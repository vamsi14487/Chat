import express from "express"
import mongoose from "mongoose";
import dotenv from "dotenv";
import {Server as socketIOServer} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
import http from "http";
import { LoginRoute } from "./routes/LoginRoute.js";
import { ChatsRoute } from "./routes/ChatsRoute.js";

const app=express();

dotenv.config()

const server=http.createServer(app)
const io=new socketIOServer(server,{
    cors:{
        origin:[process.env.ORIGIN1,process.env.ORIGIN2,process.env.ORIGINADMIN]
    }
})

const roomUsers={};

io.on("connection",(socket)=>{
    console.log(`User socket id ${socket.id}`)

    socket.on("client-message",(message,name,room)=>{
        if(room=="")
        {
            socket.broadcast.emit("server-message",message)
        }
        else
        {
            socket.broadcast.to(room).emit("server-message",message,name)
        }
    })

    socket.on("join-room",(room, name, uid, cb)=>{
        socket.join(room);
        
        if(!roomUsers[room])
        {
            roomUsers[room]=[]
        }

        roomUsers[room].push({name:name, uid:uid});
        console.log(roomUsers[room]);
        
        const message=`${name} joined the room`
        socket.broadcast.to(room).emit("server-joined",message,roomUsers[room]); //sending users info to all other users in the room
        socket.emit("users",roomUsers[room]) //sending the existing users info to the newly joined user
        cb(`you joined the room`)
    })

    socket.on("leave-room",(room, uid, name)=>{
        if(roomUsers[room])
        {
            const message=`${name} left the room`
            roomUsers[room]=roomUsers[room].filter(user=>user.uid!==uid)
            socket.broadcast.to(room).emit("server-left",message,roomUsers[room])
            socket.leave(room);
            socket.disconnect();
        }
    })
})

instrument(io,{auth:false})

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/",LoginRoute)
app.use("/chats",ChatsRoute)

mongoose.connect(process.env.DATABASE)

const port=process.env.PORT
server.listen(port,()=>{
    console.log(`server running on port ${port}`)
})