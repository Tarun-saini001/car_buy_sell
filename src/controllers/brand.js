const services = require("../services");


const addBrand = async (req, res, next) => {
    try {
        const data = await services.brand.newBrand(req.body)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const getAllBrands = async (req, res, next) => {
    try {
        const data = await services.brand.seeBrands()
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const updateBrand = async (req, res, next) => {
    try {
        const data = await services.brand.updatedBrand(req)
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

const deleteBrand = async (req, res, next) => {
    try {
        const data = await services.brand.removeBrand(req);
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

module.exports = { addBrand, getAllBrands, updateBrand, deleteBrand }