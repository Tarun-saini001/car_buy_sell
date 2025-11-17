const router = require("express").Router();
const multer = require("multer");
const express = require("express")
const Controller = require('../controllers');

const { JWT_VERIFY } = require("../middlewares/auth");

// router.route('/').get(userController.getUser);
router.post("/signup", Controller.user.signup)
router.post("/verifyOTP", Controller.user.verifyOTP)
router.post("/login", Controller.user.login)
router.get("/getProfile", JWT_VERIFY, Controller.user.getProfile)
router.patch("/updateProfile", JWT_VERIFY, Controller.user.createProfile)
//router.get("/resendOTP",JWT_VERIFY,Controller.user.resendOTP)
router.delete("/deleteAccount", JWT_VERIFY, Controller.user.deleteAccount)
router.post("/forgotPassword", Controller.user.forgotPassword)
router.post("/setNewPassword", JWT_VERIFY, Controller.user.setNewPassword)
router.patch("/changePassword", JWT_VERIFY, Controller.user.changePassword)
router.post("/logout", JWT_VERIFY, Controller.user.logout)
router.get("/getAllUsers",Controller.user.getAllUsers)

//category routes
router.post("/addCategory", JWT_VERIFY,Controller.category.addCategory)
router.get("/getAllCategories", JWT_VERIFY,Controller.category.getAllCategories)
router.patch("/updateCategory/:id", JWT_VERIFY,Controller.category.updateCategory)
router.delete("/deleteCategory/:id", JWT_VERIFY,Controller.category.deleteCategory)

//brand routes
router.post("/addBrand", JWT_VERIFY,Controller.brand.addBrand)
router.get("/getAllBrands",JWT_VERIFY, Controller.brand.getAllBrands)
router.patch("/updateBrand/:id",JWT_VERIFY, Controller.brand.updateBrand)
router.delete("/deleteBrand/:id",JWT_VERIFY, Controller.brand.deleteBrand)

//product routes
router.post("/addCar",JWT_VERIFY, Controller.product.addCar)
router.get("/getAllCars",JWT_VERIFY, Controller.product.getAllCars)
router.patch("/updateCar/:id",JWT_VERIFY, Controller.product.updateCar)
router.delete("/deleteCar/:id",JWT_VERIFY, Controller.product.deleteCar)
router.get("/getCarDetails/:id",JWT_VERIFY,Controller.product.getCarDetails)
router.post("/giveRatings",JWT_VERIFY, Controller.product.giveRatings)
router.get("/carRatings",JWT_VERIFY,Controller.product.carRatings)
router.post("/addToWishlist",JWT_VERIFY,Controller.product.addToWishlist)
router.get("/getWishlist",JWT_VERIFY,Controller.product.getWishlist)

router.get("/buyCar",JWT_VERIFY,Controller.product.buyCar)
router.get("/transactionList",JWT_VERIFY,Controller.product.transactionList)
router.post("/refund",JWT_VERIFY,Controller.product.refund)
router.post("/createSubscription",JWT_VERIFY,Controller.product.createSubscription)
router.get("/subscriptionList",JWT_VERIFY,Controller.product.subscriptionList)
router.post("/buySubscription",JWT_VERIFY,Controller.product.buySubscription)
router.post("/upgradeSubscription",JWT_VERIFY,Controller.product.upgradeSubscription)
// router.post("/webhook", express.raw({type:'applicatio/json'}),Controller.product.webhooks)

router.get("/homepage",JWT_VERIFY,Controller.homepage.homepage)
router.get("/seeAll",JWT_VERIFY, Controller.homepage.seeAll)
router.get("/allBrandsOfCategory",JWT_VERIFY ,Controller.homepage.allBrandsOfCategory)

//chat routes
router.get("/getRoomId",JWT_VERIFY,Controller.chats.getRoomId)
router.get("/chatList",JWT_VERIFY,Controller.chats.chatList)
// router.get("/getRoomId1",JWT_VERIFY,Controller.chats.getRoomId1)
// router.get("/getChats",JWT_VERIFY,Controller.chats.getChats)
router.get("/chatHistory",JWT_VERIFY,Controller.chats.chatHistory)
router.put("/deleteMessage",JWT_VERIFY,Controller.chats.deleteMessage)

//group chat routes
router.post("/creatGroup",JWT_VERIFY,Controller.chats.creatGroup)
router.post("/addGroupMembers",JWT_VERIFY,Controller.chats.addGroupMembers)
router.get("/groupList",JWT_VERIFY,Controller.chats.groupList)
router.delete("/removeMembers",JWT_VERIFY,Controller.chats.removeMembers)
router.delete("/deleteGroup",JWT_VERIFY,Controller.chats.deleteGroup)
router.delete("/exitGroup",JWT_VERIFY,Controller.chats.exitGroup)
router.post("/makeAdmin",JWT_VERIFY,Controller.chats.makeAdmin)
router.get("/seeGroupMembers",JWT_VERIFY,Controller.chats.seeGroupMembers)
router.get("/grpChatHitory",JWT_VERIFY,Controller.chats.grpChatHitory)
router.patch("/deleteGrpMsg",JWT_VERIFY,Controller.chats.deleteGrpMsg)
router.get("/groupDetails",JWT_VERIFY,Controller.chats.groupDetails)

// file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "upload/");
    },
    filename: function (req, file, cb) {
        const name = file.originalname.replace(/\s+/g, "-")
        cb(null, Date.now() + "-" + name);
    }
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("myfile"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const fileurl = `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`
    return res.json({
        message: "File uploaded successfully",
        data: fileurl
    });
});

module.exports = router;