class GetProduct {
  constructor(products, query) {
    this.products = products;
    this.query = query;
  }

  // Search products
  search() {
    const q = this.query.q
      ? {
          name: { $regex: this.query.q, $options: "i" },
        }
      : {};

    this.products = this.products.find({ ...q });
    return this;
  }

  // Filter products
  filter() {
    const query = { ...this.query };
    const unwantedFields = ["q", "p", "l", "sort"];
    unwantedFields.forEach((field) => delete query[field]);

    if (query.category) {
      // multile categories
      let category = query.category.toString().replaceAll(",", "|");
      query.category = { $regex: category, $options: "i" };
    }
    if (query.gender) {
      // multile genders
      let gender = query.gender.split(",");
      gender =
        query.gender === "Kids" ? ["Boys", "Girls", "Unisex Kids"] : gender;
      gender = query.gender === "KidsB" ? ["Boys", "Unisex Kids"] : gender;
      gender = query.gender === "KidsG" ? ["Girls", "Unisex Kids"] : gender;

      query.gender = { $in: gender };
    }
    if (query.brand) {
      // multile brands
      let brands = query.brand.toString().replaceAll(",", "|");
      query.brand = { $regex: brands, $options: "i" };
    }
    if (query.sizes) {
      // multile sizes
      let sizes = query.sizes.toString().replaceAll(",", "|");
      query.sizes = { $regex: sizes, $options: "i" };
    }
    if (query.price) {
      try {
        query.price = JSON.parse(query.price);
      } catch {}
    }

    this.products = this.products.find({ ...query });
    return this;
  }

  // sort products
  sort() {
    const sort = this.query.sort || "latest";
    const sortOptions = {
      latest: { createdAt: -1 },
      name: { name: 1 },
      rating: { rating: -1 },
      discount: { discount: -1 },
      low_to_high: { price: 1 },
      high_to_low: { price: -1 },
    };

    this.products = this.products.sort(sortOptions[sort]);
    return this;
  }

  // product pagination
  pagination() {
    const l = this.query.l || 20;
    const p = this.query.p || 1;
    const skip = l * (p - 1);

    this.products = this.products.limit(l).skip(skip);
    return this;
  }

  // select products
  select() {
    this.products = this.products.select(
      "landingPageUrl name brand additionalInfo productId mrp price rating ratingCount discount discountDisplayLabel displayImage stock category"
    );
    return this;
  }
}
module.exports = GetProduct;
