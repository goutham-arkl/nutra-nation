const { promiseImpl } = require('ejs')
const { response } = require('../app')
const collections = require('../config/collections')
var db=require('../config/connection')
const Promise=require('promise')
const { resolve } = require('promise')
var objectId=require('mongodb').ObjectId
module.exports={
    

    addproduct:(product,callback)=>{
       
        
        db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.insertedId)
        }).catch((err)=>{
            console.log(err)
        })
    },
    addcategory:(category,callback)=>{
        
     let  categoryExist=db.get().collection(collections.CATEGORY_COLLECTION).find(category)
        if(categoryExist)
        {   console.log('category Exist');
            resolve(err='category already exist')
        }
        else{
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne(category).then((data)=>{
                callback(data.insertedId)
            }).catch((err)=>{
                console.log(err);
            })

        }

        
    },

    viewproducts:()=>{ 
        return new Promise((resolve,reject)=>{
         let  products= db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
                
                if(products)
                {
                    console.log('Data fetched');
                    resolve(products)
                }
                else{
                    console.log('failed');

                }
            
        })
        
    },
    deleteproduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.PRODUCT_COLLECTION).remove({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    viewCategory:()=>{
        return new Promise((resolve,reject)=>{
             db.get().collection(collections.CATEGORY_COLLECTION).find().toArray().then((categories)=>{

                
                resolve(categories)
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    deleteCategory:(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collections.CATEGORY_COLLECTION).remove({_id:objectId(categoryId)}).then((category)=>{
                resolve(category)
            })
        })
    },
    getCategoryDetails:(categoryId)=>{

        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).findOne({_id:objectId(categoryId)}).then((category)=>{
                resolve(category)
            })
        })

    },
    updateCategory:(categoryId,categoryDetails)=>{

        return new Promise((resolve,reject)=>{
            console.log(categoryDetails);
            
            db.get().collection(collections.CATEGORY_COLLECTION).updateOne({_id:objectId(categoryId)},{
                $set:{
                    name:categoryDetails.name,
                    description:categoryDetails.description
                }
            }).then((response)=>{
                console.log(response)
                resolve()
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
            console.log(product);
            resolve(product)
           })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
           
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            
            
            {
                $set:{
                     name:proDetails.name,
                     description:proDetails.description,
                     category:proDetails.category,
                     price:proDetails.price
                    }
            }
            ).then(()=>{
                console.log('kjkbhvhngb')
                resolve()
            })
        }).catch((err)=>{
            console.log(err);
        })
    }
}