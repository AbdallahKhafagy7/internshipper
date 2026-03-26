const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    applyContact: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    deadline: {
      type: Date,
    },
    target: {
      type: String,
      enum: ['undergrad', 'freshgrad', 'both'],
      default: 'both',
    },
    images: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Internship) {
  delete mongoose.models.Internship;
}

module.exports = mongoose.model('Internship', internshipSchema);
