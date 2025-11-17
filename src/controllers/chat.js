const services = require("../services");

const getRoomId = async (req, res, next) => {
    try {
        const data = await services.chats.roomId(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const chatList = async (req, res, next) => {
    try {
        const data = await services.chats.chats(req);
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

// handling "as buyer" and " as seller"

// const getRoomId1 = async (req, res, next) => {
//     try {
//         const data = await services.chats.getRoomId1(req);
//         if (data.success) {
//             return res.success({ message: data.message, data: data.data })
//         } else if (data.status == "recordNotFound") {
//             return res.recordNotFound({ message: data.message })
//         } else {
//             throw new Error(data.message)
//         }
//     } catch (error) {
//         return res.internalServerError({ message: error.message || "Something went wrong" })
//     }
// }

// const getChats = async (req,res,next)=>{
//     try {
//         const data = await services.chats.getChats(req);
//          if (data.success) {
//             return res.success({ message: data.message, data: data.data })
//         } else if (data.status == "recordNotFound") {
//             return res.recordNotFound({ message: data.message })
//         } else {
//             throw new Error(data.message)
//         }
//     } catch (error) {
//         return res.internalServerError({ message: error.message || "Something went wrong" })
//     }
// }

const chatHistory = async (req, res, next) => {
    try {
        const data = await services.chats.history(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "validation") {
            return res.validation({ message: data.message })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        data = await services.chats.messageTodelete(req);
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

// group chat

const creatGroup = async (req, res, next) => {
    try {
        const data = await services.chats.creatGroup(req);
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

const groupList = async (req, res, next) => {
    try {
        const data = await services.chats.groupsList(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const addGroupMembers = async (req, res, next) => {
    try {
        const data = await services.chats.addGroupMembers(req);
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

const removeMembers = async (req, res, next) => {
    try {
        const data = await services.chats.removeMember(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const deleteGroup = async (req, res, next) => {
    try {
        const data = await services.chats.deleteGroup(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const exitGroup = async (req, res, next) => {
    try {
        const data = await services.chats.exitGroup(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const makeAdmin = async (req, res, next) => {
    try {
        const data = await services.chats.makeAdmin(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const seeGroupMembers = async (req, res, next) => {
    try {
        const data = await services.chats.seeGroupMembers(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "recordNotFound") {
            return res.recordNotFound({ message: data.message })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}


const grpChatHitory = async (req, res, next) => {
    try {
        const data = await services.chats.grpChatHitory(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "validation") {
            return res.validation({ message: data.message })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}
const deleteGrpMsg = async (req, res, next) => {
    try {
        const data = await services.chats.deleteGrpMsg(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "validation") {
            return res.validation({ message: data.message })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

const groupDetails = async (req, res, next) => {
    try {
        const data = await services.chats.groupDetails(req);
        if (data.success) {
            return res.success({ message: data.message, data: data.data })
        } else if (data.status == "validation") {
            return res.validation({ message: data.message })
        } else if (data.status == "unautherized") {
            return res.unautherized({ message: data.message })
        } else {
            throw new Error(data.message)
        }
    } catch (error) {
        return res.internalServerError({ message: error.message || "Something went wrong" })
    }
}

module.exports = {
    getRoomId, chatList,
    chatHistory, deleteMessage, creatGroup, addGroupMembers, groupList, removeMembers,
    deleteGroup, exitGroup, makeAdmin,seeGroupMembers,grpChatHitory,deleteGrpMsg,groupDetails
    // getRoomId1 ,getChats
}