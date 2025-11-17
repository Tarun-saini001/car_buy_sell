const services = require("../services");


const addCar = async (req, res, next) => {
    try {
        const data = await services.product.newCar(req.body);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "validation") {
            return res.validation({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const getAllCars = async (req, res, next) => {
    try {
        const data = await services.product.seeCars(req)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "validation") {
            return res.validation({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const updateCar = async (req, res, next) => {
    try {
        const data = await services.product.updatedCar(req)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const deleteCar = async (req, res, next) => {
    try {
        const data = await services.product.removeCar(req)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const getCarDetails = async (req, res, next) => {
    try {
        const data = await services.product.carDetails(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const giveRatings = async (req, res, next) => {
    try {
        const data = await services.product.ratings(req)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else if (data.status == "validation") {
            return res.validation({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const carRatings = async (req, res, next) => {
    try {
        const data = await services.product.listOfRating(req)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const addToWishlist = async (req, res, next) => {
    try {
        const data = await services.product.addWishlist(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const getWishlist = async (req, res, next) => {
    try {
        const data = await services.product.wishlist(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const buyCar = async (req, res, next) => {
    try {
        const data = await services.product.buyCar(req);
        if (data.success) {
            console.log('data: ------------------', data);
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })

    }
}


const webhooks = async (req, res, next) => {
    try {
        console.log("inside wenhook controler")
        const data = await services.product.webhooks(req);
        //console.log('data: controller ', data);
        console.log("coming from stripe servie")
        console.log("webhook run successfully !");
        if (data.success) {
            console.log("inside success");
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            console.log("data.status");
            return res.recordNotFound({ message: data.message })
        } else {
            console.log("elseeeee");
            throw new Error(data.message)
        }
    } catch (error) {
        console.log("inside catch of controller", error.message)
        return res.internalServerError({ message: error.message || "Something went wrong" })

    }
}

const transactionList = async (req, res, next) => {
    try {
        const data = await services.product.transactionList(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const refund = async (req , res , next)=>{
 try {
        const data = await services.product.refund(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const createSubscription = async (req,res,next) => {
    try {
    const data = await services.product.createSubscription(req);
     if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
} catch (error) {
    return res.internalServerError({ message: error.message || "Something went wrong" })
}
}

const subscriptionList = async (req,res,next) => {
     try {
    const data = await services.product.subscriptionList(req);
     if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
} catch (error) {
    return res.internalServerError({ message: error.message || "Something went wrong" })
}
}

const buySubscription = async (req,res,next)=>{
try {
    const data = await services.product.buySubscription(req);
     if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
} catch (error) {
    return res.internalServerError({ message: error.message || "Something went wrong" })
}
}


const upgradeSubscription = async (req,res,next) => {
    try {
    const data = await services.product.upgradeSubscription(req);
     if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
} catch (error) {
    return res.internalServerError({ message: error.message || "Something went wrong" })
}
}

module.exports = { addCar, getAllCars, updateCar, deleteCar, getCarDetails, giveRatings, carRatings, addToWishlist,
     getWishlist, buyCar, webhooks,transactionList,refund,createSubscription,buySubscription,subscriptionList ,upgradeSubscription}