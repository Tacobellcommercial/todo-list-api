mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    todoList: []
})

const User = mongoose.model("User", userSchema);

module.exports = User;