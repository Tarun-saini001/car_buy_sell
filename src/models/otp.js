const mongoose = require("mongoose");

const otp = new mongoose.Schema({
   
    email: { type: String },
    phoneNumber:{type:Number},
    countryCode : {type: String},
    otp: { type: Number },
    expiredAt:{type:Date}
},
    { timestamps: true }
)
const otpModel = mongoose.model("otps", otp)

module.exports = otpModel;