import express from "express";
import cors from "cors";
import User from "../models/UserSchema.js";
import Room from "../models/RoomSchema.js";

const router=express.Router();
router.use(express.urlencoded({extended:true}));
router.use(cors());

router.post("/join-room/:roomId/:uid", async(req,res)=>{
    const {name}=req.body;
    const room=await Room.findOne({roomId:req.params.roomId});
    if(!room)
    {
        const newRoom=new Room(
            {
                roomId:req.params.roomId,
                users:[{
                    name:name,
                    uid:req.params.uid,
                    chats:[]
                }]
            }
        )
        newRoom.save();
        res.status(200).json({"prevChats":[]});
    }
    else{
        var prevChats=[];
        for(var i=0;i<room.users.length;i++)
        {
            if(room.users[i].uid==req.params.uid)
            {
                prevChats=room.users[i].chats;
            }
        }
        res.status(200).json({"prevChats":prevChats});
    }
})

router.post("/save-chats/:roomId/:uid",async(req,res)=>{

    const {name, chats}=req.body;

    const room=await Room.findOne({roomId: req.params.roomId});

    var alreadyExists=false;

    for(var i=0;i<room.users.length;i++)
    {
        if(room.users[i].uid == req.params.uid)
        {
            alreadyExists = true;
            for( var j=0; j<chats.length; j++ )
            {
                room.users[i].chats.push(chats[j]);
            }
            room.save();
        }
    }

    if(!alreadyExists)
    {
        room.users.push({
            "name":name,
            "uid":req.params.uid,
            "chats":chats
        })
        room.save();
    }

    res.status(200).json({"message":"updated chats successfully"})
})

router.delete("/delete-room/:roomId", async(req, res)=>{
    await Room.deleteOne({roomId:req.params.roomId});
    res.status(200).json({"message":"Deleted Successfully"});
})

export {router as ChatsRoute};