const dashboardService = require('../services/dashboard.service');
const { ok, asyncHandler } = require('../utils/response');

module.exports = {
  overview: asyncHandler(async (req, res) => {
    const data = await dashboardService.getOverview();
    return ok(res, data, 'Ringkasan dashboard');
  }),
};
