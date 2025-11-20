export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Simple response tanpa database
    res.status(200).json({
      success: true,
      message: 'API is working (no DB connection yet)',
      data: {
        hasAdmin: false,
        admins: [],
        total: 0
      }
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
