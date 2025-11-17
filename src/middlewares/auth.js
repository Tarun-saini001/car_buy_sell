const JWT = require("jsonwebtoken")
const { generateRandomString } = require("../utils/jti")
const userModel = require("../models/user")

const generateJWT = (payload) => {
    return new Promise((resolve, reject) => {
        const identity = { id: payload.id, jti: payload.jti }
        JWT.sign(identity, process.env.JWT_SECRET_KEY, { expiresIn: "1000d" }, (error, token) => {
            if (error) {
                return reject("something went wrong while generating the token")
            }
            else {
                return resolve(token);
            }
        })
    })
}

function JWT_VERIFY(req, res, next) {
    const token = req.header('authentication')
    if (typeof header !== null) {
        JWT.verify(token, process.env.JWT_SECRET_KEY, async(error, data) => {
            if (error) {
                return res.json({ message: "unautherized" })
            }
          //  console.log("dataaaaaaa",data);
           const user = await userModel.findOne({
                _id: data.id,
                jti:data.jti
            })
           // console.log("userr : ",user)
            if(!user) return res.status(401).json({ message: "unautherized" })
                
            req.user = user
        req.user.id = user._id
            next();
        })
    }
}

module.exports = { generateJWT, JWT_VERIFY }