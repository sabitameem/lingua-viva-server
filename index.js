const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgocvky.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const reviewCollection = client.db("linguaDb").collection("reviews");
    const usersCollection = client.db("linguaDb").collection("users");
    const topClassesCollection = client.db("linguaDb").collection("topClasses");
    const instructorsCollection = client
      .db("linguaDb")
      .collection("instructors");
    // this route is for selected classes that user selected
    const selectedClassCollection = client.db("linguaDb").collection("classes");



    //jwt
    app.post('/jwt',(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })


   //user related routes

   app.get('/users', async(req,res)=>{
    const result =await usersCollection.find().toArray();
    res.send(result);
   })




   app.post('/users', async(req,res)=>{
    const user = req.body;
    const query = { email: user.email }
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: 'user already exists' })
    }

    const result = await usersCollection.insertOne(user);
    res.send(result);
   })


   //admin 
   app.patch('/users/admin/:id', async(req,res)=>{
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: 'admin'
      },
    };
    const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
   })

   //instructor
   app.patch('/users/instructor/:id', async(req,res)=>{
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: 'instructor'
      },
    };
    const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
   })


    // reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
    //top classes
    app.get("/topclasses", async (req, res) => {
      // res.send('hello topclass')
      const result = await topClassesCollection.find().toArray();

      res.send(result);
    });

    //instructors
    app.get("/instructors", async (req, res) => {
      // res.send('instructors')
      const result = await instructorsCollection.find().toArray();
      res.send(result);
    });

    //selected-classes
    app.get("/classes", verifyJWT, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'forbidden access' })
      }
      const query = { email: email };
      const result = await selectedClassCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/classes", async (req, res) => {
      const classCard = req.body;
      console.log(classCard);
      const result = await selectedClassCollection.insertOne(classCard);
      res.send(result);
    });

    app.delete("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result);
    });

    // having problem with https://lingua-viva-server.vercel.app/reviews
    // it was network issue

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Language sikho sobai");
});

app.listen(port, () => {
  console.log(`language sikhte hole aso sikhi : ${port}eeeeeeee`);
});
