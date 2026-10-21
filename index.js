import express from 'express'
import 'dotenv/config';
import cors from 'cors'
import router from './routes/index.js'
import mongoose, { connectDB } from './db/index.js'
import chalk from 'chalk';

const app = express()
const port = process.env.PORT || 4000;

if (!process.env.SUPER_ADMIN_EMAIL?.trim() || !process.env.SUPER_ADMIN_PASSWORD?.trim()) {
    console.warn(
        chalk.yellow.bold(
            'Warning: SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is missing in .env — super admin login will not work until you set them and restart the server.'
        )
    );
}

app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
    console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`));
    next();
});

// DB connection logs
const db = mongoose.connection;
db.on('error', (err) => console.error(chalk.red('MongoDB connection error:'), err?.message || err));
db.once('open', () => console.log(chalk.white.bgGreen.bold('DB connected!')));

// Middleware: Har request se pehle DB connection ensure karo (Vercel serverless & local dono ke liye)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error(chalk.red('DB connect error:'), err.message);
        return res.status(503).json({
            success: false,
            message: 'Database is not connected. Check MongoDB configuration and network access.',
            error: err.message,
        });
    }
});

// Root / Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Backend server is running',
        environment: process.env.VERCEL ? 'vercel' : 'local',
        dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// Routes
app.use('/api', router);

// Vercel pe app.listen nahi chalta, sirf local pe chalao
if (!process.env.VERCEL) {
    connectDB()
        .then(() => {
            app.listen(port, () => {
                console.log(chalk.white.bgBlue.bold(`Server is running on port ${port}`));
            });
        })
        .catch((err) => {
            console.error(chalk.red('MongoDB initial connection error:'), err.message);
            app.listen(port, () => {
                console.log(chalk.white.bgYellow.bold(`Server is running on port ${port} (DB disconnected)`));
            });
        });
}

export default app;