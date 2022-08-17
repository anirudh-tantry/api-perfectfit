const Product = require("../models/Product");
const ErrorHander = require("../utils/ErrorHandler");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const cloudinary = require("cloudinary");
const {
  generateProductId,
  kebabCase,
  discountPercentage,
} = require("../utils/helperFunctions");
const GetProduct = require("../utils/GetProduct");

// Create Product - admin
exports.createProduct = asyncMiddleware(async (req, res, next) => {
  let images = [];

  // checking if its single image or array of images
  if (typeof req.body.Images === "string") {
    images.push(req.body.Images);
  } else {
    images = req.body.Images;
  }

  const imagesLinks = [];

  // Uploading images to cloudinary
  if (images) {
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "PerfectFit/products",
      });

      imagesLinks.push(result.secure_url);
    }
  }

  // setting additional data to req.body
  req.body.productId = req.body.productId || (await generateProductId());
  req.body.landingPageUrl = kebabCase(
    `${req.body.category}/${req.body.brand}/${req.body.name}/${req.body.productId}/buy`
  );
  req.body.discount = req.body.mrp - req.body.price;
  req.body.discountDisplayLabel = discountPercentage(
    req.body.mrp,
    req.body.discount
  );
  req.body.Images = imagesLinks;
  req.body.displayImage = imagesLinks[0];

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: "Product added successfully.",
  });
});

// Update Product - admin

exports.updateProduct = asyncMiddleware(async (req, res, next) => {
  let product = await Product.findOne({ productId: req.params.productId });

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.Images === "string") {
    images.push(req.body.Images);
  } else {
    images = req.body.Images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let Image of product.Images) {
      let public_id = Image.split("/");
      public_id = public_id.slice(-3);
      public_id = public_id.toString().replaceAll(",", "/");
      public_id = public_id.split(".");
      await cloudinary.v2.uploader.destroy(public_id[0]);
    }

    const imagesLinks = [];

    // Uploading new images to cloudinary
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "PerfectFit/products",
      });

      imagesLinks.push(result.secure_url);
    }

    req.body.Images = imagesLinks;
    req.body.displayImage = imagesLinks[0];
  }

  if (req.body.name || req.body.brand || req.body.category) {
    req.body.landingPageUrl = kebabCase(
      `${req.body.category || product.category}/${
        req.body.brand || product.brand
      }/${req.body.name || product.name}/${product.productId}/buy`
    );
  }

  if (req.body.mrp || req.body.price) {
    const mrp = req.body.mrp || product.mrp;
    const price = req.body.price || product.price;
    req.body.discount = mrp - price;
    req.body.discountDisplayLabel = discountPercentage(mrp, req.body.discount);
  }

  product = await Product.updateOne(
    { productId: req.params.productId },
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully.",
  });
});

// Delete Product

exports.deleteProduct = asyncMiddleware(async (req, res, next) => {
  const product = await Product.findOne({ productId: req.params.productId });

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // Deleting Images From Cloudinary
  for (let image of product.Images) {
    let public_id = image.split("/");
    public_id = public_id.slice(-3);
    public_id = public_id.toString().replaceAll(",", "/");
    public_id = public_id.split(".");
    await cloudinary.v2.uploader.destroy(public_id[0]);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully.",
  });
});

// Get All Product
exports.getAllProducts = asyncMiddleware(async (req, res, next) => {
  // Total Filtered products
  const totalFilteredProducts = new GetProduct(Product.find(), req.query)
    .search()
    .filter();
  const totalProducts = await totalFilteredProducts.products;
  const total_products = totalProducts.length;
  // Filter Products
  const filterProducts = new GetProduct(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .pagination()
    .select();

  const products = await filterProducts.products;

  res.status(200).json({
    success: true,
    total_products,
    products_per_page: Number(req.query.l) || 20,
    products,
  });
});

// Get Single Product  Details
exports.getProduct = asyncMiddleware(async (req, res, next) => {
  const product = await Product.findOne({ productId: req.params.productId });

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // similar products
  const similar_products = await Product.find({
    category: product.category,
    brand: product.brand,
  })
    .limit(20)
    .select(
      "landingPageUrl name brand additionalInfo productId mrp price rating ratingCount discount discountDisplayLabel displayImage"
    );

  res.status(200).json({
    success: true,
    product,
    similar_products,
  });
});

// Rate Product
exports.rateProduct = asyncMiddleware(async (req, res, next) => {
  let { rating, productId } = req.body;
  rating = Number(rating);

  const already_rated = await Product.findOne({
    productId: productId,
    reviews: { $elemMatch: { userId: req.user._id } },
  });

  if (!already_rated) {
    const product = await Product.findOne({ productId: productId });

    let ratingCount = product.ratingCount + 1;
    let newRting =
      (product.rating * product.ratingCount + product.rating) / ratingCount;

    await Product.updateOne(
      { productId },
      {
        ratingCount,
        rating: newRting,
        $push: {
          reviews: [{ userId: req.user._id, rating }],
        },
      }
    );

    res.status(200).json({ success: true, message: "Rating added." });
  }

  let newRting =
    (already_rated.rating * already_rated.ratingCount -
      already_rated.reviews[0].rating +
      rating) /
    already_rated.ratingCount;


  await Product.updateOne(
    { productId, reviews: { $elemMatch: { userId: req.user._id } } },
    { $set: { "reviews.$.rating": rating }, rating: newRting }
  );

  res.status(200).json({ success: true, message: "Rating updated." });
});

// Get Current Rating
exports.getCurrentRating = asyncMiddleware(async (req, res, next) => {
  
  const currentRating = await Product.findOne({
    productId: req.params.productId,
    reviews: { $elemMatch: { userId: req.user._id } },
  });

  if (!currentRating) {
    res.status(200).json(0);
  } else {
    res.status(200).json(currentRating.reviews[0].rating);
  }
});

exports.totalProducts = asyncMiddleware(async (req, res, next) => {
  const total = await Product.countDocuments();

  res.status(200).json(total);
});
