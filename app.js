import express from 'express';
import mongodb, { MongoClient } from 'mongodb';
import mongoose, { Schema, Aggregate } from 'mongoose';
import bodyParser from 'body-parser';

mongoose.Promise = global.Promise;
// process.env.MONGODB_URI ||
// 'mongodb://root:bestappever@ds133856.mlab.com:33856/coffeewifi' ||
mongoose.connect('mongodb://localhost:27017/test'
, {useMongoClient: true});

// let userSchema = new Schema({
//   sub: String,
//   liked_workspaces: {type: [Schema.Type.ObjectId]}
// });

let userSchema = new Schema({
  name: String,
  title: String,
  num: Number
});


let businessSchema = new Schema({
  name: String,
  loc: { type: {type: String }, coordinates: [Number]}
});
businessSchema.index({'loc': '2dsphere'});


let User = mongoose.model('User', userSchema);
let Business = mongoose.model('businesses', businessSchema);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  let server = app.listen(process.env.PORT || 8080, () => {
    let port = server.address().port;
    console.log("App now running on port", port);
  });

  // User.create({name: "Jeff",
  //              title: "AA",
  //              num: 233})
});


const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/testinsert', (req, res) => {
  console.log("on test");

  res.send("hi")
})

app.get('/', (req, res) => {
  res.send("HI THERE");
});

app.post("/users", (req, res) => {
  // let query = getUsername(req.body);
  User.findOne(req.body, (err, user) => {
    if (err) {
      console.log("err",  err);
      res.json(err);
    }
    if (user === null) {
      User.create({sub: req.body.sub}, (err, doc) => {
        if(err) {
          console.log(err);
          res.json(err)
        }
        console.log("created user", doc);
        res.json(doc)
      })
    } else {
      console.log("user was found", user);
      res.json(user);
    }
  });
});

//test
let filter;
let name;
let radius;
let location;
let outlets;
let query;
let aggregate;
let pipeline;
app.post('/filter', (req,res) => {
   filter = req.body;
  //  console.log(filter);
   name = filter.name;
   console.log(name);
   radius = filter.radius;
   location = filter.location;
   outlets = filter.outlets;
   console.log("r", radius);
   console.log("l", location);
   console.log("o", outlets);
   aggregate = Business.aggregate()
   if (name) {
     aggregate = aggregate.match({name});
   }
   if (radius && location) {
     aggregate = aggregate.near({
           "near": location,
           "distanceField": "dist.calculated",
           "spherical": true,
           "maxDistance": radius
     })
    //  console.log(aggregate.pipeline());
   }
   if (outlets) {
     aggregate = aggregate.match({outlets})
   }

   aggregate.exec((err, result) => {
     if (err) {
       console.log(err);
       res.json(err);
     }
     console.log(result);
     res.json(result);
   })
});

app.get('/businesses', (req, res) => {
  Business.aggregate(
    [
        { "$geoNear": {
            "near": {
                "type": "Point",
                "coordinates": [-122.41, 37.78]
            },
            "distanceField": "distance",
            "spherical": true,
            "maxDistance": 100
        }}
    ],
    function(err,results) {
      console.log(results);
      res.json(results)
    }
)
});
