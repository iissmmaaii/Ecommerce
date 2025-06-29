const User = require('../models/user');
const Cart = require('../models/cart');
const bcrypt=require('bcryptjs');
exports.getLogin = (req, res, next) => {
  let message=req.flash('error');
  if(message.length>0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage:message
  });
};


exports.postSignup = (req, res, next) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  req.body.email='';
  req.body.password='';
  req.body.confirmPassword='';

  User.findOne({ where: { email: email } })
    .then(userDoc => {
      if (userDoc) {
        req.flash('error','E-Mail exists alredy,please pick a different one.');
        return res.redirect('/signup'); 
      }

return bcrypt.hash(password,12).then(hashedPassword=>{
  return User.create({
    email: email,
    password: hashedPassword
  });

})
.then(user => {
  return user.createCart();
})
.then(() => {
  res.redirect('/login'); 
});
     
    })
    .catch(err => {
      console.log(err);
    });
};
exports.getSignup=(req,res,next)=>{
  let message=req.flash('error');
  if(message.length>0){
    message=message[0];
  }
  else{
    message=null;
  }
  res.render('auth/signup',{
    path:'/signup',
    pageTitle:'Signup',
    t:false,
    errorMessage:message
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  req.body.email = '';
  req.body.password = '';

  User.findOne({ where: { email: email } }) 
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login'); 
      }

      bcrypt.compare(password, user.password)
        .then(result => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            if (user.email === 'asmaylbae522@gmail.com') {
              req.session.isAdmin = true; 
              console.log("is Admin here");
            } else {
              req.session.isAdmin = false; 
              console.log("he is not admin");

            }

            return req.session.save(err => {
              res.redirect('/'); 
            });
          }

          req.flash('error', 'Invalid email or password');
          res.redirect('/login');
        })
        .catch(err => {
          res.redirect('/login');
        });
    })
    .catch(err => {
      res.redirect('/login');
    });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
};