const Router = require('express').Router
const router = new Router();
const userController = require('../controllers/user-controller')

router.get('/', (req, res) => {
  res.json("router's working")
})

router.post('/register', userController.register);
router.post('/signIn', userController.signIn);

module.exports = router