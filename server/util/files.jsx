// server/util/files.js
import fs from 'fs'
import path from 'path'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = process.env.STORAGE_TYPE === 's3'
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null

export async function getSignedDownloadUrl(fileKey, { downloadName, expiresSeconds = 300 } = {}) {
  if (!s3) throw new Error('S3 not configured')
  const cmd = new GetObjectCommand({
    Bucket: process.env.AWS_PRIVATE_BUCKET,
    Key: fileKey,
    ResponseContentDisposition: `attachment; filename="${downloadName}"`,
    ResponseContentType: 'application/pdf',
  })
  return await getSignedUrl(s3, cmd, { expiresIn: expiresSeconds })
}

export function streamFromDisk(filePath, downloadName, res) {
  const abs = path.resolve(filePath)
  if (!fs.existsSync(abs)) {
    res.status(404).send('File missing')
    return
  }
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`)
  const stream = fs.createReadStream(abs)
  stream.pipe(res)
}
