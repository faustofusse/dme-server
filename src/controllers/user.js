const bcrypt = require("bcrypt");
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/constants");

exports.login = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) return res.send({success: false, message: 'Complete all the fields.'});
  email = email.toLowerCase();
  User.find({email}, (err, users) => {
    if (err || users.length != 1) return res.send({success: false, message: 'Error: Invalid email.'});
    let user = users[0];
    if (user.is_deleted) return res.send({success: false, message: 'User deleted.'});
    let validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.send({success: false, message: 'Error: Invalid password.'});
    let userSession = new UserSession();
    userSession.userId = user._id;
    userSession.save((err, doc) => {
        if (err) return res.send({success: false, message: 'Server error.'});
        const token = jwt.sign({userId: user._id, sessionId: doc._id}, JWT_SECRET);
        return res.send({success: true, message: 'Valid login.', token: token });
    });
  });
}

exports.register = async (req, res) => {
  let { username, email, password, repeatPassword, firstName, lastName } = req.body;
  if (!username || !email || !password || !repeatPassword || !firstName || !lastName) 
    return res.send({success: false, message: 'Complete all the fields.'});
  email = email.toLowerCase();
  // Check username and email
  let users = await User.find({ email });
  if (users.length > 0) return res.send({success: false, message: 'Error: email taken.'});
  users = await User.find({ username });
  if (users.length > 0) return res.send({success: false, message: 'Error: username taken.'});
  // Check passwords
  if (password !== repeatPassword) return res.send({success: false, message: 'Error: passwords do not match.'});
  // Create and save user
  const newUser = new User();
  newUser.email = email;
  newUser.username = username;
  newUser.firstName = firstName;
  newUser.lastName = lastName;
  newUser.password = newUser.generateHash(password);
  newUser.save((err, user) => {
    if (err) return res.send({success: false, message: 'Server error, user not created.'})
    res.send({success: true, message: 'User registered.'})
  });
}

exports.logout = async (req, res) => {
  const { sessionId } = res.locals;
  UserSession.findByIdAndUpdate(sessionId, {$set:{is_deleted: true}}, {new: true}, (err, doc) => {
    if (err) return res.send({success:false, message: 'Error: invalid'});
    return res.send({success: true, message:'Logged out.'});
  });
} 

exports.deleteUser = async (req, res) => {
  const { userId } = res.locals;
  User.findByIdAndUpdate(userId, {$set: {is_deleted: true}}, {new: true}, (err, doc) => {
    if (err) return res.send({success: false, message: 'Server error, user not deleted.'});
    if (!doc) return res.send({success: false, message: 'User not found.'});
    res.send({success: true, message: 'User deleted.'})
  });
};

exports.deleteSessions = async (req, res) => {
  const { userId } = res.locals;
  UserSession.updateMany({userId: userId, is_deleted: false}, {$set:{is_deleted: true}}, (err, docs) => {
    if (err) return res.send({success: false, message: 'Server error, sessions not deleted.'});
    res.send({success: true, message: 'All sessions deleted.'});
  });
}

exports.fetchSessions = async (req, res) => {
  const { userId } = res.locals;
  await UserSession.find({userId: userId})
    .then(result => res.json(result))
    .catch(err => res.json(err));
};

exports.verifyToken = async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.send({success:false, message:'Not authorized. Token missing.'});
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) return res.send({success:false, message:'Not authorized. Invalid token.'});
    UserSession.find({_id: verified.sessionId}, (err, sessions) => {
      if (!sessions || sessions.length != 1) return res.send({success: false, message: 'Error: invalid sessionId.'});
      const session = sessions[0];
      if (session.is_deleted) return res.send({success: false, message: 'Session is deleted.'});
      res.send({success: true, message: 'Valid.'});
    });
  } catch(e) {return res.send({success: false, message: e.message});}
} 

exports.getUser = async (req, res) => {
  const { userId } = res.locals;
  User.findById(userId, (err, doc) => {
    if (err) return res.send({success: false, message: 'Server error.'});
    const user = {
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      username: doc.username,
    };
    res.send({success: true, user: user});
  });
}

exports.fetchUsers = async (req, res) => {
  await User.find()
    .then(result => res.json(result))
    .catch(err => res.json(err));
};
