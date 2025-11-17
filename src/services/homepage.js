const { Message } = require("twilio/lib/twiml/MessagingResponse");
const { messages } = require("../messages/en");
const Model = require("../models");
const { default: mongoose } = require("mongoose");

async function dashboard(req) {
    try {
        const user_id = req.user.id;
        // .all() : "Runs multiple promises in parallel and resolves only if all succeed,
        //           otherwise rejects on the first failure."

        // const [categories, brands, cars] = await Promise.all([
        //     Model.category.find().lean(),
        //     await Model.brand.find().lean(),
        //     Model.product.find().select("carName totalPrice trialAmount fuelType")
        // ])

        // const data = {
        //     categories,
        //     brands,
        //     cars
        // }


        const pipeline = [
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "userId",
                    as: "cars"
                }
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: "$cars" }, 0] }
                }
            },
            {
                $project: {
                    address: 1,
                    name: { $concat: ["$firstName", " ", "$lastName"] },
                }
            }
        ]


        const pipeline2 = [
            {
                $lookup: {
                    from: "ratings",
                    let: { productId: "$_id" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{ $eq: ["$productId", "$$productId"] },
                                { $eq: ["$userId", new mongoose.Types.ObjectId(user_id)] }]
                            }
                        }
                    }],
                    as: "userRating"
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "productId",
                    as: "productRatings"
                }
            },
            {
                $addFields: {
                    avgRating: { $avg: "$productRatings.rating" },
                    isRated: { $gt: [{ $size: "$userRating" }, 0] },
                }
            },
            {
                $project: {
                    carName: 1,
                    totalPrice: 1,
                    trialAmount: 1,
                    fuelType: 1,
                    avgRating: 1,
                    isRated: 1
                }
            }
        ]

        // allSettled : "Runs multiple promises in parallel and always resolves
        //                with a report of all outcomes (success or failure)." 

        const [categories, brands, cars, users] = await Promise.allSettled([
            Model.category.find().lean(),
            await Model.brand.find().lean(),
            Model.product.aggregate(pipeline2),
            await Model.user.aggregate(pipeline)
        ])


        const data = {
            categories: categories.status == "fulfilled" ? categories.value : [],
            brands: brands.status == "fulfilled" ? brands.value : [],
            cars: cars.status == "fulfilled" ? cars.value : [],
            users: users.status == "fulfilled" ? users.value : [],
        }

        // const[categories, brands,cars] = await Promise.race([
        //     Model.category.find().lean(),
        //     await Model.brand.find().lean(),
        //     Model.product.find().select("carName totalPrice trialAmount fuelType")
        // ])

        // const[categories, brands,cars] = await Promise.any([
        //     Model.category.find().lean(),
        //     await Model.brand.find().lean(),
        //     Model.product.find().select("carName totalPrice trialAmount fuelType")
        // ])


        //  category list
        // const categories = await Model.category.find();
        //  brand list
        // const brands = await Model.brand.find();

        // const cars = await Model.product.find().select("carName totalPrice trialAmount fuelType");
        return {
            success: true,
            data,
            message: "you are on home page",
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

async function allVendors(req) {
    try {
        const page = req.query.pageNum
        console.log("page ", page)
        const limit = 2
        const skip = (page - 1) * limit;
        const pipeline = [
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "userId",
                    as: "vendors"
                }
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: "$vendors" }, 0] }
                }
            },
            {
                $project: {
                    address: 1,
                    name: { $concat: ["$firstName", " ", "$lastName"] },
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]
        const vendors = await Model.user.aggregate(pipeline)
        return {
            success: true,
            message: "all vendords are fetched",
            data: vendors,
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

async function brandsOfCategory(req) {
    try {
        const id = req.query.id;
        const category = await Model.category.findById(id)
        if (!category) {
            return {
                success: false,
                message: messages.CATEGORY_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        const pipeline = [{
            $lookup: {
                from: "categories",
                localField: "categoryid",
                foreignField: "_id",
                as: "brands"
            }
        },
        {
            $project: {
                name: 1
            }
        }
        ]
        const brands = await Model.brand.aggregate(pipeline)
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

module.exports = { dashboard, allVendors, brandsOfCategory }