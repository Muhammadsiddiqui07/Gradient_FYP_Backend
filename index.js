import 'dotenv/config'; // Load environment variables IMMEDIATELY for use in other imports

import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import mongoose from './db/index.js'
import chalk from 'chalk';

const app = express()
const port = process.env.PORT || 4000;

app.use(express.json())
app.use(cors())

// DB connection logs
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log(chalk.white.bgGreen.bold('DB connected!')));

// Routes
app.use('/api', router)

app.listen(port, () => {
    console.log(chalk.white.bgBlue.bold(`Server is running on port ${port}`));
})