const { readData, writeData, logAudit } = require('./utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { sheetId, employeeId, quarter, achievements, comment } = req.body || {};
  const data = readData();
  const sheet = data.goalSheets.find(gs => gs.id === sheetId && gs.employeeId === employeeId);
  if (!sheet) {
    return res.status(404).json({ error: 'Goal sheet not found' });
  }
  if (sheet.status !== 'approved') {
    return res.status(400).json({ error: 'Goal sheet is not approved for check-ins' });
  }
  // Remove existing entry for quarter
  sheet.quarterlyCheckins = sheet.quarterlyCheckins.filter(qc => qc.quarter !== quarter);
  sheet.quarterlyCheckins.push({ quarter, achievements, comment });
  logAudit({ actorId: employeeId, sheetId: sheet.id, resource: 'quarterlyCheckin', before: null, after: { quarter, achievements, comment }, message: `Recorded ${quarter} check-in` });
  writeData(data);
  return res.status(200).json(sheet);
};