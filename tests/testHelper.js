const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    "title": "where's the money",
    "url": "jdoe.com",
    "likes": 9
  },
  {
    "title": "getting stronger",
    "url": "janed.com",
    "likes": 17
  },
  {
    "title": "block",
    "url": "she.com",
    "likes": 99
  }
]

const initialUsers = [
  {
    "username": "jenna doe",
    "name": "Jenna",
    "password": "87654321"
  },
  {
    "username": "john doe",
    "name": "John",
    "password": "876"
  }
]

const getToken = async (api) => {
  const user = initialUsers[0]

  const response = await api
    .post('/api/login')
    .send({ username: user.username, password: user.password })
    .expect(200);

  return response.body.token;
}


const blogDbValues = async () => {
  const blogs = await Blog.find({})

  return blogs.map(b => b.toJSON())
}

const userDbValues = async () => {
  const users = await User.find({})

  return users.map(u => u.toJSON())
}

const getFirstUserId = async () => {
  const userHelper = await User.findOne({username: initialUsers[0].username})
  return userHelper._id.toString()
}

module.exports = {
  initialBlogs,
  initialUsers,
  getToken,
  blogDbValues,
  userDbValues,
  getFirstUserId
}