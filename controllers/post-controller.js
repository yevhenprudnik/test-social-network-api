const postService = require('../services/post-service');

class PostController {

  async createPost(req, res, next) {
    try {
      const { text, header } = req.body;
      const postedBy = req.user.id;
      const postData = await postService.createPost(postedBy, header, text);

      return res.json(postData);
    } catch (error) {
      next(error);
    }
  }

  async getFriendsPosts(req, res, next) {
    try {
        const userId = req.user.id;
        const page = req.query.page || 0;
        const posts = await postService.getFriendsPosts(userId, page);

        res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  async getPost(req, res, next) {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        const post = await postService.getPost(postId, userId);

        res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async getPostLikes(req, res, next) {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        const page = req.query.page || 0;
        const likes = await postService.getPostLikes(userId, postId, page);

        res.json(likes);
    } catch (error) {
      next(error);
    }
  }

  async getPostComments(req, res, next) {
    try {
        const userId = req.user.id;
        const postId = req.params.id;
        const page = req.query.page || 0;
        const comments = await postService.getPostComments(userId, postId, page);

        res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async getUserPosts(req, res, next) {
    try {
        const user = req.user;
        const postedBy = req.params.postedBy;
        const page = req.query.page || 0;
        const posts = await postService.getUserPosts(postedBy, user, page);

        res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  async editPost(req, res, next) {
    try {
      const postId = req.params.id;
      const { newText } = req.body;
      const userId = req.user.id;
      const newPost = await postService.editPost(userId, postId, newText);
  
      return res.json(newPost)
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const result = await postService.deletePost(userId, postId);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostController();