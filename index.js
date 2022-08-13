const express = require('express');
const cors = require('cors');
require('dotenv').config()
const PORT = process.env.PORT || 3001;
const mongoose = require('mongoose');
const router = require('./route/index');
const errorMiddleware = require('./middleware/error-middleware');
const cookieParser = require('cookie-parser')
const app = express();


app.use( cookieParser() );
app.use( cors() );
app.use( express.urlencoded({ extended : true }));
app.use( express.json() );
app.use( '/api', router );
app.use( errorMiddleware );

app.get('/', (req, res) => {
  res.json("It's working!");
})

const start = (async () => {
  try {
    mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`)
    })
  } catch (err) {
    console.log(err.message);
  }
})();