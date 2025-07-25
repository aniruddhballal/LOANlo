const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = connectDB;