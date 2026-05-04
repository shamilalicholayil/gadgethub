require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

const seedAdmin = async (req, res) => {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await Admin.findOne({ email: "admin@gmail.com" });
    if(existing) {
        console.log("Admin already exists.");
        process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword
    });

    console.log("Admin created successfully");
    process.exit();
}

seedAdmin();