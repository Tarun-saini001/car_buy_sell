const services = require("../services");

const homepage = async (req, res, next) => {
    try {
        const data = await services.homepage.dashboard(req)
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

const seeAll = async (req, res, next) => {
    try {
        const data = await services.homepage.allVendors(req)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const allBrandsOfCategory = async (req, res, next) => {
    try {
        const data = await services.homepage.brandsOfCategory(req);
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

module.exports = { homepage, seeAll, allBrandsOfCategory }