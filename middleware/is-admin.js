module.exports=(req,res,next)=>{
    if(!req.session.isAdmen){
        return res.redirect('/login');
      }
      next();
}