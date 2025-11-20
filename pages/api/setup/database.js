import clientPromise from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise
      const db = client.db('evoting-osis')

      const requiredCollections = ['users', 'candidates', 'votes', 'settings']
      
      const existingCollections = await db.listCollections().toArray()
      const existingCollectionNames = existingCollections.map(col => col.name)

      // Create missing collections
      for (const collectionName of requiredCollections) {
        if (!existingCollectionNames.includes(collectionName)) {
          await db.createCollection(collectionName)
          console.log('Created collection:', collectionName)
        }
      }

      // Create indexes
      try {
        await db.collection('users').createIndex({ username: 1 }, { unique: true })
        await db.collection('users').createIndex({ nis: 1 }, { unique: true })
        console.log('Created indexes')
      } catch (indexError) {
        console.log('Indexes may already exist')
      }

      res.json({
        success: true,
        message: 'Database setup completed',
        data: {
          collections: requiredCollections,
          setupCompleted: true
        }
      })
    } catch (error) {
      console.error('Database setup error:', error)
      res.status(500).json({ 
        success: false,
        error: 'Database setup failed: ' + error.message 
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
