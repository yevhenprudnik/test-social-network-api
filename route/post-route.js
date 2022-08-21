const Router = require('express').Router;
const postRouter = new Router();
const postController = require('../controllers/post-controller');
const authMiddleware = require('../middleware/auth-middleware');

// TODO: use as global authMiddleware, don't use for every route

postRouter.get('/', (req, res) => {res.json("router's working")});

// TODO: .post(/posts, postController.createPost)

// TODO: .post(/posts/:id/comments, postController.commentPost)

// and other in the same way (REST-API)
// example: https://learn.co/lessons/sinatra-restful-routes-readme#:~:text=A%20RESTful%20route%20is%20a,HTTP%20verb%20and%20the%20URL.


postRouter.post('/create-post', authMiddleware, postController.createPost);
postRouter.get('/posts', authMiddleware, postController.getPosts);
postRouter.post('/comment-post', authMiddleware, postController.commentPost);
postRouter.post('/like-post', authMiddleware, postController.likePost);
postRouter.post('/edit-post', authMiddleware, postController.editPost);
postRouter.delete('/delete-post', authMiddleware, postController.deletePost);

module.exports = postRouter;