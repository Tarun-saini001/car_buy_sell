
const sendOtp = require("../utils/email");
const sendOtpToNumber = require("../utils/phoneNumber");
const { generateRandomString } = require("../utils/jti");
const stripe = require("../utils/stripe")
const bcrypt = require("bcrypt");
const { generateJWT, JWT_VERIFY } = require("../middlewares/auth");
const dayjs = require("dayjs");
const { validateWithJoi } = require("../validations");
const { messages } = require("../messages/en");

const Model = require("../models");
const Validation = require("../validations");

async function user() {
    console.log("user services")
    return { message: "successfull" }
}

async function newUser(data) {
    try {
        const result = validateWithJoi(Validation.auth.signupValidation, data)
        if (!result.isValid) {
            return {
                success: false,
                message: result.errors,
                status: "validation"
            }
        }
        const { email, phoneNumber, countryCode, password } = data;
        if ((!email && !phoneNumber) || !password) {
            return {
                success: false,
                message: messages.EMAIL_PASS_REQUIRED,
                status: "validation"
            }
        }

        let query = {};

        if (email != null) {
            query.email = email;
            query.isEmailVerified = true
        } else if (phoneNumber != null) {
            query.phoneNumber = phoneNumber;
            query.isNumberVerified = true
        }
        console.log("query", query)
        const verified = await Model.user.findOne(query);

        console.log("verified", verified)
        if (verified) {
            return {
                success: "false",
                message: messages.VERIFIED,
                status: "validation"
            }
        }
        console.log("reached")
        const otp = 1234;
        const expiry = dayjs().add(5, "minutes").toISOString();
        const hashedPASS = await bcrypt.hash(password.toString(), 10)
      
        if (email) {
            sendOtp(email, otp);
            const addUser = await Model.user.findOneAndUpdate(
                { email },
                { $set: { email, password: hashedPASS } },
                { upsert: true, new: true }
            );
            const newOtp = await Model.otp.findOneAndUpdate(
                { email },
                { $set: { email, otp, expiredAt: expiry } },
                { upsert: true, new: true }
            );


            await addUser.save();
            await newOtp.save();
            return {
                success: true,
                // data: user,
                message: messages.MAIL_OTP_SUCCESSFULL,
                status: "success"
            }

        } else if (phoneNumber) {
            console.log("inside phone")
            sendOtpToNumber(phoneNumber, otp)

            const addUser = await Model.user.findOneAndUpdate(
                { phoneNumber },
                { $set: { countryCode, phoneNumber, password: hashedPASS } },
                { upsert: true, new: true }
            );
            const newOtp = await Model.otp.findOneAndUpdate(
                { phoneNumber },
                { $set: { countryCode, phoneNumber, otp, expiredAt: expiry } },
                { upsert: true, new: true }
            );

            await addUser.save();
            await newOtp.save();
            return {
                success: true,
                // data: user,
                message: messages.NUMBER_OTP_SUCCESSFULL,
                status: "success"
            }

        }



        // const addUser = new userModel({ email, password: hashedPASS })
        // const newOtp = new otpModel({ email, otp, expiredAt: expiry })


        // const addUser = await userModel.findOneAndUpdate(
        //     { email },
        //     { $set: { email, password: hashedPASS } },
        //     { upsert: true, new: true }
        // );

        // const newOtp = await otpModel.findOneAndUpdate(
        //     { email },
        //     { $set: { email, otp, expiredAt: expiry } },
        //     { upsert: true, new: true }
        // );

    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function verifyUser(data) {
    try {
        const result = validateWithJoi(Validation.auth.verifyOtpValidation, data)
        if (!result.isValid) {
            return {
                success: false,
                message: result.errors,
                status: "validation"
            }
        }
        const { email, countryCode, phoneNumber, otp } = data;
        console.log(data);

        let qry = {};

        if (data.email) {
            qry.email = data.email;

        }

        if (phoneNumber && countryCode) {
            qry.phoneNumber = phoneNumber;
            qry.countryCode = countryCode;

        }

        console.log("query ", qry);

        if ((!email && !phoneNumber) || !otp) {
            return {
                success: false,
                message: messages.EMAIL_PASS_REQUIRED,
                status: "validation"
            }
        }

        const user = await Model.user.findOne(qry);
        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "validation"
            }
        }
        const findOTP = await Model.otp.findOne(qry);

        if (!findOTP) {
            return {
                success: false,
                message: messages.INVALID_USER,
                status: "unautherized"
            }
        }
        console.log("findUSer", findOTP)
        // if(dayjs().isAfter(dayjs(findUSer.expiredAt))){
        //      return {
        //         success:false,
        //         message:"OTP has expired",
        //         status:"unautherized"
        //     }
        // }
        if (otp == findOTP.otp) {
            const qry = {}
            if (email) {
                qry.email = email
                qry.isEmailVerified = true
            }
            if (phoneNumber) {
                qry.phoneNumber = phoneNumber
                qry.isNumberVerified = true

            }
            // const user = await userModel.findOne(qry)
            const jti = generateRandomString(20)
            const token = await generateJWT({ id: user._id, jti });
            console.log("token", token)
            await Model.otp.findByIdAndDelete(findOTP?._id);
            qry.jti = jti;


            await Model.user.findOneAndUpdate({ _id: user._id }, qry);


            return {
                success: true,
                data: token,
                message: messages.VERIFY_SUCCESSFULL,
                status: "success"
            }
        }
        else {
            await Model.otp.findByIdAndDelete(findOTP?._id);
            return {
                success: false,
                message: messages.INVALID_OTP,
                status: "unautherized"
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function loginUser(data) {
    try {
        console.log("before")
        const result = validateWithJoi(Validation.auth.loginValidation, data)
        console.log("afret")
        if (!result.isValid) {
            return {
                success: false,
                message: result.errors,
                status: "validation"
            }
        }
        const { email, countryCode, phoneNumber, password } = data;
        let qry = {};

        if (data.email) {
            qry.email = data.email;

        }

        if (phoneNumber && countryCode) {
            qry.phoneNumber = phoneNumber;
            qry.countryCode = countryCode;

        }
        const user = await Model.user.findOne(qry);

        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "unautherized"
            }
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return {
                success: false,
                message: messages.INVALID_PASSWORD,
                status: "validation"
            }
        }
        const jti = generateRandomString(20);

        const token = await generateJWT({ id: user._id, jti: jti });
        await Model.user.findByIdAndUpdate({ _id: user._id }, { $set: { jti: jti } }, { new: true })
        return {
            success: true,
            message: messages.LOGIN_SUCCESSFULL,
            data: token,
            status: "success"
        }

    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function newProfile(req) {
    try {
        const user_id = req.user.id;
       
        const result = validateWithJoi(Validation.user.userValidationSchema, req.body)
        if (!result.isValid) {
            return {
                success: false,
                message: result.errors,
                status: "validation"
            }
        }
        const { firstName, lastName, gender, email, age, phoneNumber, address, role } = req.body;
        const updateProfile = { firstName, lastName, gender, email, age, phoneNumber, address ,role };
        if(!req.user.stripeCustomerId){
        const name = `${firstName} ${lastName}`
         const customerId = await stripe.createCustomer(name,email);
         console.log("stripeCustomerId",customerId)
          updateProfile.stripeCustomerId=customerId.id
        }
        console.log("id", user_id)
        
        const user = await Model.user.findOneAndUpdate({ _id: user_id }, { $set: updateProfile  }, { new: true })
        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "unautherized"
            }
        }
        console.log("profile", user);
        return {
            success: true,
            data: user,
            message: messages.PROFILE_SUCCESSFULL,
            status: "success"
        }

    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function getUser(req) {
    try {
        const user_id = req.user.id;
        const user = await Model.user.findById(user_id);
        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "unautherized"
            }
        }
        return {
            success: true,
            message: messages.USER_FETCHED_SUCCESSFULLY,
            data: user,
            status: "success"
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function getOTP(data) {
    try {
        //const user_id=req.user;
        const { email, phoneNumber } = data
        const user = await Model.user.findOne({ $or: [{ email }, { phoneNumber }] })
        if (!user) {
            return {
                success: false,
                message: messages.NOT_EXIST,
                status: "validation"
            }
        }

        const otp = 1234
        if (user?.email) {
            sendOtp(email, otp)
            const expiry = dayjs().add(5, "minutes").toISOString();
            const newOtp = new Model.otp({ email, otp, expiredAt: expiry })
            await newOtp.save();
            return {
                success: true,
                message: messages.MAIL_OTP_SUCCESSFULL,
                status: "success"
            }

        } else {
            sendOtpToNumber(phoneNumber, otp)
            const expiry = dayjs().add(5, "minutes").toISOString();
            const newOtp = new Model.otp({ phoneNumber, otp, expiredAt: expiry })
            await newOtp.save();
            return {
                success: true,
                message: messages.NUMBER_OTP_SUCCESSFULL,
                status: "success"
            }
        }



    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function deleteUser(req) {
    try {
        const user_id = req.user;
        //  const user  = await userModel.findById(user_id);
        const user = await Model.user.findById(user_id);
        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "unautherized"
            }
        }
        await Model.user.findByIdAndDelete(user_id);
        return {
            success: true,
            message: messages.ACC_DELETE_SUCCESSFULL,
            status: "success"
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function newPassword(req) {
    try {
        const user_id = req.user.id;
        const { newPassword } = req.body;
        const user = await Model.user.findById(user_id);
        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "unautherized"
            }
        }
        console.log("reached 1")
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await Model.user.findByIdAndUpdate(user_id, { $set: { password: hashedNewPassword } }, { new: true })
        console.log("reached 2")
        return {
            success: true,
            message: messages.PASS_RESET_SUCCESSFULL,
            status: "success"
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}


async function changeOldPass(req) {
    try {
        const { oldPassword, newPassword } = req.body;
        const user_id = req.user.id;
        const user = await Model.user.findById(user_id);
        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "unautherized"
            }
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return {
                success: false,
                message: messages.INVALID_PASSWORD,
                status: "validation"
            }
        }
        await Model.user.findByIdAndUpdate(user_id, { $set: { password: newPassword } }, { new: true })
        return {
            success: true,
            message: messages.PASS_CHANGED_SUCCESSFULLY,
            status: "success"
        }

    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function logoutUser(req) {
    try {
        const user_id = req.user.id;
        const jti = req.user.jti
        const user = await Model.user.findOneAndUpdate({ $or: [{ _id: user_id }, { jti: jti }] }, { $set: { jti: "" } }, { new: true })
        if (!user) {
            return {
                success: false,
                message: messages.NOT_FOUND,
                status: "unautherized"
            }
        }
        return {
            success: true,
            message: messages.USER_LOG_OUT,
            status: "success"
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function allUsers() {
    try {
         const users = await Model.user.find();
         if(!users){
            return{
                success:false,
                message:messages.NOT_FOUND,
                status:"recordNotFound"
            }
         }
         return{
            success:true,
            message:messages.USER_FETCHED_SUCCESSFULLY,
            data : users,
            status:"success"
         }
    } catch (error) {
         return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

module.exports = {
    user, newUser, verifyUser, newProfile, loginUser, getUser,
    getOTP, deleteUser, newPassword, changeOldPass, logoutUser,allUsers
}