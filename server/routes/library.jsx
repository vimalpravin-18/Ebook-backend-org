// server/routes/library.js
import express from 'express'
import { Entitlements, Products } from '../store/db.js'
import { requireAuth } from '../util/auth.js'
import { getSignedDownloadUrl, streamFromDisk } from '../util/files.js'

const router = express.Router()

// GET meta to render Access page
router.get('/:entitlementId/meta', requireAuth, async (req, res) => {
  const ent = await Entitlements.findById(req.params.entitlementId)
  if (!ent || ent.userId !== req.user.id) return res.status(404).send('Not found')

  const product = await Products.findById(ent.productId)
  if (!product) return res.status(404).send('Product missing')

  return res.json({
    title: product.title,
    description: product.description,
    cover: product.cover,
    sampleUrl: product.sampleUrl,
    fileSize: product.fileSize || null,
  })
})

// GET signed URL or stream
router.get('/:entitlementId/download', requireAuth, async (req, res) => {
  const ent = await Entitlements.findById(req.params.entitlementId)
  if (!ent || ent.userId !== req.user.id) return res.status(404).send('Not found')

  const product = await Products.findById(ent.productId)
  if (!product) return res.status(404).send('Product missing')

  // Option A: Signed URL from object storage (recommended)
  if (process.env.STORAGE_TYPE === 's3' || process.env.STORAGE_TYPE === 'r2' || process.env.STORAGE_TYPE === 'gcs') {
    const url = await getSignedDownloadUrl(product.fileKey, {
      downloadName: product.downloadName || `${product.slug || product.id}.pdf`,
      expiresSeconds: 300,
    })
    return res.json({ url })
  }

  // Option B: Stream from disk (file outside public/)
  return streamFromDisk(product.filePath, product.downloadName || `${product.id}.pdf`, res)
})

export default router
