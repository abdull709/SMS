const router = require('express').Router();
const { optionalAuthenticate, authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  loginValidators,
  registerValidators,
  loginUser,
  register,
  me
} = require('../controllers/authController');

router.post('/login', loginValidators, validateRequest, loginUser);
router.post('/register', optionalAuthenticate, registerValidators, validateRequest, register);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, (_req, res) => res.status(204).send());

module.exports = router;
