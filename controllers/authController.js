require('dotenv').config();

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../config/mailer");

const getRegister = (req, res) => {
    res.render("register", { error: null });
}

const postRegister = async (req, res) => {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
        return res.render("register", { error: "All fields are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.render("register", { error: "Invalid email format." });
    }
    if (password.length < 8) {
        return res.render("register", { error: "Password must be at least 8 characters." });
    }
    if (password !== confirmPassword) {
        return res.render("register", { error: "Passwords do not match." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render("register", { error: "Email already registered." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        await Wallet.create({ user: user._id, balance: 0, transactions: [] });
        res.redirect("/login");
    } catch (error) {
        res.render("register", { error: "Something went wrong. Try again." });
    }
};

const getLogin = (req, res) => {
    if(req.session.user) {
        return res.redirect("/home");
    }
    res.render("login", { error: null });
}

const postLogin = async (req, res) => {
    const email    = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
        return res.render("login", { error: "Email and password are required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.render("login", { error: "Enter a valid email address." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("login", { error: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render("login", { error: "Invalid email or password." });
        }

        if (user.isBlocked) {
            return res.render("login", { error: "Your account has been blocked." });
        }

        req.session.user = {
            _id:   user._id,
            name:  user.name,
            email: user.email
        };

        res.redirect("/home");

    } catch (error) {
        res.render("login", { error: "Something went wrong. Try again." });
    }
};

const userLogout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("user.sid");
        res.redirect("/login");
    });
}

const getForgotPassword = (req, res) => {
    res.render("forgotPassword");
};

const getResetPassword = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        });
        if(!user) return res.render("forgotPassword", { error: "Link expired or invalid." });
        res.render("resetPassword", { token });
    } catch(error) {
        res.render("forgotPassword", { error: "Something went wrong." });
    }
};

const sendResetEmail = async (req, res) => {
    const email = req.body.email?.trim();

    if(!email) {
        return res.render("forgotPassword", { error: "Email is required." });
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.render("forgotPassword", { error: "Enter a valid email address." });
    }

    try {
        const user = await User.findOne({ email });

        if(!user) {
            return res.render("forgotPassword", { message: "If this email is registered, a reset link has been sent." });
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "GadgetHub Password Reset",
            html: `
                <h3>Password Reset Request</h3>
                <p>Click the link below to reset your password. Link expires in 10 minutes.</p>
                <a href="${process.env.BASE_URL}/reset-password/${token}">Reset Password</a>
            `
        });

        res.render("forgotPassword", { message: "If this email is registered, a reset link has been sent." });
    } catch (error) {
        res.render("forgotPassword", { error: "Something went wrong." });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if(!password || password.length < 8) {
        return res.render("resetPassword", { token, error: "Password must be at least 8 characters." });
    }
    if(!/[A-Z]/.test(password)) {
        return res.render("resetPassword", { token, error: "Password must include at least one uppercase letter." });
    }
    if(!/[0-9]/.test(password)) {
        return res.render("resetPassword", { token, error: "Password must include at least one number." });
    }

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        });
        if(!user) return res.render("forgotPassword", { error: "Link expired or invalid." });

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.redirect("/login");
    } catch (error) {
        res.render("forgotPassword", { error: "Something went wrong." });
    }
};

module.exports = {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    userLogout,

    getForgotPassword,
    sendResetEmail,
    getResetPassword,
    resetPassword
}