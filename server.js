const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await User.create({ username, email, password });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/submit', authenticate, async (req, res) => {
    const { count } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (user) {
            user.totalRecitations += count;
            await user.save();
            res.sendStatus(200);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating recitations' });
    }
});

app.get('/total', async (req, res) => {
    try {
        const users = await User.find({});
        const total = users.reduce((acc, user) => acc + user.totalRecitations, 0);
        res.json({ total });
    } catch (error) {
        res.status(400).json({ message: 'Error calculating total recitations' });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find({}).sort({ totalRecitations: -1 }).limit(5);
        const leaderboard = users.map(user => ({
            username: user.username,
            totalRecitations: user.totalRecitations,
        }));
        res.json({ leaderboard });
    } catch (error) {
        res.status(400).json({ message: 'Error fetching leaderboard' });
    }
});

app.get('/search', authenticate, async (req, res) => {
    const { username } = req.query;
    try {
        const user = await User.findOne({ username: username.toLowerCase() });
        res.json({ totalRecitations: user ? user.totalRecitations : 0 });
    } catch (error) {
        res.status(400).json({ message: 'Error searching user' });
    }
});

app.get('/user-data', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            username: user.username,
            totalRecitations: user.totalRecitations,
            dailyGoal: user.dailyGoal,
            weeklyGoal: user.weeklyGoal,
            recitationStats: user.recitationStats
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
