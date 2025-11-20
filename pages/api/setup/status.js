import clientPromise from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise
      const db = client.db('evoting-osis')

      // Check collections
      const collections = await db.listCollections().toArray()
      const collectionNames = collections.map(col => col.name)
      
      const requiredCollections = ['users', 'candidates', 'votes', 'settings']
      const missingCollections = requiredCollections.filter(
        col => !collectionNames.includes(col)
      )

      const isSetupCompleted = missingCollections.length === 0

      res.json({
        success: true,
        data: {
          isSetupCompleted,
          collections: {
            existing: collectionNames,
            missing: missingCollections,
            required: requiredCollections
          }
        }
      })
    } catch (error) {
      console.error('Status check error:', error)
      res.status(500).json({ 
        success: false,
        error: 'Status check failed: ' + error.message 
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
