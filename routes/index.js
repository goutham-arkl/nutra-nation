var express = require('express');
const adminHelpers = require('../helpers/admin-helpers');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var MongoClient= require('mongodb').MongoClient
var userHelper=require('../helpers/user-helpers')
const Promise=require('promise')

const serviceSID="VAbb6f0b38d4035a60265ce8078ef63349"
const accountSID="AC3795f14c62a65687ba0c45647bde5306"
const authToken="cd476e12c375e4cff342546ff356f1ae"
const client=require('twilio')(accountSID,authToken)


/* GET home page. */
router.get('/',  function(req, res) {

  res.setHeader('cache-control', 'private,no-cache,no-store,must-revalidate')

   productHelpers.viewCategory().then((category)=>{
    if(req.session.user){
   

      res.render('home',{user:req.session.user,category})
      
    }
    else{
      res.render('home',({user:req.session.user,category}))
      // res.redirect('/login')
    
  }
   })
    

   

 
  // let user=req.session.user
  // res.redirect('/signup')  
  // res.render('user')
 
});

router.get('/signup',(req,res)=>{
 res.render('register')

})

router.post('/submit',(req,res)=>{
 
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response);
    res.redirect('/login')
  })
})

router.get('/login',function(req,res){
  if(req.session.user)
  {
    res.redirect('/')
  }

  else{
  res.setHeader('cache-control', 'private,no-cache,no-store,must-revalidate')
  let err=''
  res.render('index',{err})
  }
})

router.post('/login',(req,res)=>{
 
  userHelper.doLogin(req.body).then((response)=>{

    if(response.isBlocked){
      
      let err='Blocked User'
      console.log(err);

      res.render('index',{err})

    }
   
    else  if(response.status){
      req.session.loggedIn=true
     
      req.session.user=req.body.username
      res.redirect('/')
    }
    else{
       let err='Invalid User'
     
      res.render('index',{err})
    }
  })
})

router.get('/otp-login',(req,res)=>{
  res.render('otp-login')
})

router.post('/otp-login',(req,res)=>{
 let  number=req.body

  let user=adminHelpers.getUserbynumber(number)

    console.log(user);
  console.log('success');
  client.verify .services(serviceSID).verifications.create({

    to: '+919961588211',
    channel:'sms'
  }).then((resp)=>{
    res.redirect('/verify-otp')
    // res.status(200).json({resp})
    
  })

  })
  
 
 
 
  


router.get('/verify-otp',(req,res)=>{
  res.render('verifyotp')
})


router.post('/verify-otp',(req,res)=>{
  
  const {otp}=req.body
  console.log(otp);
  client.verify.services(serviceSID).verificationChecks.create({
    to: '+919961588211',
    code:otp
  }).then((resp)=>{
    console.log("otp res",{resp});
    if(resp.valid)
    {
      req.session.user=true
      res.redirect('/')
    }
    else{
      res.redirect('/login')
    }
  })
})




router.get('/shop',(req,res)=>{
  productHelpers.viewproducts().then((product)=>{
    res.render('shop',{user:req.session.user,product})
  })
  
})
router.get('/single-product',(req,res)=>{
 let proId=req.query.id
 productHelpers.getProductDetails(proId).then((product)=>{

  console.log(product);
  res.render('singleproduct',{user:req.session.user,product})

 })
 
})


router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
