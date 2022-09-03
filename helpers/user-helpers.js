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
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
            
            if(userCart)
            {
               db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId)},
               {
              

                        $push:{products:objectId(proId)}
                    
               }
               ).then((response)=>{
               
                resolve()
               })

            }else{
                let cartObj={
                    user:objectId(userId),
                    products:[objectId(proId)]

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
                    $lookup:{
                        from:collections.PRODUCT_COLLECTION,
                        let:{proList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id',"$$proList"]
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)

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
    removeproductfromCart:(proId,userId)=>{

    }
   

       
       
}
       
         
    
