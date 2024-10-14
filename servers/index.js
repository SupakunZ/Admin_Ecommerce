const express = require('express')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT
// Library
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path') // Module ที่ใช้ทำงานกับไฟล์
const multer = require('multer') // Middleware ที่ช่วยจัดการการอัพโหลดไฟล์ในฝั่ง Node.js
const jwt = require('jsonwebtoken')
const connectDB = require('./db/ConnectDB')
const modelSchema = require('./models/Models')
const UserSchema = require('./models/UserModel')
const { error } = require('console')


app.use(express.json())
app.use(cors())

//Contect Databases
connectDB()

// API Create
app.get('/', (req, res) => {
  res.send('Successfully connected to server.')
})

// Create Data to Databases
app.post('/addproduct', async (req, res) => {
  let products = await modelSchema.find({})
  let id
  // Logic Auto increment ID
  if (products.length > 0) { // ถ้า db มีข้อมูล
    let last_product_array = products.slice(-1) //เอาแค่ตัวสุดท้ายมา
    let last_product = last_product_array[0]
    id = last_product.id + 1 // เข้าถึง id แล้วบวกไอดีต่อไป
  } else {
    id = 1;
  }
  const product = new modelSchema({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
    data: req.body.data,
    avilable: req.body.avilable
  })
  console.log(product)
  await product.save()
  console.log('Success')
  res.json({ success: true, name: req.body.name })
})

// Delete Data
app.post('/removeproduct', async (req, res) => {
  await modelSchema.findOneAndDelete({ id: req.body.id })
  console.log('Remove')
  res.json({ success: true, name: req.body.name })
})

// Image Storage สร้าง Folder ใชัเก็บรูปที่ส่งมา
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => { // รับไฟล์ที่ส่งมา
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ storage: storage })

//Create Upload Route
app.use('/images', express.static('upload/images')) // อนุญาตมให้เข้าถึงโฟเดอร์ upload/images 
app.post('/upload', upload.single('product'), (req, res) => { // upload file จาก form ที่ส่งมา name: product ลงใน /upload
  console.log(req.file)
  res.json({
    success: 1,
    image_url: `http://localhost:${PORT}/images/${req.file.filename}`
  })
})

// Creating API for getting all
app.get('/allproducts', async (req, res) => {
  let products = await modelSchema.find({});
  console.log('All Products Fetched')
  res.send(products)
})

//** Create Endpoint for registering the user */
app.post('/singup', async (req, res) => {
  try {
    // เช็ตว่าใน database มีข้อมู email นี้ไหม 
    let check = await UserSchema.findOne({ email: req.body.email })
    if (check) {
      return res.status(400).json({ suscess: false, errors: "Existing user found with same email address" })
    }
    let cart = {}
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    const user = new UserSchema({ // กำหนกค่าลงใน Table
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      cartData: cart
    })
    await user.save() // save data at database

    const data = {
      user: {
        id: user.id
      }
    }

    // ** use Json Web Token **
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token })
  } catch (error) {
    res.json({ success: "Failed Registering", status: error })
  }
})

// Create Login Route
app.post('/login', async (req, res) => {
  let user = await UserSchema.findOne({ email: req.body.email })
  if (user) { // 1. check ว่า มี email นี้อยูใน database ไหม
    const passCompare = req.body.password == user.password  // 2.Check ว่า password ที่ login เข้ามาตรงกับ database
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      }
      const token = jwt.sign(data, 'secret_ecom') // 3. ส่ง Token กลับไป
      res.json({ success: true, token })
    }
    else {
      res.json({ suscess: false, errors: "Wrong Password" })
    }
  }
  else {
    res.json({ suscess: false, errors: "Wrong Email" })
  }
})

// get newcollection data
app.get('/newcollections', async (req, res) => {
  let products = await modelSchema.find({});
  let newcollection = products.slice(0).slice(-8)
  console.log("NewCollection Fetched")
  res.send(newcollection)
})

// get popular in women section
app.get('/popularinwomen', async (req, res) => {
  let products = await modelSchema.find({ category: "women" })
  let popular_women = products.slice(0, 4)
  console.log("Popular in women Fetched")
  res.send(popular_women)
})


// create middleware
const fectUser = async (req, res, next) => {
  const token = req.header('auth-token')
  if (!token) {
    res.status(401).send({ error: "Please authentication using valid token" })
  } else {
    try {
      const data = jwt.verify(token, 'secret_ecom')
      req.user = data.user
      // console.log(data)
      next()
    } catch (error) {
      res.status(401).send({ error: error })
    }
  }
}

// add product in cartdata
app.post('/addtocart', fectUser, async (req, res) => {
  let userData = await UserSchema.findOne({ _id: req.user.id })
  console.log("Added :", req.body.itemId)
  //updata database
  userData.cartData[req.body.itemId] += 1;
  await UserSchema.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData })
  res.send("Added")
})

// remove product in database
app.post('/removefromcart', fectUser, async (req, res) => {
  let userData = await UserSchema.findOne({ _id: req.user.id })
  console.log("Removed :", req.body.itemId)
  //updata database
  // if (userData.cartData > 0) {
  userData.cartData[req.body.itemId] -= 1;
  await UserSchema.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData })
  res.send("Removed")
  // }
})

// get cartdata
app.post('/getcart', fectUser, async (req, res) => {
  console.log("GetCart")
  let userData = await UserSchema.findOne({ _id: req.user.id })
  res.json(userData.cartData)
})

app.listen(PORT, () => {
  try {
    console.log(`Servers is running on Port ${PORT}`)
  } catch (error) {
    console.log(`Error :` + error)
  }
})