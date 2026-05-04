const { Router } = require("express");
const router = Router();
const auth = require("../middleware/authMiddleware");
const {
    getHome,

    getProfile,
    updateUser,
    resetPassword,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,

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
} = require("../controllers/userController");

router.get("/home", getHome);

router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateUser);
router.patch("/profile/password", auth, resetPassword);
router.post("/profile/address", auth, addAddress);
router.patch("/profile/address/:id", auth, editAddress);
router.delete("/profile/address/:id", auth, deleteAddress);
router.patch("/profile/address/:id/default", auth, setDefaultAddress);

router.get("/orders", auth, getOrders);
router.get("/orders/:id", auth, getOrderDetails);
router.patch("/orders/:id/cancel", auth, cancelOrder);
router.patch("/orders/:id/return", auth, returnOrder);

router.get("/shop", auth, getShop);

router.get("/product/:id", auth, getProduct);
router.post("/product/:id/review", auth, addReview)

router.get("/wishlist", auth, getWishlist);
router.post("/wishlist/:productId", auth, addToWishlist);
router.delete("/wishlist/:productId", auth, removeFromWishlist);

router.post("/cart/:productId", auth, addToCart);
router.get("/cart", auth, getCart);
router.patch("/cart/:productId", auth, updateQuantity);
router.delete("/cart/:productId", auth, removeFromCart);

router.get("/coupons", auth, getCoupons)
router.post("/apply-coupon", auth, applyCoupon);

router.get("/checkout", auth, getCheckout);
router.post("/checkout", auth, placeOrder);
router.post("/checkout/create-order", auth, createRazorpayOrder);
router.post("/checkout/verify-payment", auth, verifyPayment);

router.get("/", (req, res) => {
    res.redirect("/home");
});

module.exports = router;