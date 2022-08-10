const ApiError = require('../exceptions/api-error');
const postService = require('../services/post-service');

class PostController {

// -------------------------------- Create a Post ----------------------------------- //

  async createAPost(req, res, next) {
    try {
      const { text } = req.body;
      const postedBy = req.user.id;
      const postData = await postService.createAPost(postedBy, text);

      return res.json(postData);
    } catch (error) {
      next(error);
    }
  }

// --------------------------------- Get posts/post ------------------------------- //

  async getPosts(req, res, next) {
    try {
        let searchQuery = {};
        req.query.id ? searchQuery.postedBy = req.query.id : null;
        const posts = await postService.getPosts(searchQuery);

        res.json(posts);
    } catch (error) {
      next(error);
    }
  }

// ------------------- Get posts of specific users(users you follow) --------------------- //

  async getFollowingPosts(req, res, next) {
    try {
        const { followingIdsArray } = req.body;
        const posts = await postService.getFollowingPosts(followingIdsArray);
        res.json(posts);
    } catch (error) {
      next(error);
    }
  }

// ------------------------------ Comment a Post -------------------------------- //

  async commentAPost(req, res, next) {
    try {
      const { postId, comment } = req.body;
      const userId = req.user.id;
      const userComment = await postService.commentAPost(userId, postId, comment);

      return res.json(userComment);
    } catch (error) {
      next(error);
    }
  }

// ------------------------------ Like a Posts -------------------------------- //

  async likeAPost(req, res, next) {
    try {
      const { postId } = req.body;
      const userId = req.user.id;

      const post = await postService.likeAPost(userId, postId);

      return res.json(post);
    } catch (error) {
      next(error);
    }
  }

// ------------------------------ Edit a Post -------------------------------- //

  async editAPost(req, res, next) {
    try {
      const { postId, newText } = req.body;
      const userId = req.user.id;
      const newPost = await postService.editAPost(userId, postId, newText);
  
      return res.json(newPost)
    } catch (error) {
      next(error);
    }
  }

  // ------------------------------ Delete Post -------------------------------- //
  async deleteAPost(req, res, next) {
    try {
      const { postId } = req.body;
      const userId = req.user.id;
      const result = await postService.deleteAPost(userId, postId);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();