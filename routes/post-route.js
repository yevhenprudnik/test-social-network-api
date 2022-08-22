const Router = require('express').Router;
const router = new Router();
const postController = require('../controllers/post-controller');
const authMiddleware = require('../middleware/auth-middleware');
const commentPost = require('../controllers/comment-controller')
const likePost = require('../controllers/like-controller')

router.get('/', (req, res) => {res.json("router's working")});

router.use( authMiddleware );

router.post('/post', postController.createPost);
router.get('/posts', postController.getFriendsPosts);
router.get('/posts/:postedBy', postController.getUserPosts);
router.get('/post/:id', postController.getPost);
router.post('/post/:id/comment', commentPost);
router.get('/post/:id/like', likePost);
router.post('/post/:id/edit', postController.editPost);
router.delete('/post/:id/delete', postController.deletePost);

module.exports = router;