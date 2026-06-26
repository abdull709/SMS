const router = require('express').Router();
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  createUserValidators,
  updateUserValidators,
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/usersController');

router.use(authorize('admin'));
router.get('/', listUsers);
router.post('/', createUserValidators, validateRequest, createUser);
router.get('/:id', getUser);
router.put('/:id', updateUserValidators, validateRequest, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
