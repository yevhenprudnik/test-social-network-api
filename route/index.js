const Router = require('express').Router;
const router = new Router();
const userController = require('../controllers/user-controller');
const postController = require('../controllers/post-controller');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');


router.get('/', (req, res) => {res.json("router's working")});
// ------------------------------ Users ------------------------------ //
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({min: 5, max: 32}),
  body('username').isLength({min: 5, max: 32}),
  userController.register
);
router.post('/signIn', userController.signIn);
router.get('/auth', authMiddleware, userController.auth);
router.get('/refresh', userController.refresh);
router.get('/confirmEmail/:link', userController.confirmEmail);
router.get('/getUser', authMiddleware, userController.getUser);
// ------------------------------ Posts ------------------------------ //
router.post('/createAPost', authMiddleware, postController.createAPost);
router.get('/getPosts', postController.getPosts);
router.post('/getFollowingPosts', authMiddleware, postController.getPosts);
router.post('/commentAPost', authMiddleware, postController.commentAPost);
router.post('/likeAPost', authMiddleware, postController.likeAPost);
router.post('/editAPost', authMiddleware, postController.editAPost);
router.delete('/deleteAPost', authMiddleware, postController.deleteAPost);

module.exports = router;