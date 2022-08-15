const Router = require('express').Router;
const userRouter = new Router();
const userController = require('../controllers/user-controller');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');

userRouter.get('/', (req, res) => {res.json("userRouter's working")});

userRouter.post('/register',
  body('email').isEmail(),
  body('password').isLength({min: 5, max: 32}),
  body('username').isLength({min: 5, max: 32}),
  userController.register
);
userRouter.post('/signIn',  userController.signIn);
userRouter.get('/signOut', authMiddleware, userController.signOut);
userRouter.get('/check-auth', authMiddleware, userController.auth);
userRouter.get('/refresh', userController.refresh);
userRouter.get('/confirm-email/:link', userController.confirmEmail);
userRouter.get('/user', authMiddleware, userController.getUser);
userRouter.post('/send-request',authMiddleware, userController.sendRequest);
userRouter.post('/accept-request', authMiddleware, userController.acceptRequest);
userRouter.post('/reject-request', authMiddleware, userController.rejectRequest);
userRouter.delete('/delete-friend', authMiddleware, userController.deleteFriend);
userRouter.post('/change-avatar',authMiddleware, userController.changeAvatar);

module.exports = userRouter;