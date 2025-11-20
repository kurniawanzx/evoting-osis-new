import clientPromise from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise
      const db = client.db('evoting-osis')
      const { users } = req.body

      if (!users || !Array.isArray(users)) {
        return res.status(400).json({ 
          success: false,
          error: 'No student data provided' 
        })
      }

      let imported = 0
      let failed = 0
      const errors = []

      for (const student of users) {
        try {
          const nis = student.nis || student.NIS || ''
          const nama = student.nama || student.Nama || student.name || ''
          const kelas = student.kelas || student.Kelas || student.class || ''

          if (!nis || !nama) {
            failed++
            errors.push(`Missing NIS or name: ${nis}`)
            continue
          }

          // Check if exists
          const existing = await db.collection('users').findOne({ 
            $or: [{ nis: nis.toString() }, { username: nis.toString() }] 
          })

          if (existing) {
            failed++
            errors.push(`Student exists: ${nama} (${nis})`)
            continue
          }

          // Hash password (NIS as password)
          const hashedPassword = await bcrypt.hash(nis.toString(), 12)

          await db.collection('users').insertOne({
            nis: nis.toString(),
            name: nama,
            username: nis.toString(),
            email: `${nis}@school.com`,
            password: hashedPassword,
            class: kelas,
            role: 'voter',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          })

          imported++

        } catch (error) {
          failed++
          errors.push(`Error: ${student.nis} - ${error.message}`)
        }
      }

      res.json({
        success: imported > 0,
        message: `Imported ${imported} students, ${failed} failed`,
        data: { imported, failed, errors }
      })

    } catch (error) {
      console.error('Import error:', error)
      res.status(500).json({ 
        success: false,
        error: 'Import failed: ' + error.message 
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
