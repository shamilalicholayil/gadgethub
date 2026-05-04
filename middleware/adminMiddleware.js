const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
    if(!req.session.admin) {
        return res.redirect("/admin/login")
    }

    try {
        const admin = await Admin.findById(req.session.admin._id);
        if(!admin) {
            return req.session.destroy(() => {
                res.clearCookie("admin.sid");
                res.redirect("/admin/login");
            })
        }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next()
    } catch (error) {
        res.redirect("/admin/login?error=Something went wrong with session. Try again.");
    }
}

module.exports = adminAuth;