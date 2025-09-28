// server/routes/payments.js
import express from 'express'
import crypto from 'crypto'
import { Entitlements, Products } from '../store/db.js' // simple data access layer
import { requireAuth } from '../util/auth.js'

const router = express.Router()

router.post('/verify', requireAuth, async (req, res) => {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      orderId, // same as razorpayOrderId if you used Orders API
      productId,
    } = req.body

    // 1) Verify signature
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expected !== razorpaySignature) {
      return res.status(400).send('Invalid signature')
    }

    // 2) Optional: confirm payment captured via Razorpay API (recommended)
    // Skipped here for brevity; rely on Orders auto-capture + webhook fallback

    // 3) Create entitlement
    const product = await Products.findById(productId)
    if (!product) return res.status(400).send('Unknown product')

    const entitlement = await Entitlements.create({
      userId: req.user.id,
      productId,
      status: 'active',
      createdAt: new Date(),
    })

    return res.json({ success: true, entitlementId: entitlement.id })
  } catch (e) {
    console.error(e)
    return res.status(500).send('Verification error')
  }
})

export default router
