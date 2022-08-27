var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { resolve } = require('path')
const { promiseImpl } = require('ejs')
const { USER_COLLECTION } = require('../config/collections')


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
    }
       
       
}
       
         
    
