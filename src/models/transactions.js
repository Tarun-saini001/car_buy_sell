const mongoose = require("mongoose");
const { PAYMENTSTATUS } = require("../utils/constants");
const { object } = require("joi");


const transactions = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    status: { type: Number, enum: Object.values(PAYMENTSTATUS), default:PAYMENTSTATUS.PENDING},
    amount: { type: Number },
    paymentType: { type: String, enum: ["buyCar","one time subscription","recurring subscription","recurring subscription renewal","recurring subscription update" ] },
    paymentId: { type: String },//stripe payment id
    subscriptionId :{type:String},
},


    { timestamps: true }
);

const transactionsModel = mongoose.model("transactions", transactions);

module.exports = transactionsModel  