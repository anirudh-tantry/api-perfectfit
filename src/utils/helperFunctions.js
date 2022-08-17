const Product = require("../models/Product");
const _ = require("lodash");

// generate unique productId
exports.generateProductId = async () => {
  let productId;
  let isTrue = true;

  while (isTrue) {
    const id = _.random(1000000, 9999999);
    const product = await Product.findOne({ productId: id });
    if (!product) {
      productId = id;
      isTrue = false;
    }
  }
  return productId;
};

// convert to kebabCase
exports.kebabCase = (str) => _.capitalize(str).replaceAll(" ", "-");

// calculate discount percentage
exports.discountPercentage = (mrp, discount) => {
  const discountPercentage = Math.floor((discount / mrp) * 100);
  const discountLable = `(${discountPercentage}% OFF)`;
  return discountLable;
};
