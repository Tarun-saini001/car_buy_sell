const mongoose = require("mongoose");


const messages = mongoose.Schema({
    groupId : {type:mongoose.Schema.Types.ObjectId,ref:"groups"},
   roomId :{type:mongoose.Schema.Types.ObjectId,ref:"rooms"},
   userId : {type:mongoose.Schema.Types.ObjectId,ref:"users"},
   message : {type:String},
   messageType:{type:String,enum:["Loction","Video","Audio","Image","Pdf","text"]},
   attachment:{type :String},
   isRead : {type: Boolean,default:false},
   isDeleted:[{type:mongoose.Schema.Types.ObjectId,ref:"users"}]
},
    { timestamps: true }
);
const messagessModel = mongoose.model("messages",messages);
module.exports = messagessModel