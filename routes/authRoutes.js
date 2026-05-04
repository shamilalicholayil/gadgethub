const { Router } = require("express");
const router = Router();

const {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    userLogout,

    getForgotPassword,
    sendResetEmail,
    getResetPassword,
    resetPassword
} = require("../controllers/authController");

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/register", getRegister, );
router.post("/register", postRegister);
router.get("/logout", userLogout);

router.get("/forgot-Password", getForgotPassword);
router.post("/forgot-Password", sendResetEmail);
router.get("/reset-password/:token", getResetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;