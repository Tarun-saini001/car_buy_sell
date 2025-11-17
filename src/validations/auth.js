const joi = require("joi");

const signupValidation = joi.object({
    email: joi.string().email(),
    countryCode: joi.string().pattern(/^\+[0-9]{1,4}$/),

    phoneNumber: joi.string()
        .pattern(/^[0-9]{10}$/)

        .messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be a valid 10-digit number"
        }),
    password: joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.pattern.base": "Password must contain alphabets, digits, and a special character"
        })
})

const loginValidation = joi.object({
    email: joi.string().email(),
    countryCode: joi.string().pattern(/^\+[0-9]{1,4}$/),

    phoneNumber: joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be a valid 10-digit number"
        }),
    password: joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.pattern.base": "Password must contain alphabets, digits, and a special character"
        })
})

const verifyOtpValidation = joi.object({
    email: joi.string().email(),
    countryCode: joi.string().pattern(/^\+[0-9]{1,4}$/),
    phoneNumber: joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be a valid 10-digit number"
        }),
    otp: joi.number().min(4).required()
})


module.exports = { loginValidation, verifyOtpValidation, signupValidation }