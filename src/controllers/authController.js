const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/generateToken');

//Register a New User
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Basic Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // 2. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 5. Generate token
        const token = generateToken(user);

        // 6. Send response
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // 2. Find user (explicitly include password)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 3. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 4. Generate token
        const token = generateToken(user);

        // 5. Send response
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


