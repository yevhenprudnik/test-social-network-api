const postService = require('../services/post-service');

class PostController {

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

  async getUserPosts(req, res, next) {
    try {
        const userId = req.user.id;
        const postedBy = req.params.postedBy;
        const page = req.query.page || 0;
        const posts = await postService.getUserPosts(postedBy, userId, page);

        res.json(posts);
    } catch (error) {
      next(error);
    }
  }

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