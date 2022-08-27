var db=require('../config/connection')
var collection=require('../config/collections')
const collections = require('../config/collections')
const { ObjectId } = require('mongodb')
const { response } = require('../app')
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
               console.log(user);
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
        
    }
}






