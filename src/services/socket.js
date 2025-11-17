
const JWT = require("jsonwebtoken");
const Model = require("../models");
const { Receive } = require("twilio/lib/twiml/FaxResponse");

module.exports = (io) => {
    console.log("socket")

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
        console.log("listing to clients")
        console.log("A user connected:", socket.id);
        socket.on("joinRoom", async (data) => {
            try {
                // console.log(data)
                // data = JSON.parse(data)
                console.log("socket user", socket.user)
                const user = socket.user;
                const userInfo = {
                    fullName: `${user.firstName} ${user.lastName}`,
                    phoneNumber: user.phoneNumber
                }
                //console.log("data",data)  
                //console.log("reached")
                //console.log("id",data.roomId)   
                const room = await Model.room.findById(data.roomId)
                if (!room) {
                    io.to(user._id.toString()).emit("roomNotExist",`room does not exist`);
                    return;
                }
                // await Model.roomUser.create({ roomId: room._id, userId:})
                socket.join(data.roomId)
                console.log("newUser joined", data.roomId)
                io.to(data.roomId.toString()).emit("userJoined", `${userInfo.fullName} ${userInfo.phoneNumber} joined ${data.roomId}`)

            } catch (error) {
                console.log("something went wrong", error)
            }
            // console.log(`Message from ${socket.id} : ${data}`);
            // io.emit("chat", `user ${socket.id} : ${data}`)
        });

        socket.on("chatMessage", async ({ roomId, message, messageType }) => {
            try {
                const user = socket.user;
                const userInfo = {
                    fullName: `${user.firstName} ${user.lastName}`,
                    phoneNumber: user.phoneNumber
                }
                const room = await Model.room.findById(roomId);
                if (!room) {
                    io.to(user._id.toString()).emit("roomNotExist",`room does not exist`);
                    return;
                }
                const newMessage = await Model.message.create({ roomId: roomId, userId: user._id, message: message, messageType: messageType })
                const plainMessage = newMessage.toObject();
                const dataToSend = { ...plainMessage, ...userInfo }
                console.log(dataToSend)
                io.to(roomId.toString()).emit("newMessage", { "data": dataToSend, message: "message received" })
                console.log("message", newMessage, user)
            } catch (error) {
                console.log("something went wrong", error)
            }
        })
        socket.on("disconnect", () => {
            console.log(`User ${socket.id} disconnected`);
            io.emit("chat", `User ${socket.id} left the chat`)
        })
    })
} 
