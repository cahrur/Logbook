const moduleRepo = require('../repositories/module.repository');
const activityRepo = require('../repositories/activity.repository');

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

// Start of the current week (Monday) and today, as YYYY-MM-DD.
function weekRange() {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diffToMonday);
  return { from: toISODate(monday), to: toISODate(now) };
}

const dashboardService = {
  async getOverview() {
    const modules = await moduleRepo.list();
    const { from, to } = weekRange();

    const [activitiesThisWeek, blockedThisWeek] = await Promise.all([
      activityRepo.countBetween(from, to),
      activityRepo.countBetween(from, to, 'blocked'),
    ]);

    const recentActivities = await activityRepo.list({ limit: 8 });

    const stats = {
      total_modules: modules.length,
      in_progress_modules: modules.filter((m) => m.status === 'in_progress').length,
      done_modules: modules.filter((m) => m.status === 'done').length,
      activities_this_week: activitiesThisWeek,
      blocked_this_week: blockedThisWeek,
    };

    return { stats, modules, recent_activities: recentActivities };
  },
};

module.exports = dashboardService;
