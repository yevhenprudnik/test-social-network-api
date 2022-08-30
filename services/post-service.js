const UserModel = require('../models/user-model');
const ApiError = require('../exceptions/api-error');
const PostModel = require('../models/post-model');
const FriendModel = require('../models/friend-model');
const CommentModel = require('../models/comment-model');
const LikeModel = require('../models/like-model');
const mongoose = require('mongoose');

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
  async getUserPosts(postedBy, user, page){
    const postPerPage = 20;
    const friend = await UserModel.findOne({ username : postedBy });
    const isFriend = await FriendModel.findOne({$or: [
      { requesterId: user.id, receiverId : friend.id },
      { receiverId: user.id, requesterId : friend.id },
    ]});
    if (!isFriend && user.username !== postedBy) {
      throw ApiError.Forbidden("You can't see posts of users you are not friends with");
    }
    const posts = await PostModel.find({ postedBy: friend.id })
    .populate('postedBy', 'username')
    .skip(postPerPage*page)
    .limit(postPerPage)
    .sort([['createdAt', -1]]);

    return posts;
  }

  async getFriendsPosts(userId, page){
    const postPerPage = 20;
    const FriendsPosts = await FriendModel.aggregate([
      {
        $match: {
          $or : [ 
            { requesterId : mongoose.Types.ObjectId(userId) }, 
            { receiverId : mongoose.Types.ObjectId(userId) } 
          ]
        }
      },
      {
        $project:
          {
            "_id" : 0,
            "friendId" :
            {
              $switch:
                {
                  branches: [
                    {
                      case: { $eq : [ "$requesterId", mongoose.Types.ObjectId(userId) ] },
                      then: "$receiverId"
                    },
                    {
                      case: { $eq : [ "$receiverId", mongoose.Types.ObjectId(userId) ] },
                      then: "$requesterId"
                    }
                  ],
                  default: "Wrong friend object"
                }
            }
          }
      },
      {
        $lookup : {
          from : "posts",
          localField : "friendId",
          foreignField : "postedBy",
          as: "FriendsPosts"
        }
      },
      {
        $unwind : "$FriendsPosts"
      },
      {
        $group : {
          _id : null,
          FriendsPosts : { $addToSet : '$FriendsPosts' }
        }
      },
      {
        $unwind : "$FriendsPosts"
      },
      {
        $replaceRoot: {
          newRoot: "$FriendsPosts"
        }
      },
      {
        $sort : {
          createdAt : -1
        }
      },
      {
        $skip : postPerPage*page
      },
      {
        $limit : postPerPage
      }
    ])
    
    return FriendsPosts;
  }
  /**
   * @param postId
   *   Post id.
   */
  async getPost(postId, userId){
    const post = await PostModel.findById(postId)
    .populate('postedBy', 'username');
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const postAuthor = await UserModel.findOne({ username : post.postedBy.username });
    const isFriend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : postAuthor.id },
      { receiverId: userId, requesterId : postAuthor.id },
    ]});
    if (!isFriend && post.postedBy.id != userId) {
      throw ApiError.Forbidden("You can't see posts of users you are not friends with");
    }
    return post;
  }
  /**
   * @param comment
   *   Comment to be added.
   */
  async commentPost(userId, postId, text) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const postAuthor = await UserModel.findById(post.postedBy);
    const isFriend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : postAuthor.id },
      { receiverId: userId, requesterId : postAuthor.id },
    ]});
    if (!isFriend && post.postedBy != userId) {
      throw ApiError.Forbidden("You can't comment posts of users you are not friends with");
    }
    const comment = await CommentModel.create({ postId, writtenBy: userId, text });
    post.comments.push(comment.id);

    await post.save();

    return post;
  }

  async getPostLikes(userId, postId, page) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const LikesPerPage = 100;
    const isFriend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : post.postedBy },
      { receiverId: userId, requesterId : post.postedBy },
    ]});
    if (!isFriend && post.postedBy != userId) {
      throw ApiError.Forbidden("You can't view posts of users you are not friends with");
    }
    const postLikes = await LikeModel.find({ postId })
    .populate("authorId", "username")
    .skip(LikesPerPage*page)
    .limit(LikesPerPage)
    .sort([['createdAt', -1]]);
    return postLikes;
  }

  async getPostComments(userId, postId, page) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const CommentsPerPage = 50;
    const isFriend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : post.postedBy },
      { receiverId: userId, requesterId : post.postedBy },
    ]});
    if (!isFriend && post.postedBy != userId) {
      throw ApiError.Forbidden("You can't view posts of users you are not friends with");
    }
    const postComments = await CommentModel.find({ postId })
    .populate("writtenBy", "username")
    .skip(CommentsPerPage*page)
    .limit(CommentsPerPage)
    .sort([['createdAt', -1]]);
    return postComments;
  }

  async likePost(userId, postId) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    const isFriend = await FriendModel.findOne({$or: [
      { requesterId: userId, receiverId : post.postedBy },
      { receiverId: userId, requesterId : post.postedBy },
    ]});
    if (!isFriend && post.postedBy != userId) {
      throw ApiError.Forbidden("You can't like posts of users you are not friends with");
    }
    const likedByUser = await LikeModel.findOne({ postId, authorId: userId});
    if (likedByUser) {
      const likes = post.likes;
      const index = likes.indexOf(likedByUser.id);
      post.likes.splice(index, 1);
      await post.save();
      await likedByUser.delete();
    } else {
      const likeObj = await LikeModel.create({ postId, authorId: userId });
      post.likes.push(likeObj.id);
      await post.save();
    }
    return post;
  }
  /**
   * @param newText
   *   New post text to replace the old one.
   */
  async editPost(userId, postId, newText) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw ApiError.NotFound('Post is not found');
    }
    if (userId != post.postedBy) {
      throw ApiError.Forbidden("Post can be modified only by it's author");
    } 
    post.text = newText;
    await post.save();

    return post;
  }

  async deletePost(userId, postId) {
    try {
      const post = await PostModel.findById(postId);
      if (!post) {
        throw ApiError.NotFound('Post is not found');
      }
      if (userId != post.postedBy) {
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