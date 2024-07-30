require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./models/user");

const app = express();

mongoose.connect("mongodb+srv://tacobellcommercial:"+ process.env.PASSWORD +"@cluster0.2ic4zk2.mongodb.net/")

app.use(express.json());
app.use(cors({
    origin: "https://react-todo-list-agyx.onrender.com"
}))

app.post("/", (req, res)=>{
    console.log(req.body);
    res.send()
})

app.post("/create-new-user", async (req, res)=>{
    const result = await User.findOne({username: req.body.username})
    if (!result){
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            todoList: []
        })

        await newUser.save();
        res.status(201).send("User created");
    }else{
        res.status(404).send("User already created");   
    }
})

app.post("/login", async (req, res)=>{
    const user = await User.findOne({username: req.body.username});
    if (user && await bcrypt.compare(req.body.password, user.password)){
        const token = jwt.sign({userId: user._id, username: user.username}, process.env.SECRET_KEY, {expiresIn: "1h"});
        res.json({token: token});
    }else{
        res.status(401).send("Invalid username or password...");
    }
})

function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.SECRET_KEY, (err, user)=>{
        if (err){
            return res.sendStatus(403).send("IP obtained from user... sending to authorities");
        }else{
            req.user = user;
            next();
        }
    })
}

app.get("/user-data", authenticateToken, async (req, res)=>{
    const userId = req.user.userId;
    const user = await User.findOne({"_id": userId});
    res.json({userObject: user})
})

app.post("/add-todo-item", authenticateToken, async (req, res)=>{
    const userId = req.user.userId;
    console.log(req.body);
    await User.updateOne({_id: userId}, {$push: {todoList: req.body}})
    res.sendStatus(201);
})

app.post("/delete-todo-item", authenticateToken, async (req, res)=>{
    const userId = req.user.userId;
    console.log(req.body);
    await User.updateOne({_id: userId}, {$pull: {todoList: {id: req.body.id}}})
    res.sendStatus(201);
})


app.listen(process.env.PORT, ()=>{
    console.log("Listening on Port 3001...");
})