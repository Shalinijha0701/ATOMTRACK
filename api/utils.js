/*
 * Shared utilities for Vercel API functions.  Provides data storage,
 * reading/writing functions and scoring logic.  Data is initialised from
 * the bundled JSON file and persisted to /tmp during a Vercel
 * invocation.  Because serverless functions run in isolated
 * containers, this persistence is per-instance and resets when the
 * instance is recycled.  For a production deployment you should
 * replace these functions with calls to a real database.
 */

const fs = require('fs');
const path = require('path');

// Global in-memory store; persists across invocations in the same
// serverless instance.
let dataCache = null;

// Path to bundled data file relative to this module
const bundledPath = path.join(__dirname, '..', 'data.json');

// Path to temp file for persisted writes
const tmpPath = '/tmp/atomtrack-data.json';

function loadData() {
  if (dataCache) return dataCache;
  // Attempt to read from /tmp first (written by previous invocation)
  try {
    const raw = fs.readFileSync(tmpPath, 'utf8');
    dataCache = JSON.parse(raw);
    return dataCache;
  } catch (err) {
    // fall back to bundled file
    const raw = fs.readFileSync(bundledPath, 'utf8');
    dataCache = JSON.parse(raw);
    // Write to /tmp for subsequent writes
    fs.writeFileSync(tmpPath, JSON.stringify(dataCache, null, 2));
    return dataCache;
  }
}

function saveData() {
  if (!dataCache) return;
  fs.writeFileSync(tmpPath, JSON.stringify(dataCache, null, 2));
}

function readData() {
  return loadData();
}

function writeData(newData) {
  dataCache = newData;
  saveData();
}

function uuid() {
  return (Date.now().toString(16) + '-' + Math.random().toString(16).substring(2, 10)).replace(/\./g, '');
}

function computeScore(goal, actual) {
  const target = goal.target;
  if (goal.unit === 'MAX') {
    return (actual / target) * 100;
  }
  if (goal.unit === 'MIN') {
    return (target / actual) * 100;
  }
  if (goal.unit === 'ZERO') {
    return actual === 0 ? 100 : 0;
  }
  if (goal.unit === 'TIMELINE') {
    const deadline = new Date(target);
    const actualDate = new Date(actual);
    return actualDate <= deadline ? 100 : 0;
  }
  return 0;
}

function logAudit({ actorId, sheetId, resource, before, after, message }) {
  const data = readData();
  const entry = {
    id: uuid(),
    timestamp: new Date().toISOString(),
    actorId,
    sheetId,
    resource,
    message,
    before,
    after
  };
  data.auditLogs.push(entry);
  if (sheetId) {
    const sheet = data.goalSheets.find(gs => gs.id === sheetId);
    if (sheet) {
      sheet.history = sheet.history || [];
      sheet.history.push(entry.id);
    }
  }
  writeData(data);
  return entry;
}

function getAnalytics() {
  const data = readData();
  const analytics = {
    goalDistribution: {},
    completionRateByManager: {},
    uomDistribution: {},
    statusCounts: {},
    averageProgress: 0
  };
  let totalScore = 0;
  let scoreCount = 0;
  data.goalSheets.forEach(sheet => {
    analytics.statusCounts[sheet.status] = (analytics.statusCounts[sheet.status] || 0) + 1;
    const user = data.users.find(u => u.id === sheet.employeeId);
    const managerId = user ? user.managerId : null;
    if (managerId) {
      analytics.completionRateByManager[managerId] = analytics.completionRateByManager[managerId] || { completed: 0, total: 0 };
    }
    sheet.goals.forEach(goal => {
      analytics.goalDistribution[goal.thrust] = (analytics.goalDistribution[goal.thrust] || 0) + 1;
      analytics.uomDistribution[goal.unit] = (analytics.uomDistribution[goal.unit] || 0) + 1;
      sheet.quarterlyCheckins.forEach(qc => {
        const ach = qc.achievements.find(a => a.goalId === goal.id);
        if (ach) {
          const score = computeScore(goal, ach.actual);
          totalScore += score * (goal.weightage / 100);
          scoreCount++;
          if (managerId) {
            const mgrStats = analytics.completionRateByManager[managerId];
            if (score >= 60) mgrStats.completed++;
            mgrStats.total++;
          }
        }
      });
    });
  });
  analytics.averageProgress = scoreCount > 0 ? (totalScore / scoreCount) : 0;
  return analytics;
}

module.exports = {
  readData,
  writeData,
  uuid,
  computeScore,
  logAudit,
  getAnalytics
};