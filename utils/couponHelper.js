const calculateDiscount = (coupon, rawTotal) => {
    return coupon.discountType === "percent"
        ? rawTotal * coupon.discountValue / 100
        : coupon.discountValue;
};

module.exports = { calculateDiscount };