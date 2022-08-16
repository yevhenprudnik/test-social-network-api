const express = require('express');
const cors = require('cors');
require('dotenv').config()
const PORT = process.env.PORT || 3001;
const mongoose = require('mongoose');
const userRouter = require('./route/user-route');
const postRouter = require('./route/post-route');
const oauthRouter = require('./route/oauth');
const errorMiddleware = require('./middleware/error-middleware');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();

app.use( cookieParser() );
app.use( cors() );
app.use( express.urlencoded({ extended : true }));
app.use( express.json() );
app.use( '/user', userRouter );
app.use( '/post', postRouter );
app.use( '/oauth', oauthRouter );
app.use( '/documentation', swaggerUi.serve );
app.use( errorMiddleware );

app.get('/documentation', swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json(`Documentation: ${process.env.API_URL}/documentation`);
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