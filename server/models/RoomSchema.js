import mongoose from "mongoose";

const roomSchema=new mongoose.Schema({
    roomId:{
        type:String,
        required:true
    },
    users:[
            {
                name:String,
                uid:String,
                chats:[]
            }
        ]
})

export default mongoose.model("Room",roomSchema);
