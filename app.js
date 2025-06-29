const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const multer = require('multer');

const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir); 
  },
  filename: (req, file, cb) => {
    const safeDate = new Date().toISOString().replace(/:/g, '-');
    const safeName = file.originalname
      .replace(/ /g, '_')
      .replace(/[^a-zA-Z0-9_.-]/g, '');
    cb(null, `${safeDate}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) { 
    cb(null, true);
  } else {
    cb(new Error(''), false);
  }
};

app.use('/images', express.static(imagesDir)); 

const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

app.use(
  session({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { secure: false } 
  })
);

const csrfProtection = csrf({ cookie: false });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.t = req.session.isLoggedIn;
  res.locals.crsfToken = req.csrfToken(); 
  res.locals.isAdmin = req.session.isAdmin;
  next();
});

sessionStore.sync();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', require('./routes/admin'));
app.use(require('./routes/shop'));
app.use(require('./routes/auth'));

app.use(errorController.get404);

Product.belongsTo(User, { onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize.sync()
  .then(async () => {
    const port = 3000;
    const server = https.createServer(credentials, app);
    server.listen(port, () => {
      
    });
  })
  .catch(err => console.log(err));







  