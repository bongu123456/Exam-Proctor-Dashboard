const express = require('express');
const router = express.Router();
const { 
  getSubmissions, 
  getSubmissionById, 
  getAdminStats 
} = require('../controllers/examController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// MUST be placed BEFORE the dynamic /:id route to prevent collision
router.route('/admin/stats')
  .get(protect, adminOnly, getAdminStats);

router.route('/')
  .get(protect, getSubmissions);

router.route('/:id')
  .get(protect, getSubmissionById);

module.exports = router;
