const express = require('express');
const router = express.Router();
const { db } = require('./db');
const { v4: uuidv4 } = require('uuid');

// Mock Secret for "JWT"
const MOCK_JWT_SECRET = "delivery_hub_secret_key_2025";

// Helper: Generate Token (Mock)
const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        name: user.name
    };
    // In a real app, sign with jsonwebtoken
    // return jwt.sign(payload, MOCK_JWT_SECRET);
    return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Login Endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = db.users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Determine default redirect based on role
    let redirectUrl = "/";
    if (user.role === 'fleet_manager') redirectUrl = "/fleet";
    else if (user.role === 'warehouse_manager') redirectUrl = "/warehousing";
    else if (user.role === 'logistics_coordinator') redirectUrl = "/logistics/tracking";

    const token = generateToken(user);

    // Don't send password back
    const { password: _, ...userWithoutPass } = user;

    res.json({
        success: true,
        token,
        user: userWithoutPass,
        redirectUrl
    });
});

// Get Current User (Verify Token)
router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    try {
        const token = authHeader.split(" ")[1];
        // In real app: jwt.verify(token, ...)
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        res.json({ user: decoded });
    } catch (e) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// List Users (Admin Only - Mock Middleware)
router.get('/users', (req, res) => {
    // In real app, check req.user.role === 'super_admin'
    const minimalUsers = db.users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        name: u.name,
        email: u.email,
        permissions: u.permissions
    }));
    res.json({ users: minimalUsers });
});

module.exports = router;
