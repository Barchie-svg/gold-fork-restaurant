const express = require('express');
const router = express.Router();
const {
  createReservation, getReservations, updateReservation, getReservationStats,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getReservationStats);
router.get('/', protect, getReservations);
router.post('/', createReservation);
router.put('/:id', protect, updateReservation);

module.exports = router;
