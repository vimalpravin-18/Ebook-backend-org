// ebook-backend/server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')

const createOrder = require('./api/create-order')
const verifyPayment = require('./api/verify-payment')

const app = express()
app.use(cors())
app.use(express.json())

app.use(createOrder)
app.use(verifyPayment)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
