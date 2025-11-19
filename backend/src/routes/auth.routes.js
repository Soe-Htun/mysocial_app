const express = require('express')
const { z } = require('zod')
const { prisma } = require('../lib/prisma')
const { hashPassword, verifyPassword } = require('../utils/password')
const { signToken, attachToken } = require('../utils/token')

const router = express.Router()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = registerSchema.pick({ email: true, password: true })

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: payload.email } })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash: await hashPassword(payload.password),
        headline: 'New SocialSphere member',
      },
      select: { id: true, name: true, email: true, headline: true, avatarUrl: true, createdAt: true },
    })
    const token = signToken(user.id)
    attachToken(res, token)
    return res.status(201).json({ user, token })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', issues: error.issues })
    }
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body)
    const userRecord = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!userRecord) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const valid = await verifyPassword(payload.password, userRecord.passwordHash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const { passwordHash, ...user } = userRecord
    const token = signToken(user.id)
    attachToken(res, token)
    return res.json({ user, token })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', issues: error.issues })
    }
    next(error)
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  return res.json({ message: 'Logged out' })
})

module.exports = { authRouter: router }
