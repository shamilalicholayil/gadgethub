const User = require("../models/User");

const auth = async (req, res, next) => {
    if(!req.session.user) {
        return res.redirect("/login");
    }

    try {
        const user = await User.findById(req.session.user._id);
        if(!user || user.isBlocked) {
            return req.session.destroy(() => {
                res.clearCookie("user.sid");
                res.redirect("/login");
            })
        }

        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        next()
    } catch (error) {
        res.redirect("/login?error=Something went wrong with session. Try again.");
    }
}

module.exports = auth;