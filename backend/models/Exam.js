const mongoose = require('mongoose');
const { getDbMode, createModelEmulator } = require('../config/db');

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true } // 0-indexed index of options
});

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  totalQuestions: { type: Number, required: true },
  questions: [QuestionSchema]
}, { timestamps: true });

const mongooseModel = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
const jsonModel = createModelEmulator('exams');

const ExamProxy = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = getDbMode() === 'mongodb' ? mongooseModel : jsonModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});

module.exports = ExamProxy;
