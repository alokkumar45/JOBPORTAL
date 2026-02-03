import mongoose from "mongoose";
import multer from "multer";
export const connection =  ()=>{
    mongoose.connect(process.env.MONGO_URL,{
    }).then(()=>{
        console.log("connected to DB...")
    }).catch(err=>{
        console.log(`some error connection to  DB.. :${err}`)
    })
}