const Event = require('../models/Event');

/**
 * @desc    Create a new event booking
 * @route   POST /api/events
 * @access  Public
 */
const createEventBooking = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      eventDate,
      guestCount,
      venue,
      budget,
      description,
    } = req.body;

    const event = await Event.create({
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      eventDate,
      guestCount,
      venue,
      budget,
      description,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all event bookings (paginated)
 * @route   GET /api/events?page=1&limit=10
 * @access  Private (admin)
 */
const getEventBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.eventType) filter.eventType = req.query.eventType;

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event booking
 * @route   PUT /api/events/:id
 * @access  Private (admin)
 */
const updateEventBooking = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event booking not found' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEventBooking,
  getEventBookings,
  updateEventBooking,
};
