const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./testHelper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { log } = require('../utils/logger')
const bcrypt = require('bcrypt')


beforeEach(async () => {

  await User.deleteMany({})

  const users = helper.initialUsers
    .map(user => new User({
      username: user.username,
      name: user.name,
      passwordHash: bcrypt.hashSync(user.password, 10)
    }));

  let promisesArray = users.map(user => user.save())

  await Promise.all(promisesArray)


  await Blog.deleteMany({})

  const user = await helper.getFirstUserId()

  log(user)

  const blogs = helper.initialBlogs
    .map(blog => new Blog({
      ...blog,
      author: user
    }))

  promisesArray = blogs.map(blog => blog.save())

  await Promise.all(promisesArray)
})

describe('tests for users', () => {
  test('there are initial values', async () => {
    const res = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(res.body).toHaveLength(helper.initialUsers.length)
  })

  test('adding a new user successfully', async () => {
    const newUser = {
      username: 'bob123',
      name: 'Bob',
      password: '000111'
    }

    const { body: addedUser } = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const newDbValues = await helper.userDbValues()

    expect(newDbValues).toHaveLength(helper.initialUsers.length + 1)
    
    expect(addedUser).toMatchObject({ username: 'bob123' })
  })

  test('register failed because of length of username or password', async () => {
    const newUser = {
      username: 'bo',
      name: 'Bobby',
      password: '01'
    }

    const res = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const dbValues = await helper.userDbValues()

    const usernames = dbValues.map(u => u.username)

    expect(dbValues).toHaveLength(helper.initialUsers.length)
    
    expect(usernames).not.toContain({ username: 'bob123' })
  })
})

describe('logging in', () => {
  
  test('successfully logged in', async () => {

    const dbUser = helper.initialUsers[0]

    const user1 = {
      username: dbUser.username,
      password: dbUser.password
    }

    const res = await api
      .post('/api/login')
      .send(user1)
      .expect(200)

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('username', dbUser.username);
      expect(res.body).toHaveProperty('name', dbUser.name)
  })

  test('error logging in', async () => {

    const user1 = {
      username: helper.initialUsers[0].username,
      password: helper.initialUsers[0].password + '123'
    }

    const res = await api
      .post('/api/login')
      .set('body', user1)
      .expect(401)
  })
})

describe("when there's initially some blogs saved", () => {

  test("the total amount of blogs is expected", async () => {

    const token = await helper.getToken(api)

    const response = await api
      .get("/api/blogs")
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/)
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
  
  test("blogs have an id attribute", async () => {
    const token = await helper.getToken(api)
  
    const response = await api
      .get("/api/blogs")
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/)
  
    const blogsId = response.body.map(blog => blog.id)
  
    blogsId.forEach(id => {
      expect(id).toBeDefined()
    });
  
  })
})

describe("when adding new blogs", () => {

  test("a new post is added successfully", async () => {

    const user = await helper.getFirstUserId()
    const token = await helper.getToken(api)

    const blog = {
      title: "test-blog",
      author: user,
      url: "String",
      likes: 0
    }
    
    const response = await api
      .post("/api/blogs")
      .set('Authorization', `Bearer ${token}`)
      .send(blog)
      .expect(201)
      .expect("Content-Type", /application\/json/)
  
    const blogsUpdated = await helper.blogDbValues()
  
    expect(blogsUpdated).toHaveLength(helper.initialBlogs.length + 1)
  
    const addedBlog = response.body
  
    expect(addedBlog).toMatchObject({
      title: "test-blog",
      author: user,
      url: "String",
      likes: 0
    })
    
  })
  
  test('verify when likes property is missing it is set to zero', async () => {

    const user = await helper.getFirstUserId()
    const token = await helper.getToken(api)

    const newBlog = {
      title: "test-blog",
      author: user,
      url: "String"
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsUpdated = await helper.blogDbValues()
  
    const blogAdded = blogsUpdated.find(blog => blog.title === newBlog.title)
  
    expect(blogAdded.likes).toBe(0)
  })
  
  test('if title or author is missing get a bad request code', async () => {

    const user = await helper.getFirstUserId()
    const token = await helper.getToken(api)

    const newBlog = {
      title: 'test-blog',
      author: user,
      likes: 0
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe("when editing blogs", () => {

  test("blog is updated successfully", async () => {

    let initialBlogs = await helper.blogDbValues()

    let firstBlog = initialBlogs[0]

    const toUpdate = {
      likes: 100
    }

    const token = await helper.getToken(api)

    const resToUpdate = await api
      .put(`/api/blogs/${firstBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(toUpdate)
      .expect(200)
      .expect("Content-Type", /application\/json/)


    initialBlogs = await helper.blogDbValues()

    firstBlog = initialBlogs[0]

    expect(firstBlog.likes).toBe(resToUpdate.body.likes)
    expect(toUpdate).toMatchObject({likes: resToUpdate.body.likes})
  })
})

describe("when deleting blogs data", () => {

  test("delete successfully", async () => {

    const blogsAtBeginning = await helper.blogDbValues()

    const lastBlog = blogsAtBeginning[blogsAtBeginning.length - 1]

    const token = await helper.getToken(api)

    await api
      .delete(`/api/blogs/${lastBlog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogDbValues()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length - 1)

    const urls = blogsAtEnd.map(n => n.url)

    expect(urls).not.toContain(lastBlog.url)

  })
})

afterAll(async () => {
  mongoose.connection.close()
})