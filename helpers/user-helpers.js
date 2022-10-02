var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { resolve } = require('path')
const { promiseImpl } = require('ejs')
const { USER_COLLECTION } = require('../config/collections')
const collections = require('../config/collections')
var objectId = require('mongodb').ObjectId
const Promise = require('promise')

const { response } = require('../app')
const { reject } = require('promise')
const { count, time } = require('console')
const { ObjectId } = require('mongodb')
const Razorpay = require('razorpay')

var instance = new Razorpay({
    key_id: 'rzp_test_hoUa0LVqQYvuNv',
    key_secret: 'XDJ38OgMbiMNYxLBKANZ5fXM',
});



module.exports = {
    doSignup: (userData) => {
        userData.isBlocked = false
        return new Promise(async (resolve, reject) => {



            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops)
            })

        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {

            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ username: userData.username })




            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {

                    if (user.isBlocked) {
                        response.isBlocked = true
                        resolve(response)
                    }


                    else if (status) {


                        response.user = user
                        response.status = true

                        resolve(response)

                    }
                    else {

                        response.status = false
                        resolve(response)
                    }
                })

            }

            else {


                resolve({ status: false })
            }
        })
    },
    getcategory: (catagory) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.PRODUCT_COLLECTION).find({ category: catagory }).toArray().then((product) => {

                resolve(product)
            })



        })
    },

    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)

                if (proExist != -1) {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    )
                } else {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {


                            $push: { products: proObj }

                        }
                    ).then((response) => {

                        resolve()
                    })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]

                }

                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([

                {
                    $match: { user: objectId(userId) }
                },

                {
                    $unwind: '$products'

                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productsitems'
                    }

                },
                {
                    $unwind: '$productsitems'

                },

            ]).toArray()
            // console.log(cartItems[0].productsitems);
            resolve(cartItems)

        })
    },

    getCartCount: (userId) => {

        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
    
        let count = parseInt(details.count)
        let quantity = parseInt(details.quantity)
       


        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {

                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collections.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {

                        $inc: { 'products.$.quantity': count }
                    }
                ).then((response) => {

                    resolve({ status: true })
                })
            }


        })
    },
    removeProduct: (details) => {
        console.log(details);


        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {

                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let Total = await db.get().collection(collections.CART_COLLECTION).aggregate([

                {
                    $match: { user: objectId(userId) }
                },

                {
                    $unwind: '$products'

                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },



                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                    }
                }


            ]).toArray()


            resolve(Total[0].total)

        })

    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(products, total, order);
            let status = order.paymentMethod === 'cod' || 'paypal' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    mobile: order.mobile,
                    address: order.address,
                    pincode: order.pincode
                },
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collections.CART_COLLECTION).remove({ user: objectId(order.userId) })
                resolve(response.insertedId)
            })
        })

    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })

           
            resolve(cart.products)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).sort({date:-1}).toArray()

            resolve(orders)
        })

    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.ORDER_COLLECTION).aggregate([

                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log(products);
            resolve(products)
        })
    },
    cancelOrder: (orderId) => {

        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: "Cancelled"
                }
            })
            resolve()
        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {

            var instance = new Razorpay({ key_id: 'rzp_test_hoUa0LVqQYvuNv', key_secret: 'XDJ38OgMbiMNYxLBKANZ5fXM' })



            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log("New order:", order);

                resolve(order)
            });


        })
    },
    verifyPayment: (detaills) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'XDJ38OgMbiMNYxLBKANZ5fXM');
            hmac.update(detaills['payment[razorpay_order_id]'] + '|' + detaills['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == detaills['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }

            ).then(() => {
                resolve()
            })
        })
    },
    addAddress: (address, userId) => {


        return new Promise(async (resolve, reject) => {





            let useraddress = await db.get().collection(collections.ADDRESS_COLLECTION).findOne({ user: objectId(userId) })



            if (useraddress) {

                db.get().collection(collections.ADDRESS_COLLECTION).updateOne({ user: objectId(userId) },
                    {
                        $push: { Address: address }
                    })



            }
            else {

                let addressObj = {
                    user: objectId(userId),
                    Address: [address]
                }

                db.get().collection(collections.ADDRESS_COLLECTION).insertOne(addressObj)


            }
            resolve()
        })
    },
    getaddress: (userId) => {
        return new Promise(async (resolve, reject) => {

            let address = await db.get().collection(collections.ADDRESS_COLLECTION).findOne({ user: objectId(userId) })

            if (address != null) {
                console.log(address.Address);
                resolve(address.Address)
            }
            else {
                resolve(address)
            }




        })
    },
    getuserCount: () => {
        return new Promise(async (resolve, reject) => {

            let userCount = await db.get().collection(collections.USER_COLLECTION).count()

            resolve(userCount)
        })
    },

    getorderCount: () => {
        return new Promise(async (resolve, reject) => {

            let orderCount = await db.get().collection(collections.ORDER_COLLECTION).count()


            resolve(orderCount)
        })
    },

    getproductCount: () => {
        return new Promise(async (resolve, reject) => {

            let productsCount = await db.get().collection(collections.PRODUCT_COLLECTION).count()

            resolve(productsCount)
        })
    },

    deliveredOrders: (userId) => {
        return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId), status: "Delivered" }).limit(5).toArray()
                resolve(orders)

        })
    },

    addToWishlist: (proId, userId) => {
        let proObj = {
            item: objectId(proId),

        }
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })

            if (userWishlist) {
                let proExist = userWishlist.products.findIndex(products => products.item == proId)////////////////////////////  

                if (proExist != -1) {

                    db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $pull: { products: proObj }
                        }
                    )
                } else {

                    db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: proObj }

                        }
                    ).then((response) => {

                        resolve()
                    })
                }




            } else {
                let wishlistObj = {
                    user: objectId(userId),
                    products: [proObj]

                }

                db.get().collection(collections.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    wishlistid: (userId) => {
        return new Promise(async(resolve, reject) => {
           await db.get().collection(collections.WISHLIST_COLLECTION).findOne().then((detaills)=>{
            resolve(detaills)
           })
        })

    },
    getWishlistProducts: (userId) => {
       
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([

                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item'

                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },

                {
                    $project: {
                        item: 1, product: { $arrayElemAt: ['$product', 0] }
                    }

                },
            ]).toArray()
            
            resolve(products)

        })
    },
    getBanners:()=>{
        return new Promise(async(resolve,reject)=>{
          
           let banner=await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
           console.log(banner);
           resolve(banner)
        })
    },
    getCouponDetails:(coupon)=>{
        return new Promise(async(resolve,reject)=>{
           let details=await db.get().collection(collections.COUPON_COLLECTION).findOne({name:coupon})
                  console.log(details);
                    resolve(details)
              

        
        })
    }
    

    







}





