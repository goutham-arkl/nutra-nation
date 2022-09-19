var express = require('express');
var router = express.Router();
var producthelper=require('../helpers/product-helpers')
var adminHelper=require('../helpers/admin-helpers');
var userHelper=require('../helpers/user-helpers');
const { response } = require('../app');

/* GET users listing. */




router.get('/',async function (req, res, next) {

  if(req.session.loggedIn){

    let user= await userHelper.getuserCount()
    
    let order= await userHelper.getorderCount()
    let products= await userHelper.getproductCount()
   
    
    
    
    res.render('admin-home',{user,order,products})
  }
  else{
    res.redirect('admin/login')
  }
  
//  res.render('admin-home')
});
router.get('/graphdata',async(req,res)=>{

   let weekWise=await adminHelper.getWeeks()
   
    let weekXaxis=[]
    let weekYaxis=[]
    for(val of weekWise)
    {
      weekXaxis.push(""+val._id)
      weekYaxis.push(""+val.count)
    }
    let MonthWise=await adminHelper.getMonths()
    
    let MonthXaxis=[]
    let MonthYaxis=[]
    for(val of MonthWise)
    {
      MonthXaxis.push(""+val._id)
      MonthYaxis.push(""+val.count)
    }
    // let YearWise=await adminHelper.getYears()

    res.send({weekXaxis,weekYaxis, MonthXaxis, MonthYaxis})

})




router.get('/login',(req,res)=>{
  res.render('admin-login')
})

router.post('/login',(req,res)=>{
 let admin=req.body

  adminHelper.adminLogin(admin).then((response)=>{
   
   

    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/admin')
    }
    else{
      res.redirect('/admin/login')
    }
  })
})


router.get('/home',(req,res)=>{
 
})


router.get('/view-product',(req,res)=>{
 producthelper.viewproducts().then((products)=>{
  res.render('viewproducts',{products:products})
 })
})


router.get('/view-users',(req,res)=>{

  adminHelper.viewUsers().then((users)=>{
    res.render('viewusers',{users:users})
  })
  
})

router.get('/add-users',(req,res)=>{
  res.render('addusers')
})

router.get('/edit-user',async(req,res)=>{
  
 let userId=req.query.id
  console.log(userId);
let user=await adminHelper.getUserDetails(userId).then((user)=>{
 
  res.render('edituser',{user})

})

router.post('/update-user',(req,res)=>{

 
  
  console.log(userId);
  adminHelper.updateUser(userId,req.body).then(()=>{
    console.log("ook");
  

    res.redirect('/admin/view-users')
  })
    
  })

})
router.post('/submit',(req,res)=>{
  console.log('added');
 
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response);
    res.redirect('/admin/add-users')
  })
})

router.get('/delete-users',(req,res)=>{
  let userId=req.query.id

  adminHelper.deleteUsers(userId).then((response)=>{
    console.log('User removed');
  })
})

router.get('/block-user',(req,res)=>{
 let userId=req.query.id
 adminHelper.blockUser(userId).then((users)=>{
  res.redirect('/admin/view-users')
 })
})

router.get('/addproduct',(req,res)=>{
  producthelper.viewCategory().then((category)=>{

    res.render('addproduct',{category})
  })
  
})

router.post('/addproduct',(req,res)=>{
  console.log(req.body);
  

  
  
  producthelper.addproduct(req.body,(id)=>{
    let images=req.files.image;

   
    images.mv('./public/images/products/'+id+'.jpg',(err,data)=>{
      if(!err){
        res.redirect("/admin/addproduct")
        
      }
      else{
        console.log(err)
      
      }
    })
    
  })
})


router.get('/edit-product',async(req,res)=>{
   
    proId=req.query.id
    console.log(proId);
  let product=await producthelper.getProductDetails(proId)
  let category=await producthelper.viewCategory()
  
  res.render('editproduct',{product,category})

})

router.post('/updateproduct',(req,res)=>{
  proId=req.query.id
  producthelper.updateProduct(proId,req.body).then(()=>{
    try{

      let image = req.files.image
      console.log(req.files.image);
      image.mv('./public/images/products/'+req.query.id+'.jpg')
  }catch(ERR){
    console.log(ERR);

  }

    
    res.redirect('/admin/view-product')
  })
})
// router.post('/updateproduct/:id',(req,res)=>{
//   producthelper.updatep(req.params.id,req.body).then(()=>{
//       res.redirect('/admin/viewproduct')
//      try{
//           let image = req.files.image
//           image.mv('./public/productimage/'+req.params.id+'.jpg')
//       }catch{

//       }
//   })
// })

router.get('/delete-product',(req,res)=>{
  let proId=req.query.id
  console.log(proId);
  producthelper.deleteproduct(proId).then((response)=>{
    res.redirect('/admin/view-product')
  })

})


router.get('/add-category',(req,res)=>{
  res.render('addcategory')
})

router.post('/add-category',(req,res)=>{
  producthelper.addcategory(req.body,(id)=>{
    let images=req.files.image;

   
    images.mv('./public/images/catagories/'+id+'.jpg',(err,data)=>{
      if(!err){
        res.redirect("/admin/add-category")
      }
      else{
        console.log(err)
      
      }
    })
    
  })
 
})


router.get('/add-category',(req,res)=>{
 
  res.render('viewcategories')

})

router.get('/view-category',(req,res)=>{

 producthelper.viewCategory().then((categories)=>{

    res.render('viewcategories',{categories:categories})
  })

  
})

router.get('/delete-catagory',(req,res)=>{
  let catagoryId=req.query.id
  console.log(catagoryId);
  producthelper.deleteCategory(catagoryId).then((response)=>{
    res.redirect('/admin/view-category')
  })
})

router.get('/edit-category',(req,res)=>{
 
  let categoryId=req.query.id
 
  producthelper.getCategoryDetails(categoryId).then((category)=>{
    
    res.render('editcategory',{category})

  })
})

router.post('/update-category',(req,res)=>{
  let categoryId=req.query.id
  console.log('ok');
  producthelper.updateCategory(categoryId,req.body).then(()=>{
    try{

      let image = req.files.image
      console.log(req.files.image);
      image.mv('./public/images/catagories/'+req.query.id+'.jpg')
  }catch(ERR){
    console.log(ERR);

  }
    res.redirect('/view-category')

  })

})

router.get('/orders',async(req,res)=>{
  let orders=await adminHelper.getUserOrders()
  res.render('view-orders',{orders})


})

router.post('/change-status',(req,res)=>{
 let orderId=req.query.id
 let status=req.body.status
 console.log(status);
 adminHelper.changeStatus(orderId,status)
 res.redirect('/admin/orders')

})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/admin')
})

module.exports = router;
