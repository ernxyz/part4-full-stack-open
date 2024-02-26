const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (req, res, next) => {
  logger.log('Method: ', req.method)
  logger.log('Path: ', req.path)
  logger.log('Body: ', req.body)
  logger.log('---')

  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.startsWith('Bearer ')) {

    const token = authorization.replace('Bearer ', '')
    const decodedToken = jwt.verify(token, process.env.SECRET)
    req.tokenId = decodedToken.id
  }
  
  next()
}

const errorHandler = (err, req, res, next) => {
  logger.log(err)

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' })
  } else if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformated id' })
  } else if (err.name === 'MongoServerError' && err.message.includes('E11000 duplicate key error')) {
    return res.status(400).send({ error: 'expected `username` to be unique' })
  }

  next(err)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  tokenExtractor,
  errorHandler
}