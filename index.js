const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wymui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


console.log(uri)

async function run(){
    try{
        await client.connect();

        const database = client.db('My-BlogNadia');
        const blogCollection = database.collection('blogs');
        const usersCollection = database.collection('users');
        const messagesCollection = database.collection('reviewMessages');
        



        app.get('/blogs', async(req, res) => {
            const cursor = blogCollection.find({});
            const blogs = await cursor.toArray();
            res.send(blogs);
          })

          app.post('/blogs', async (req, res) => {
            const blogs = req.body;
            const result = await blogCollection.insertOne(blogs);
            res.json(result);
          });

          app.post('/reviewMessages',async(req, res) => {
            const reviewMessages = req.body;
            const result = await messagesCollection.insertOne(reviewMessages);
            res.json(result);
          })

          app.delete('/blogs/:id',  async(req, res) => {
            const id = req.params.id;
            console.log("delete",id);
            const query = {_id : ObjectId(id)};
            const result = await blogCollection.deleteOne(query);
            res.json(result);
          })
          

          app.get('/users/:email', async(req,res)=> {
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false
            if(user?.role === 'admin'){
              isAdmin= true;
            }
            res.json({admin: isAdmin});
      
          })

          app.post('/users', async(req,res)=> {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
            console.log(result);
          })

          app.put('/users', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const options = { upsert: true };
            const updateUser = { $set: user };
            const result = await usersCollection.updateOne(filter, updateUser, options);
            res.json(result);

          })
        
          
   app.put('/users/admin', async(req,res) => {
     const user = req.body;
     const filter = {email: user.email};
     const updateUser = {$set: {role: 'admin'}
}



 const result = await usersCollection.updateOne(filter, updateUser);
 res.json(result);

   })

 app.get('/blogs/blogItem/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const blog = await blogCollection.findOne(query);
    console.log('load usr with id:', id);
    res.send(blog);
  
   })

    }
    finally{
        // await client.close();
      }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Nadia!')
  })
  
  app.listen(port, () => {
    console.log(`listening at ${port}`)
  })