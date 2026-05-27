const mongoose = require('mongoose');
const { getDbMode, createModelEmulator } = require('../config/db');

const ViolationLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Tab Switch', 'Focus Loss', 'Webcam Off', 'Fullscreen Exit'],
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  description: { type: String, required: true }
});

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: { 
    type: Map, 
    of: Number // key is question index, value is selected option index
  },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  violationsCount: { type: Number, default: 0 },
  violationsLog: [ViolationLogSchema],
  status: { type: String, enum: ['completed', 'auto-submitted'], default: 'completed' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const mongooseModel = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
const jsonModel = createModelEmulator('submissions');

const SubmissionProxy = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = getDbMode() === 'mongodb' ? mongooseModel : jsonModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});

module.exports = SubmissionProxy;
