require("dotenv").config();
const connectDB = require("./config/db");
connectDB();

const express = require("express");
const session = require("express-session");
const path = require("path");
const { MongoStore } = require("connect-mongo");
const checkBlockedStatus = require("./middleware/checkBlockStatus");
const Cart = require("./models/Cart")
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

app.use("/admin", session({
    name: "admin.sid",
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "adminSessions"
    })
}));
app.use(session({
    name: "user.sid",
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "userSessions"
    })
}));

app.use((req, res, next) => {
    res.locals.admin = req.session.admin;
    res.locals.user = req.session.user || null;
    next();
});

app.use(async (req, res, next) => {
    try {
        if(req.session.user && !req.path.startsWith("/admin")) {
            const cart = await Cart.findOne({ user: req.session.user._id });
            res.locals.cartCount = cart ? cart.items.length : 0;
        } else {
            res.locals.cartCount = 0;
        }
        next();
    } catch (error) {
        res.locals.cartCount = 0;
        next();
    }
});

app.use((req, res, next) => {
    res.locals.currentPage = "";
    next();
});

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(checkBlockedStatus);

app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use("/", userRoutes);

app.use((req, res) => {
    res.status(404).render("404");
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
});