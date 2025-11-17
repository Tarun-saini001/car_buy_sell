const mongoose = require("mongoose");

const groupMessages = mongoose.Schema({
    groupId : {type:mongoose.Schema.Types.ObjectId,ref:"groups"},
   userId : {type:mongoose.Schema.Types.ObjectId,ref:"users"},
   message : {type:String},
   messageType:{type:String,enum:["Loction","Video","Audio","Image","Pdf","text"]},
   attachment:{type :String},
   readBy : [{type:mongoose.Schema.Types.ObjectId,ref:"users"}],
   isDeleted:[{type:mongoose.Schema.Types.ObjectId,ref:"users"}]
},
    { timestamps: true }
);
const   groupMessagesModel = mongoose.model("groupMessages",groupMessages);
module.exports = groupMessagesModel