const router = require('express').Router();
const { param } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/errorHandler');
const {
  createParentValidators,
  updateParentValidators,
  listParents,
  getParent,
  createParent,
  updateParent,
  deleteParent
} = require('../controllers/parentsController');

router.use(authorize('admin'));
router.get('/', listParents);
router.post('/', createParentValidators, validateRequest, createParent);
router.get('/:id', param('id').isInt({ min: 1 }), validateRequest, getParent);
router.put('/:id', updateParentValidators, validateRequest, updateParent);
router.delete('/:id', param('id').isInt({ min: 1 }), validateRequest, deleteParent);

module.exports = router;
