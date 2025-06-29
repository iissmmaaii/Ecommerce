const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

// GET /login
router.get('/login', authController.getLogin);
router.get('/signup',authController.getSignup);

// POST /login
router.post('/login', authController.postLogin);
router.post('/signup',authController.postSignup);

router.post('/logout', authController.postLogout);



module.exports = router;