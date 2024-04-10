const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'f3c8a3c9b8a9f0b2440a646f3a5b8f9e6d6e46555a4b2b5c6d7c8d9e0a1b2c3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8g9h0', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.user = authData;
                next();
            }
        });
    } else {
        res.sendStatus(403);
    }
}

module.exports = verifyToken;