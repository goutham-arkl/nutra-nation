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



const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn)
  {
    next()
  }
  else
  {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function(req, res) {
 

  
  res.setHeader('cache-control', 'private,no-cache,no-store,must-revalidate')
   productHelpers.viewCategory().then(async(category)=>{
    

   
  
    let cartCount=0
   
   
    if(req.session.user){
    
      let user= req.session.user
      console.log(user);
      let cartCount= await userHelper.getCartCount(user._id)
      console.log('oooooooooooooooooooooooooooooooooooooooooo');
     
     
      res.render('home',{user:req.session.user,category,cartCount})
      
    }
    
    else{
      // category = category._W
      console.log(category);
      res.render('home',({user:req.session.user,category,cartCount}))
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
     
      req.session.user=response.user
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
 let product= productHelpers.viewproducts().then((product)=>{
  console.log(product._W);
    cartCount=null
    res.render('shop',{user:req.session.user,product,cartCount})

 })
    
  
  
})
router.get('/single-product',(req,res)=>{
 let proId=req.query.id
 productHelpers.getProductDetails(proId).then((product)=>{

  console.log(product);
  res.render('singleproduct',{user:req.session.user,product,cartCount})

 })
 
})

router.get('/category/:id',(req,res)=>{
  let categoryid=req.params.id
 console.log('roarrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
  console.log(categoryid);
  productHelpers.getCategoryDetails(categoryid).then((category)=>{
    console.log(category);
    userHelper.getcategory(category.name).then((product)=>{
      console.log(product);
      res.render('category-view',{user:req.session.user,product,cartCount})
    })
    
   
  })

})



router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{

  console.log(req.params.id);

  console.log(req.session.user._id);
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
})

router.get('/cart',verifyLogin,async(req,res)=>{
 
  let products=await userHelper.getCartProducts(req.session.user._id)
  console.log(products);
  let cartCount=null
  res.render('cart',{user:req.session.user,products,cartCount})
})

router.get('/remove-product',(req,res)=>{
  let proId=req.query.id
 let user=req.session.user
  userHelper.remove-product-fromCart(proId,user)
})


router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})



module.exports = router;
