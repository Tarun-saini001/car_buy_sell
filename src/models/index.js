const category = require("./category");
const brand = require("./brand");
const otp = require("./otp");
const user = require("./user");
const product = require("./product");
const rating = require("./ratings")
const wishlist = require("./wishlist")
const room = require("./room")
const roomUser = require("./roomUsers")
const message = require("./messages")
const chat = require("./chats")
const group = require("./group")
const groupMember = require("./groupMembers")
const groupMessage = require("./groupMessages")
const transaction = require("./transactions")
const subscription =require("./subscription")
const subsHistory = require("./subsHistory")
module.exports = {
    category,
    brand,
    otp,
    user,
    product,
    rating,
    wishlist,
    room,
    roomUser,
    message,
    chat,
    group, groupMember, groupMessage,transaction,subscription,subsHistory
}