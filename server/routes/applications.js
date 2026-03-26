const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

// @desc    Apply for an internship
// @route   POST /api/applications
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { internshipId } = req.body;

        const alreadyApplied = await Application.findOne({
            internshipId,
            userId: req.user._id
        });

        if (alreadyApplied) {
            return res.status(400).json({ message: 'You have already applied for this internship' });
        }

        const application = await Application.create({
            internshipId,
            userId: req.user._id
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get current user's applications
// @route   GET /api/applications/my
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user._id })
            .populate({
                path: 'internshipId',
                populate: { path: 'postedBy', select: 'username' }
            })
            .sort({ appliedDate: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (User who applied)
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this application' });
        }

        application.status = status;
        await application.save();

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Untrack an application (Delete)
// @route   DELETE /api/applications/:id
// @access  Private (User who applied)
router.delete('/:id', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to untrack this application' });
        }

        await Application.deleteOne({ _id: application._id });
        res.json({ message: 'Application untracked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
