const { readData } = require('./utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const data = readData();
  return res.status(200).json(data.auditLogs);
};