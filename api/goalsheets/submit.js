const { readData, writeData, logAudit } = require('../utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { sheetId, employeeId } = req.body || {};
  const data = readData();
  const sheet = data.goalSheets.find(gs => gs.id === sheetId && gs.employeeId === employeeId);
  if (!sheet) {
    return res.status(404).json({ error: 'Goal sheet not found' });
  }
  if (sheet.status !== 'draft' && sheet.status !== 'returned') {
    return res.status(400).json({ error: 'Goal sheet cannot be resubmitted' });
  }
  const beforeStatus = sheet.status;
  sheet.status = 'submitted';
  sheet.submittedAt = new Date().toISOString();
  logAudit({ actorId: employeeId, sheetId: sheet.id, resource: 'goalSheet', before: beforeStatus, after: 'submitted', message: 'Submitted goal sheet' });
  writeData(data);
  return res.status(200).json(sheet);
};