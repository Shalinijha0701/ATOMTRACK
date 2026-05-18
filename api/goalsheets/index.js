const { readData, writeData, logAudit, uuid } = require('../utils');

module.exports = async function handler(req, res) {
  const data = readData();
  if (req.method === 'GET') {
    let { employeeId, managerId } = req.query || {};
    let sheets = data.goalSheets;
    if (employeeId) {
      sheets = sheets.filter(gs => gs.employeeId === employeeId);
    }
    if (managerId) {
      const reports = data.users.filter(u => u.managerId === managerId).map(u => u.id);
      sheets = sheets.filter(gs => reports.includes(gs.employeeId));
    }
    return res.status(200).json(sheets);
  }
  if (req.method === 'POST') {
    const { employeeId, goals } = req.body || {};
    if (!employeeId || !Array.isArray(goals)) {
      return res.status(400).json({ error: 'employeeId and goals are required' });
    }
    let sheet = data.goalSheets.find(gs => gs.employeeId === employeeId);
    const payloadGoals = goals.map(g => ({ ...g, id: g.id || uuid(), weightage: Number(g.weightage), target: g.unit === 'TIMELINE' ? g.target : Number(g.target) }));
    if (sheet) {
      const before = JSON.parse(JSON.stringify(sheet.goals));
      sheet.goals = payloadGoals;
      sheet.status = 'draft';
      logAudit({ actorId: employeeId, sheetId: sheet.id, resource: 'goalSheet', before, after: payloadGoals, message: 'Updated goals' });
    } else {
      const sheetId = uuid();
      sheet = { id: sheetId, employeeId, status: 'draft', goals: payloadGoals, quarterlyCheckins: [], history: [] };
      data.goalSheets.push(sheet);
      logAudit({ actorId: employeeId, sheetId: sheetId, resource: 'goalSheet', before: null, after: payloadGoals, message: 'Created goals' });
    }
    writeData(data);
    return res.status(200).json(sheet);
  }
  return res.status(405).json({ error: 'Method Not Allowed' });
};