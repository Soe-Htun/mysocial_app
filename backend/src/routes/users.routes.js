const express = require('express')
const { z } = require('zod')
const { prisma } = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

const profileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  headline: z.string().max(160).optional().or(z.literal('').transform(() => null)),
  location: z.string().max(120).optional().or(z.literal('').transform(() => null)),
  avatarUrl: z.string().url().optional().or(z.literal('').transform(() => null)),
  coverUrl: z.string().optional().or(z.literal('').transform(() => null)),
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        headline: true,
        avatarUrl: true,
        coverUrl: true,
        location: true,
        createdAt: true,
      },
    })
    res.json(user)
  } catch (error) {
    next(error)
  }
})

router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body)
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        headline: true,
        avatarUrl: true,
        coverUrl: true,
        location: true,
        createdAt: true,
      },
    })
    res.json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid profile data', issues: error.issues })
    }
    next(error)
  }
})

module.exports = { usersRouter: router }
