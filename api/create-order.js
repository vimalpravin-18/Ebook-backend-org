// ebook-backend/api/create-order.js
// Creates a Razorpay Order and returns { id, amount, currency } to the client.
// Requires environment vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET.

const express = require('express')
const Razorpay = require('razorpay')

const router = express.Router()

// Initialize Razorpay SDK with server-side credentials
// Keep key_secret only on the server for security.
const razor = new Razorpay({
  key_id: process.env.rzp_test_RLPjpke68Syc0q,        // e.g., rzp_test_xxxxx
  key_secret: process.env.dVHNOSyHmfPgXEVlPAx0b2EO
 // DO NOT expose to frontend
})

// POST /api/orders
// Body: { amount, currency = 'INR', productId, title }
// amount must be in paise (₹299.00 => 29900)
router.post('/api/orders', async (req, res) => {
  try {
    const { amount, currency = 'INR', productId, title } = req.body
    if (!amount || !productId) {
      return res.status(400).json({ error: 'BAD_REQUEST' })
    }

    const order = await razor.orders.create({
      amount,                      // integer paise
      currency,                    // 'INR'
      receipt: `rcpt_${productId}_${Date.now()}`,
      notes: { productId, title }  // optional metadata
    })

    // Return minimal fields needed by frontend
    return res.json({ id: order.id, amount: order.amount, currency: order.currency })
  } catch (err) {
    console.error('ORDER_CREATE_FAILED:', err)
    return res.status(500).json({ error: 'ORDER_CREATE_FAILED' })
  }
})

module.exports = router
