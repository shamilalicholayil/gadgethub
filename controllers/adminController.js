const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Coupon = require("../models/Coupon");
const Category = require("../models/Category");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const puppeteer = require("puppeteer");

const getLogin = (req, res) => {
    if(req.session.admin){
        return res.redirect("/admin/dashboard");
    }
    res.render("admin/login", { error: null });
}

const postLogin = async (req, res) => {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
        return res.render("admin/login", { error: "Email and password are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.render("admin/login", { error: "Enter a valid email address." });
    }

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.render("admin/login", { error: "Invalid email or password." });
        }
        const authorize = await bcrypt.compare(password, admin.password);
        if (!authorize) {
            return res.render("admin/login", { error: "Invalid email or password." });
        }
        req.session.admin = { _id: admin._id, name: admin.name, email: admin.email };
        res.redirect("/admin/dashboard");
    } catch (error) {
        res.render("admin/login", { error: "Something went wrong. Try again." });
    }
};

const adminLogout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("admin.sid");
        res.redirect("/admin/login");
    });
}

const getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalBrands = await Brand.countDocuments();
        const totalOrders = await Order.countDocuments();

        const revenueData = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueData[0]?.totalRevenue || 0;

        const ordersByStatus = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);

        // Daily
        const dailySales = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
            { $group: {
                _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }},
            { $sort: { "_id.month": 1, "_id.day": 1 } }
        ]);

        // Monthly (last 12 months)
        const monthlySales = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
            { $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
        ]);

        // 6 months
        const sixMonthSales = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] }, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
            { $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Yearly
        const yearlySales = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
            { $group: {
                _id: { year: { $year: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1 } }
        ]);

        // Top 5 products
        const topProducts = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
            { $unwind: "$items" },
            { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $project: { name: "$product.name", totalSold: 1, revenue: 1 } }
        ]);

        // Category wise sales
        const categorySales = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
            { $unwind: "$items" },
            { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
            { $unwind: "$category" },
            { $group: { _id: "$category.name", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
            { $sort: { revenue: -1 } }
        ]);

        res.render("admin/dashboard", {
            totalUsers, totalProducts, totalBrands,
            totalOrders, totalRevenue,
            ordersByStatus, monthlySales,
            dailySales, sixMonthSales, yearlySales,
            topProducts, categorySales
        });
    } catch(error) {
        res.render("admin/dashboard", { error: "Something went wrong." });
    }
}

const downloadReport = async (req, res) => {
    const { range, startDate, endDate } = req.query;
    try {
        let matchStage = { orderStatus: { $nin: ["cancelled", "returned"] } };

        const now = new Date();
        if (range === "day") {
            matchStage.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        } else if (range === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchStage.createdAt = { $gte: weekAgo };
        } else if (range === "month") {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchStage.createdAt = { $gte: monthAgo };
        } else if (range === "year") {
            const yearAgo = new Date();
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            matchStage.createdAt = { $gte: yearAgo };
        } else if (range === "custom" && startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const orders = await Order.find(matchStage)
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        const rows = orders.map(o => `
            <tr>
                <td>${o._id}</td>
                <td>${o.user?.name || "N/A"}</td>
                <td>${o.user?.email || "N/A"}</td>
                <td>₹${o.totalAmount}</td>
                <td>${o.orderStatus}</td>
                <td>${o.paymentMethod}</td>
                <td>${new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
        `).join("");

        const html = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { color: #0891b2; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #0891b2; color: white; padding: 10px; text-align: left; }
                    td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 12px; }
                    tr:nth-child(even) { background: #f8fafc; }
                    .summary { margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; }
                </style>
            </head>
            <body>
                <h2>GadgetHub — Sales Report</h2>
                <div class="summary">
                    <strong>Period:</strong> ${range === "custom" ? `${startDate} to ${endDate}` : range}<br>
                    <strong>Total Orders:</strong> ${orders.length}<br>
                    <strong>Total Revenue:</strong> ₹${totalRevenue}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th><th>Customer</th><th>Email</th>
                            <th>Amount</th><th>Status</th><th>Payment</th><th>Date</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "load" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
        });
        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=report-${range}-${Date.now()}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong." });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.render("admin/users", { users });
    } catch (error) {
        res.render("admin/dashboard", { error: "Something went wrong. Try again." });
    }
}

const blockUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if(!user) {
            return res.json({ success: false, message: "User not found." })
        }
        user.isBlocked = !user.isBlocked;
        await user.save();
        const msg = user.isBlocked ? "User blocked successfully." : "User unblocked successfully.";
        res.json({ success: true, message: msg, isBlocked: user.isBlocked });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render("admin/brands", { brands });
    } catch (error) {
        res.render("admin/dashboard", { error: "Something went wrong. Try again." });
    }
}

const addBrand = async (req, res) => {
    const name = req.body.name?.trim();
    if(!name) {
        return res.json({ success: false, message: "A field is empty." });
    }
    try {
        const existingBrand = await Brand.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        if(existingBrand) {
            return res.json({ success: false, message: "Brand already exists." })
        }
        const brand = new Brand({ name });
        await brand.save();
        res.json({ success: true, message: "Brand created successfully" })
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const editBrand = async (req, res) => {
    const { id } = req.params;
    const name = req.body.name?.trim();
    const { isActive } = req.body;
    if(!name) {
        return res.json({ success: false, message: "A field is empty." });
    }
    try {
        const exists = await Brand.findOne({ name: { $regex: `^${name}$`, $options: "i" }, _id: { $ne: id }});
        if(exists) return res.json({ success: false, message: "Already exists" });

        const brand = await Brand.findByIdAndUpdate(id, { $set: { name, isActive }});
        if(!brand) {
            return res.json({ success: false, message: "Brand not found." });
        }
        res.json({ success: true, message: "Brand updated successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const deleteBrand = async (req, res) => {
    const { id } = req.params;
    const { enableProducts } = req.body;
    try {
        const brand = await Brand.findById(id);
        if(!brand) {
            return res.json({ success: false, message: "Brand not found."});
        }

        brand.isActive = !brand.isActive;
        await brand.save();

        if(!brand.isActive) {
            await Product.updateMany({ brand: id}, { isActive: false });
        } else if(enableProducts) {
            await Product.updateMany({ brand: id }, { isActive: true });
        }

        const msg = brand.isActive ? "Brand enabled successfully." : "Brand disabled successfully.";
        return res.json({ success: true, message: msg, isActive: brand.isActive });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getCategories = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};

        if(search) query.name = { $regex: search, $options: "i" };
        const categories = await Category.find(query);

        if(req.headers.accept.includes("application/json")) {
            return res.json({ success: true, categories });
        }

        res.render("admin/categories", { categories });
    } catch (error) {
        res.render("admin/dashboard", { error: "Something went wrong. Try again." });
    }
}

const addCategory = async (req, res) => {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim();
    if(!name || !description) {
        return res.json({ success: false, message: "A field is empty." });
    }
    try {
        const existingCategory = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        if(existingCategory) {
            return res.json({ success: false, message: "Category already exists." });
        }
        const category = new Category({ name, description });
        await category.save();
        res.json({ success: true, message: "Category added successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const editCategory = async (req, res) => {
    const { id } = req.params;
    const name = req.body.name?.trim();
    const description = req.body.description?.trim();
    if(!name || !description) {
        return res.json({ success: false, message: "A field is empty." });
    }
    try {
        const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" }, _id: { $ne: id }});
        if(exists) return res.json({ success: false, message: "Already exists" });

        const category = await Category.findByIdAndUpdate(id, { $set: { name, description }});
        if(!category) {
            return res.json({ success: false, message: "Category not found." });
        }
        res.json({ success: true, message: "Category updated successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const { enableProducts } = req.body;
    try {
        const category = await Category.findById(id);
        if(!category) {
            return res.json({ success: false, message: "Category not found."});
        }

        category.isActive = !category.isActive;
        await category.save();

        if(!category.isActive) {
            await Product.updateMany({ category: id}, { isActive: false });
        } else if(enableProducts) {
            await Product.updateMany({ category: id }, { isActive: true });
        }

        const msg = category.isActive ? "Category enabled successfully." : "Category disabled successfully.";
        return res.json({ success: true, message: msg, isActive: category.isActive });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getCoupons = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};

        if(search) query.code = { $regex: search, $options: "i" };
        const coupons = await Coupon.find(query);

        if(req.headers.accept.includes("application/json")) {
            return res.json({ success: true, coupons });
        }

        res.render("admin/coupons", { coupons });
    } catch (error) {
        res.render("admin/dashboard", { error: "Something went wrong. Try again." });
    }
}

const addCoupon = async (req, res) => {
    const code = req.body.code?.trim().toUpperCase();
    const discountType = req.body.discountType?.trim();
    const discountValue = parseFloat(req.body.discountValue);
    const minOrderValue = parseFloat(req.body.minOrderValue);
    const expiryDate = req.body.expiryDate?.trim();
    const usageLimit = parseInt(req.body.usageLimit);

    if(!code || !discountType || !expiryDate) {
        return res.json({ success: false, message: "All fields are required." });
    }
    if(!["percent", "flat"].includes(discountType)) {
        return res.json({ success: false, message: "Invalid discount type." });
    }
    if(isNaN(discountValue) || discountValue <= 0) {
        return res.json({ success: false, message: "Discount value must be a positive number." });
    }
    if(discountType === "percent" && discountValue > 100) {
        return res.json({ success: false, message: "Percentage discount cannot exceed 100." });
    }
    if(isNaN(minOrderValue) || minOrderValue < 0) {
        return res.json({ success: false, message: "Invalid minimum order value." });
    }
    if(isNaN(usageLimit) || usageLimit < 1) {
        return res.json({ success: false, message: "Usage limit must be at least 1." });
    }
    if(new Date(expiryDate) <= new Date()) {
        return res.json({ success: false, message: "Expiry date must be in the future." });
    }

    try {
        const existingCoupon = await Coupon.findOne({ code: { $regex: `^${code}$`, $options: "i" } });
        if(existingCoupon) {
            return res.json({ success: false, message: "Coupon already exists." });
        }
        const coupon = new Coupon({ code, discountType, discountValue, minOrderValue, expiryDate, usageLimit });
        await coupon.save();
        res.json({ success: true, message: "Coupon added successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const editCoupon = async (req, res) => {
    const { id } = req.params;
    const code = req.body.code?.trim().toUpperCase();
    const discountType = req.body.discountType?.trim();
    const discountValue = parseFloat(req.body.discountValue);
    const minOrderValue = parseFloat(req.body.minOrderValue);
    const expiryDate = req.body.expiryDate?.trim();
    const usageLimit = parseInt(req.body.usageLimit);
    const { isActive } = req.body;

    if(!code || !discountType || !expiryDate) {
        return res.json({ success: false, message: "All fields are required." });
    }
    if(!["percent", "flat"].includes(discountType)) {
        return res.json({ success: false, message: "Invalid discount type." });
    }
    if(isNaN(discountValue) || discountValue <= 0) {
        return res.json({ success: false, message: "Discount value must be a positive number." });
    }
    if(discountType === "percent" && discountValue > 100) {
        return res.json({ success: false, message: "Percentage discount cannot exceed 100." });
    }
    if(isNaN(minOrderValue) || minOrderValue < 0) {
        return res.json({ success: false, message: "Invalid minimum order value." });
    }
    if(isNaN(usageLimit) || usageLimit < 1) {
        return res.json({ success: false, message: "Usage limit must be at least 1." });
    }

    try {
        const exists = await Coupon.findOne({ code: { $regex: `^${code}$`, $options: "i" }, _id: { $ne: id } });
        if(exists) return res.json({ success: false, message: "Coupon code already in use." });

        const updatedCoupon = await Coupon.findByIdAndUpdate(id, { $set: { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive } });
        if(!updatedCoupon) {
            return res.json({ success: false, message: "Coupon not found." });
        }
        res.json({ success: true, message: "Coupon updated successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const deleteCoupon = async (req, res) => {
    const { id } = req.params;
    try {
        const coupon = await Coupon.findById(id);
        if(!coupon) {
            return res.json({ success: false, message: "Coupon not found." });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        const msg = coupon.isActive ? "Coupon enabled successfully." : "Coupon disabled successfully.";
        return res.json({ success: true, message: msg, isActive: coupon.isActive });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getProducts = async (req, res) => {
    try {
        const { search, brand, category, page } = req.query;
        const query = {};
        const limit = 10;
        const currentPage = parseInt(page) || 1;
        const skip = (currentPage - 1) * limit;

        if(search) query.name = { $regex: search, $options: "i" };
        if(brand) query.brand = brand;
        if(category) query.category = category;

        const products = await Product.find(query).populate("brand").populate("category").skip(skip).limit(limit);
        const brands = await Brand.find();
        const categories = await Category.find();
        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        if(req.headers.accept.includes("application/json")) {
            return res.json({ success: true, products, brands, categories, currentPage, totalPages });
        }

        res.render("admin/products", { products, brands, categories, currentPage, totalPages });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const addProduct = async (req, res) => {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim();
    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);
    const { brand, category } = req.body;
    const hasOffer = req.body.hasOffer === "on";
    const offerPercent = hasOffer ? parseFloat(req.body.offerPercent) || 0 : 0;

    if(!name || !description || !brand || !category) {
        return res.json({ success: false, message: "All fields are required." });
    }
    if(isNaN(price) || price <= 0) {
        return res.json({ success: false, message: "Price must be a positive number." });
    }
    if(isNaN(stock) || stock < 0) {
        return res.json({ success: false, message: "Stock must be 0 or more." });
    }

    try {
        const images = [];
        for(let i = 0; i <= 4; i++) {
            if(!req.files[`image_${i}`]) {
                return res.json({ success: false, message: "Please upload all 5 images." });
            }
            const { buffer, mimetype } = req.files[`image_${i}`][0];
            const result = await uploadToCloudinary(buffer, mimetype);
            images.push({ url: result.secure_url, public_id: result.public_id });
        }

        const isExists = await Product.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        if(isExists) {
            return res.json({ success: false, message: "Product already exists." });
        }

        const finalPrice = hasOffer && offerPercent > 0
            ? Math.round(price - (price * offerPercent / 100))
            : price;

        const product = new Product({ name, description, price, finalPrice, stock, brand, category, images, hasOffer, offerPercent });
        await product.save();
        res.json({ success: true, message: "Product added successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const editProduct = async (req, res) => {
    const { id } = req.params;
    const name = req.body.name?.trim();
    const description = req.body.description?.trim();
    const price = req.body.price?.trim();
    const stock = req.body.stock?.trim();
    const { brand, category } = req.body;
    const hasOffer = req.body.hasOffer === "on";
    const offerPercent = hasOffer ? parseFloat(req.body.offerPercent) || 0 : 0;

    if(!name || !description || !price || !stock || !brand || !category) {
        return res.json({ success: false, message: "A field is empty." });
    }
    try {
        const exists = await Product.findOne({ name: { $regex: `^${name}$`, $options: "i" }, _id: { $ne: id }});
        if(exists) return res.json({ success: false, message: "Already exists" });
        
        const product = await Product.findById(id);
        if(!product) return res.json({ success: false, message: "Product not found." });

        const updatedImages = [];
        for(let i = 0; i <= 4; i++) {
            if(req.files[`image_${i}`]) {
                await cloudinary.uploader.destroy(product.images[i].public_id);
                
                const { buffer, mimetype } = req.files[`image_${i}`][0];
                const result = await uploadToCloudinary(buffer, mimetype);
                updatedImages.push({ url: result.secure_url, public_id: result.public_id });
            } else {
                updatedImages.push(product.images[i]);
            }
        }
        const finalPrice = hasOffer && offerPercent > 0
            ? Math.round(price - (price * offerPercent / 100))
            : price;
        
        const updateProduct = { name, description, price, finalPrice, stock, brand, category, images: updatedImages, hasOffer, offerPercent };
        const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateProduct });

        if(!updatedProduct) return res.json({ success: false, message: "Product not found."});
        res.json({ success: true, message: "Product updated successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if(!product) {
            return res.json({ success: false, message: "Product not found." });
        }
        if(product.isActive === false) {
            const category = await Category.findById(product.category);
            const brand = await Brand.findById(product.brand);
            if(!category || !category.isActive) {
                return res.json({ success: false, message: "Cannot enable product while its category is disabled." });
            }
            if(!brand || !brand.isActive) {
                return res.json({ success: false, message: "Cannot enable product while its brand is disabled." });
            }
        }
        product.isActive = !product.isActive;
        await product.save();
        const msg = product.isActive ? "Product enabled successfully." : "Product disabled successfully.";
        return res.json({ success: true, message: msg, isActive: product.isActive });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
        res.render("admin/orders", { orders });
    } catch (error) {
        res.render("admin/orders", { orders: [], error: "Something went wrong." })
    }
}

const updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"];
    if(!orderStatus || !allowedStatuses.includes(orderStatus)) {
        return res.json({ success: false, message: "Invalid order status." });
    }

    try {
        const order = await Order.findById(orderId);
        if(!order) return res.json({ success: false, message: "Order not found." });
        order.orderStatus = orderStatus;
        await order.save();
        res.json({ success: true, message: `Order status changed to ${orderStatus}.`, orderStatus: order.orderStatus });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

module.exports = {
    getLogin,
    postLogin,
    adminLogout,
    getDashboard,
    downloadReport,

    getUsers,
    blockUser,

    getBrands,
    addBrand,
    editBrand,
    deleteBrand,

    getCategories,
    addCategory,
    editCategory,
    deleteCategory,

    getCoupons,
    addCoupon,
    editCoupon,
    deleteCoupon,

    getProducts,
    addProduct,
    editProduct,
    deleteProduct,

    getAdminOrders,
    updateOrderStatus
}