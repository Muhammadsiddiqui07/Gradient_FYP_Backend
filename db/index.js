import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://muhammadsiddiqui1410_db_user:${MONGO_URI}@firstcluster.6ezdxxr.mongodb.net/`)

export default mongoose;