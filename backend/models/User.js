const mongoose = require('mongoose');
const { getDbMode, createModelEmulator } = require('../config/db');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

const mongooseModel = mongoose.models.User || mongoose.model('User', UserSchema);
const jsonModel = createModelEmulator('users');

const UserProxy = new Proxy({}, {
  get: (target, prop) => {
    const activeModel = getDbMode() === 'mongodb' ? mongooseModel : jsonModel;
    const value = activeModel[prop];
    if (typeof value === 'function') {
      return value.bind(activeModel);
    }
    return value;
  }
});

module.exports = UserProxy;
