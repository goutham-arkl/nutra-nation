var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { resolve } = require('path')
const { promiseImpl } = require('ejs')
const { USER_COLLECTION } = require('../config/collections')
const collections = require('../config/collections')
var objectId=require('mongodb').ObjectId
const Promise=require('promise')

const { response } = require('../app')
const { reject } = require('promise')
const { count } = require('console')
const { ObjectId } = require('mongodb')



module.exports={
    doSignup:(userData)=>{
        userData.isBlocked=false
        return new Promise(async(resolve,reject)=>{

        
           
            userData.password= await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.ops)
            })
          
        })

    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            
            let loginStatus=false
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({username:userData.username})
            

           
            
            if(user)
            {
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    
                    if(user.isBlocked)
                    {
                        response.isBlocked=true
                        resolve(response)
                    }

                   
                    else  if(status){
                        
                        console.log('Login success');
                        response.user=user
                        response.status=true
                        
                        resolve(response)
                        
                    }
                    else{
                         console.log('login failed');
                        response.status=false
                        resolve(response)
                    }
                })

            }
           
            else{
                
                console.log('Login failed');
                resolve({status:false})
            }
        })
    },
    getcategory:(catagory)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collections.PRODUCT_COLLECTION).find({category:catagory}).toArray().then((product)=>{

                resolve(product)
            })
            

           
        })
    },

    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
            
            if(userCart)
            {
                let proExist=userCart.products.findIndex(product=>product.item==proId)
                console.log(proExist);
                if(proExist!=-1)
                {
                   db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
                   {
                        $inc:{'products.$.quantity':1}
                   }
                   ) 
                }else{
               db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId)},
               {
              

                        $push:{products:proObj}
                    
               }
               ).then((response)=>{
               
                resolve()
               })
                }

            }else{
                let cartObj={
                    user:objectId(userId),
                    products:[proObj]

                }
              
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collections.CART_COLLECTION).aggregate([

                {
                    $match:{user:objectId(userId)}
                },

                {
                    $unwind:'$products'
                    
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'productsitems'
                    }
                   
                },
                {
                    $unwind:'$productsitems'
                    
                },
                
            ]).toArray()
            // console.log(cartItems[0].productsitems);
            resolve(cartItems)

        })
    },

    getCartCount:(userId)=>{

        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        console.log(details);
       let count=parseInt(details.count)
       let quantity=parseInt(details.quantity)
       console.log(quantity);
       
       
        return new Promise((resolve,reject)=>{
            if(count ==-1 && quantity==1){
                db.get().collection( collections.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    
                $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                resolve({removeProduct:true})
                })
            }else{
                db.get().collection(collections.CART_COLLECTION).updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                {
                    
                     $inc:{'products.$.quantity':count}
                }
                ) .then((response)=>{
                   
                    resolve({status:true})
                })
            }
           
        
        })
    },
    removeProduct:(details)=>{
        console.log(details);


        return new Promise((resolve,reject)=>{
            db.get().collection( collections.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
            {
                
            $pull:{products:{item:objectId(details.product)}}
            }
            ).then((response)=>{
            resolve({removeProduct:true})
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            let Total=await db.get().collection(collections.CART_COLLECTION).aggregate([

                {
                    $match:{user:objectId(userId)}
                },

                {
                    $unwind:'$products'
                    
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                  $lookup:{
                    from:collections.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                  }  
                },
                {
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$product',0]}
                    }
                },
               
                

                { $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity','$products.price']}}
                    }
                }
               
                
            ]).toArray()
            
            console.log(Total);
            resolve(Total)

        })

    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(products,total,order);
            let status=order.paymentMethod==='cod'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:objectId(order.userId),
                paymentMethod:order.paymentMethod,
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collections.CART_COLLECTION).remove({user:objectId(order.userId)})
                resolve()
            })
        })
        
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
           
            console.log(cart.products);
            resolve(cart.products)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
            console.log(orders);
            resolve(orders)
        })
        
    },
    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection(collections.ORDER_COLLECTION).aggregate([

                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'

                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            console.log(products);
            resolve(products)
        })
    },
    cancelOrder:(orderId)=>{
        console.log('**');
        console.log(orderId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
                $set:{
                status:"Cancelled"
                }
            })
            resolve()
        })
    }
   

       
       
}
       
         
    
