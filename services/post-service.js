const UserModel = require('../models/user-model');
const ApiError = require('../exceptions/api-error');
const PostModel = require('../models/post-model');
//const mongoose = require('mongoose');
class PostService {

// ------------------------------ Create a Post ------------------------------ //

  async createPost(postedBy, header, text) {
    const post = await PostModel.create({ postedBy, header, text, date: new Date() });
    
    return post;
  }

// ------------------------------ Get Posts ------------------------------ //

  async getPosts(postId, userId, postedBy){
    const user = await UserModel.findById(userId);
    // Get the posts of a specific user
    if (postedBy) {
      if (!user.friends.includes(postedBy) && user.username !== postedBy) {
        throw ApiError.Forbidden("You can't see posts of users you are not friends with");
      }
      const posts = await PostModel.find({ postedBy })
      .sort([['date', -1]]);

      return posts;
    }
    // Get the specific post
    if (postId) {
      const post = await PostModel.findById(postId);
      const postAuthor = await UserModel.findOne({ username : post.postedBy });
      if (!user.friends.includes(postAuthor.username) && post.postedBy != user.username) {
        throw ApiError.Forbidden("You can't see posts of users you are not friends with");
      }
      if (!post) {
        throw ApiError.NotFound('Post is not found');
      }

      return post;
    }
    // Get all posts of user's friends
    const posts = await PostModel.find({ postedBy: {$in: user.friends}})
    .sort([['date', -1]]);

    return posts;
  }

// ------------------------------ Comment a Post ----------------------------- //

  async commentPost(userId, postId, comment) {
    const user = await UserModel.findById(userId);
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (!user){
      throw ApiError.NotFound('User is not found');
    }
    const postAuthor = await UserModel.findOne({ username : post.postedBy });
    if (!user.friends.includes(postAuthor.username) && post.postedBy != user.username) {
      throw ApiError.Forbidden("You can't comment posts of users you are not friends with");
    }
    post.comments.push({
      writtenBy: user.username,
      comment: comment,
    })
    await post.save();

    return post;
  }

// ------------------------------ Like a Posts ----------------------------- //

  async likePost(userId, postId) {
    const post = await PostModel.findById(postId);
    const user = await UserModel.findById(userId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (!user){
      throw ApiError.NotFound('User is not found');
    }
    const postAuthor = await UserModel.findOne({ username : post.postedBy });
    if (!user.friends.includes(postAuthor.username) && post.postedBy != user.username) {
      throw ApiError.Forbidden("You can't like posts of users you are not friends with");
    }
    const likes = post.likedBy;
    //console.log(`likes: ${likes}`, `User id: ${userId}`);
    const index = likes.indexOf(user.username);
    if (index > -1) {
      post.likedBy.splice(index, 1);
    } else {
      post.likedBy.push(user.username);
    }
    await post.save();

    return post;
  }

// ------------------------------ Edit a Post ----------------------------- //

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

// ------------------------------ Delete a Post ----------------------------- //

  async deletePost(postedBy, postId) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (postedBy !== post.postedBy) {
      throw ApiError.BadRequest("Post can be deleted only by it's author");
    } 
    await post.delete();

    return { deleted : true };
  }

}

module.exports = new PostService();