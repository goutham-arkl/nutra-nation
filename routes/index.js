var express = require("express");
const adminHelpers = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var userHelper = require("../helpers/user-helpers");
const Promise = require("promise");
const { response } = require("../app");
const { getCartProductList } = require("../helpers/user-helpers");
const paypal = require('@paypal/checkout-server-sdk')

const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    "Aan2wbNoWBmxj2W1ARfP6KcOhf1NqUrF9VrWM1FYYFnBT4aFErHH0CqveX1MLfTUF2cJkRLnWbN0yrwd",
    "EBHV2zx2uhrM8Gu5gwibQ64gVtzXl5YX3iYrhYpIW81Qy7XT5Bf_CcKMxpd5IMsdBD8Eh_JRDq5ZiMuw"
  )
)

const serviceSID = "VAbb6f0b38d4035a60265ce8078ef63349";
const accountSID = "AC3795f14c62a65687ba0c45647bde5306";
const authToken = "054ec7a210dd95f686eefb8c37a525ab";
const client = require("twilio")(accountSID, authToken);


router.get("/err", (req, res) => {
  console.log('dffsdgdfgdfghfdhgf');
  res.render('404')
})

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
    let banner = await userHelper.getBanners()
    console.log(banner);


    if (req.session.user) {
      let userId = req.session.user._id
      let userDetails = await adminHelpers.getUserDetails(userId)

      let user = req.session.user = userDetails


      let cartCount = await userHelper.getCartCount(user._id);

      res.render("home", { user: req.session.user, category, cartCount, banner });
    } else {
      // category = category._W

      res.render("home", { user: req.session.user, category, cartCount, banner });
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

router.post("/otp-login", async (req, res) => {
  let number = req.body;
  console.log(number);




  client.verify.v2.services(serviceSID)
    .verifications
    .create({ to: '+919961588211', channel: 'sms' })
    .then(verification => res.redirect("/verify-otp"));
});

router.get("/verify-otp", (req, res) => {
  res.render("verifyotp");
});

router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  console.log(otp);
  client.verify.v2.services(serviceSID)
    .verificationChecks
    .create({ to: '+919961588211', code: otp })
    .then(verification_check =>
      adminHelpers.getUserbynumber('+919961588211').then((user) => {
        console.log(user);
        req.session.user = user
        res.redirect('/')
      }),
    );
});

router.get("/view-profile", async (req, res) => {
  try {
    let userId = req.session.user._id;
    user = req.session.user;
    let orders = await userHelper.deliveredOrders(userId);
    console.log(orders);
    res.render("profile", {
      username: req.session.user,
      user,
      orders,
      cartCount: null,
    })

  } catch (error) {
    res.redirect('/err')
  }
});

router.get("/edit-profile", (req, res) => {
  let userId = req.session._id;

  res.render("edituser", { user: req.session.user, cartCount: null });
});

router.get("/shop", async (req, res) => {
  await productHelpers.viewproducts().then((product)=> {
    cartCount = null;
    res.render("shop", { user: req.session.user, product, cartCount });
  });
});
router.get("/single-product", (req, res) => {

  let proId = req.query.id;

  productHelpers.getProductDetails(proId).then((product) => {
    console.log(product);
    let cartCount = null
    res.render("singleproduct", { user: req.session.user, product, cartCount });
  }).catch(() => {
    res.redirect('/err')

  })

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

//wishlist//


router.get("/wishlist", verifyLogin, async (req, res) => {
  let userId = req.session.user._id

  let products = await userHelper.getWishlistProducts(userId)
  if (products.length > 0) {
    res.render('wishlist', { user: req.session.user, cartCount: null, products, err: false })

  } else {

    res.render('empty-wishlist', { user: req.session.user, cartCount: null })
  }


})

router.get("/add-to-wishlist/:id", verifyLogin, (req, res) => {



  userHelper.addToWishlist(req.params.id, req.session.user._id).then(() => {
    res.redirect("/");
  });
});



//wishlist//

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {


  console.log(req.session.user._id);
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.redirect("/");
  });
});

router.get("/cart", verifyLogin, async (req, res) => {
  try {
    let products = await userHelper.getCartProducts(req.session.user._id);

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

router.get("/proceedToPay", async (req, res) => {
  let cartCount = null;


  let address = await userHelper.getaddress(req.session.user._id)
  let coupon = await userHelper.getCoupons()
  if (address) {
    await userHelper.getTotalAmount(req.session.user._id).then((total) => {

      console.log(total);
      res.render("place-order", {
        cartCount,
        user: req.session.user,
        total,
        coupon,
        address,
      });
    });

  } else {
    await userHelper.getTotalAmount(req.session.user._id).then((total) => {


      res.render("place-order", {
        cartCount,
        user: req.session.user,
        total,
        coupon,
        address,

      });
    });
  }

});

router.post("/place-order", async (req,res) => {


  let products = await userHelper.getCartProductList(req.body.userId);

  let totalPrice = await userHelper.getTotalAmount(req.body.userId);



  if (req.session.user.coupon) {
    totalPrice = (totalPrice) - (req.session.user.discount)
  }

  userHelper
    .placeOrder(req.body, products, totalPrice)
    .then((orderId) => {
      if (req.body["paymentMethod"] == "cod" || req.body["paymentMethod"] == "paypal") {

        res.json({ codSuccess:true });


      } else {
        userHelper
          .generateRazorpay(orderId, totalPrice)
          .then((response) => {
            res.json(response);
          });
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



router.post('/update-user', (req, res) => {

  let userId = req.session.user._id
  console.log(userId);
  console.log(req.body);
  adminHelpers.updateUser(userId, req.body).then(() => {



    res.redirect('/')
  })

})

router.get('/getTotal', async (req, res) => {

  let Total = await userHelper.getTotalAmount(req.session.user._id)
  res.json(Total)
})

router.post('/apply-coupon', async (req, res) => {
  let response = {}
  console.log(req.body);
  if (req.body.name == '') {
    response.Total = req.body.total
    response.noCoupon = true
    res.json(response)
  } else {
    let couponDetails = await userHelper.getCouponDetails(req.body.name)
    if (couponDetails) {
      if (couponDetails.expirydate > new Date()) {
        let Total = await userHelper.getTotalAmount(req.session.user._id)
        if (couponDetails.min < Total) {
          let percent = parseInt(couponDetails.discount, 10)
          let offer = req.body.total * percent / 100
          let total = req.body.total - offer
          response.offer=offer
          response.total = total
          req.session.total = total
          req.session.coupon = true
          res.json(response)

        }else{
          let a=couponDetails.min - Total
          response.min=a
          res.json(response)
        }

      } else {
        response.exp = true
        res.json(response)
      }

    } else {
      response.noExist = true
      res.json(response)
    }
  }
})
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});


module.exports = router;
