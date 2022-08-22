const postService = require('../services/post-service');

module.exports = async function(req, res, next) {
  try {
    const postId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.id;
    const userComment = await postService.commentPost(userId, postId, comment);

    return res.json(userComment);
  } catch (error) {
    next(error);
  }
}