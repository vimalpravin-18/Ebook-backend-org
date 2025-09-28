// server/routes/webhooks.js
import express from 'express'
import crypto from 'crypto'
import { Entitlements, Products } from '../store/db.js'

const router = express.Router()

router.post('/razorpay', express.json({ type: '*/*' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature']
  const body = JSON.stringify(req.body)
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  if (expected !== signature) return res.status(400).send('Bad signature')

  const event = req.body
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity
    const productId = payment.notes?.productId
    const userId = payment.notes?.userId // pass userId in order/notes at create time
    if (productId && userId) {
      const prod = await Products.findById(productId)
      if (prod) {
        await Entitlements.create({
          userId,
          productId,
          status: 'active',
          createdAt: new Date(),
        })
      }
    }
  }
  res.json({ received: true })
})

export default router
