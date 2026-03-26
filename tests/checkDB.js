import 'dotenv/config';
import mongoose from 'mongoose';

async function checkDB() {
    try {
        const MONGO_URI = process.env.MONGODB_PASSWORD;
        const url = `mongodb+srv://muhammadsiddiqui1410_db_user:${MONGO_URI}@firstcluster.6ezdxxr.mongodb.net/`;
        
        console.log('Connecting to:', url);
        await mongoose.connect(url);
        
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('\nAvailable Databases:');
        dbs.databases.forEach(db => console.log(` - ${db.name}`));

        console.log('\nCurrent Database Name:', mongoose.connection.db.databaseName);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections in current DB:');
        collections.forEach(col => console.log(` - ${col.name}`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkDB();
