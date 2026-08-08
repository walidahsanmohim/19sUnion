const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const Artist = require('../models/Artist');

// SSLCommerz payment initiation
router.post('/sslcommerz/initiate', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone, customerAddress } = req.body;

    // Find the order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    
    const url = isLive 
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

    const data = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: amount,
      currency: 'BDT',
      tran_id: orderId,
      success_url: `${process.env.SUCCESS_URL || 'http://localhost:5000'}/api/payment/sslcommerz/success`,
      fail_url: `${process.env.FAIL_URL || 'http://localhost:5000'}/api/payment/sslcommerz/fail`,
      cancel_url: `${process.env.CANCEL_URL || 'http://localhost:5000'}/api/payment/sslcommerz/cancel`,
      cus_name: customerName,
      cus_email: customerEmail,
      cus_phone: customerPhone,
      cus_add1: customerAddress,
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      product_name: 'Beauty Service',
      product_category: 'Service',
      product_profile: 'general'
    };

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.status === 'SUCCESS') {
      // Update order with transaction ID
      await Order.findByIdAndUpdate(order._id, {
        paymentMethod: 'sslcommerz',
        transactionId: response.data.tran_id
      });

      res.json({
        success: true,
        data: {
          paymentUrl: response.data.GatewayPageURL,
          transactionId: response.data.tran_id
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment initiation failed',
        error: response.data
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Payment error',
      error: error.message
    });
  }
});

// SSLCommerz success callback
router.post('/sslcommerz/success', async (req, res) => {
  try {
    const { tran_id, val_id, amount, card_type } = req.body;

    const order = await Order.findOne({ orderId: tran_id });
    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=Order not found`);
    }

    // Verify payment with SSLCommerz
    const isValid = await verifyPayment(tran_id, amount);
    
    if (isValid) {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'paid',
        transactionId: val_id,
        status: 'confirmed'
      });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${tran_id}`);
    } else {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'failed'
      });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=Payment verification failed`);
    }
  } catch (error) {
    console.error('Payment success callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=Server error`);
  }
});

// SSLCommerz fail callback
router.post('/sslcommerz/fail', async (req, res) => {
  try {
    const { tran_id } = req.body;

    await Order.findOneAndUpdate(
      { orderId: tran_id },
      { paymentStatus: 'failed' }
    );

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=Server error`);
  }
});

// SSLCommerz cancel callback
router.post('/sslcommerz/cancel', async (req, res) => {
  try {
    const { tran_id } = req.body;

    await Order.findOneAndUpdate(
      { orderId: tran_id },
      { paymentStatus: 'failed', status: 'cancelled' }
    );

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancelled`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancelled?error=Server error`);
  }
});

// Verify payment with SSLCommerz
async function verifyPayment(tranId, expectedAmount) {
  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

    const url = isLive
      ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
      : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

    const data = {
      val_id: tranId,
      store_id: storeId,
      store_passwd: storePassword,
      v: '1',
      format: 'json'
    };

    const response = await axios.get(url, { params: data });
    
    return response.data.status === 'VALID' && 
           parseFloat(response.data.amount) === parseFloat(expectedAmount);
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}

// bKash payment initiation (for Bangladesh mobile banking)
router.post('/bkash/initiate', async (req, res) => {
  try {
    const { orderId, amount, customerPhone } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // In production, integrate with bKash API
    // This is a placeholder for bKash integration
    const bkashToken = await getBkashToken();
    
    if (!bkashToken) {
      return res.status(500).json({
        success: false,
        message: 'bKash service unavailable'
      });
    }

    // Create payment URL for bKash
    const paymentUrl = `https://checkout.pay.bka.sh/Checkout?token=${bkashToken}`;

    res.json({
      success: true,
      data: {
        paymentUrl,
        instruction: 'You will be redirected to bKash payment gateway'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'bKash payment error',
      error: error.message
    });
  }
});

// Get bKash access token (placeholder)
async function getBkashToken() {
  // In production, implement actual bKash token generation
  // This requires bKash API credentials
  return null;
}

// POST /api/payment/create-order - Create new order
router.post('/create-order', async (req, res) => {
  try {
    const { artistId, service, customer, bookingDate, bookingTime, notes } = req.body;

    // Verify artist exists
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }

    // Find service price
    const serviceObj = artist.services.find(s => s.name === service);
    if (!serviceObj) {
      return res.status(400).json({
        success: false,
        message: 'Service not found'
      });
    }

    const order = new Order({
      customer,
      artist: artistId,
      service: {
        name: service,
        price: serviceObj.price
      },
      totalAmount: serviceObj.price,
      bookingDate: new Date(bookingDate),
      bookingTime,
      notes
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// GET /api/payment/order/:orderId - Get order status
router.get('/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('artist', 'name phone city');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

module.exports = router;
