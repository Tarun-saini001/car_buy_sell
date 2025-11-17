const mongoose = require("mongoose");

const subsHistory = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "subscriptions" },
    stripeSubscriptionId: { type: String }, // to match webhook subscription ID
    amount:{type:Number},
    current_period_end: { type: Date },
    current_period_start: { type: Date },
    status: { type: String, enum: ["active", "canceled", "incomplete", "past_due", "trialing"], default: "incomplete" }

},
    { timestamps: true }
);

const subsHistoryModel = mongoose.model("subsHistory", subsHistory);

module.exports = subsHistoryModel