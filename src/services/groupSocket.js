
const JWT = require("jsonwebtoken");
const Model = require("../models");

module.exports = (io) => {


    io.use(async (socket, next) => {
        const token = socket.handshake.query.token;
        try {
            if (!token) {
                next(new Error("Authentication error : no token provided."))
            }
            const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY)
            const user = await Model.user.findById(decoded.id).select("-password").lean()
            socket.join(user._id.toString());
            socket.user = user
            console.log("user data ", user)
            next();
        } catch (error) {
            console.log("JWT varification failed", error);
            next(new Error("invalid token"))
        }
    })


    io.on("connection", (socket) => {
        console.log("A new user connencted :", socket.id);

        socket.on("joinGroup", async (data) => {
            try {
                console.log("socket user", socket.user);
                const user = socket.user;
                const userInfo = {
                    fullName: `${user.firstName} ${user.lastName}`,
                    phoneNumber: user.phoneNumber
                }
                console.log("user info:", userInfo)
                //const group = await Model.group.findById(data.groupId);
                const groupMeber = await Model.groupMember.findOne({ groupId: data.groupId, userId: user._id })
                console.log("groupMember", groupMeber)
                if (!groupMeber) {
                    io.to(user._id.toString()).emit(("groupNotExist", "group does not exist"))
                    return;
                }
                socket.join(data.groupId);
                console.log("newUser joined", data.groupId)
                io.to(data.groupId.toString()).emit("userJoined", `${userInfo.fullName} ${userInfo.phoneNumber} joined ${data.groupId}`)
            } catch (error) {
                console.log("somethind went wrong :", error)
            }
        })

        socket.on("chatMessage", async ({ groupId, message, messageType }) => {
            try {
                const user = socket.user;
                const userInfo = {
                    fullName: `${user.firstName} ${user.lastName}`,
                    phoneNumber: user.phoneNumber
                }
                const group = await Model.group.findById(groupId);
                if (!group) {
                    io.to(user._id.toString().emit("groupNotExist", "group does not exist"))
                    return;
                }
                const newMessage = await Model.groupMessage.create({
                    groupId: groupId, userId: user._id,
                    message: message, messageType: messageType
                })
                const plainMessage = newMessage.toObject();
                const dataToSend = { ...plainMessage, ...userInfo }
                console.log(dataToSend)
                io.to(groupId.toString()).emit("newMessage", { "data": dataToSend, message: "message recieved" })
                console.log("message", newMessage, user)
            } catch (error) {
                console.log("somethind went wrong :", error)
            }
        })
        socket.on("disconnect", () => {
            console.log(`User ${socket.id} disconnected`);
            io.emit("chat", `User ${socket.id} left the chat`)
        })
    })
}