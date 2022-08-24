const UserModel = require('../models/user-model');
const ApiError = require('../exceptions/api-error');
const PostModel = require('../models/post-model');

class PostService {
    /**
   * @param postedBy
   *   Author id.
   * @param header
   *   Post header.
   * @param text
   *   Post text(main content).
   */
  async createPost(postedBy, header, text) {
    const post = await PostModel.create({ postedBy, header, text });
    
    return post;
  }
  /**
   * @param userId
   *   User id.
   * @param page
   *   Posts page.
   */
  async getUserPosts(postedBy, userId, page){
    const postPerPage = 20;
    const user = await UserModel.findById(userId)
    .populate('friends.addresseeId', 'username');
    if (!user.friends.some(el => el.addresseeId.username === postedBy) && user.username !== postedBy) {
      throw ApiError.Forbidden("You can't see posts of users you are not friends with");
    }
    const postAuthor = await UserModel.findOne({ username : postedBy })
    const posts = await PostModel.find({ postedBy: postAuthor.id })
    .populate('postedBy comments.writtenBy likedBy.authorId', 'username')
    .skip(postPerPage*page)
    .limit(postPerPage)
    .sort([['createdAt', -1]]);

    return posts;
  }

  async getFriendsPosts(userId, page){
    const postPerPage = 20;
    const user = await UserModel.findById(userId);
    const friends = user.friends.map( el => el.addresseeId);
    const posts = await PostModel.find({ postedBy: {$in: friends}})
    .populate('postedBy comments.writtenBy likedBy.authorId', 'username')
    .skip(postPerPage*page)
    .limit(postPerPage)
    .sort([['createdAt', -1]]);

    return posts;
  }
  /**
   * @param postId
   *   Post id.
   */
  async getPost(postId, userId){
    const user = await UserModel.findById(userId)
    .populate('friends.addresseeId', 'username');
    const post = await PostModel.findById(postId)
    .populate('postedBy comments.writtenBy likedBy.authorId', 'username');
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const postAuthor = await UserModel.findOne({ username : post.postedBy.username });
    if (!user.friends.some(el => el.addresseeId.username === postAuthor.username) && post.postedBy.username != user.username) {
      throw ApiError.Forbidden("You can't see posts of users you are not friends with");
    }

    return post;
  }
  /**
   * @param comment
   *   Comment to be added.
   */
  async commentPost(userId, postId, comment) {
    const user = await UserModel.findById(userId)
    .populate('friends.addresseeId', 'username');
    const post = await PostModel.findById(postId)
    .populate('postedBy comments.writtenBy likedBy.authorId', 'username');
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const postAuthor = await UserModel.findOne({ username : post.postedBy.username });
    if (!user.friends.some(el => el.addresseeId.username === postAuthor.username) && post.postedBy.username != user.username) {
      throw ApiError.Forbidden("You can't comment posts of users you are not friends with");
    }

    post.comments.push({
      writtenBy: user.id,
      comment: comment
    })

    await post.save();

    return post;
  }

  async likePost(userId, postId) {
    const user = await UserModel.findById(userId)
    .populate('friends.addresseeId', 'username');
    const post = await PostModel.findById(postId)
    .populate('postedBy comments.writtenBy likedBy.authorId', 'username')
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const postAuthor = await UserModel.findOne({ username : post.postedBy.username });
    if (!user.friends.some(el => el.addresseeId.username === postAuthor.username) && post.postedBy.username != user.username) {
      throw ApiError.Forbidden("You can't like posts of users you are not friends with");
    }
    const likes = post.likedBy;
    const likeObj = likes.find(likeObj => likeObj.authorId.id == userId);
    if (likeObj) {
      post.likedBy.pull(likeObj.id);
    } else {
      post.likedBy.push({ authorId: userId });
    }
    await post.save();

    return post;
  }
  /**
   * @param newText
   *   New post text to replace the old one.
   */
  async editPost(postedBy, postId, newText) {
    const post = await PostModel.findById(postId)
    .populate('comments.writtenBy likedBy.authorId', 'username');
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (postedBy != post.postedBy) {
      throw ApiError.Forbidden("Post can be modified only by it's author");
    } 
    post.text = newText;
    await post.save();

    return post;
  }

  async deletePost(postedBy, postId) {
    try {
      const post = await PostModel.findById(postId)
      .populate('comments.writtenBy likedBy.authorId', 'username');
      if (!post) {
        throw ApiError.NotFound('Post is not found');
      }
      if (postedBy != post.postedBy) {
        throw ApiError.Forbidden("Post can be deleted only by it's author");
      } 
      await post.delete();

      return { deleted : true };
    } catch (e) {
      return { deleted : false }
    }
  }

}

module.exports = new PostService();