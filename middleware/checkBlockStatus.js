const User = require("../models/User");

const checkBlockedStatus = async (req, res, next) => {
    if(!req.session.user) {
        return next();
    }

    try {
        const user = await User.findById(req.session.user._id);
        if(!user || user.isBlocked) {
            return req.session.destroy(() => {
                res.clearCookie("user.sid");
                res.redirect("/login");
            })
        }
        next();
    } catch (error) {
        res.redirect("/login?error=User is Blocked.")
    }
}

module.exports = checkBlockedStatus;