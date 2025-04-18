import mongoose from "mongoose";

export const dbConnection= ()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"ATTENDENCE_MANGEMENT_SYSTEM"
    })
    .then(()=>{
        console.log("Connected to database!")
    })
    .catch((err)=>{
        console.log(err);
    })
}