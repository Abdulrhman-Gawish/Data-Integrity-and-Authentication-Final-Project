const Log = require('../models/log');
const AppError = require('../utils/appError');

/**
 * @desc    Get all logs (Admin only)
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
const getLogs = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      action,
      entity,
      userId,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage)
      .populate('userId', 'name email') 
      .lean();

    const total = await Log.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: logs, 
      pagination: {
        total,
        count: logs.length,
        perPage: itemsPerPage,
        currentPage,
        totalPages: Math.ceil(total / itemsPerPage)
      }
    });
  } catch (error) {
    next(new AppError('Failed to fetch logs: ' + error.message, 500));
  }
};
module.exports = {
  getLogs
};