const nodemailer = require("nodemailer")
const { patch } = require("../routes")
 
const sendOtp=async (email,otp)=>{
   let transporter = nodemailer.createTransport({
     service :"gmail",
     auth : {
        user: "radha.apptunix@gmail.com",
        pass:"ntzo yzoi ulnt maxk"
     }
   } )

   let mailOption = {
    from:"radha.apptunix@gmail.com",
    to : email,
    subject: "Sending otp",
    text : `your otp is ${otp}`,
    html: `<h2>your otp is ${otp}</h2>`
   }
    return new Promise((resolve,reject)=>{
      transporter.sendMail(mailOption,(error,info)=>{
        if(error){
            reject("error",error.reject)
        }
        else{
            resolve("otp sent", info.resolve)
        }
      });
      
    })
}
module.exports = sendOtp;