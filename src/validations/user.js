const joi = require("joi");

const userValidationSchema = joi.object({
    firstName: joi.string().min(3).max(50).required(),
    lastName: joi.string().min(3).max(50).required(),
    email: joi.string().email(),
    gender: joi.string().required(),
    age: joi.number().min(15).max(100).required(),
    //password: joi.number().min(4).required(),
    countryCode : joi.string().pattern(/^\+[0-9]{1,4}$/),

    phoneNumber: joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            "string.empty": "Phone number is required",
            "string.pattern.base": "Phone number must be a valid 10-digit number"
        }),
       address:  joi.string().required(),
       role: joi.number()
})

module.exports = { userValidationSchema }