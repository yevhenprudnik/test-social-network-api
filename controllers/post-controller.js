const postService = require('../services/post-service');
// TODO: add space after require for (all files)
class PostController {

// -------------------------------- Create a Post ----------------------------------- //

  async createPost(req, res, next) {
    try {
      const { text, header } = req.body;
      const postedBy = req.user.username;
      const postData = await postService.createPost(postedBy, header, text);

      return res.json(postData);
    } catch (error) {
      next(error);
    }
  }

// --------------------------------- Get posts/post ------------------------------- //
  // TODO: add separate action for getPost
  async getPosts(req, res, next) {
    try {
        const userId = req.user.id;
        const postId = req.query.postId;
        const postedBy = req.query.postedBy;
        // TODO: use can use getPosts({ userId: req.user.id, postedBy: req.postedBy })

        // TODO: add pagination
        const posts = await postService.getPosts(postId, userId, postedBy);

        res.json(posts);
    } catch (error) {
      next(error);
    }
  }

// ------------------------------ Comment a Post -------------------------------- //

  // TODO: create comment-controller

  async commentPost(req, res, next) {
    try {
      const { postId, comment } = req.body;
      const userId = req.user.id;
      const userComment = await postService.commentPost(userId, postId, comment);

      return res.json(userComment);
    } catch (error) {
      next(error);
    }
  }

  // TODO: create like-controller

// ------------------------------ Like a Posts -------------------------------- //

  async likePost(req, res, next) {
    try {
      const { postId } = req.body;
      const userId = req.user.id;

      const post = await postService.likePost(userId, postId);

      return res.json(post);
    } catch (error) {
      next(error);
    }
  }

// ------------------------------ Edit a Post -------------------------------- //

  async editPost(req, res, next) {
    try {
      const { postId, newText } = req.body;
      const postedBy = req.user.username;
      const newPost = await postService.editPost(postedBy, postId, newText);
  
      return res.json(newPost)
    } catch (error) {
      next(error);
    }
  }

  // ------------------------------ Delete Post -------------------------------- //
  async deletePost(req, res, next) {
    try {
      const { postId } = req.body;
      const postedBy = req.user.username;
      const result = await postService.deletePost(postedBy, postId);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();