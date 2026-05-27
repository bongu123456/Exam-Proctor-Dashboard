const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let dbMode = 'mongodb'; // 'mongodb' or 'json'
const jsonDbPath = path.join(__dirname, '..', 'data.json');

// Initialize local JSON file if it doesn't exist
if (!fs.existsSync(jsonDbPath)) {
  fs.writeFileSync(jsonDbPath, JSON.stringify({ users: [], exams: [], submissions: [] }, null, 2));
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/exam-proctor', {
      serverSelectionTimeoutMS: 2000 // Quick timeout to fallback fast
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    dbMode = 'mongodb';
  } catch (error) {
    console.warn(`\n⚠️ MongoDB connection failed: ${error.message}`);
    console.warn(`⚠️ FALLING BACK to localized JSON database storage at: ${jsonDbPath}\n`);
    dbMode = 'json';
  }
};

// JSON Database Helper Methods to emulate Mongoose
const readJsonDB = () => {
  try {
    const data = fs.readFileSync(jsonDbPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { users: [], exams: [], submissions: [] };
  }
};

const writeJsonDB = (data) => {
  fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
};

// Mock Query Chain to mimic Mongoose chain methods (.populate, .select, etc)
class QueryChain {
  constructor(data) {
    this.data = data;
  }
  
  populate(field) {
    // Basic populator mock
    if (!this.data) return this;
    const db = readJsonDB();
    const isArray = Array.isArray(this.data);
    const items = isArray ? this.data : [this.data];

    items.forEach(item => {
      if (field === 'student' && item.student) {
        const studentId = item.student.toString();
        item.student = db.users.find(u => u._id === studentId || u.id === studentId) || { _id: studentId, name: 'Unknown User' };
      }
      if (field === 'exam' && item.exam) {
        const examId = item.exam.toString();
        item.exam = db.exams.find(e => e._id === examId || e.id === examId) || { _id: examId, title: 'Unknown Exam' };
      }
    });

    return this;
  }

  select(fields) {
    // Mock select fields (ignoring for simplicity or basic filtering)
    return this;
  }

  sort(sortOption) {
    if (!Array.isArray(this.data)) return this;
    if (typeof sortOption === 'object') {
      const field = Object.keys(sortOption)[0];
      const dir = sortOption[field];
      this.data.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (field === 'submittedAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return dir === -1 ? 1 : -1;
        if (valA > valB) return dir === -1 ? -1 : 1;
        return 0;
      });
    }
    return this;
  }

  // Executing the query chain returns the data
  async exec() {
    return this.data;
  }

  // Allow thenable behaviors
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.data).then(onfulfilled, onrejected);
  }
}

// Model Emulator Factory
const createModelEmulator = (collectionName) => {
  return {
    find: (query = {}) => {
      const db = readJsonDB();
      const collection = db[collectionName] || [];
      const filtered = collection.filter(item => {
        for (const key in query) {
          if (query[key] && typeof query[key] === 'object' && query[key].$ne !== undefined) {
            if (item[key] === query[key].$ne) return false;
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
      // Clone objects to prevent mutating db cache directly
      return new QueryChain(JSON.parse(JSON.stringify(filtered)));
    },

    findOne: (query = {}) => {
      const db = readJsonDB();
      const collection = db[collectionName] || [];
      const item = collection.find(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      return new QueryChain(item ? JSON.parse(JSON.stringify(item)) : null);
    },

    findById: (id) => {
      const db = readJsonDB();
      const collection = db[collectionName] || [];
      const item = collection.find(item => item._id === id.toString() || item.id === id.toString());
      return new QueryChain(item ? JSON.parse(JSON.stringify(item)) : null);
    },

    create: async (data) => {
      const db = readJsonDB();
      const collection = db[collectionName] || [];
      const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const newItem = {
        _id: newId,
        id: newId,
        ...data,
        createdAt: new Date().toISOString()
      };
      collection.push(newItem);
      db[collectionName] = collection;
      writeJsonDB(db);
      return JSON.parse(JSON.stringify(newItem));
    },

    findByIdAndUpdate: async (id, updateData, options = {}) => {
      const db = readJsonDB();
      const collection = db[collectionName] || [];
      const idx = collection.findIndex(item => item._id === id.toString() || item.id === id.toString());
      if (idx === -1) return null;
      
      // Update operators like $push, etc.
      let updatedItem = { ...collection[idx] };
      if (updateData.$push) {
        for (const field in updateData.$push) {
          if (!updatedItem[field]) updatedItem[field] = [];
          updatedItem[field].push(updateData.$push[field]);
        }
      } else {
        updatedItem = { ...updatedItem, ...updateData };
      }
      
      collection[idx] = updatedItem;
      db[collectionName] = collection;
      writeJsonDB(db);
      return JSON.parse(JSON.stringify(updatedItem));
    },

    deleteOne: async (query = {}) => {
      const db = readJsonDB();
      const collection = db[collectionName] || [];
      const idx = collection.findIndex(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (idx !== -1) {
        collection.splice(idx, 1);
        db[collectionName] = collection;
        writeJsonDB(db);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },

    countDocuments: async (query = {}) => {
      const db = readJsonDB();
      const collection = db[collectionName] || [];
      const filtered = collection.filter(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      return filtered.length;
    }
  };
};

module.exports = {
  connectDB,
  getDbMode: () => dbMode,
  createModelEmulator,
  readJsonDB,
  writeJsonDB
};
