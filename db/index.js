import mongoose from 'mongoose';
import dns from 'dns';

// Fix for some cloud environments where DNS resolution fails
dns.setServers(['8.8.8.8', '8.8.4.4']);

const password = process.env.MONGODB_PASSWORD;
// Prioritize full MONGO_URI if available, otherwise construct it from password
const MONGO_URI = process.env.MONGO_URI || `mongodb+srv://muhammadsiddiqui1410_db_user:${encodeURIComponent(password)}@gradiant.6ezdxxr.mongodb.net/gradiant`;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => console.error('MongoDB connection error:', err));

export default mongoose;
