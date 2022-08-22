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
    const post = await PostModel.create({ postedBy, header, text, date: new Date() });
    
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
    const user = await UserModel.findById(userId);
    if (!user.friends.includes(postedBy) && user.username !== postedBy) {
      throw ApiError.Forbidden("You can't see posts of users you are not friends with");
    }
    const posts = await PostModel.find({ postedBy })
    .skip(postPerPage*page)
    .limit(postPerPage)
    .sort([['date', -1]]);

    return posts;
  }

  async getFriendsPosts(userId, page){
    const postPerPage = 20;
    const user = await UserModel.findById(userId);
    const posts = await PostModel.find({ postedBy: {$in: user.friends}})
    .skip(postPerPage*page)
    .limit(postPerPage)
    .sort([['date', -1]]);

    return posts;
  }
  /**
   * @param postId
   *   Post id.
   */
  async getPost(postId, userId){
    const user = await UserModel.findById(userId);
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const postAuthor = await UserModel.findOne({ username : post.postedBy });
    if (!user.friends.includes(postAuthor.username) && post.postedBy != user.username) {
      throw ApiError.Forbidden("You can't see posts of users you are not friends with");
    }

    return post;
  }
  /**
   * @param comment
   *   Comment to be added.
   */
  async commentPost(userId, postId, comment) {
    const user = await UserModel.findById(userId);
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    // if(!user) was useless check due to auth-middleware
    const postAuthor = await UserModel.findOne({ username : post.postedBy });
    // TODO: maybe would be better to create friend model?)
    if (!user.friends.includes(postAuthor.username) && post.postedBy != user.username) {
      throw ApiError.Forbidden("You can't comment posts of users you are not friends with");
    }
    // TODO: maybe would be better to create comment model?)
    post.comments.push({
      writtenBy: user.username,
      comment: comment,
    })
    await post.save();

    return post;
  }

  async likePost(userId, postId) {
    const post = await PostModel.findById(postId);
    const user = await UserModel.findById(userId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    // if(!user) was useless check due to auth-middleware
    const postAuthor = await UserModel.findOne({ username : post.postedBy });
    if (!user.friends.includes(postAuthor.username) && post.postedBy != user.username) {
      throw ApiError.Forbidden("You can't like posts of users you are not friends with");
    }
    // TODO: maybe would be better to create like model?)
    const likes = post.likedBy;
    // don't use indexOf, use includes instead (but I recommend to create a like model)
    const index = likes.indexOf(user.username);
    if (index > -1) {
      post.likedBy.splice(index, 1);
    } else {
      post.likedBy.push(user.username);
    }
    await post.save();

    return post;
  }
  /**
   * @param newText
   *   New post text to replace the old one.
   */
  async editPost(postedBy, postId, newText) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (postedBy !== post.postedBy) {
      throw ApiError.BadRequest("Post can be modified only by it's author");
    } 
    post.text = newText;
    await post.save();

    return post;
  }

  async deletePost(postedBy, postId) {
    try {
      const post = await PostModel.findById(postId);
      if (!post) {
        throw ApiError.NotFound('Post is not found');
      }
      if (postedBy !== post.postedBy) {
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