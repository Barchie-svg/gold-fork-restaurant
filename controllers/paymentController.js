const axios = require('axios');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

/** Get M-Pesa OAuth token */
const getMpesaToken = async () => {
  const key    = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const baseURL = process.env.MPESA_BASE_URL;
  const auth   = Buffer.from(`${key}:${secret}`).toString('base64');

  const { data } = await axios.get(
    `${baseURL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return data.access_token;
};

/** Format timestamp: YYYYMMDDHHmmss */
const getMpesaTimestamp = () => {
  const d   = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

/**
 * @desc    Initiate M-Pesa STK Push
 * @route   POST /api/payments/mpesa/stk-push
 * @access  Public
 */
const initiateMpesaPayment = async (req, res, next) => {
  try {
    const { orderId, phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: 'Phone and amount are required' });
    }

    const token       = await getMpesaToken();
    const shortcode   = process.env.MPESA_SHORTCODE;
    const passkey     = process.env.MPESA_PASSKEY;
    const callbackURL = process.env.MPESA_CALLBACK_URL;
    const baseURL     = process.env.MPESA_BASE_URL;
    const timestamp   = getMpesaTimestamp();
    const password    = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // Format phone: remove leading 0 or +254, add 254
    const cleanPhone = phone.replace(/^(\+254|0)/, '254');

    const { data } = await axios.post(
      `${baseURL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   'CustomerPayBillOnline',
        Amount:            Math.ceil(amount),
        PartyA:            cleanPhone,
        PartyB:            shortcode,
        PhoneNumber:       cleanPhone,
        CallBackURL:       callbackURL,
        AccountReference:  'GoldenFork',
        TransactionDesc:   'Restaurant Order Payment',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Create payment record
    const paymentData = {
      method:            'mpesa',
      amount,
      status:            'pending',
      checkoutRequestId: data.CheckoutRequestID,
    };
    if (orderId) paymentData.order = orderId;
    await Payment.create(paymentData);

    res.status(200).json({
      success:           true,
      message:           'STK Push sent. Enter your M-Pesa PIN on your phone.',
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
    });
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'M-Pesa payment initiation failed. Check your credentials.',
      error:   error.response?.data || error.message,
    });
  }
};

/**
 * @desc    Handle M-Pesa callback
 * @route   POST /api/payments/mpesa/callback
 * @access  Public (Safaricom only)
 */
const mpesaCallback = async (req, res) => {
  try {
    const { stkCallback } = req.body.Body;
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    const payment = await Payment.findOne({ checkoutRequestId: CheckoutRequestID });

    if (payment) {
      if (ResultCode === 0) {
        // Extract receipt from metadata
        const items       = CallbackMetadata?.Item || [];
        const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber');
        const receiptNumber = receiptItem ? receiptItem.Value : null;

        payment.status = 'success';
        if (receiptNumber) payment.mpesaReceiptNumber = receiptNumber;
        await payment.save();

        // Update order if linked
        if (payment.order) {
          await Order.findByIdAndUpdate(payment.order, {
            paymentStatus:      'paid',
            mpesaReceiptNumber: receiptNumber,
          });
        }
      } else {
        payment.status = 'failed';
        await payment.save();
        if (payment.order) {
          await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'failed' });
        }
      }
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error.message);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

/**
 * @desc    Create Stripe Payment Intent
 * @route   POST /api/payments/stripe/create-intent
 * @access  Public
 */
const createStripePaymentIntent = async (req, res, next) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount, orderId } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100), // Convert to cents
      currency: 'kes',
      metadata: { orderId: orderId || '' },
    });

    await Payment.create({
      order:                orderId || undefined,
      method:               'stripe',
      amount,
      status:               'pending',
      stripePaymentIntentId: paymentIntent.id,
    });

    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stripe webhook
 * @route   POST /api/payments/stripe/webhook
 * @access  Public
 */
const confirmStripePayment = async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi      = event.data.object;
      const payment = await Payment.findOne({ stripePaymentIntentId: pi.id });
      if (payment) {
        payment.status = 'success';
        await payment.save();
        if (payment.order) {
          await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'paid' });
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  initiateMpesaPayment,
  mpesaCallback,
  createStripePaymentIntent,
  confirmStripePayment,
};
