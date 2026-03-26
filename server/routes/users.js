const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({})
            .select('username email role createdAt')
            .sort({ username: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/role', protect, admin, async (req, res) => {
    const { role } = req.body;

    if (!role || !['student', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role must be "student" or "admin"' });
    }

    if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot change your own role' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('username email role');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
