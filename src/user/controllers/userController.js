const userService = require('../services/userService');

exports.signup = userService.userSignup(UserModel);
