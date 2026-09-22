const UserModel = require('../models/userModel');
const ReferralModel = require('../models/referralModel');

/**
 * Controller for customer email authentication & profiles
 */
const AuthController = {
  // POST /api/auth/signup
  async signup(req, res, next) {
    try {
      const { email, password, username, phone, deviceId } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      }

      const user = await UserModel.signupCustomer({
        email,
        password,
        username,
        phone,
        deviceId
      });

      // Auto-register referral handle
      await ReferralModel.getOrCreateProfile(user.username, user.email);

      res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Signup failed. Please check your details.'
      });
    }
  },

  // POST /api/auth/signin
  async signin(req, res, next) {
    try {
      const { email, password, deviceId } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const user = await UserModel.signinCustomer({
        email,
        password,
        deviceId
      });

      res.status(200).json({
        success: true,
        message: `Welcome back, ${user.username}!`,
        data: user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials. Please try again.'
      });
    }
  },

  // POST /api/auth/google
  async googleAuth(req, res, next) {
    try {
      const { credential, email, name, picture, sub, deviceId } = req.body;

      let userEmail = email;
      let userName = name;
      let userPicture = picture;
      let googleId = sub;

      // If a JWT credential token is provided by Google Identity Services, decode or verify its payload
      if (credential && typeof credential === 'string') {
        try {
          if (typeof fetch === 'function') {
            try {
              const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
              if (verifyRes.ok) {
                const googleData = await verifyRes.json();
                if (googleData.email) {
                  userEmail = googleData.email;
                  userName = googleData.name || googleData.given_name || userEmail.split('@')[0];
                  userPicture = googleData.picture || '';
                  googleId = googleData.sub || '';
                }
              }
            } catch (netErr) {
              // Network fallback
            }
          }

          if (!userEmail) {
            const parts = credential.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
              if (payload.email) {
                userEmail = payload.email;
                userName = payload.name || payload.given_name || userEmail.split('@')[0];
                userPicture = payload.picture || '';
                googleId = payload.sub || '';
              }
            }
          }
        } catch (decodeErr) {
          // Fallback to body parameters if decode is not needed
        }
      }

      if (!userEmail || !userEmail.includes('@')) {
        return res.status(400).json({ success: false, message: 'Google authentication did not provide a valid email.' });
      }

      const user = await UserModel.upsertGoogleUser({
        email: userEmail,
        name: userName,
        picture: userPicture,
        googleId,
        deviceId
      });

      // Auto-register referral handle
      await ReferralModel.getOrCreateProfile(user.username, user.email);

      res.status(200).json({
        success: true,
        message: `Signed in with Google as ${user.username}!`,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Google authentication failed. Please try again.'
      });
    }
  },

  // POST /api/auth/identify (Guest / legacy identify)
  async identifyUser(req, res, next) {
    try {
      const { email, username, phone, deviceId } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }

      const user = await UserModel.upsertCustomer({
        email,
        username,
        phone,
        deviceId
      });

      // Auto-register referral handle
      await ReferralModel.getOrCreateProfile(user.username, user.email);

      res.status(200).json({
        success: true,
        message: 'Customer session identified successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Unable to identify session.'
      });
    }
  },

  // GET /api/auth/profile/:email
  async getProfile(req, res, next) {
    try {
      const { email } = req.params;
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/customers
  async getAllCustomers(req, res, next) {
    try {
      const customers = await UserModel.getAllCustomers();
      res.status(200).json({
        success: true,
        count: customers.length,
        data: customers
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AuthController;
