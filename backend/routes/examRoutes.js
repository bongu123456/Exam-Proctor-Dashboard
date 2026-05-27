const express = require('express');
const router = express.Router();
const { 
  getExams, 
  getExamById, 
  createExam, 
  submitExam 
} = require('../controllers/examController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getExams)
  .post(protect, adminOnly, createExam);

router.route('/:id')
  .get(protect, getExamById);

router.route('/:id/submit')
  .post(protect, submitExam);

module.exports = router;
