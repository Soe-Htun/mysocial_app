const jwt = require('jsonwebtoken')

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' })

const attachToken = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  })
}

module.exports = { signToken, attachToken }
