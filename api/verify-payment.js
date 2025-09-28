// ebook-backend/api/verify-payment.js
// Verifies Razorpay payment signature: HMAC_SHA256(order_id|payment_id, RAZORPAY_KEY_SECRET).
// On success, respond with { success: true, entitlementId }.
// Requires env: RAZORPAY_KEY_SECRET.

const express = require('express')
const crypto = require('crypto')

const router = express.Router()

// POST /api/payments/verify
// Body: {
//   razorpayPaymentId,
//   razorpayOrderId,
//   razorpaySignature,
//   orderId,        // same as razorpayOrderId sent to Checkout
//   productId
// }
router.post('/api/payments/verify', async (req, res) => {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      orderId,
      productId,
    } = req.body

    if (!razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ success: false, error: 'BAD_REQUEST' })
    }

    // Compute expected signature using your server-side key_secret
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    hmac.update(orderId + '|' + razorpayPaymentId)
    const expected = hmac.digest('hex')

    const isValid = expected === razorpaySignature
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'INVALID_SIGNATURE' })
    }

    // TODO: Create entitlement for the authenticated user in your DB
    // Example placeholder:
    const entitlementId = `ent_${productId}_${Date.now()}`

    return res.json({ success: true, entitlementId })
  } catch (err) {
    console.error('VERIFY_FAILED:', err)
    return res.status(500).json({ success: false, error: 'VERIFY_FAILED' })
  }
})

module.exports = router
