// server/index.js
import express from 'express'
import cors from 'cors'
import payments from './routes/payments.js'
import library from './routes/library.js'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Your auth session/JWT middleware should set req.user
app.use((req, _res, next) => {
  // TODO: replace this stub; set req.user = { id, email } from session/JWT
  if (req.headers['x-dev-user']) {
    req.user = { id: req.headers['x-dev-user'], email: 'dev@example.com' }
  }
  next()
})

app.use('/api/payments', payments)
app.use('/api/library', library)

const port = process.env.PORT || 5000
app.listen(port, () => console.log('API on', port))
