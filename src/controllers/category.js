const services = require("../services");


const addCategory = async (req, res, next) => {
    try {
        const data = await services.category.newCategory(req.body)
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const getAllCategories = async (req, res, next) => {
    try {
        const data = await services.category.seeCategories()
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const updateCategory = async (req, res, next) => {
    try {
        const data = await services.category.updatedCategory(req)
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

const deleteCategory = async (req, res, next) => {
    try {
        const data = await services.category.removeCategory(req);
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

module.exports = { addCategory, getAllCategories, updateCategory, deleteCategory }