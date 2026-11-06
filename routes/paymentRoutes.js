const express = require('express');
const router = express.Router();
const {
  initiateMpesaPayment, mpesaCallback,
  createStripePaymentIntent, confirmStripePayment,
} = require('../controllers/paymentController');

router.post('/mpesa/stk-push', initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback);
router.post('/stripe/create-intent', createStripePaymentIntent);
router.post('/stripe/webhook', confirmStripePayment);

module.exports = router;
