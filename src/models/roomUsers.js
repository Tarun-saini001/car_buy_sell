const mongoose = require("mongoose");

const roomUsers = mongoose.Schema({
   roomId :{type:mongoose.Schema.Types.ObjectId,ref:"rooms"},
   users: 
          {
              type: mongoose.Schema.Types.ObjectId, ref: "users"
          }
},
    { timestamps: true }
);

const roomUsersModel = mongoose.model("roomUsers",roomUsers);

module.exports = roomUsersModel