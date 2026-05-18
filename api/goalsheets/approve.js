const { readData, writeData, logAudit } = require('../utils');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { sheetId, managerId, action, comments } = req.body || {};
  const data = readData();
  const sheet = data.goalSheets.find(gs => gs.id === sheetId);
  if (!sheet) {
    return res.status(404).json({ error: 'Goal sheet not found' });
  }
  const employee = data.users.find(u => u.id === sheet.employeeId);
  if (!employee || employee.managerId !== managerId) {
    return res.status(403).json({ error: 'Manager not authorised for this goal sheet' });
  }
  if (sheet.status !== 'submitted' && sheet.status !== 'returned') {
    return res.status(400).json({ error: 'Goal sheet is not awaiting approval' });
  }
  const beforeStatus = sheet.status;
  if (action === 'approve') {
    sheet.status = 'approved';
    sheet.approvedAt = new Date().toISOString();
    sheet.approvalComment = comments || '';
  } else if (action === 'return') {
    sheet.status = 'returned';
    sheet.returnComment = comments || '';
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }
  logAudit({ actorId: managerId, sheetId: sheet.id, resource: 'goalSheet', before: beforeStatus, after: sheet.status, message: action === 'approve' ? 'Approved goal sheet' : 'Returned goal sheet' });
  writeData(data);
  return res.status(200).json(sheet);
};