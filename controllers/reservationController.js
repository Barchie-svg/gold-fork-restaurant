const Reservation = require('../models/Reservation');

/**
 * @desc    Create a new reservation
 * @route   POST /api/reservations
 * @access  Public
 */
const createReservation = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      guests,
      specialRequests,
    } = req.body;

    const reservation = await Reservation.create({
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      guests,
      specialRequests,
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reservations (paginated, filterable by date range)
 * @route   GET /api/reservations?page=1&limit=10&from=2024-01-01&to=2024-01-31
 * @access  Private (admin)
 */
const getReservations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }

    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reservations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a reservation
 * @route   PUT /api/reservations/:id
 * @access  Private (admin)
 */
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reservation statistics
 * @route   GET /api/reservations/stats
 * @access  Private (admin)
 */
const getReservationStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const total = await Reservation.countDocuments();
    const pending = await Reservation.countDocuments({ status: 'pending' });
    const confirmed = await Reservation.countDocuments({ status: 'confirmed' });
    const cancelled = await Reservation.countDocuments({ status: 'cancelled' });
    const todayReservations = await Reservation.countDocuments({
      date: { $gte: startOfToday, $lt: endOfToday },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        cancelled,
        todayReservations,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getReservations,
  updateReservation,
  getReservationStats,
};
