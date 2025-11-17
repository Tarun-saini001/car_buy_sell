const mongoose = require("mongoose");
const chats = mongoose.Schema({
    userforBuying: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    userforSelling: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
},
    { timestamps: true }
)
const chatModel = mongoose.model("chats", chats);
module.exports = chatModel