const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({});
    // Return all exams but strip detailed questions array to save size if needed,
    // or just return the overview. Let's return overview + title details.
    const examOverviews = exams.map(e => ({
      _id: e._id || e.id,
      title: e.title,
      description: e.description,
      duration: e.duration,
      totalQuestions: e.totalQuestions,
      createdAt: e.createdAt
    }));
    res.json(examOverviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Security: If the requester is a student, strip the correctOption field!
    let examData = JSON.parse(JSON.stringify(exam));
    if (req.user.role !== 'admin') {
      examData.questions = examData.questions.map(q => {
        const { correctOption, ...safeQuestion } = q;
        return safeQuestion;
      });
    }

    res.json(examData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new exam (Admin only)
// @route   POST /api/exams
// @access  Private/Admin
const createExam = async (req, res) => {
  const { title, description, duration, questions } = req.body;

  if (!title || !duration || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Please provide title, duration, and questions array' });
  }

  try {
    const exam = await Exam.create({
      title,
      description,
      duration,
      totalQuestions: questions.length,
      questions
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an exam
// @route   POST /api/exams/:id/submit
// @access  Private
const submitExam = async (req, res) => {
  const { answers, violationsCount, violationsLog, status } = req.body;
  const examId = req.params.id;
  const studentId = req.user.id;

  try {
    // 1. Fetch exam to grade it
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // 2. Grade the answers
    let score = 0;
    exam.questions.forEach((q, idx) => {
      // answers can be a Map or simple Object, key is index (number or string representation)
      const studentAnswer = answers[idx.toString()] !== undefined ? answers[idx.toString()] : answers[idx];
      if (studentAnswer !== undefined && Number(studentAnswer) === q.correctOption) {
        score++;
      }
    });

    // 3. Create submission
    const submission = await Submission.create({
      student: studentId,
      exam: examId,
      answers,
      score,
      totalQuestions: exam.totalQuestions,
      violationsCount: violationsCount || 0,
      violationsLog: violationsLog || [],
      status: status || 'completed',
      submittedAt: new Date()
    });

    res.status(201).json({
      _id: submission._id || submission.id,
      score,
      totalQuestions: exam.totalQuestions,
      violationsCount: submission.violationsCount,
      status: submission.status,
      submittedAt: submission.submittedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions
// @route   GET /api/submissions
// @access  Private
const getSubmissions = async (req, res) => {
  try {
    let submissions;
    if (req.user.role === 'admin') {
      submissions = await Submission.find({})
        .populate('student')
        .populate('exam')
        .sort({ submittedAt: -1 });
    } else {
      submissions = await Submission.find({ student: req.user.id })
        .populate('exam')
        .sort({ submittedAt: -1 });
    }
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submission details by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student')
      .populate('exam');
      
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Security: Student can only view their own submissions
    const submissionStudentId = submission.student._id 
      ? submission.student._id.toString() 
      : submission.student.id || submission.student.toString();

    if (req.user.role !== 'admin' && submissionStudentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate('student')
      .populate('exam');
      
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalExams = await Exam.countDocuments({});
    const totalSubmissions = submissions.length;

    // Averages and rates
    let totalScorePercent = 0;
    let highViolationCount = 0; // count of submissions with >= 3 violations
    const violationTypeCounts = {
      'Tab Switch': 0,
      'Focus Loss': 0,
      'Webcam Off': 0,
      'Fullscreen Exit': 0
    };

    const scoreRanges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0
    };

    submissions.forEach(sub => {
      const percentage = sub.totalQuestions > 0 ? (sub.score / sub.totalQuestions) * 100 : 0;
      totalScorePercent += percentage;

      if (sub.violationsCount >= 3) {
        highViolationCount++;
      }

      // Track violation types
      if (sub.violationsLog && Array.isArray(sub.violationsLog)) {
        sub.violationsLog.forEach(v => {
          if (violationTypeCounts[v.type] !== undefined) {
            violationTypeCounts[v.type]++;
          }
        });
      }

      // Track score ranges
      if (percentage <= 20) scoreRanges['0-20%']++;
      else if (percentage <= 40) scoreRanges['21-40%']++;
      else if (percentage <= 60) scoreRanges['41-60%']++;
      else if (percentage <= 80) scoreRanges['61-80%']++;
      else scoreRanges['81-100%']++;
    });

    const averageScore = totalSubmissions > 0 ? Math.round(totalScorePercent / totalSubmissions) : 0;
    const highSuspicionRate = totalSubmissions > 0 ? Math.round((highViolationCount / totalSubmissions) * 100) : 0;

    // Format chart data for Recharts
    const scoreDistributionChart = Object.keys(scoreRanges).map(range => ({
      range,
      count: scoreRanges[range]
    }));

    const violationTypeChart = Object.keys(violationTypeCounts).map(type => ({
      name: type,
      value: violationTypeCounts[type]
    }));

    // Recent violations logs across all exams
    let recentViolations = [];
    submissions.forEach(sub => {
      if (sub.violationsLog && Array.isArray(sub.violationsLog)) {
        sub.violationsLog.forEach(v => {
          recentViolations.push({
            studentName: sub.student?.name || 'Unknown student',
            examTitle: sub.exam?.title || 'Unknown exam',
            type: v.type,
            timestamp: v.timestamp,
            description: v.description,
            submissionId: sub._id || sub.id
          });
        });
      }
    });

    // Sort recent violations by timestamp descending, limit to 8
    recentViolations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    recentViolations = recentViolations.slice(0, 8);

    res.json({
      summary: {
        totalStudents,
        totalExams,
        totalSubmissions,
        averageScore,
        highSuspicionRate
      },
      charts: {
        scoreDistribution: scoreDistributionChart,
        violationBreakdown: violationTypeChart
      },
      recentViolations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExams,
  getExamById,
  createExam,
  submitExam,
  getSubmissions,
  getSubmissionById,
  getAdminStats
};
