const { getAnalytics } = require('./utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const analytics = getAnalytics();
  return res.status(200).json(analytics);
};