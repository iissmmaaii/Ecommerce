const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
 
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    t: req.session.isLoggedIn 

  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const { title, price, description } = req.body;
    const image = req.file;

    if (!image) {
      req.flash('error', 'No image uploaded');
      return res.redirect('/admin/add-product');
    }

    const imageUrl = '/images/' + image.filename;

    await req.user.createProduct({
      title,
      price: parseFloat(price),
      imageUrl,
      description
    });

    req.flash('success', 'The product was added successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('An error occurred while adding the product', error);
    req.flash('error', 'Failed to add product');
    res.redirect('/admin/add-product');
  }
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } })
    // Product.findById(prodId)
    .then(products => {
      const product = products[0];
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        t: req.session.isLoggedIn 

      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.file;
  const updatedDesc = req.body.description;
  Product.findByPk(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
         t: req.session.isLoggedIn 

      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      return product.destroy();
    })
    .then(result => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};
