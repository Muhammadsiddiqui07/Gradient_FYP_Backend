import mongoose from "mongoose";

const { Schema } = mongoose;

const historySchema = new Schema({
    username: {
        type: String,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        default: 4
    },
    mode: {
        type: String,
        enum: ['chat', 'geography', 'history', 'economics'],
        default: 'chat'
    }
}, {
    timestamps: true
});

const History = mongoose.model('Queries_History', historySchema);

export default History;
