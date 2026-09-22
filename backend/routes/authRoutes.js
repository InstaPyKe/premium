const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Customer Sign Up & Password Registration
router.post('/signup', AuthController.signup);

// Customer Sign In with Email & Password
router.post('/signin', AuthController.signin);

// Continue with Google Authentication
router.post('/google', AuthController.googleAuth);

// Customer Email Identification / Guest Session (Backward compatibility)
router.post('/identify', AuthController.identifyUser);

// Profile lookup
router.get('/profile/:email', AuthController.getProfile);

// Customers list with spending statistics (for Admin)
router.get('/customers', AuthController.getAllCustomers);

module.exports = router;
