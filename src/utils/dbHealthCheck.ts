import mongoose from 'mongoose';

export const checkDbConnection = async (): Promise<boolean> => {
  // If already connected, return true
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  
  try {
    // If not connected, or in connecting/disconnecting state, try to establish a new connection
    // or wait for the existing one to resolve.
    // Setting a short timeout for the health check.
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 2000, // Shorter timeout for health check
      // Other options like useNewUrlParser, useUnifiedTopology are deprecated in Mongoose 6+
    });
    // If mongoose.connect resolves, it means the connection was successful
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
