const { required } = require("joi");
const mongoose = require("mongoose");
const { Number } = require("twilio/lib/twiml/VoiceResponse");

const product = new mongoose.Schema({
    carName: { type: String },
    userId:{type : mongoose.Types.ObjectId , ref:"users"},
    categoryid: { type: mongoose.Types.ObjectId, ref: "category" },
    brandId: { type: mongoose.Types.ObjectId, ref: "brand" },
    otherSpecifications: { type: String },
    registrationNumber: { type: String },
    carModel: { type: String },
    fuelType:{type : String , enum: ["Petrol", "Diesel", "Gasoline"]  },
    engineDetails: { type: String },
    location: {
        type: {
            type: String,
            //  requiredn: true
        },
        coordinates: {
            type: [Number],
            // required: true
        }

    },
    latitude: { type: Number },
    longitude: { type: Number },
    address : {type : String},
    trialAmount:{type : Number},
    carAvailability: { type: String },
    contactNumber: { type: String },
    totalPrice: { type: Number },
    description: { type: String },
    averageRating :{type:Number}
},
    { timestamps: true }
)



product.pre("save", function (next) {
    console.log("inside hook")

    if (this.longitude !== undefined && this.latitude !== undefined) {
        location = {
            type: "Point",
            coordinates: [this.longitude, this.latitude]
        }
        console.log("location : ", location)
        this.set({location});
    }
    next();
})
product.index({ location: "2dsphere" })
const productModel = mongoose.model("products", product);
module.exports = productModel