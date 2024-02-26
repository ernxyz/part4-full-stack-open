const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controller/blogs')
const userRouter = require('./controller/users')
const loginRouter = require('./controller/login')
const middleware = require('./utils/middleware')
require('express-async-errors')
const cors = require('cors')
const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

mongoose.connect(config.URL)
  .then(() => {
    logger.log(`connected to ${config.URL}`)
  })
  .catch(error => {
    logger.error(error)
  })

app.use(cors())
app.use(express.json())

app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/blogs', middleware.tokenExtractor, blogsRouter)
app.use('/api/users', userRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app