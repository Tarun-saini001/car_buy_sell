const mongoose = require("mongoose")

const ratings = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    rating: { type: Number },
    review :{type:String, default:""}
},
    { timestamps: true }
)

const ratingModel = mongoose.model("ratings", ratings);
module.exports = ratingModel;