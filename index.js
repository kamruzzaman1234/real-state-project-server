const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 6010




require('dotenv').config()

// Middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Middleware 

const loger = async(req,res,next)=>{
    console.log('Called', req.host, req.originalUrl)
    next()
}

app.get('/', (req,res)=>{
    res.send("Hello Server !!")
})



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.7olulz0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    // Send a ping to confirm a successful connection

    const realEstateCollection = client.db('real_estate_proparties').collection('proparties_data')
    const bookingPropertyCollection = client.db('real_estate_proparties').collection('bookingProperty')
    // create Web json token
    app.post('/jwt', (req, res)=>{
      const user = req.body 
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_JSON_TOKEN,
         {expiresIn: '1h'})
         console.log("Token cookie is", token)
        res.
      cookie('token',  token, {
        httpOnly: true,
        secure: false
      })
      .send({success: true})
    })

    // Show the data in client get 
    app.get('/proparties', async(req,res)=>{
        const cursor = realEstateCollection.find()
        const result = await cursor.toArray()
        res.send(result);
    })

    // Show the data in client get
    app.get('/proparties/:id', async(req, res)=>{
        const id = req.params.id 
        const query = {_id: new ObjectId(id)}
        const option = {
            projection: {title: 1, image:1, price:1, location: 1}
        }
        const result = await realEstateCollection.findOne(query, option)
        res.send(result)
    })

    // Post Data In Client
    app.post('/bookings', async(req, res)=>{
      const booking = req.body
      // console.log(booking)
      const result = await bookingPropertyCollection.insertOne(booking)
      res.send(result)
    })

    app.get('/bookings', async(req, res) => {
      console.log('Email:', req.query.email);
      console.log("Token cookie is ", req.cookies.token)
    
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
    
      const result = await bookingPropertyCollection.find(query).toArray();
      res.send(result);
    });

     // Delete Korar Get Method
     app.delete('/bookings/:id', async(req,res)=>{
      const id = req.params.id 
      const query = {_id : new ObjectId(id)}
      const result = await bookingPropertyCollection.deleteOne(query)
      res.send(result)
      console.log(result)
  })

      // Update / patch 
      app.patch('/bookings/:id', async(req,res)=>{
        const id = req.params.id
        const filter = {_id: new ObjectId(id)}
        const updateBooking = req.body 
        console.log(updateBooking)
        const updateDoc = {
          $set: {
            status: updateBooking.status
          }
        }
        const result = await bookingPropertyCollection.updateOne(filter, updateDoc)
        res.send(result)
      })
      
  



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.listen(port, ()=>{
    console.log(`Server is Running is port is ${port}`)
})