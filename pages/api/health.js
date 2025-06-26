export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'CFB Analytics API is running',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
}
