const express = require('express');
const router = express.Router();
const { createEventBooking, getEventBookings, updateEventBooking } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.post('/', createEventBooking);
router.get('/', protect, getEventBookings);
router.put('/:id', protect, updateEventBooking);

module.exports = router;
