const Router = require('express').Router;
const router = new Router();
const userController = require('../controllers/user-controller');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');
const FriendController = require('../controllers/friend-controller');

router.get('/', (req, res) => {res.json("userRouter's working")});

router.use( authMiddleware );

router.get('/user/:user', userController.getUser);
router.get('/send-request/:user', FriendController.sendRequest);
router.get('/accept-request/:user', FriendController.acceptRequest);
router.get('/reject-request/:user', FriendController.rejectRequest);
router.delete('/delete-friend/:user', FriendController.deleteFriend);
router.post('/change-avatar', userController.changeAvatar);

module.exports = router;