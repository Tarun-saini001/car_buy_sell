const mongoose = require("mongoose");

const rooms = mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "users"
        }
    ]
},
    { timestamps: true }
);
const roomModel = mongoose.model("rooms", rooms);
module.exports = roomModel