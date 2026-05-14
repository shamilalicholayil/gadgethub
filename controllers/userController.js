require('dotenv').config();

const User = require("../models/User");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const Address = require("../models/Address");
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");

const { calculateDiscount } = require("../utils/couponHelper");
const { restoreStock } = require("../utils/orderHelper");

const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


const getHome = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).limit(4);
        const offerProducts = await Product.find({ isActive: true, hasOffer: true }).limit(5);
        const category = await Category.find();
        const smartphoneCategory = category.find(c => c.name === "SMARTPHONES");
        const laptopCategory = category.find(c => c.name === "LAPTOPS");
        const audioCategory = category.find(c => c.name === "AUDIO");
        const accessoriesCategory = category.find(c => c.name === "ACCESSORIES");
        res.render("home", { products, offerProducts, smartphoneCategory, laptopCategory, audioCategory, accessoriesCategory, currentPage: "home" });
    } catch (error) {
        res.render("home", { currentPage: "home", error: "Something went wrong. Try again." });
    }
}

const getProfile = async (req, res) => {
    const user = req.session.user._id;
    try {
        const userData = await User.findById(user);
        const addresses = await Address.find({ user: user });
        res.render("profile", { userData, addresses, currentPage: "home" });
    } catch (error) {
        res.render("home", { error: "Something went wrong. Try again." });
    }
}

const updateUser = async (req, res) => {
    const userId = req.session.user._id;
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();

    if (!name || !email) {
        return res.json({ success: false, message: "Name and email are required." });
    }
    if (name.length < 3) {
        return res.json({ success: false, message: "Name must be at least 3 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.json({ success: false, message: "Invalid email address." });
    }

    try {
        const existing = await User.findOne({ email, _id: { $ne: userId } });
        if (existing) {
            return res.json({ success: false, message: "Email already in use." });
        }

        await User.findByIdAndUpdate(userId, { name, email });
        req.session.user.name = name;
        req.session.user.email = email;
        res.json({ success: true, message: "Profile updated." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const resetPassword = async (req, res) => {
    const userId = req.session.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.json({ success: false, message: "All fields are required." });
    }
    if (newPassword.length < 8) {
        return res.json({ success: false, message: "Password must be at least 8 characters." });
    }

    try {
        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.json({ success: false, message: "Current password is incorrect." });

        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userId, { password: hashed });
        res.json({ success: true, message: "Password updated." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const addAddress = async (req, res) => {
    const userId = req.session.user._id;
    const fullName = req.body.fullName?.trim();
    const phone = req.body.phone?.trim();
    const address = req.body.address?.trim();
    const city = req.body.city?.trim();
    const state = req.body.state?.trim();
    const pincode = req.body.pincode?.trim();

    if (!fullName || !phone || !address || !city || !state || !pincode) {
        return res.json({ success: false, message: "All fields are required." });
    }
    if (!/^\d{10}$/.test(phone)) {
        return res.json({ success: false, message: "Invalid phone number." });
    }
    if (!/^\d{6}$/.test(pincode)) {
        return res.json({ success: false, message: "Invalid pincode." });
    }

    try {
        await Address.create({ user: userId, fullName, phone, address, city, state, pincode });
        res.json({ success: true, message: "Address added." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const editAddress = async (req, res) => {
    const userId = req.session.user._id;
    const { id } = req.params;

    const fullName = req.body.fullName?.trim();
    const phone = req.body.phone?.trim();
    const address = req.body.address?.trim();
    const city = req.body.city?.trim();
    const state = req.body.state?.trim();
    const pincode = req.body.pincode?.trim();

    if (!fullName || !phone || !address || !city || !state || !pincode) {
        return res.json({ success: false, message: "All fields are required." });
    }
    if (!/^\d{10}$/.test(phone)) {
        return res.json({ success: false, message: "Invalid phone number." });
    }
    if (!/^\d{6}$/.test(pincode)) {
        return res.json({ success: false, message: "Invalid pincode." });
    }

    try {
        const existing = await Address.findOne({ _id: id, user: userId });
        if (!existing) {
            return res.json({ success: false, message: "Address not found." });
        }
        await Address.findByIdAndUpdate(id, { fullName, phone, address, city, state, pincode });
        res.json({ success: true, message: "Address updated." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const deleteAddress = async (req, res) => {
    const userId = req.session.user._id;
    const { id } = req.params;

    try {
        const address = await Address.findOne({ _id: id, user: userId });
        if (!address) {
            return res.json({ success: false, message: "Address not found." });
        }
        await Address.findByIdAndDelete(id);
        res.json({ success: true, message: "Address deleted." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const setDefaultAddress = async (req, res) => {
    const userId = req.session.user._id;
    const { id } = req.params;

    try {
        const address = await Address.findOne({ _id: id, user: userId });
        if (!address) {
            return res.json({ success: false, message: "Address not found." });
        }
        await Address.updateMany({ user: userId }, { isDefault: false });
        await Address.findByIdAndUpdate(id, { isDefault: true });
        res.json({ success: true, message: "Default address updated." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const getOrders = async (req, res) => {
    const userId = req.session.user._id;
    try{
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.render("orderList", { orders, currentPage: "orders" });
    } catch (error) {
        res.render("home", { error: "Something went wrong. Try again." });
    }
}

const getWallet = async (req, res) => {
    const userId = req.session.user._id;
    try {
        const wallet = await Wallet.findOne({ user: userId });
        res.render("wallet", { wallet, currentPage: "wallet" });
    } catch(error) {
        res.redirect("/profile");
    }
}

const getOrderDetails = async (req, res) => {
    const userId = req.session.user._id;
    const orderId = req.params.id;
    try {
        const userData = await User.findById(userId);
        const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.product", "name images");
        if(!order) return res.redirect("/orders");
        
        res.render("orderDetails", { order, userData, currentPage: "orderDetails" });
    } catch (error) {
        res.redirect("/orders");
    }
}

const cancelOrder = async (req, res) => {
    const userId = req.session.user._id;
    const orderId = req.params.id;
    try {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if(!order) return res.json({ success: false, message: "Order not found." });

        if(order.orderStatus !== "pending" && order.orderStatus !== "processing") {
            return res.json({ success: false, message: "Order cannot be cancelled." });
        }

        order.orderStatus = "cancelled";
        await order.save();

        if(order.paymentMethod === "online" || order.paymentMethod === "wallet" || order.paymentMethod === "cod") {
            await Wallet.findOneAndUpdate(
                { user: userId },
                {
                    $inc: { balance: order.totalAmount },
                    $push: { transactions: {
                        amount: order.totalAmount,
                        type: "credit",
                        description: `Refund for cancelled order #${order._id}`
                    }}
                }
            );
        }

        await restoreStock(order.items);

        res.json({ success: true, message: "Order cancelled successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const returnOrder = async (req, res) => {
    const userId = req.session.user._id;
    const orderId = req.params.id;
    try {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if(!order) return res.json({ success: false, message: "Order not found." });

        if(order.orderStatus !== "delivered") {
            return res.json({ success: false, message: "Only delivered order can be returned." });
        }

        order.orderStatus = "returned";
        await order.save();

        if(order.paymentMethod === "online" || order.paymentMethod === "wallet" || order.paymentMethod === "cod") {
            await Wallet.findOneAndUpdate(
                { user: userId },
                {
                    $inc: { balance: order.totalAmount },
                    $push: { transactions: {
                        amount: order.totalAmount,
                        type: "credit",
                        description: `Refund for return order #${order._id}`
                    }}
                }
            );
        }

        await restoreStock(order.items);

        res.json({ success: true, message: "Order Returned successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getShop = async (req, res) => {
    const { page, search = "", category, brand, minPrice, maxPrice, sort } = req.query;
    const limit = 12;
    const currentPageNumber = parseInt(page) || 1;
    const skip = (currentPageNumber - 1) * limit;
    const query = { isActive: true };

    if(search) query.name = { $regex: search, $options: "i" };
    if(category) query.category = category;
    if(brand) query.brand = brand;
    if(minPrice || maxPrice) {
        query.finalPrice = {};
        if(minPrice) query.finalPrice.$gte = Number(minPrice);
        if(maxPrice) query.finalPrice.$lte = Number(maxPrice);
    }

    const sortOptions = {
        price_asc: { finalPrice:  1 },
        price_desc: { finalPrice: -1 },
        newest: { createdAt:  -1 }
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };
    try {
        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const products = await Product.find(query).populate("brand").populate("category").sort(sortBy).skip(skip).limit(limit);
        const brands = await Brand.find({ isActive: true });
        const categories = await Category.find({ isActive: true });
        if(req.headers.accept === "application/json") {
            return res.json({ success: true, products, currentPageNumber, totalPages });
        }
        res.render("shop", { products, currentPage: "shop", brands, categories, currentPageNumber, totalPages });
    } catch (error) {
        res.render("home", { currentPage: "home", error: "Something went wrong. Try again." });
    }
}

const getProduct = async (req, res) => {
    const user = req.session.user;
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate("brand").populate("category");
        if(!product || !product.isActive || !product.category.isActive || !product.brand.isActive) {
            return res.redirect("/shop");
        }

        const reviews = await Review.find({ product: id }).populate("user", "name");

        res.render("product", { user, product, reviews, currentPage: "product" });
    } catch (error) {
        res.redirect("/shop");
    }
}

const addReview = async (req, res) => {
    const user = req.session.user;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const parsedRating = parseInt(rating);
    if(!parsedRating || parsedRating < 1 || parsedRating > 5) {
        return res.json({ success: false, message: "Rating must be between 1 and 5." });
    }
    if(!comment || comment.trim().length < 3) {
        return res.json({ success: false, message: "Please write a comment." });
    }

    try {
        const order = await Order.findOne({ user: user._id, "items.product": productId, orderStatus: "delivered" });
        if(!order) return res.json({ success: false, message: "You can only review products you have purchased." });

        let review = await Review.findOne({ user: user._id, product: productId });
        if(review) return res.json({ success: false, message: "You have already added a review." });

        review = new Review({ user: user._id, product: productId, rating: parsedRating, comment: comment.trim() });
        await review.save();
        res.json({ success: true, message: "Review added successfully." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const getWishlist = async (req, res) => {
    const userId = req.session.user._id;
    try {
        const wishlist = await Wishlist.findOne({ user: userId }).populate("products", "name images finalPrice");

        res.render("wishlist", { wishlist, currentPage: "wishlist" });
    } catch (error) {
        res.redirect("/home");
    }
}

const addToWishlist = async (req, res) => {
    const userId = req.session.user._id;
    const { productId } = req.params;
    try {
        await Wishlist.findOneAndUpdate({ user: userId }, { $addToSet: { products: productId } }, { upsert: true });
        res.json({ success: true, message: "Product added to wishlist successfully."})
    } catch (error) {
        res.json({ success: false, message: "Something went wrong."});
    }
}

const removeFromWishlist = async (req, res) => {
    const userId = req.session.user._id;
    const { productId } = req.params;
    try {
        await Wishlist.findOneAndUpdate({ user: userId }, { $pull: { products: productId } });
         res.json({ success: true, message: "Removed from wishlist." });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong."});
    }
}

const addToCart = async (req, res) => {
    const userId = req.session.user._id;
    const { productId } = req.params;
    try {
        let cart = await Cart.findOne({ user: userId });
        const product = await Product.findById(productId);
        if(!product || !product.isActive) {
            return res.json({ success: false, message: "Product not available." });
        }

        if(!cart) {
            cart = new Cart({ user: userId, items: [] });
        }
        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        );

        if(itemIndex > -1) {
            if(cart.items[itemIndex].quantity >= product.stock) {
                return res.json({ success: false, message: "Cannot exceed available stock." });
            }
            cart.items[itemIndex].quantity += 1;
        } else {
            if(product.stock < 1) {
                return res.json({ success: false, message: "Out of stock." });
            }
            cart.items.push({ product: productId });
        }
        await cart.save();
        const updatedCart = await Cart.findOne({ user: userId });
        const cartCount = updatedCart.items.length;
        res.json({ success: true, message: "Added to cart.", cartCount });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getCart = async (req, res) => {
    const userId = req.session.user._id;
    try {
        const cart = await Cart.findOne({ user: userId })
            .populate("items.product", "name price finalPrice images stock");

        const items = cart ? cart.items.filter(item => item.product !== null) : [];

        let cartModified = false;
        for (const item of items) {
            if (item.product.stock > 0 && item.quantity > item.product.stock) {
                item.quantity = item.product.stock;
                cartModified = true;
            }
        }
        if (cartModified) await cart.save();

        const inStockItems    = items.filter(item => item.product.stock > 0);
        const outOfStockItems = items.filter(item => item.product.stock === 0);

        res.render("cart", {
            inStockItems,
            outOfStockItems,
            currentPage: "cart",
            appliedCoupon: req.session.appliedCoupon,
            stockWarning: cartModified
        });
    } catch (error) {
        res.redirect("/shop");
    }
};

const removeFromCart = async (req, res) => {
    const userId = req.session.user._id;
    const { productId } = req.params;
    try {
        const cart = await Cart.findOne({ user: userId });
        if(!cart) return res.json({ success: false, message: "Cart not found." });
        
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        const updatedCart = await Cart.findOne({ user: userId }).populate("items.product", "price finalPrice stock");
        const inStockItems = updatedCart.items.filter(item => item.product && item.product.stock > 0);
        const total = inStockItems.reduce((sum, item) => sum + item.product.finalPrice * item.quantity, 0);
        const cartCount = updatedCart.items.length;

        // Check if coupon still valid
        let couponCleared = false;
        let finalTotal = total;
        let discountAmount = 0;

        if(req.session.appliedCoupon) {
            const coupon = await Coupon.findOne({ code: req.session.appliedCoupon.code, isActive: true });
            if(!coupon || total < coupon.minOrderValue || total === 0) {
                req.session.appliedCoupon = null;
                couponCleared = true;
            } else {
                discountAmount = coupon.discountType === "percent"
                    ? total * coupon.discountValue / 100
                    : coupon.discountValue;
                finalTotal = total - discountAmount;
                req.session.appliedCoupon.discountAmount = discountAmount;
            }
        }

        res.json({ success: true, total, finalTotal, discountAmount, couponCleared, cartCount });
    } catch(error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const updateQuantity = async (req, res) => {
    const userId = req.session.user._id;
    const { productId } = req.params;
    const { action } = req.body;
    try {
        const cart = await Cart.findOne({ user: userId });
        if(!cart) return res.json({ success: false, message: "Cart not found." });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if(itemIndex === -1) return res.json({ success: false, message: "Item not found." });

        if(action === "increment") {
            const product = await Product.findById(productId);
            if(cart.items[itemIndex].quantity >= product.stock) {
                return res.json({ success: false, message: "Cannot exceed available stock." });
            }
            cart.items[itemIndex].quantity += 1;
        } else {
            if(cart.items[itemIndex].quantity === 1) {
                cart.items = cart.items.filter(item => item.product.toString() !== productId);
            } else {
                cart.items[itemIndex].quantity -= 1;
            }
        }
        await cart.save();

        const updatedCart = await Cart.findOne({ user: userId }).populate("items.product", "price finalPrice stock");
        const inStockItems = updatedCart.items.filter(item => item.product && item.product.stock > 0);
        const total = inStockItems.reduce((sum, item) => sum + item.product.finalPrice * item.quantity, 0);
        const updatedItem = updatedCart.items.find(item => item.product._id.toString() === productId);
        const newQuantity = updatedItem ? updatedItem.quantity : 0;

        // Check if coupon still valid
        let couponCleared = false;
        let finalTotal = total;
        let discountAmount = 0;

        if(req.session.appliedCoupon) {
            const coupon = await Coupon.findOne({ code: req.session.appliedCoupon.code, isActive: true });
            if(!coupon || total < coupon.minOrderValue || total === 0) {
                req.session.appliedCoupon = null;
                couponCleared = true;
            } else {
                discountAmount = coupon.discountType === "percent"
                    ? total * coupon.discountValue / 100
                    : coupon.discountValue;
                finalTotal = total - discountAmount;
                req.session.appliedCoupon.discountAmount = discountAmount;
            }
        }

        res.json({ success: true, newQuantity, total, finalTotal, discountAmount, couponCleared, removed: newQuantity === 0, cartCount: updatedCart.items.length });
    } catch(error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true, expiryDate: { $gte: new Date() } })
        res.json({ success: true, coupons })
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
}

const applyCoupon = async (req, res) => {
    const userId = req.session.user._id;
    const code = req.body.code?.trim();
    const orderTotal = parseFloat(req.body.orderTotal);

    if(!code) return res.json({ success: false, message: "Coupon code is required." });
    if(!orderTotal || isNaN(orderTotal) || orderTotal <= 0) {
        return res.json({ success: false, message: "Invalid order total." });
    }

    try {
        const coupon = await Coupon.findOne({ code });
        if(!coupon) return res.json({ success: false, message: "Invalid coupon code." });
        if(!coupon.isActive) return res.json({ success: false, message: "Coupon is inactive." });
        if(coupon.expiryDate < new Date()) return res.json({ success: false, message: "Coupon expired." });
        if(coupon.usedCount >= coupon.usageLimit) return res.json({ success: false, message: "Coupon usage limit reached." });
        if(orderTotal < coupon.minOrderValue) return res.json({ success: false, message: `Minimum order value is ₹${coupon.minOrderValue}.` });

        const isUsed = await Coupon.findOne({ _id: coupon._id, usedBy: userId });
        if(isUsed) return res.json({ success: false, message: "You've already used this coupon." });

        const discountAmount = coupon.discountType === "percent"
            ? orderTotal * coupon.discountValue / 100
            : coupon.discountValue;
        const finalTotal = orderTotal - discountAmount;

        req.session.appliedCoupon = { code: coupon.code, discountAmount };
        res.json({ success: true, message: "Coupon applied successfully.", discountAmount, finalTotal });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const getCheckout = async (req, res) => {
    const userId = req.session.user._id;
    try {
        const cart = await Cart.findOne({ user: userId })
            .populate("items.product", "name finalPrice stock isActive");
        if(!cart || cart.items.length === 0) return res.redirect("/cart");

        for(const item of cart.items) {
            if(!item.product || !item.product.isActive) return res.redirect("/cart");
            if(item.quantity > item.product.stock) return res.redirect("/cart");
        }

        const wallet = await Wallet.findOne({ user: userId });
        const walletBalance = wallet ? wallet.balance : 0;

        const addresses = await Address.find({ user: userId });
        const total = cart.items.reduce((sum, item) => 
            sum + item.product.finalPrice * item.quantity, 0);

        let finalTotal = total;
        let discountAmount = 0;
        const appliedCoupon = req.session.appliedCoupon || null;

        if(appliedCoupon) {
            const coupon = await Coupon.findOne({ code: appliedCoupon.code, isActive: true });
            if(coupon && coupon.expiryDate > new Date() && total >= coupon.minOrderValue) {
                const discountAmount = calculateDiscount(coupon, total);
                finalTotal = total - discountAmount;
            } else {
                req.session.appliedCoupon = null;
            }
        }

        res.render("checkout", { items: cart.items, addresses, total, finalTotal, discountAmount, appliedCoupon: req.session.appliedCoupon, walletBalance });
    } catch(error) {
        res.redirect("/cart");
    }
}

const placeOrder = async (req, res) => {
    const userId = req.session.user._id;
    const { addressId, paymentMethod } = req.body;

    if(!addressId || !paymentMethod) {
        return res.json({ success: false, message: "Please select address and payment method." });
    }
    if(!["COD", "online", "wallet"].includes(paymentMethod)) {
        return res.json({ success: false, message: "Invalid payment method." });
    }

    try {
        const address = await Address.findOne({ _id: addressId, user: userId });
        if(!address) return res.json({ success: false, message: "Invalid address." });

        const cart = await Cart.findOne({ user: userId }).populate("items.product", "name finalPrice stock isActive");
        if(!cart || cart.items.length === 0) {
            return res.json({ success: false, message: "Cart is empty." });
        }

        for(const item of cart.items) {
            if(!item.product || !item.product.isActive) {
                return res.json({ success: false, message: `${item.product?.name || "A product"} is no longer available.` });
            }
            if(item.quantity > item.product.stock) {
                return res.json({ success: false, message: `Only ${item.product.stock} units of ${item.product.name} left.` });
            }
        }

        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.finalPrice
        }));

        const rawTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if(paymentMethod === "COD" && rawTotal > 5000) {
            return res.json({ success: false, message: "COD is only available for orders up to ₹5000." });
        }

        let coupon = null;
        let totalAmount = rawTotal;
        if(req.session.appliedCoupon) {
            coupon = await Coupon.findOne({ code: req.session.appliedCoupon.code, isActive: true });
            if(coupon && coupon.expiryDate > new Date() && rawTotal >= coupon.minOrderValue) {
                const discount = calculateDiscount(coupon, rawTotal);
                totalAmount = rawTotal - discount;
            }
        }

        if(paymentMethod === "wallet") {
            const wallet = await Wallet.findOne({ user: userId });
            if(!wallet || wallet.balance < totalAmount) {
                return res.json({ success: false, message: "Insufficient wallet balance." });
            }
        }

        const order = new Order({
            user: userId,
            items: orderItems,
            address: {
                fullName: address.fullName,
                phone: address.phone,
                address: address.address,
                city: address.city,
                state: address.state,
                pincode: address.pincode
            },
            paymentMethod,
            totalAmount
        });
        await order.save();

        if(paymentMethod === "wallet") {
            await Wallet.findOneAndUpdate(
                { user: userId },
                {
                    $inc: { balance: -totalAmount },
                    $push: { transactions: {
                        amount: totalAmount,
                        type: "debit",
                        description: `Payment for order #${order._id}`
                    }}
                }
            );
        }

        if(req.session.appliedCoupon && coupon) {
            await Coupon.findByIdAndUpdate(coupon._id, { $push: { usedBy: userId }, $inc: { usedCount: 1 } });
            req.session.appliedCoupon = null;
        }

        for(const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
        }

        cart.items = [];
        await cart.save();

        res.json({ success: true, orderId: order._id });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

const createRazorpayOrder = async (req, res) => {
    const amount = parseFloat(req.body.amount);

    if(!amount || isNaN(amount) || amount <= 0) {
        return res.json({ success: false, message: "Invalid amount." });
    }

    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount),
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });
        res.json({ success: true, order });
    } catch (error) {
        res.json({ success: false, message: error.error?.description || error.message || "Could not initiate payment." });
    }
};

const verifyPayment = async (req, res) => {
    const userId = req.session.user._id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId, paymentMethod } = req.body;
    try {
        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if(expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed." });
        }

        const address = await Address.findOne({ _id: addressId, user: userId });
        if(!address) return res.json({ success: false, message: "Invalid address." });

        const cart = await Cart.findOne({ user: userId }).populate("items.product", "name finalPrice stock isActive");
        if(!cart || cart.items.length === 0) return res.json({ success: false, message: "Cart is empty." });

        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.finalPrice
        }));

        const rawTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        let coupon = null;
        let totalAmount = rawTotal;
        if(req.session.appliedCoupon) {
            coupon = await Coupon.findOne({ code: req.session.appliedCoupon.code, isActive: true });
            if(coupon && coupon.expiryDate > new Date() && rawTotal >= coupon.minOrderValue) {
                const discount = calculateDiscount(coupon, rawTotal);
                totalAmount = rawTotal - discount;
            }
        }

        const order = new Order({
            user: userId,
            items: orderItems,
            address: {
                fullName: address.fullName,
                phone: address.phone,
                address: address.address,
                city: address.city,
                state: address.state,
                pincode: address.pincode
            },
            paymentMethod,
            paymentStatus: "paid",
            totalAmount
        });
        await order.save();

        if(req.session.appliedCoupon && coupon) {
            await Coupon.findByIdAndUpdate(coupon._id, { $push: { usedBy: userId }, $inc: { usedCount: 1 } });
            req.session.appliedCoupon = null;
        }

        for(const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }

        cart.items = [];
        await cart.save();

        res.json({ success: true, orderId: order._id });
    } catch (error) {
        res.json({ success: false, message: "Something went wrong." });
    }
};

module.exports = {
    getHome,

    getProfile,
    updateUser,
    resetPassword,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,

    getWallet,

    getOrders,
    getOrderDetails,
    cancelOrder,
    returnOrder,

    getShop,

    getProduct,
    addReview,

    getWishlist,
    addToWishlist,
    removeFromWishlist,

    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,

    getCoupons,
    applyCoupon,

    getCheckout,
    placeOrder,
    createRazorpayOrder,
    verifyPayment
}