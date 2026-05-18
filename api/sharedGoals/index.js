const { readData, writeData, logAudit, uuid } = require('../utils');

module.exports = async function handler(req, res) {
  const data = readData();
  if (req.method === 'GET') {
    return res.status(200).json(data.sharedGoals);
  }
  if (req.method === 'POST') {
    const { adminId, thrust, title, unit, target, weightage, employeeIds } = req.body || {};
    if (!adminId || !thrust || !title || !unit || target === undefined || weightage === undefined || !Array.isArray(employeeIds)) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const admin = data.users.find(u => u.id === adminId && u.role === 'admin');
    if (!admin) {
      return res.status(403).json({ error: 'Only admins can create shared goals' });
    }
    const goalId = uuid();
    const sharedGoal = { id: goalId, thrust, title, unit, target, weightage, employeeIds };
    data.sharedGoals.push(sharedGoal);
    employeeIds.forEach(empId => {
      let sheet = data.goalSheets.find(gs => gs.employeeId === empId);
      if (!sheet) {
        const newSheetId = uuid();
        sheet = { id: newSheetId, employeeId: empId, status: 'draft', goals: [], quarterlyCheckins: [], history: [] };
        data.goalSheets.push(sheet);
      }
      const newGoal = { id: uuid(), thrust, title, unit, target, weightage, shared: true, parentId: goalId };
      sheet.goals.push(newGoal);
      logAudit({ actorId: adminId, sheetId: sheet.id, resource: 'goalSheet', before: null, after: newGoal, message: 'Added shared goal' });
    });
    writeData(data);
    return res.status(200).json(sharedGoal);
  }
  return res.status(405).json({ error: 'Method Not Allowed' });
};