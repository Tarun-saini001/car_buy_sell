const { default: mongoose } = require("mongoose");
const { messages } = require("../messages/en");
const Model = require("../models");
const { pipeline } = require("nodemailer/lib/xoauth2");


async function roomId(req) {
    try {
        const id = req.user.id;
        const userId = req.body.userId
        const room = await Model.room.findOne({
            users: { $all: [id, userId] }
        })
        if (!room) room = await Model.room.create({
            users: [id, userId]
        })
        const chats = await Model.chat.create({
            userforBuying: id,
            userforSelling: userId
        })
        console.log("chat", chats)
        return {
            success: true,
            message: messages.GET_ROMM_ID,
            data: room,
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

async function chats(req) {
    try {
        const id = req.user._id;
        const chats = await Model.room.aggregate([
            { $match: { users: { $all: [id] } } },
            {
                $lookup: {
                    from: "users",
                    let: { userIds: "$users" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$_id", "$$userIds"] },
                                    { $ne: ["$_id", id] }
                                ]
                            }
                            // role
                        }
                    },
                    {
                        $project: {
                            id: 1,
                            firstName: 1,
                            lastName: 1,
                            phoneNumber: 1
                        }
                    }
                    ],
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $lookup: {
                    from: "messages",
                    let: { roomId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$roomId", "$$roomId"] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: "lastMessage"
                }
            },
            {
                $unwind: {
                    path: "$lastMessage",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "messages",
                    let: { roomId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$roomId", "$$roomId"] },
                                        { $eq: ["$isRead", false] },
                                        { $ne: ["$userId", id] }
                                    ]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    as: "unseenMessages"
                }
            },
            {
                $unwind: {
                    path: "$unseenMessages",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    userDetails: 1,
                    lastMessage: {
                        userId: 1,
                        message: 1,
                        createdAt: 1
                    },
                    unseenMessages: { $ifNull: ["$unseenMessages.count", 0] }
                }
            }
        ])
        if (!chats) {
            return {
                success: false,
                message: messages.CHATS_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.ALL_CHATS_FETCHED,
            data: chats,
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

// handling  "as buyer" and " as seller"

// async function getRoomId1(req) {
//     try {
//         const id = req.user._id;
//         const userId = new mongoose.Types.ObjectId(req.body.userId);


//         let chat = await Model.chat.find({
//             $or: [
//                 { userForBuying: id, userForSelling: userId },
//                 { userForBuying: userId, userForSelling: id }
//             ]
//         });
//         console.log('chat', chat)
//         if (chat.length === 0) {
//             chat = await Model.chat.create({
//                 userforBuying: id,
//                 userforSelling: userId
//             });
//         }
//         console.log("result", chat);
//         return {
//             success: true,
//             message: messages.GET_ROMM_ID,
//             data: chat,
//             status: "success"
//         }
//     } catch (error) {
//         return {
//             success: false,
//             message: error.message || "something went wrong",
//             status: "internalServerError"
//         }
//     }
// }

// async function getChats(req) {
//     try {
//         const id = req.user._id
//         let query = {};
//         if (req.query.role == 1) {
//             query.userforBuying = id
//         }
//         if (req.query.role == 2) {
//             query.useforSelling = id
//         }

//         const chats = await Model.chat.aggregate([
//             {
//                 $match: query
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     let: { userIds: ["$userforBuying", "$userforSelling"] },
//                     pipeline: [{
//                         $match: {
//                             $expr: {
//                                 $and: [
//                                     { $in: ["$_id", "$$userIds"] },
//                                     { $ne: ["$_id", id] }
//                                 ]
//                             }
//                             // role
//                         }
//                     },
//                     {
//                         $project: {
//                             id: 1,
//                             firstName: 1,
//                             lastName: 1,
//                             phoneNumber: 1
//                         }
//                     }
//                     ],
//                     as: "userDetails"
//                 }
//             },

//         ])

//         return {
//             success: true,
//             message: messages.ALL_CHATS_FETCHED,
//             data: chats,
//             status: "success"
//         }

//         // as a buyer
//         // if (roleType == "1") {
//         //     const chats = await Model.chat.find({ userforBuying: id })
//         //     if (!chats) {
//         //         return {
//         //             success: false,
//         //             message: messages.CHATS_NOT_FOUND,
//         //             status: "recordNotfound"
//         //         }
//         //     }
//         //     return {
//         //         success: true,
//         //         message: messages.ALL_CHATS_FETCHED,
//         //         data: chats,
//         //         status: "success"
//         //     }
//         // }
//         // if (roleType == "2") {
//         //     const chats = await Model.chat.find({ userforSelling: id })
//         //     if (!chats) {
//         //         return {
//         //             success: false,
//         //             message: messages.CHATS_NOT_FOUND,
//         //             status: "recordNotfound"
//         //         }
//         //     }
//         //     return {
//         //         success: true,
//         //         message: messages.ALL_CHATS_FETCHED,
//         //         data: chats,
//         //         status: "success"
//         //     }
//         // }
//     } catch (error) {
//         return {
//             success: false,
//             message: error.message || "something went wrong",
//             status: "internalServerError"
//         }
//     }
// }

async function history(req) {
    try {
        const id = req.user._id;
        const roomId = new mongoose.Types.ObjectId(req.body.roomId);

        if (!roomId) {
            return {
                success: false,
                message: messages.ROOM_ID_REQUIRED,
                status: "validation"
            }
        }
        // const data = await Model.message.find({ roomId: roomId })
        //     .select("userId message isRead isDeleted")
        //     .populate({
        //         path: "userId",
        //         select: "firstName lastName phoneNumber"
        //     });
        // if (!data) {
        //     return {
        //         success: false,
        //         message: messages.CHATS_NOT_FOUND,
        //         status: "recordNotFound"
        //     }
        // }
        // const result = data.map((message) => {
        //     if (!message.isDeleted.includes(id)){
        //         return message
        //     }
        // })
        await Model.message.updateMany({ roomId: roomId, userId: { $ne: id } },
            { $set: { isRead: true } })


        const result = await Model.message.aggregate([
            {
                $match: { roomId: roomId, isDeleted: { $nin: [id] } }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    userId: 1,
                    message: 1,
                    messageType: 1,
                    isRead: 1,
                    isDeleted: 1,
                    userDetails: {
                        phoneNumber: 1,
                        firstName: 1,
                        lastName: 1,
                    }
                }
            }])

        return {
            success: true,
            message: messages.CHAT_HISTORY,
            data: result,
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

async function messageTodelete(req) {
    try {
        const id = req.user._id;
        let messageTodelete = req.body.messageTodelete;
        messageTodelete.map((id) => {
            return new mongoose.Types.ObjectId(id)
        })
        if (!messageTodelete) {
            return {
                success: false,
                message: messages.MESSAGES_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        await Model.message.updateMany(
            { _id: { $all: messageTodelete } },
            { $set: { isDeleted: id } });

        return {
            success: true,
            message: messages.MESSAGE_DELETE_SUCCESSFULLY,
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

//group chat

async function creatGroup(req) {
    try {
        const id = req.user._id;
        const { name, groupDescription, users } = req.body;
        if (!name) {
            return {
                success: false,
                message: messages.ENTER_GROUP_NAME,
                status: "recordNotFound"
            }
        }
        console.log("users", users)
        if (!users || users.length == 0) {
            return {
                success: false,
                message: messages.SELECT_USER,
                status: "vaidation"
            }
        }
        const group = await Model.group.find({ name: name });
        if (group.length > 0) {
            return {
                success: false,
                message: messages.ALREADY_IN_GROUP,
                data: group,
                status: "validation"
            }
        }

        const newGroup = await Model.group.create({ name: name, groupDescription: groupDescription, admin: id ,createdBy : id })
        console.log("newGroup", newGroup)

        const allMembers = [id, ...users].map(userId => ({
            groupId: newGroup._id, userId: userId, isAdmin: userId == id ? true : false
        }))

        const newMember = await Model.groupMember.insertMany(allMembers)
        console.log("newMember", newMember)

        return {
            success: true,
            message: messages.GROUP_CREATED_SUCCESFULLY,
            data: {
                group: newGroup,
                members: newMember
            },
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

async function groupsList(req) {
    try {

        const id = req.user._id;
        if (!id) {
            return {
                success: false,
                message: messages.INVALID_USER,
                status: "unautherized"
            }
        }
        // const groupList = await Model.group.find().select("name");
        // if(groupList==0){
        //      return {
        //     success: false,
        //     message: messages.NO_ROOM_EXIST,
        //     status: "rocordNotFound"
        // }
        // }
        const groups = await Model.groupMember.aggregate([
            { $match: { userId: id } },
            {
                $lookup: {
                    from: "groups",
                    let: { groupId: "$groupId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$groupId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $ne: ["$userId", id] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "allGroups"
                }
            },
            {
                $unwind: "$allGroups"
            },
            {
                $lookup: {
                    from: "groupmessages",
                    let: { groupId: "$groupId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$groupId", "$$groupId"] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: "lastMessage"
                }
            },
            {
                $unwind: {
                    path: "$lastMessage",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.userId",
                    foreignField: "_id",
                    as: "lastMsgUser"
                }
            },
            {
                $unwind: {
                    path: "$lastMsgUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "groupmessages",
                    let: { groupId: "$groupId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$groupId", "$$groupId"] },
                                        { $not: [{ $in: [id, "$readBy"] }] },
                                        { $not: [{ $in: [id, "$isDeleted"] }] },
                                        { $ne: ["$userId", id] }
                                    ]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    as: "unseenMessages"
                }
            },
            {
                $unwind: {
                    path: "$unseenMessages",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    lastMessage: {
                        message: 1,
                        userId: 1,
                        createdAt: 1,
                    },
                    userName: {
                        $concat: [
                            "$lastMsgUser.firstName", " ", "$lastMsgUser.lastName"
                        ]
                    },
                    name: "$allGroups.name",
                    unseenMessages: { $ifNull: ["$unseenMessages.count", 0] }
                }
            }
        ]);


        return {
            success: true,
            message: messages.GROUP_LIST_FETCHED,
            data: groups,
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

async function addGroupMembers(req) {
    try {
        const { groupId, userId } = req.body;
        if (!groupId || !userId) {
            return {
                success: false,
                message: messages.GROUP_OR_USER_ID_REQUIRED,
                status: "recordNotFound"
            }
        }
        const member = await Model.groupMember.find({ groupId: groupId, userId: userId })
        if (member.length > 0) {
            return {
                success: false,
                message: messages.ALREADY_IN_GROUP,
                status: "validation"
            }
        }
        const grounMember = await Model.groupMember.create({ groupId: groupId, userId: userId });
        console.log("grounMember", grounMember)
        return {
            success: true,
            message: messages.MEMBER_ADDED_SUCCESSFULLY,
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

async function removeMember(req) {
    try {
        const id = req.user._id;
        const { groupId, userId } = req.body
        if (!id)
            return {
                success: false,
                message: messages.INVALID_USER,
                status: "unautherized"
            }
        const admin = await Model.group.find({ _id: groupId, admin: id })
        if (!admin) {
            return {
                success: false,
                message: messages.NOT_ADMIN,
                status: "unautherized"
            }
        }
        await Model.groupMember.findOneAndUpdate({ groupId: groupId, userId: userId },
            { $set: { isJoined: false } },
            { new: true }
        )
        return {
            success: true,
            message: messages.REMOVED_SUCCESSFULLY,
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

async function deleteGroup(req) {
    try {
        const id = req.user._id;
        const { groupId } = req.body
        if (!id)
            return {
                success: false,
                message: messages.INVALID_USER,
                status: "unautherized"
            }
        const admin = await Model.group.find({ _id: groupId, admin: id })
        if (!admin || admin.length == 0) {
            return {
                success: false,
                message: messages.NOT_ADMIN,
                status: "unautherized"
            }
        }
        await Model.group.findOneAndUpdate({ _id: groupId },
            { $set: { isDeleted: true } },
            { new: true }
        )
        return {
            success: true,
            message: messages.GRP_DELETED_SUCCESSFULLY,
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

async function exitGroup(req) {
    try {
        const id = req.user._id;
        const { groupId, userId } = req.body;
        if (!id)
            return {
                success: false,
                message: messages.INVALID_USER,
                status: "unautherized"
            }
        const admin = await Model.group.find({ _id: groupId, admin: id })
        if (!admin || admin.length == 0) {
            await Model.groupMember.findOneAndUpdate(
                { groupId: groupId, userId: id },
                { $set: { isJoined: false } },
                { new: true }
            )
            return {
                success: true,
                message: messages.GROUP_EXIT,
                status: "success"
            }
        }
        const group = admin[0];
        console.log("grp", group)
        if (group.admin.length == 1) {
            console.log("reach")
            await Model.group.findByIdAndUpdate(new mongoose.Types.ObjectId(groupId),
                { $set: { admin: [userId] } },
                { new: true }
            )
        }
        await Model.groupMember.findOneAndUpdate(
            { groupId: groupId, userId: id },
            { $set: { isJoined: false } },
            { new: true }
        )
        return {
            success: true,
            message: messages.GROUP_EXIT,
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

async function makeAdmin(req) {
    try {
        const id = req.user._id;
        const { groupId, userId } = req.body;
        if (!id)
            return {
                success: false,
                message: messages.INVALID_USER,
                status: "unautherized"
            }
        const admin = await Model.group.findOne({ _id: groupId, admin: id })

        if (!admin) {
            return {
                success: false,
                message: messages.NOT_ADMIN,
                status: "unautherized"
            }
        }
        const member = await Model.groupMember.findOneAndUpdate({ groupId: groupId, userId: userId },{$set:{isAdmin:true}});
        if (!member) {
            return {
                success: false,
                message: messages.NOT_MEMBER_OF_GRP,
                status: "recordNotFound"
            }
        }
        admin.admin.push(userId);
        await admin.save();
        return {
            success: true,
            message: messages.ADMIN_ADDED,
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

async function seeGroupMembers(req) {
    try {
        const id = req.user._id;
        const { groupId } = req.body;
        if (!id)
            return {
                success: false,
                message: messages.INVALID_USER,
                status: "unautherized"
            }
        if (!groupId) {
            return {
                success: false,
                message: messages.GROUP_ID_REQUIRED,
                status: "unautherized"
            }
        }
        const members = await Model.groupMember.find({ groupId: groupId })
            .populate({
                path: "userId",
                select: "firstName lastName phoneNumber"
            }).select("userId")

        if (!members) {
            return {
                success: false,
                message: messages.GROUP_NOT_FOUNT,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.GROUP_MEMBERS_FETCHED,
            data: members,
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

async function grpChatHitory(req) {
    try {
        const id = req.user._id;
        const groupId = new mongoose.Types.ObjectId(req.query.groupId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log("groupId", groupId)
        if (!groupId) {
            return {
                success: false,
                message: messages.GROUP_ID_REQUIRED,
                status: "validation"
            }
        }

        await Model.groupMessage.updateMany({ groupId: groupId, userId: { $ne: id } },
            { $addToSet: { readBy: id } }
        )
        const pipeline1 = [
            { $match: { groupId: groupId } },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },

            { $limit: 4 },
            { $unwind: "$userInfo" },
            {
                $project: {
                    "userInfo.firstName": 1,
                    "userInfo.lastName": 1
                }
            }
        ];


        const pipeline2 = [
            { $match: { groupId: groupId, isDeleted: { $nin: [id] } } },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    // userId: 1,
                    message: 1,
                    messageType: 1,
                    //  isRead: 1,
                    // readBy: 1,
                    // isDeleted: 1,
                    userDetails: {
                        phoneNumber: 1,
                        firstName: 1,
                        lastName: 1,
                    }
                }
            },
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        const [group, members, grpMessages] = await Promise.allSettled([
            Model.group.findById(groupId).select("name").lean(),
            Model.groupMember.aggregate(pipeline1),
            Model.groupMessage.aggregate(pipeline2)
        ])
        const data = {
            group: group.status == "fulfilled" ? group.value.name : {},
            members: members.status == "fulfilled" ? members.value : [],
            grpMessages: grpMessages.status == "fulfilled" ? grpMessages.value : []
        }
        return {
            success: true,
            message: messages.CHAT_HISTORY,
            data: data,
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

async function deleteGrpMsg(req) {
    try {
        const id = req.user._id;
        let messageTodelete = req.body.messageTodelete;
        messageTodelete.map((id) => {
            return new mongoose.Types.ObjectId(id)
        })
        if (!messageTodelete) {
            return {
                success: false,
                message: messages.MESSAGES_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        await Model.groupMessage.updateMany(
            { _id: { $all: messageTodelete } },
            { $set: { isDeleted: id } }
        )
        return {
            success: true,
            message: messages.MESSAGE_DELETE_SUCCESSFULLY,
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

async function groupDetails(req) {
    try {
        const groupId = new mongoose.Types.ObjectId(req.query.groupId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const pipeline = [
            { $match: { groupId: groupId } },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            
            {
                $project: {
                    "firstName": "$userDetails.firstName",
                    "lastName": "$userDetails.lastName",
                    "phoneNumber": "$userDetails.phoneNumber",
                     isAdmin:1,
                  
                }
            },
            {
                $facet: {
                    members: [
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalMembers: [
                        { $count: "count" }
                    ]
                }
            }
        ]

        const [group, members] = await Promise.allSettled([
            Model.group.findById(groupId).select("name groupDescription createdBy createdAt").lean(),
            Model.groupMember.aggregate(pipeline),
        ])
        const facetdata = members.status == "fulfilled" ? members.value[0] : [];
        const grpMembers = facetdata.members || [];
        const totalMembers = facetdata.totalMembers?.[0]?.count || 0;
        const data = {
            group: group.status == "fulfilled" ? group.value : {},
            grpMembers,
            totalMembers

        }
        return {
            success: true,
            message: messages.GRP_DETAILS_FETCHED,
            data: data,
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

module.exports = {
    roomId, chats,
    history, messageTodelete, creatGroup, addGroupMembers, groupsList, removeMember, deleteGroup,
    exitGroup, makeAdmin, seeGroupMembers, grpChatHitory, deleteGrpMsg, groupDetails
    //getRoomId1, getChats
}