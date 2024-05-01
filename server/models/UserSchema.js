import mongoose  from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        reqired:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
})

export default mongoose.model("User",userSchema)