const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  cartData: {
    type: Object
  },
  Date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', UserSchema)