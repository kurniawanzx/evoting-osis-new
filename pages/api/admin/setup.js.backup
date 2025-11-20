import clientPromise from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise
      const db = client.db('evoting-osis')
      
      const adminExists = await db.collection('users').findOne({ role: 'admin' })
      
      res.json({
        success: true,
        data: {
          hasAdmin: !!adminExists,
          admins: adminExists ? [adminExists] : []
        }
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
