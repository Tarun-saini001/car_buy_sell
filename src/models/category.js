const mongoose = require("mongoose");
const cotegory = mongoose.Schema({
    name: { type: String },
},
    { timestamps: true }
)

const categoryModdel = mongoose.model("category", cotegory)

module.exports = categoryModdel;
