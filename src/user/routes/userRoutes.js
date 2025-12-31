const routes = require('express');
const authController = require('../controllers/userController');


const router = routes();

router.post(
    '/signup',
    authController.signup
);