const { default: mongoose } = require('mongoose')
const moongose = require('mongoose')

const userSchema = moongose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLenght: 3
  },
  name: String,
  passwordHash: String,
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

module.exports = mongoose.model('User', userSchema)