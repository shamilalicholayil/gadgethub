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
    const password = req.body.password?.trim();
    const confirmPassword = req.body.confirmPassword?.trim();
    if(!name || !email || !password || !confirmPassword) {
        return res.render("register", { error: "A field is empty." });
    }
    if(password !== confirmPassword) {
        return res.render("register", { error: "Password should match confirm password." });
    }
    try {
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.render("register", { error: "Email already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        await Wallet.create({ user: user._id, balance: 0, transactions: [] });
        res.redirect("/login");
    } catch (error) {
        res.render("register", { error: "Something went wrong. Try again."})
    }
}

const getLogin = (req, res) => {
    if(req.session.user) {
        return res.redirect("/home");
    }
    res.render("login", { error: null });
}

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.render("login", { error: "Invalid email or password." });
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.render("login", { error: "Invalid email or password."})
        }
        if(user.isBlocked) {
            return res.render("login", { error: "Your account has been blocked." });
        }
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        }
        res.redirect("/home");
    } catch (error) {
        res.render("login", { error: "Something went wrong. Try again."})
    }
}

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
    const user = await User.findOne({ 
        resetToken: token, 
        resetTokenExpiry: { $gt: new Date() } 
    });
    if(!user) return res.render("forgotPassword", { error: "Link expired or invalid." });
    res.render("resetPassword", { token });
};

const sendResetEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) return res.redirect("/login");

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        // Send email
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "GadgetHub Password Reset",
            html: `
                <h3>Password Reset Request</h3>
                <p>Click the link below to reset your password. Link expires in 10 minutes.</p>
                <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
            `
        });

        res.render("forgotPassword", { message: "Reset link sent to your email." });
    } catch(error) {
        console.log(error);
        res.render("forgotPassword", { error: "Something went wrong." });
    }
}

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
        if(!user) return res.render("forgotPassword", { error: "Link expired or invalid." });

        const hashed = await bcrypt.hash(password, 10);
        
        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.redirect("/login");
    } catch(error) {
        res.render("forgotPassword", { error: "Something went wrong." });
    }
}

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