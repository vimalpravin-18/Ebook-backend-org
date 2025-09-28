// server/store/db.js
const _entitlements = new Map() // id -> { id, userId, productId, status, createdAt }
const _products = new Map([
  ['prod_disc1', {
    id: 'prod_disc1',
    title: 'Psychology of Discipline',
    description: 'Master your mindset and habits.',
    cover: '/covers/generated-image (1).png',
    sampleUrl: '/samples/discipline-sample.pdf',
    // Either fileKey (S3/R2/GCS) or filePath (disk)
    fileKey: 'src/components/Psychology of Discipline pdf format.pdf',
    filePath: null,
    downloadName: 'Psychology-of-Discipline.pdf',
    fileSize: null,
  }],
  // ...add your other products: prod_focus1, prod_life1, etc.
])

let _autoId = 1

export const Entitlements = {
  async create(row) {
    const id = String(_autoId++)
    const rec = { id, ...row }
    _entitlements.set(id, rec)
    return rec
  },
  async findById(id) {
    return _entitlements.get(String(id)) || null
  },
}

export const Products = {
  async findById(id) {
    return _products.get(String(id)) || null
  },
}
