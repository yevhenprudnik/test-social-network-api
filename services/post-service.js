const UserModel = require('../models/user-model');
const ApiError = require('../exceptions/api-error');
const PostModel = require('../models/post-model');
const mongoose = require('mongoose');
class PostService {

// ------------------------------ Create a Post ------------------------------ //

  async createAPost(postedBy, text) {
    const post = await (await PostModel.create({postedBy, text, date: new Date() }))
    .populate("postedBy", "username");
    return post;
  }

// ------------------------------ Get Posts ------------------------------ //

  async getPosts(searchId){
    if (!searchId) {
      const posts = await PostModel.find()
      .populate('postedBy', 'username')
      .populate('comments.writtenBy', 'username')
      .populate('likedBy', 'username')
      .sort([['date', -1]]);
      return posts;
    }
    let posts = await PostModel.find({ postedBy : searchId})
    .populate('postedBy', 'username')
    .populate('comments.writtenBy', 'username')
    .populate('likedBy', 'username')
    .sort([['date', -1]]);
    if (!posts.length) {
      posts = await PostModel.findById(searchId)
      .populate('postedBy', 'username')
      .populate('comments.writtenBy', 'username')
      .populate('likedBy', 'username')
      .sort([['date', -1]]);
    }
    if (!posts.length) {
      throw ApiError.NotFound('Posts are not found');
    }
    return posts;
  }

// ------------------------------ Get Following Posts ------------------------------ //

  async getFollowingPosts(followingIdsArray) {
    const posts = await PostModel.find({ postedBy: {$in: followingIdsArray}})
    .populate('postedBy', 'username')
    .populate('comments.writtenBy', 'username')
    .populate('likedBy', 'username')
    .sort([['date', -1]]);

    return posts;
  }

// ------------------------------ Comment a Post ----------------------------- //

  async commentAPost(userId, postId, comment) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    post.comments.push({
      writtenBy: userId,
      comment: comment,
    })
    await(await post.save()).populate("postedBy", "username");

    return post;
  }

// ------------------------------ Like a Posts ----------------------------- //

  async likeAPost(userId, postId) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const likes = post.likedBy;
    //console.log(`likes: ${likes}`, `User id: ${userId}`);
    const index = likes.indexOf(userId);
    if (index > -1) {
      post.likedBy.splice(index, 1);
    } else {
      post.likedBy.push(userId);
    }
    await(await post.save()).populate("postedBy", "username");
    return populatedPost;
  }

// ------------------------------ Edit a Post ----------------------------- //

  async editAPost(userId, postId, newText) {

    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (userId !== post.postedBy.toHexString()) {
      throw ApiError.BadRequest("Post can be modified only by it's author");
    } 
    post.text = newText;
    await(await post.save()).populate("postedBy", "username");
    return post;
  }

// ------------------------------ Delete a Post ----------------------------- //

  async deleteAPost(userId, postId) {

    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (userId !== post.postedBy.toHexString()) {
      throw ApiError.BadRequest("Post can be deleted only by it's author");
    } 
    await post.delete();

    return { deleted : true };
  }

}

module.exports = new PostService();