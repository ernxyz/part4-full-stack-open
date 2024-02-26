const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (req, res) => {

  const blogs = await Blog
    .find({})
    .populate('author', { username: 1, name: 1 })

  res.json(blogs)

})

blogsRouter.get('/:id', async (req, res) => {

  const blog = await Blog.findById(req.params.id)

  if (blog) {
    res.json(blog)
  } else {
    res.status(404).end()
  }

})

blogsRouter.post('/', async (req, res) => {
  const body = req.body

  const decodedTokenId = req.tokenId

  if (!decodedTokenId) {
    return res.status(401).json({ error: 'invalid token' })
  }

  const user = await User.findById(decodedTokenId)

  if (body.title && body.url) {  
    const blog = new Blog({
      title: body.title,
      author: user._id,
      url: body.url,
      likes: body.likes || 0
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)

    await user.save()

    res.status(201).json(savedBlog)
  } else {
    res.status(400).json({ error: 'title or url is missing' })
  }

})

blogsRouter.put("/:id", async (req, res) => {
  const body = req.body

  const decodedTokenId = req.tokenId

  if (!decodedTokenId) {
    return res.status(401).json({ error: 'invalid token' })
  }

  const user = await User.findById(decodedTokenId)

  const dataToUpdate = {
    title: body.title,
    author: user._id,
    url: body.url,
    likes: body.likes
  }
  
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, dataToUpdate, { new: true })

  res.json(updatedBlog) 
})

blogsRouter.delete('/:id', async (req, res) => {

  const blogId = req.params.id
  const decodedTokenId = req.tokenId

  if (!decodedTokenId) {
    return res.status(401).json({ error: 'invalid token' })
  }

  const user = await User.findById(decodedTokenId)
  const blog = await Blog.findById(blogId)

  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }

  if (!(blog.author.toString() === user.id.toString())) {
    return res.status(405).json({ error: 'you do not have permission' })
  }
  blog.deleteOne()
  res.status(204).end()

})

module.exports = blogsRouter