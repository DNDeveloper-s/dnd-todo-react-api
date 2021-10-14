"use strict";
exports.__esModule = true;
var jwt = require('jsonwebtoken');
var createError = require('http-errors');
var isAuth = function (req, res, next) {
    var authHeader = req.get('Authorization');
    if (!authHeader) {
        return next(createError(401, 'Not authorized!'));
    }
    var token = authHeader.split(' ')[1];
    var decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    }
    catch (e) {
        return next(createError(500, 'Something went wrong with decoding token!'));
    }
    if (!decodedToken) {
        return next(createError(401, 'Not authorized!'));
    }
    // @ts-ignore
    req.userId = decodedToken.userId;
    // @ts-ignore
    next();
};
exports["default"] = isAuth;
