const Router = require('express').Router;
const router = new Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const userController = require('../controllers/user-controller');
const postController = require('../controllers/post-controller');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));
router.get('/', (req, res) => {res.json("router's working")});
// ------------------------------ Users ------------------------------ //
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({min: 5, max: 32}),
  body('username').isLength({min: 5, max: 32}),
  userController.register
);
router.post('/signIn', userController.signIn);
router.get('/signOut', authMiddleware, userController.signOut);
router.get('/check-auth', authMiddleware, userController.auth);
router.get('/refresh', userController.refresh);
router.post('/follow',authMiddleware, userController.follow);
router.post('/unfollow', authMiddleware, userController.unfollow);
router.get('/confirm-email/:link', userController.confirmEmail);
router.get('/user', authMiddleware, userController.getUser);
// ------------------------------ Posts ------------------------------ //
router.post('/create-post', authMiddleware, postController.createAPost);
router.get('/posts', postController.getPosts);
router.post('/following-posts', authMiddleware, postController.getFollowingPosts);
router.post('/comment-post', authMiddleware, postController.commentAPost);
router.post('/like-post', authMiddleware, postController.likeAPost);
router.post('/edit-post', authMiddleware, postController.editAPost);
router.delete('/delete-post', authMiddleware, postController.deleteAPost);

module.exports = router;