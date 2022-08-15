const Router = require('express').Router;
const postRouter = new Router();
const postController = require('../controllers/post-controller');
const authMiddleware = require('../middleware/auth-middleware');

postRouter.get('/', (req, res) => {res.json("router's working")});

postRouter.post('/create-post', authMiddleware, postController.createPost);
postRouter.get('/posts', authMiddleware, postController.getPosts);
postRouter.post('/comment-post', authMiddleware, postController.commentPost);
postRouter.post('/like-post', authMiddleware, postController.likePost);
postRouter.post('/edit-post', authMiddleware, postController.editPost);
postRouter.delete('/delete-post', authMiddleware, postController.deletePost);

module.exports = postRouter;