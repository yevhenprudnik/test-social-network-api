const Router = require('express').Router
const router = new Router();
const userController = require('../controllers/user-controller')
const { body } = require('express-validator');

router.get('/', (req, res) => {
  res.json("router's working")
})

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({min: 5, max: 32}),
  body('username').isLength({min: 5, max: 32}),
  userController.register
);
router.post('/signIn', userController.signIn);

module.exports = router