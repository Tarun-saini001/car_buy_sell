const mongoose = require("mongoose");
const brand = mongoose.Schema({
    categoryid: { type: mongoose.Types.ObjectId, ref: "category" },
    name: { type: String },
},
    { timeStamps: true }
)

const brandModel = mongoose.model("brand", brand)

module.exports =  brandModel;