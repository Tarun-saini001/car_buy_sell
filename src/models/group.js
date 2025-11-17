const mongoose = require("mongoose");
const groups = mongoose.Schema({
    name: { type: String },
    groupDescription:{type:String , default:"Add group description"},
    admin:[{type: mongoose.Types.ObjectId, ref: "users"}],
    numberOfMembers : {type:Number },
    isDeleted : {type:Boolean , default:false},
    createdBy:{type: mongoose.Types.ObjectId, ref: "users"}
},
    { timestamps: true })

const groupModel = mongoose.model("groups", groups);
module.exports = groupModel