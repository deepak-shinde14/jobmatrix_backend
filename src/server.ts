import path from 'path';
import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/database'; // Import connectDB

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to the database", err);
  process.exit(1);
});