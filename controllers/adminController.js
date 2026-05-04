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

const getLogin = (req, res) => {
    if(req.session.admin){
        return res.redirect("/admin/dashboard");
    }
    res.render("admin/login", { error: null });
}

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if(!admin) {
            return res.render("admin/login", { error: "Invalid email or password." });
        }
        const authorize = await bcrypt.compare(password, admin.password);
        if(!authorize) {
            return res.render("admin/login", { error: "Invalid email or password." });
        }
        req.session.admin = {
            _id: admin._id,
            name: admin.name,
            email: admin.email
        }
        res.redirect("/admin/dashboard");
    } catch (error) {
        res.render("admin/login", { error: "Something went wrong. Try again." });
    }
}

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

        // Revenue
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueData[0]?.totalRevenue || 0;

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);

        // Monthly sales (last 6 months)
        const monthlySales = await Order.aggregate([
            { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
            { $group: {
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 6 }
        ]);

        res.render("admin/dashboard", { 
            totalUsers, totalProducts, totalBrands, 
            totalOrders, totalRevenue,
            ordersByStatus, monthlySales
        });
    } catch(error) {
        res.render("admin/dashboard", { error: "Something went wrong." });
    }
}

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
        const existingBrand = await Brand.findOne({ name });
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
        const categories = await Category.find();
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
        const existingCategory = await Category.findOne({ name });
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
    const code = req.body.code?.trim();
    const discountType = req.body.discountType?.trim();
    const discountValue = req.body.discountValue?.trim();
    const minOrderValue = req.body.minOrderValue?.trim();
    const expiryDate = req.body.expiryDate?.trim();
    const usageLimit = req.body.usageLimit?.trim();
    if(!code || !discountType || !discountValue || !minOrderValue || !expiryDate || !usageLimit) {
        return res.json({ success: false, message: "A field is empty." });
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
        console.log(error);
        res.json({ success: false, message: "Something went wrong." });
    }
}

const editCoupon = async (req, res) => {
    const { id } = req.params;
    const code = req.body.code?.trim();
    const discountType = req.body.discountType?.trim();
    const discountValue = req.body.discountValue?.trim();
    const minOrderValue = req.body.minOrderValue?.trim();
    const expiryDate = req.body.expiryDate?.trim();
    const usageLimit = req.body.usageLimit?.trim();
    const { isActive } = req.body;
    if(!code || !discountType || !discountValue || !minOrderValue || !expiryDate || !usageLimit) {
        return res.json({ success: false, message: "A field is empty." });
    }
    try {
        const exists = await Coupon.findOne({ code: { $regex: `^${code}$`, $options: "i" }, _id: { $ne: id }});
        if(exists) return res.json({ success: false, message: "Already exists" });

        const updatedCoupon = await Coupon.findByIdAndUpdate(id, { $set: { code, discountType, discountValue, minOrderValue, expiryDate, usageLimit, isActive }});
        if(!updatedCoupon) {
            return res.json({ success: false, message: "Coupon not found." });
        }
        res.json({ success: true, message: "Coupon updated successfully." })
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

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
    const price = req.body.price?.trim();
    const stock = req.body.stock?.trim();
    const { brand, category } = req.body;
    const finalPrice = Number(price);

    if(!name || !description || !price || !stock || !brand || !category) {
        return res.json({ success: false, message: "A field is empty." });
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
            ? Math.round(Number(price) - (Number(price) * offerPercent / 100))
            : price;

        const product = new Product({ name, description, price, finalPrice, stock, brand, category, images });
        await product.save();
        res.json({ success: true, message: "Product added successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

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
            if(!category.isActive) {
                return res.json({ success: false, message: "Cannot enable product while its category is disabled." });
            }
            if(!brand.isActive) {
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
    try {
        const order = await Order.findById(orderId);
        if(!order) return res.json({ success: false, message: "Order not found." });
        order.orderStatus = orderStatus;
        await order.save();
        const msg = `Order status changed to ${orderStatus}.`;
        res.json({ success: true, message: msg, orderStatus: order.orderStatus });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

module.exports = {
    getLogin,
    postLogin,
    adminLogout,
    getDashboard,

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