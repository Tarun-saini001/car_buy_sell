

function validateWithJoi(schema, data) {
    const { error } = schema.validate(data, { abortEarly: false });

    if (!error) {
        return { isValid: true, errors: "" };
    }

    const errorMessages = error.details.map(err => err.message).join("\n");

    return { isValid: false, errors: errorMessages };
}

module.exports = { 
    validateWithJoi,
    auth : require("./auth"),
    user : require("./user")
 }
