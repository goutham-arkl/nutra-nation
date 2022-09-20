var express = require("express");
const adminHelpers = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var userHelper = require("../helpers/user-helpers");
const Promise = require("promise");
const { response } = require("../app");

const serviceSID = "VAbb6f0b38d4035a60265ce8078ef63349";
const accountSID = "AC3795f14c62a65687ba0c45647bde5306";
const authToken = "cd476e12c375e4cff342546ff356f1ae";
const client = require("twilio")(accountSID, authToken);

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res) {
  res.setHeader("cache-control", "private,no-cache,no-store,must-revalidate");
  productHelpers.viewCategory().then(async (category) => {
    let cartCount = 0;
    console.log("cartcout");
    

    if (req.session.user) {
      let userId=req.session.user._id
      let userDetails=await adminHelpers.getUserDetails(userId)

      let user = req.session.user=userDetails
   
      let cartCount = await userHelper.getCartCount(user._id);

      res.render("home", { user: req.session.user.name, category, cartCount });
    } else {
      // category = category._W

      res.render("home", { user: req.session.user, category, cartCount });
      // res.redirect('/login')
    }
  });

  // let user=req.session.user
  // res.redirect('/signup')
  // res.render('user')
});

router.get("/signup", (req, res) => {
  res.render("register");
});

router.post("/submit", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    res.redirect("/login");
  });
});

router.get("/login", function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.setHeader("cache-control", "private,no-cache,no-store,must-revalidate");
    let err = "";
    res.render("index", { err });
  }
});

router.post("/login", (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.isBlocked) {
      let err = "Blocked User";
      console.log(err);

      res.render("index", { err });
    } else if (response.status) {
      req.session.loggedIn = true;

      req.session.user = response.user;

      res.redirect("/");
    } else {
      let err = "Invalid User";

      res.render("index", { err });
    }
  });
});

router.get("/otp-login", (req, res) => {
  res.render("otp-login");
});

router.post("/otp-login",async (req, res) => {
  let number = req.body;

  // let user = await adminHelpers.getUserbynumber(number);

  // console.log(user);
  // console.log("success");
  client.verify
    .services(serviceSID)
    .verifications.create({
      to: "+919961588211",
      channel: "sms",
    })
    .then((resp) => {
      res.redirect("/verify-otp");
      // res.status(200).json({resp})
    });
});

router.get("/verify-otp", (req, res) => {
  res.render("verifyotp");
});

router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  console.log(otp);
  client.verify
    .services(serviceSID)
    .verificationChecks.create({
      to: "+919961588211",
      code: otp,
    })
    .then((resp) => {
      console.log("otp res", { resp });
      if (resp.valid) {
        req.session.user = true;
        res.redirect("/");
      } else {
        res.redirect("/login");
      }
    });
});

router.get("/view-profile", async (req, res) => {
  let userId = req.session.user._id;
  user = req.session.user;
  let orders = await userHelper.deliveredOrders(userId);
  console.log(orders);
  res.render("profile", {
    username: req.session.user,
    user,
    orders,
    cartCount: null,
  });
});

router.get("/edit-profile", (req, res) => {
  let userId = req.session._id;

  res.render("edituser", { user: req.session.user, cartCount: null });
});

router.get("/shop", (req, res) => {
  let product = productHelpers.viewproducts().then((product) => {
    console.log(product._W);
    cartCount = null;
    res.render("shop", { user: req.session.user, product, cartCount });
  });
});
router.get("/single-product", (req, res) => {
  let proId = req.query.id;
  productHelpers.getProductDetails(proId).then((product) => {
    console.log(product);
    res.render("singleproduct", { user: req.session.user, product, cartCount });
  });
});

router.get("/category/:id", (req, res) => {
  let categoryid = req.params.id;

  productHelpers.getCategoryDetails(categoryid).then((category) => {
    userHelper.getcategory(category.name).then((product) => {
      console.log(product[0]);
      let cartCount = null;
      res.render("category-view", {
        user: req.session.user,
        product,
        cartCount,
      });
    });
  });
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  console.log(req.params.id);

  console.log(req.session.user._id);
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.redirect("/");
  });
});

router.get("/cart", verifyLogin, async (req, res) => {
  try {
    let products = await userHelper.getCartProducts(req.session.user._id);

    console.log(products);

    if (products.length > 0) {
      await userHelper.getTotalAmount(req.session.user._id).then((total) => {
        let cartCount = null;
        res.render("cart", {
          user: req.session.user,
          products,
          cartCount,
          total,
        });
      });
    } else {
      res.render("empty-cart", {
        user: req.session.user.name,
        cartCount: null,
      });
    }
  } catch (err) {
    console.log(err, "error happened at cart");
  }
});

router.post("/remove-product-from-cart", (req, res) => {
  console.log(req.body);
  userHelper.removeProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.post("/change-product-quantity", (req, res, next) => {
  console.log(req.body);
  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user);
    console.log(response);
    res.json(response);
  });
});

router.get("/proceedToPay", verifyLogin, async (req, res) => {
  let cartCount = null;

  let address = await userHelper.getaddress(req.session.user._id)
  if(address){
    await userHelper.getTotalAmount(req.session.user._id).then((total) => {
      res.render("place-order", {
        cartCount,
        user: req.session.user,
        total,
        address,
      });
    });

  }else{
    await userHelper.getTotalAmount(req.session.user._id).then((total) => {
      res.render("place-order", {
        cartCount,
        user: req.session.user,
        total,
        address,
       
      });
    });
  }
 
});

router.post("/place-order", async (req, res) => {
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
  userHelper
    .placeOrder(req.body, products, totalPrice[0].total)
    .then((orderId) => {
      if (req.body["paymentMethod"] != "cod") {
        userHelper
          .generateRazorpay(orderId, totalPrice[0].total)
          .then((response) => {
            res.json(response);
          });
      } else {
        res.json({ codSuccess: true });
      }
    });
});

router.post("/add-address", (req, res) => {
  let userId = req.session.user._id;
  
  console.log(req.body);
  userHelper.addAddress(req.body, userId);
  res.redirect("/proceedToPay");
});

router.get("/order-placed", (req, res) => {
  let cartCount = null;
  res.render("order-placed", { user: req.session.user._id, cartCount });
});

router.get("/orders", verifyLogin, async (req, res) => {
  let orders = await userHelper.getUserOrders(req.session.user._id);
  console.log(orders);
  res.render("orders", { user: req.session.user, orders, cartCount: null });
});

router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelper.getOrderProducts(req.params.id);
  res.render("view-order-products", {
    Orderedproducts: products,
    cartCount: null,
    user: req.session.user._id,
  });
});

router.get("/cancel-order/:id", async (req, res) => {
  userHelper.cancelOrder(req.params.id);
  res.redirect("/orders");
});

router.post("/verify-payment", (req, res) => {
  userHelper.verifyPayment(req.body).then(() => {
    userHelper
      .changePaymentStatus(req.body["order[receipt]"])
      .then(() => {
        console.log("payment Success");
        res.json({ status: true });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" });
      });
  });
});



router.post('/update-user',(req,res)=>{

  let userId=req.session.user._id
  console.log(userId);
  console.log(req.body);
  adminHelpers.updateUser(userId,req.body).then(()=>{
    console.log("ook");
  

    res.redirect('/')
  })
    
  })


///////////////////////////////PAYPAL///////////////////////////////////////

const { CLIENT_ID, APP_SECRET } = process.env;

// create a new order
router.post("/api/orders", async (req, res) => {
  const order = await createOrder();
  res.json(order);
});

// capture payment & store order information or fullfill order
router.post("/api/orders/:orderID/capture", async (req, res) => {
  const { orderID } = req.params;
  const captureData = await capturePayment(orderID);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
