require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const { authRouter } = require('./routes/auth.routes')
const { postsRouter } = require('./routes/posts.routes')
const { notificationsRouter } = require('./routes/notifications.routes')
const { messagesRouter } = require('./routes/messages.routes')
const { usersRouter } = require('./routes/users.routes')

const app = express()

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, origin)
      }
      return callback(null, false)
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '25mb' }))
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/posts', postsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/users', usersRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API running on http://localhost:${port}`))
