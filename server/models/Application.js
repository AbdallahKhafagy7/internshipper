const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'interview', 'rejected', 'accepted'],
        default: 'waiting'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
