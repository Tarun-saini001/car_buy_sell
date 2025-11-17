const mongoose = require("mongoose");
const { ROLES } = require("../utils/constants");

const user = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    age: { type: Number },
    gender: { type: String },
    email: { type: String },
    countryCode: { type: String },
    phoneNumber: { type: String },
    password: { type: String },
    address: { type: String },
    jti: { type: String },
    isNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    role: { type: Number, enum: Object.values(ROLES), default: ROLES.USER },
    stripeCustomerId:{type:String}
},
    { timestamps: true }
)
const userModel = mongoose.model("users", user)

module.exports = userModel;