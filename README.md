# GadgetHub

A full-stack single-vendor electronics e-commerce web application.

## Live Demo
🔗 [Live Link](#) *(coming soon)*

## Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** EJS, Bootstrap, CSS
- **Database:** MongoDB
- **Authentication:** Express-session, Bcrypt, Crypto
- **File Upload:** Cloudinary
- **Email:** Nodemailer
- **Charts:** Chart.js
- **PDF Export:** Puppeteer

## Features
### User
- Register, Login, Logout
- Browse shop with search, filter, pagination
- Product detail page
- Cart
- Wishlist
- Coupon apply
- Checkout & order placement
- Forgot/Reset password
- Order history & tracking
- Profile & address management
- Wallet

### Admin
- Product, Category, Brand management
- Cloudinary multi-image upload & edit
- Coupon management
- User block/unblock
- Analytics dashboard
- Sales report download

## Setup Instructions
1. Clone the repo
```bash
   git clone https://github.com/shamilalicholayil/gadgethub.git
   cd gadgethub
```
2. Install dependencies
```bash
   npm install
```
3. Create a `.env` file in the root with the following:
   PORT=3000
   MONGO_URI=your_mongodb_uri
   SESSION_SECRET=your_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL=your_gmail
   EMAIL_PASSWORD=your_app_password
5. Run the app
```bash
   npm start
```

## Author
Shamil Ali Cholayil
