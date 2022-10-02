var db=require('../config/connection')
var collection=require('../config/collections')
const Promise=require('promise')
const collections = require('../config/collections')

const { response } = require('../app')
const { resolve, reject } = require('promise')
var objectId=require('mongodb').ObjectId
module.exports={


    adminLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
      
            let user= await db.get().collection(collection.ADMIN_COLLECTION).findOne({username:userData.username})
            

            
            if(user)
            {
              
                    


                    if(userData.password==user.password){
                        console.log('Login success');
                        response.user=user
                        response.status=true
                        resolve(response)
                        
                    }
                    else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                

            }
            else{
                console.log('Login failed');
                resolve({status:false})
            }
        })
    },

    viewUsers:()=>{
        return new Promise((resolve,reject)=>{


            let users=db.get().collection(collections.USER_COLLECTION).find().toArray()

            if(users)
            {
                
                resolve(users)
            }

            else
            {
                console.log("erroooooooooorrrrrrrrrrrr");
            }

        })
    },

    deleteUsers:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.USER_COLLECTION).remove({_id:objectId(userId)}).then((response)=>{
                console.log('deleted');
                resolve(response)
                
            })
        })
    },
    getUserDetails:(userId)=>{

        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
               
                resolve(user)
            })
        })
    },
    getUserbynumber:(number)=>{

        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.USER_COLLECTION).findOne({phone:number}).then((user)=>{
               
                resolve(user)
            })
        })
    },
    updateUser:(userId,userDetails)=>{
        return new Promise(async(resolve,reject)=>{
              await db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{

                $set:{

                    name:userDetails.name,
                    username:userDetails.username,
                    email:userDetails.email,
                    phone:userDetails.phone

                }
            }).then((user)=>{
                console.log(user)
                resolve()
            })
        })
    },

    blockUser:(userId)=>{
       
            return new Promise(async(resolve,reject)=>{
                await db.get().collection(collections.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
                   
                    if(user.isBlocked)
                    {
                        db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                            $set:{
                                isBlocked:false
                            }
                         }).then((user)=>{
                            resolve()
                         })

                    }
                    else{
                        db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                            $set:{
                                isBlocked:true
                            }
                         }).then((user)=>{
                            resolve()
                         })

                    }
                })
            })  
        
    },
    getUserOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTION).find().sort({date:-1}).toArray()
            
            resolve(orders)
        })
    },
    changeStatus:(orderId,Status)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{
            
            $set:{
                status:Status

            }
          
        })
        resolve()
        })
    },
    //////////////////Graph///////////////////////
    getWeeks: () => {
        return new Promise(async (resolve, reject) => {
            let weeks = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date() - 7 * 7 * 60 * 60 * 24 * 1000)
                        },
                    }
                },
                {
                    $project: {
                        date: '$date',
                        week: { $week: "$date" },
                    },
                },
                {
                    $group: {
                        _id: "$week",
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },

            ]).toArray()
            
            resolve(weeks)
        })
    },

    getMonths: () => {
        return new Promise(async (resolve, reject) => {
            let month = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date().getMonth()-10)
                        },
                    }
                },
                {
                    $project: {
                        date: '$date',
                        month: { $month: "$date" },
                    },
                },
                {
                    $group: {
                        _id: "$month",
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },

            ]).toArray()
            resolve(month)
        })
    },
    getYears: () => {
        return new Promise(async (resolve, reject) => {
            let year = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date().getYear()-10)
                        },
                    }
                },
                {
                    $project: {
                        date: '$date',
                        year: { $year: "$date" },
                    },
                },
                {
                    $group: {
                        _id: "$year",
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },

            ]).toArray()
            resolve(year)
        })
    },
    addBanner:(banner,callback)=>{
       
        
        db.get().collection(collections.BANNER_COLLECTION).insertOne(banner).then((data)=>{
            callback(data.insertedId)
        }).catch((err)=>{
            console.log(err)
        })
    },
    getBanners:()=>{
        return new Promise(async(resolve,reject)=>{
           let banner=await db.get().collection(collections.BANNER_COLLECTION).find().toArray()
           resolve(banner)
        })
    },
    addCoupon:(couponDetails)=>{
        return new Promise(async(resolve,reject)=>{
            couponDetails.isValid=true
            db.get().collection(collections.COUPON_COLLECTION).insertOne(couponDetails).then(()=>{

                resolve()
            })
          
        })
    }

}






