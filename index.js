const express = require('express');
require('dotenv').config()
const PORT = process.env.PORT || 3000;
const app = express();
const mongoose = require('mongoose');

app.use( express.json() );


app.get('/', (req, res) => {
  res.json("It's working!");
})


const start = (async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`)
    })
  } catch (err) {
    console.log(err.message);
  }
})()