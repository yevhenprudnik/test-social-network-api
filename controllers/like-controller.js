const postService = require('../services/post-service');

module.exports = async function(req, res, next) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await postService.likePost(userId, postId);

    return res.json(post);
  } catch (error) {
    next(error);
  }
}