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
  origin:[
    "http://localhost:5173",
    "https://rea-estate-project-8538e.web.app",
    "https://rea-estate-project-8538e.firebaseapp.com"

  ],
  credentials:true,
}))
app.use(express.json())
app.use(cookieParser())




// Middleware 
// Eta host name and Url name Check korbe kon jayegaye data ta load hosce
const logger = async(req,res,next)=>{
    console.log('Called', req.host, req.originalUrl)
    next()
}
// VerifyToken ami jegula dekhate saibo segulai dekhte parbe sudhu eta use kore
const verifyToken = async(req, res, next)=>{
  const token = req.cookies?.token
  console.log(token)
  console.log("Value of the token is ",token)
    if(!token){
      return res.status(401).send({
        message: "not authorized"
      })
    }

    jwt.verify(token, process.env.ACCESS_JSON_TOKEN, (err, decoded)=>{
      console.log(decoded)
        if(err){
          console.log(err)
          return res.status(401).send({message: 'un authorize'})
        }
        console.log('Value in the token is', decoded)
        req.user = decoded
         next()
    })
    
 
}

// const verifyToken = async(req,res,next)=>{
//   const token = req.cookies?.token ;
//   console.log(token)
//   if(!token){
//     return res.status(401).send({message: 'unauthorized access'})
//   }
//   jwt.verify(token, process.env.ACCESS_JSON_TOKEN, (err, decoded)=>{
//     return res.status(401).send({message: "un authorized access"})
//   })
// }
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

const cookieOption = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  secure: process.env.NODE_ENV === "production" ? true : false
}

async function run() {
  try {
    
    // await client.connect();
    // Send a ping to confirm a successful connection

    const realEstateCollection = client.db('real_estate_proparties').collection('proparties_data')
    // const allProperty = client.db('real_estate_proparties').collection('all_property');
    const bookingPropertyCollection = client.db('real_estate_proparties').collection('bookingProperty')
    // create Web json token
    app.post('/jwt', logger, (req, res)=>{
      const user = req.body 
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_JSON_TOKEN,
         {expiresIn: '1h'})
         
        res.
      cookie('token',  token, cookieOption)
      .send({success: true})
    })

    // app.post('/logout', async(req,res)=>{
    //     const user = req.body
    //     console.log(user)
    //     res.clearCookie('token', { ...cookieOption , maxAge: 0 }).send({ success: true });

    // })

    // Show the data in client get 
    app.get('/proparties', async(req,res)=>{
        try {
          const cursor = realEstateCollection.find()
          const result = await cursor.toArray()
          res.send(result);
          console.log(result)
        } catch (error) {
          res.status(200).json({
            message:error,
            status:false
          })
        }
    })

   
    app.get('/proparties/:id', async(req, res)=>{
        const id = req.params.id 
        const query = {_id: new ObjectId(id)}
        const option = {
            projection: {title: 1, image:1, price:1, location: 1}
        }
        const result = await realEstateCollection.findOne(query, option)
        res.send(result)
        console.log("Booking Property is ", result)
    })

    // Post Data In Client
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      if (!booking) {
          return res.status(400).send({ message: "Invalid booking data" });
      }
      try {
          const result = await bookingPropertyCollection.insertOne(booking);
          res.status(201).send({ success: true, insertedId: result.insertedId });
      } catch (error) {
          console.error("Error saving booking:", error);
          res.status(500).send({ success: false, message: "Internal Server Error" });
      }
  });
  

  app.get('/bookings', verifyToken, async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).send({ message: "Email is required" });
    }

    try {
        const bookings = await bookingPropertyCollection.find({ email }).toArray();
        res.status(200).send(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.delete('/bookings/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await bookingPropertyCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.patch('/bookings/:id', async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    try {
        const result = await bookingPropertyCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );
        res.status(200).send(result);
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

      
  



    // await client.db("admin").command({ ping: 1 });
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