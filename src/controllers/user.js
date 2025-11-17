const Services = require('../services');
// console.log('Services: ', Services);


const getUser = async (req, res, next) => {
    try {
        console.log("user controiller")
        const data = await Services.user.user();
        console.log(data);

        res.status(200).json({ data })
    } catch (error) {
        next(error);
    }
}

const signup = async (req, res, next) => {
    try {
        const data = await Services.user.newUser(req.body)
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

const verifyOTP = async (req, res, next) => {
    try {
        const data = await Services.user.verifyUser(req.body)
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

const login = async (req, res, next) => {
    try {
        console.log("bjhvjkbjkbjkb")
        const data = await Services.user.loginUser(req.body)
        console.log("bjhvjk-------------------bjkbjkb", data)
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

const createProfile = async (req, res, next) => {
    try {
        const data = await Services.user.newProfile(req)
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
// const resendOTP = async(req,res,next)=>{
//     try {
//         const data = await Services.user.getOTP(req.body)
//          if(data.success){
//             return res.success({message:data.message, data:data.data})
//          }else if(data.status=="validation"){
//             return res.validation({message:data.message})
//         }else{
//             throw new Error(data.message)
//          }
//     } catch (error) {
//        return res.internalServerError({ message: error.message || "Something went wrong" })  
//     }
// }

const getProfile = async (req, res, next) => {
    try {
        const data = await Services.user.getUser(req)
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

const deleteAccount = async (req, res, next) => {
    try {
        const data = await Services.user.deleteUser(req)
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

const forgotPassword = async (req, res, next) => {
    try {
        const data = await Services.user.getOTP(req.body)
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

const setNewPassword = async (req, res, next) => {
    try {
        const data = await Services.user.newPassword(req)
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

const changePassword = async (req, res, next) => {
    try {
        const data = await Services.user.changeOldPass(req)
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

const logout = async (req, res, next) => {
    try {
        const data = await Services.user.logoutUser(req)
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

const getAllUsers = async (req, res, next) => {
    try {
        const data = await Services.user.allUsers()
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

module.exports = {
    getUser,
    signup,
    verifyOTP,
    createProfile,
    login,
    getProfile,
    // resendOTP,
    deleteAccount,
    forgotPassword,
    setNewPassword,
    changePassword,
    logout,
    getAllUsers
}