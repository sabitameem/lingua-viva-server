const express = require('express');
const app=express();
const cors = require('cors');
require('dotenv').config()
const port =process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgocvky.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    
    const reviewCollection =client.db("linguaDb").collection("reviews");
    const topClassesCollection = client.db("linguaDb").collection("topClasses")
    const instructorsCollection = client.db("linguaDb").collection("instructors");
    // this route is for selected classes that user selected
    const selectedClassCollection = client.db("linguaDb").collection("classes");

// reviews
    app.get('/reviews', async(req,res)=>{
        const result = await reviewCollection.find().toArray();
        res.send(result);
    })
  //top classes
    app.get('/topclasses',async(req,res)=>{
      // res.send('hello topclass')
      const result =await topClassesCollection.find().toArray();
      
      res.send(result)
    })

    //instructors
    app.get('/instructors',async(req,res)=>{
      // res.send('instructors')
      const result = await instructorsCollection.find().toArray();
      res.send(result)
    })

    //selected-classes
    app.get('/classes', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await selectedClassCollection.find(query).toArray();
      res.send(result);
    });



    app.post('/classes', async (req, res) => {
      const classCard = req.body;
      console.log(classCard);
      const result = await selectedClassCollection.insertOne(classCard);
      res.send(result);
    })

    // having problem with https://lingua-viva-server.vercel.app/reviews
    // it was network issue





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Language sikho sobai')
})

app.listen(port,()=>{
    console.log(`language sikhte hole aso sikhi : ${port}eeeeeeee`)
})