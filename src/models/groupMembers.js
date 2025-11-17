const mongoose = require("mongoose");
const groupMembers = mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "groups" },
    userId: { type: mongoose.Types.ObjectId, ref: "users" },
    isJoined: { type: Boolean, default: true },
    isAdmin:{ type: Boolean, default: false },
},
    { timestamps: true })
const groupMembersModel = mongoose.model("groupMembers", groupMembers);
module.exports = groupMembersModel