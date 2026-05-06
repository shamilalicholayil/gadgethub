const Product = require("../models/Product");

const restoreStock = async (items) => {
    for(const item of items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
};

module.exports = { restoreStock };