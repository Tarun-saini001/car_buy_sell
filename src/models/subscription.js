const mongoose = require("mongoose");

const subscriptions = mongoose.Schema({
    name: { type: String },
    amount: { type: Number },
    interval: {
        type: String,
        enum: ["day", "week", "month", "year"],
        default: "day",
    },
    stripePriceId: { type: String, },
    stripeProductId: { type: String, },
     userId : {type:mongoose.Schema.Types.ObjectId , ref :"users"},
    stripeSubscriptionId: { type: String }, // to match webhook subscription ID
    current_period_end: { type: Date },
    status: { type: String, enum: ["active", "canceled", "incomplete", "past_due", "trialing"], default: "incomplete" }

},
    { timestamps: true }
);

const subscriptionModel = mongoose.model("subscriptions", subscriptions);

module.exports = subscriptionModel