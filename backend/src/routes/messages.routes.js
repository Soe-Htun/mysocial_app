const express = require('express')
const { z } = require('zod')
const { prisma } = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

const messageSchema = z.object({
  recipientId: z.coerce.number(),
  body: z.string().min(1),
})

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: req.user.id }, { recipientId: req.user.id }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    res.json(messages)
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = messageSchema.parse({
      ...req.body,
      recipientId: Number(req.body.recipientId),
    })
    const message = await prisma.message.create({
      data: {
        body: payload.body,
        recipientId: payload.recipientId,
        senderId: req.user.id,
      },
    })
    res.status(201).json(message)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid message data', issues: error.issues })
    }
    next(error)
  }
})

module.exports = { messagesRouter: router }
