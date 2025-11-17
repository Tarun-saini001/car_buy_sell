const { messages } = require("../messages/en");
const Model = require("../models");

async function newBrand(data) {
    try {
        const { name } = data
        const existingBrand = await Model.brand.findOne({ name: data.name })
        if (existingBrand) {
            return {
                success: false,
                message: "brand already exist",
                status: "validation"
            }
        }
        const brand = new Model.brand({ name })
        await brand.save();
        return {
            success: true,
            message: messages.NEW_BRAND_ADDED,
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

async function seeBrands() {
    try {
        const brands = await Model.brand.find();
        return {
            success: true,
            message: messages.ALL_BRANDS_FETCHED,
            data: brands,
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

async function updatedBrand(req) {
    try {
        const id = req.params.id
        const { newName } = req.body
        const brand = await Model.brand.findByIdAndUpdate(id, { $set: { name: newName } }, { new: true })
        if (!brand) {
            return {
                success: false,
                message: messages.BRAND_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.BRAND_UPDATED_SUCCESSFULLY,
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

async function removeBrand(req) {
    try {
        const id = req.params.id;
        const removedBrand = await Model.brand.findByIdAndDelete(id);
        if (!removedBrand) {
            return {
                success: false,
                message: messages.BRAND_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.BRAND_DELETE_SUCCESSFULLY,
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

module.exports = { newBrand, seeBrands, updatedBrand, removeBrand }