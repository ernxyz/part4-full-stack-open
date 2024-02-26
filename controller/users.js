const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.get('/', async (req, res) => {
  const list = await User
    .find({})
    .populate('blogs', { title: 1, likes: 1 })

  res.json(list)
})

userRouter.post('/', async (req,res) => {
  const { username, name, password } = req.body

  if (password.length < 3) {
    return res.status(400).json({ error: "invalid length for password" })
  }

  const encryptedPassword = await bcrypt.hash(password, 10)

  const newUser = new User({
    username: username,
    name: name,
    passwordHash: encryptedPassword
  })

  const savedUser = await newUser.save()

  res.status(201).json(savedUser)
})

module.exports = userRouter