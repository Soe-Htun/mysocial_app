require('dotenv').config()
const { NotificationType } = require('@prisma/client')
const { prisma } = require('./lib/prisma')
const { hashPassword } = require('./utils/password')

async function main() {
  const demoPassword = await hashPassword('password123')

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@social.app' },
    update: {},
    create: {
      name: 'Demo Founder',
      email: 'demo@social.app',
      passwordHash: demoPassword,
      headline: 'Building SocialSphere',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      coverUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60',
      location: 'San Francisco, CA',
    },
  })

  const teammate = await prisma.user.upsert({
    where: { email: 'teammate@social.app' },
    update: {},
    create: {
      name: 'Product Teammate',
      email: 'teammate@social.app',
      passwordHash: await hashPassword('password123'),
      headline: 'Design Systems @ Collective',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      coverUrl:
        'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=60',
      location: 'New York, NY',
    },
  })

  const samplePosts = [
    {
      authorId: demoUser.id,
      content: 'Kicked off our new community space focused on thoughtful product building. Come say hi!',
    },
    {
      authorId: teammate.id,
      content: 'Motion study for the onboarding tour. Debating how far to push it — thoughts welcome.',
      mediaUrl:
        'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60',
    },
  ]

  await prisma.post.createMany({
    data: samplePosts,
    skipDuplicates: true,
  })

  const seededPosts = await prisma.post.findMany({
    where: {
      content: {
        in: samplePosts.map((post) => post.content),
      },
    },
  })

  const postByContent = seededPosts.reduce((acc, post) => {
    acc[post.content] = post
    return acc
  }, {})

  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        actorId: teammate.id,
        message: 'Product Teammate left feedback on your post.',
        type: NotificationType.COMMENT,
        postId: postByContent[samplePosts[0].content]?.id || null,
      },
      {
        userId: demoUser.id,
        message: '3 new designers requested to connect.',
        type: NotificationType.REACTION,
        postId: postByContent[samplePosts[1].content]?.id || null,
      },
    ],
  })

  await prisma.message.create({
    data: {
      body: 'Loved your last post. Want to collaborate on a session next week?',
      senderId: teammate.id,
      recipientId: demoUser.id,
    },
  })

  console.log('Seed data ready! Demo login → demo@social.app / password123')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
