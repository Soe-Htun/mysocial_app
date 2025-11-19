const express = require('express')
const { prisma } = require('../lib/prisma')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const items = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    res.json(
      items.map((item) => ({
        id: item.id,
        message: item.message,
        type: item.type,
        read: item.read,
        createdAt: item.createdAt,
        postId: item.postId,
        commentId: item.commentId,
        actor: item.actor,
      })),
    )
  } catch (error) {
    next(error)
  }
})

router.post('/:notificationId/read', requireAuth, async (req, res, next) => {
  try {
    const notificationId = Number(req.params.notificationId)
    if (Number.isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification id' })
    }
    const existing = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    })
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })
    res.json(notification)
  } catch (error) {
    next(error)
  }
})

module.exports = { notificationsRouter: router }
