const mongoose = require('mongoose')

const ProductShcema = mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  new_price: {
    type: Number,
    required: true
  },
  old_price: {
    type: Number,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  avilable: {
    type: Boolean,
    default: true
  }

})

module.exports = mongoose.model('Product', ProductShcema)