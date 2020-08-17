const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./constants');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.send({success:false, message:'Not authorized. Token missing.'});
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        if (!verified) return res.send({success:false, message:'Not authorized. Invalid token.'});
        res.locals.userId = verified.userId;
        res.locals.sessionId = verified.sessionId;
        next();
    } catch(e) {return res.send({success: false, message: e.message});}
}

module.exports = auth;