const express = require('express')
const { z } = require('zod')
const { ReactionType, NotificationType } = require('@prisma/client')
const { prisma } = require('../lib/prisma')
const { requireAuth, optionalAuth } = require('../middleware/auth')

const router = express.Router()

const minimalUserSelect = { id: true, name: true, headline: true, avatarUrl: true }

const postInclude = {
  author: { select: minimalUserSelect },
  comments: {
    include: { author: { select: minimalUserSelect } },
    orderBy: { createdAt: 'asc' },
  },
  reactions: {
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true, headline: true },
      },
    },
  },
}

const formatPost = (post, viewerId) => {
  const reactionCounts =
    post.reactions?.reduce((acc, reaction) => {
      const key = reaction.type.toLowerCase()
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {}) || {}

  const viewerReaction = viewerId
    ? post.reactions?.find((reaction) => reaction.userId === viewerId)?.type ?? null
    : null

  const viewerReacted = Boolean(viewerReaction)

  const likedBy =
    post.reactions
      ?.filter((reaction) => reaction.user)
      .map((reaction) => ({
        id: reaction.user.id,
        name: reaction.user.name,
        avatar: reaction.user.avatarUrl,
        headline: reaction.user.headline,
        reaction: reaction.type,
      })) || []

  return {
    id: post.id,
    content: post.content,
    media: post.mediaUrl,
    createdAt: post.createdAt,
    author: post.author,
    comments:
      post.comments?.map((comment) => ({
        id: comment.id,
        text: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
      })) || [],
    reactions: reactionCounts,
    likedBy,
    viewerReaction,
    viewerReacted,
  }
}

const createPostSchema = z.object({
  content: z.string().min(1, 'Share something meaningful'),
  media: z.string().url().optional().or(z.literal('').transform(() => undefined)),
})

const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty'),
})

const reactionSchema = z.object({
  type: z.nativeEnum(ReactionType).default(ReactionType.LIKE),
})

const safeCreateNotification = async (data) => {
  try {
    await prisma.notification.create({ data })
  } catch (error) {
    console.error('Failed to create notification', error?.message)
  }
}

const truncate = (text = '', max = 80) => {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: postInclude,
    })
    res.json(posts.map((post) => formatPost(post, req.user?.id)))
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = createPostSchema.parse(req.body)
    const post = await prisma.post.create({
      data: {
        content: payload.content,
        mediaUrl: payload.media,
        authorId: req.user.id,
      },
      include: postInclude,
    })
    res.status(201).json(formatPost(post, req.user.id))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid post data', issues: error.issues })
    }
    next(error)
  }
})

router.post('/:postId/comments', requireAuth, async (req, res, next) => {
  try {
    const payload = createCommentSchema.parse(req.body)
    const postId = Number(req.params.postId)
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post id' })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    })
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const comment = await prisma.comment.create({
      data: {
        content: payload.text,
        postId,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    if (post.authorId !== req.user.id) {
      await safeCreateNotification({
        userId: post.authorId,
        actorId: req.user.id,
        postId,
        commentId: comment.id,
        type: NotificationType.COMMENT,
        message: `${req.user.name} commented: "${truncate(payload.text, 72)}"`,
      })
    }

    res.status(201).json({
      id: comment.id,
      text: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid comment data', issues: error.issues })
    }
    next(error)
  }
})

router.post('/:postId/reactions', requireAuth, async (req, res, next) => {
  try {
    const payload = reactionSchema.parse(req.body)
    const postId = Number(req.params.postId)
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post id' })
    }

    const targetPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    })

    if (!targetPost) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const existing = await prisma.reaction.findFirst({
      where: { userId: req.user.id, postId },
    })
    let createdReaction = false

    if (existing?.type === payload.type) {
      await prisma.reaction.delete({ where: { id: existing.id } })
    } else if (existing) {
      await prisma.reaction.update({
        where: { id: existing.id },
        data: { type: payload.type },
      })
    } else {
      await prisma.reaction.create({
        data: { userId: req.user.id, postId, type: payload.type },
      })
      createdReaction = true
    }

    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: postInclude,
    })

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (createdReaction && targetPost.authorId !== req.user.id) {
      await safeCreateNotification({
        userId: targetPost.authorId,
        actorId: req.user.id,
        postId,
        type: NotificationType.REACTION,
        message: `${req.user.name} reacted (${payload.type.toLowerCase()}) to your post`,
      })
    }

    return res.json(formatPost(updatedPost, req.user.id))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid reaction data', issues: error.issues })
    }
    next(error)
  }
})

module.exports = { postsRouter: router }
