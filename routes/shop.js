const express = require('express');
const isAuth = require('../middleware/is-auth');
const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
router.get('/cart', isAuth, shopController.getCart); 
router.get('/checkout', isAuth, shopController.getCheckout);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.get('/orders', isAuth, shopController.getOrders);
router.get('/checkout/success', isAuth, shopController.postOrder);
router.get('/checkout/cancel', isAuth, shopController.getCheckout); 
router.post('/cart/delete', isAuth, shopController.clearCart); 

module.exports = router;
