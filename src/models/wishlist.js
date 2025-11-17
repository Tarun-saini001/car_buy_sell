const mongoose = require ("mongoose");

const wishlist = mongoose.Schema({
    userId: {type:new mongoose.Schema.Types.ObjectId,ref:"users"},
    productId:{type:new mongoose.Schema.Types.ObjectId,ref:"products"}
},
 { timestamps: true }
)
const  wishlistModel = mongoose.model("wishlist",wishlist)
module.exports =wishlistModel;