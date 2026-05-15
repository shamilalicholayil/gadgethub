const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            }
        }
    ],
    address: {
        fullName: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        pincode: String
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "online", "wallet"]
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
        default: "pending"
    },
    totalAmount: {
        type: Number,
        required: true
    },
    couponCode: {
        type: String
    },
    discount: {
        type: Number,
        default: 0
    },
    cancelledAtStatus: {
        type: String,
        default: null
    },
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now }
    }]
},{ timestamps: true });

module.exports = mongoose.model("Order", orderSchema);