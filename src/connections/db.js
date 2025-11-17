const mongoose = require("mongoose");

const connectDatabase = async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URI)
       console.log("DATABASE CONNECTED SUCCESSFULLY!")
    } catch (error) {
        console.log("DATABASE CONNECTION FAILED...",error)
    }
}
 module.exports = connectDatabase