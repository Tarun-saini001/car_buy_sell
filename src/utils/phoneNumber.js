
const sendOtpToNumber=async (phoneNumber,otp)=>{
    return {
        success:true,
        Message:`otp : ${otp} sent to your Number :${phoneNumber}`,
        status: "success"
    }
}

module.exports = sendOtpToNumber;