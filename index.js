const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 6010
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

// Middleware
app.use(cors())
app.use(express.json())

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