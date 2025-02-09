const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    totalRecitations: {
        type: Number,
        default: 0,
    },
    dailyGoal: {
        type: Number,
        default: 5,
    },
    weeklyGoal: {
        type: Number,
        default: 35,
    },
    recitationStats: {
        labels: {
            type: [String],
            default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        data: {
            type: [Number],
            default: [0, 0, 0, 0, 0, 0, 0],
        },
    },
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
