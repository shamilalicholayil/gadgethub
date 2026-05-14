const { Router } = require("express");
const router = Router();
const adminAuth = require("../middleware/adminMiddleware");
const upload = require("../middleware/multer");

const {
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

    getProducts,
    addProduct,
    editProduct,
    deleteProduct,

    getCoupons,
    addCoupon,
    editCoupon,
    deleteCoupon,

    getAdminOrders,
    getAdminOrderDetails,
    updateOrderStatus
} = require("../controllers/adminController");

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/logout", adminLogout);
router.get("/dashboard", adminAuth, getDashboard);
router.get("/report/download", adminAuth, downloadReport);

router.get("/users", adminAuth, getUsers);
router.put("/users/:id/block", adminAuth, blockUser);

router.get("/brands", adminAuth, getBrands);
router.post("/brands", adminAuth, addBrand);
router.put("/brands/:id", adminAuth, editBrand);
router.delete("/brands/:id", adminAuth, deleteBrand);

router.get("/categories", adminAuth, getCategories);
router.post("/categories", adminAuth, addCategory);
router.put("/categories/:id", adminAuth, editCategory);
router.delete("/categories/:id", adminAuth, deleteCategory);

router.get("/products", adminAuth, getProducts);
router.post("/products", upload.fields([
  { name: "image_0", maxCount: 1 },
  { name: "image_1", maxCount: 1 },
  { name: "image_2", maxCount: 1 },
  { name: "image_3", maxCount: 1 },
  { name: "image_4", maxCount: 1 },
]), adminAuth, addProduct);
router.patch("/products/:id", upload.fields([
  { name: "image_0", maxCount: 1 },
  { name: "image_1", maxCount: 1 },
  { name: "image_2", maxCount: 1 },
  { name: "image_3", maxCount: 1 },
  { name: "image_4", maxCount: 1 },
]), adminAuth, editProduct);
router.delete("/products/:id", adminAuth, deleteProduct);

router.get("/coupons", adminAuth, getCoupons);
router.post("/coupons", adminAuth, addCoupon);
router.put("/coupons/:id", adminAuth, editCoupon);
router.delete("/coupons/:id", adminAuth, deleteCoupon);

router.get("/orders", adminAuth, getAdminOrders);
router.get("/order-info", adminAuth, getAdminOrderDetails);
router.patch("/orders/:id/status", adminAuth, updateOrderStatus);

module.exports = router;