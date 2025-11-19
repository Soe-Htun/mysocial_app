const jwt = require('jsonwebtoken')
const { prisma } = require('../lib/prisma')

const parseToken = (req) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    return header.split(' ')[1]
  }
  return req.cookies?.token
}

const requireAuth = async (req, res, next) => {
  try {
    const token = parseToken(req)
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme')
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

const optionalAuth = async (req, _res, next) => {
  try {
    const token = parseToken(req)
    if (!token) return next()
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme')
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (user) {
      req.user = user
    }
  } catch (error) {
    // noop
  }
  next()
}

module.exports = { requireAuth, optionalAuth }
