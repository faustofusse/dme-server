var express = require('express');
var router = express.Router();
var UserController = require('../controllers/user');

const auth = require('../utils/auth');

router.get('/', auth, UserController.getUser);
router.delete('/', auth, UserController.deleteUser);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/verifyToken', UserController.verifyToken);
router.get('/logout', auth, UserController.logout);
router.get('/sessions', auth, UserController.fetchSessions);
router.delete('/sessions', auth, UserController.deleteSessions);

module.exports = router;
