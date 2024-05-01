import express from "express";
import cors from "cors";
import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";

const router=express.Router()
router.use(express.urlencoded({extended:true}))
router.use(express.json())
router.use(cors())

const saltrounds=parseInt(process.env.SALTROUNDS);

router.get("/users",async(req,res)=>{
    const users=await User.find();
    res.status(200).json(users);
})

router.post("/register", async(req,res)=>{
    const {name,email,password}=req.body;
    const userExist=await User.findOne({email:email});
    if(!userExist)
    {
        bcrypt.hash(password,saltrounds,function(err,hash){
            const user=new User({
                name:name,
                email:email,
                password:hash,
            })
            user.save();
            res.status(200).json({"message":"Registered successfully"})
        })
    }
    else
    {
        res.status(409).json({"message":"User already exists, please login"})
    }
})

router.post("/login", async(req,res)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email:email});
    if(user)
    {
        bcrypt.compare(password,user.password,function(err,result){
            if(result)
            {
                res.status(200).json({"message":"Login successful","id":user._id,"name":user.name})
            }
            else
            {
                res.status(401).json({"message":"wrong password, please try again"})
            }
        })
    }
    else
    {
        res.status(404).json({"message":"User not found, please sign up"});
    }
})

export {router as LoginRoute};