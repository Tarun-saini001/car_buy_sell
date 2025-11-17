const { messages } = require("../messages/en");
const Model = require("../models");

async function newCategory(data) {
    try {
        const { name } = data
          const existingCategory = await Model.category.findOne({ name: data.name })
                if (existingCategory) {
                    return {
                        success: false,
                        message: "category already exist",
                        status: "validation"
                    }
                }
        const category = new Model.category({ name })
        await category.save();
        return {
            success: true,
            message: messages.NEW_CATEGORY_ADDED,
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

async function seeCategories() {
    try {
        const categories = await Model.category.find();
        return {
            success: true,
            message: messages.ALL_CATEGORES_FETCHED,
            data: categories,
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

async function updatedCategory(req) {
    try {
        const id = req.params.id
        const { newName } = req.body
        const category = await Model.category.findByIdAndUpdate(id, { $set: { name: newName } }, { new: true })
        if (!category) {
            return {
                success: false,
                message: messages.CATEGORY_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.CTEGORY_UPDATED_SUCCESSFULLY,
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

async function removeCategory(req) {
    try {
        const id = req.params.id;
        const removedCategory = await Model.category.findByIdAndDelete(id);
        if (!removedCategory) {
            return {
                success: false,
                message: messages.CATEGORY_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.CATEGORY_DELETE_SUCCESSFULLY,
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

module.exports = { newCategory, seeCategories, updatedCategory, removeCategory }