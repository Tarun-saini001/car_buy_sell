const { default: mongoose } = require("mongoose");
const { product, category } = require(".");
const { messages } = require("../messages/en");
const Model = require("../models");
const { pipeline } = require("nodemailer/lib/xoauth2");
const stripe = require("../utils/stripe");

async function newCar(data) {
    try {
        // const{carName,categoryid, brandId, otherSpecifications,registrationNumber,
        //      carModel,engineDetails,location, latitude,longitude, carAvailability,
        //      contactNumber,totalPrice, description}=data;
        const existingProduct = await Model.product.findOne({ registrationNumber: data.registrationNumber });
        if (existingProduct) {
            return {
                success: false,
                message: messages.CAR_EXISTS,
                status: "validation"
            }
        }

        const product = new Model.product(data)
        await product.save();
        return {
            success: true,
            message: messages.CAR_ADDED,
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

async function seeCars(req) {
    try {
        const query = {};
        if (req.query.minPrice || req.query.maxPrice) {
            if (req.query.minPrice) {
                query.totalPrice = { $lte: req.query.minPrice }
            }
            if (req.query.maxPrice) {
                query.totalPrice = { $lte: req.query.maxPrice }
            }
        }
        if (req.query.fuel) {
            query.fuelType = req.query.fuel
        }
        if (req.query.category) {
            query.categoryid = req.query.category
        }
        if (req.query.brand) {
            query.brandId = req.query.brand
        }
        const products = await Model.product.find(query);
        return {
            success: true,
            message: messages.ALL_CARS_FETCHED,
            data: products,
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

async function updatedCar(req) {
    try {
        const id = req.params.id;
        const data = req.body;
        console.log("data : ", data)
        const product = await Model.product.findByIdAndUpdate(id, { $set: data }, { new: true })
        console.log("product", product)
        if (!product) {
            return {
                success: false,
                message: messages.CAR_NOT_FOUND,
                status: "recordNotFound"
            }
        }

        return {
            success: true,
            message: messages.CAR_UPDATED_SUCCESSFULLY,
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

async function removeCar(req) {
    try {
        const id = req.params.id;
        const removedProduct = await Model.product.findByIdAndDelete(id);
        if (!removedProduct) {
            return {
                success: false,
                message: messages.CAR_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.CAR_DELETE_SUCCESSFULLY,
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

async function carDetails(req) {
    try {
        const userId = req.user._id;
        console.log('userId: ', userId);
        const id = req.params.id;
        const pipeline = [
            {
                $match: { productId: new mongoose.Types.ObjectId(id) }
            },
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: 1 },
                    averageRating: { $avg: "$rating" }
                }
            },
            //  {
            //     $match:{ productId : new mongoose.Types.ObjectId(id) , userId:user_id}
            // },

        ]

        const pipeline2 = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    let: { productId: "$_id" },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$productId", "$$productId"] },
                                    { $eq: ["$userId", userId] }
                                ]
                            }
                        }
                    }],
                    as: "userRating"
                }
            },
            {
                $addFields: {
                    isRated: { $gt: [{ $size: "$userRating" }, 0] },
                }
            },
            {
                $project: {
                    isRated: 1,
                    //userRating: 1
                }
            }
        ]
        const [car, ratings, isRated] = await Promise.allSettled([
            await Model.product.findById(id),
            await Model.rating.aggregate(pipeline),
            await Model.product.aggregate(pipeline2)
        ])
        const data = {
            car: car.status == "fulfilled" ? car.value : [],
            ratings: ratings.status == "fulfilled" ? ratings.value[0] : {},
            isRated: isRated.status == "fulfilled" ? isRated.value[0] : {}
        }
        return {
            success: true,
            message: messages.CAR_DETAILS,
            data,
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

async function ratings(req) {
    try {
        const user_id = req.user.id
        const { productId, rating, review } = req.body
        if (!rating || !productId) {
            return {
                success: false,
                message: messages.RATING_AND_PRODUCT_ID_REQUIRED,
                status: "unautherized"
            }
        }
        if (rating < 1 || rating > 6) {
            return {
                success: false,
                message: messages.RANGE_OF_RATING,
                status: "validation"
            }
        }

        const existingRating = await Model.rating.findOne({ productId: productId, userId: user_id })
        if (existingRating) {
            existingRating.rating = rating;
            if (review !== undefined) {
                existingRating.review = review
            }
            await existingRating.save();
            return {
                success: true,
                message: messages.RATING_UPDATED_SUCCESSFULL,
                status: "success"
            }
        }

        const newRating = new Model.rating({ productId: productId, userId: user_id, rating: rating, review: review })
        await newRating.save()
        return {
            success: true,
            message: messages.RATING_SAVED,
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

async function listOfRating(req) {
    try {
        const id = req.query.id;
        const pipeline = [
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "list"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    rating: 1,
                    review: 1,
                    fullName: {
                        $concat: ["$user.firstName", " ", "$user.lastName"]
                    },
                    createdAt: 1
                }
            }
        ]
        const list = await Model.rating.aggregate(pipeline)
        return {
            success: true,
            message: messages.RATING_LIST_FETCHED,
            data: list,
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

async function addWishlist(req) {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const likedProduct = await Model.wishlist.findOneAndUpdate(
            { productId },
            { $set: { userId: userId, productId: productId } },
            { upsert: true, new: true }
        );
        await likedProduct.save();
        return {
            success: true,
            message: messages.ADDED_TO_WISHLIST,
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

async function wishlist(req) {
    try {
        const userId = req.user._id;
        // const list = await Model.wishlist.find({userId:userId});
        // if(!list){
        //     return{
        //         success:false,
        //         message:messages.CAR_NOT_FOUND,
        //         status:"recordNotFound"
        //     }
        // }
        const pipeline = [
            {
                $lookup: {
                    from: "ratings",
                    let: { productId: "$productId" },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ["$productId", "$$productId"] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            averageRating: { $avg: "$rating" }
                        }
                    }],
                    as: "rating"
                }
            },
            {
                $unwind: {
                    path: "$rating",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $project: {

                    averageRating: "$rating.averageRating",

                    product: {
                        carName: 1,
                        totalPrice: 1,
                        trialAmount: 1
                    },

                }
            }
        ]
        const data = await Model.wishlist.aggregate(pipeline);
        return {
            success: true,
            message: messages.WISHLIST_FETCHED_SUCCESSFULLY,
            data,
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

async function buyCar(req) {
    try {
        const id = req.user._id;
        const { productId, curr } = req.body;
        let car = await Model.product.findById(productId);
        if (!car) {
            return {
                success: false,
                message: messages.CAR_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        console.log("car", car)
        const amt = car.totalPrice;

        let stripeCustomerId;
        if (!req.user.stripeCustomerId) {
            const name = `${req.user.firstName} ${req.user.lastName}`
            const customerId = await stripe.createCustomer(name, req.user.email);
            stripeCustomerId = customerId.id
            await Model.user.findByIdAndUpdate(id, { $set: { stripeCustomerId } }, { new: true })
        } else {
            stripeCustomerId = req.user.stripeCustomerId
        }
        console.log("stripeCustomerId", stripeCustomerId)
        const paymentIntent = await stripe.createPaymentIntent(amt, curr, ["card"], stripeCustomerId, id);
        console.log("paymentIntent", paymentIntent)
        const transaction = await Model.transaction.create({
            userId: id,
            amount: paymentIntent.amount,
            paymentType: "buyCar",
            paymentId: paymentIntent.id
        })
        console.log('transaction: ', transaction);
        return {
            success: true,
            message: messages.PAYMENT_INTENT_SUCCESSFULL,
            data: paymentIntent.client_secret,
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

async function webhooks(request) {
    let data = await stripe.Webhook(request);
    //  console.log('data service: ', data);
    return data;
}

async function transactionList(req) {
    try {
        const id = req.user._id;
        const transaction = await Model.transaction.find({
            userId: id,
            status: { $in: [3, 4] }
        })
        console.log('transaction: ', transaction);
        if (!transaction) {
            return {
                success: false,
                message: messages.TRANSACTION_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.TRANSACTIONS_FETCHED,
            data: transaction,
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

async function refund(req) {
    try {
        const { paymentIntentId, amount } = req.body;
        const paymentIntent = await stripe.paymentIntentData(paymentIntentId);
        console.log('paymentIntent: ', paymentIntent);
        const chargeId = paymentIntent.latest_charge
        console.log('chargeId: ', chargeId);
        const refund = await stripe.createRefund(chargeId, amount)
        console.log('refund: ', refund);
        return {
            success: true
        }

    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

async function createSubscription(req) {
    try {
        const userId = req.user._id;
        const { name, amount, interval, curr } = req.body;
        if (!name || !amount || !interval) {
            return ({
                success: false,
                message: messages.PROVIDE_NAME_AMOUNT_DURATION,
                status: "recordNotfound"
            });
        }
        const product = await stripe.createProduct(name);
        const productId = product.id
        const price = await stripe.createRecurringPrice(amount, curr, interval, productId);
        // console.log('price: ', price);
        const priceId = price.id;

        const subscription = await Model.subscription.create({
            name,
            amount,
            interval,
            userId,
            stripePriceId: priceId,
            stripeProductId: productId
        })
        return {
            success: true,
            message: messages.SUBSCRIPTION_CREATED,
            data: subscription,
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

async function subscriptionList(req) {
    try {
        const listOfSubscription = await Model.subscription.find();
        if (!listOfSubscription || listOfSubscription.length == 0) {
            return {
                success: false,
                message: messages.SUBS_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        return {
            success: true,
            message: messages.SUBS_FETCHED,
            data: listOfSubscription,
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

async function buySubscription(req) {
    try {
        const id = req.user._id;
        const { subscriptionId, curr } = req.body;
        if (!subscriptionId) {
            return {
                success: false,
                message: messages.SUBS_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        const subscription = await Model.subscription.findById({ _id: subscriptionId })
        if (!subscription) {
            return {
                success: false,
                message: messages.SUBS_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        let stripeCustomerId;
        if (!req.user.stripeCustomerId) {
            const name = `${req.user.firstName} ${req.user.lastName}`
            const customerId = await stripe.createCustomer(name, req.user.email);
            stripeCustomerId = customerId.id
            await Model.user.findByIdAndUpdate(id, { $set: { stripeCustomerId } }, { new: true })
        } else {
            stripeCustomerId = req.user.stripeCustomerId
        }

        priceId = subscription.stripePriceId
        const session = await stripe.createCheckoutSession(stripeCustomerId, priceId, id, subscriptionId)
        console.log('session: ', session);
        return {
            success: true,
            message: messages.CHECKOUT_SESSION_CREATED,
            data: session.url,
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

async function upgradeSubscription(req) {
    try {
        const { updatedPlanId, subscriptionId } = req.body;
        const userId = req.user._id
        console.log("subscriptionId", subscriptionId);
        const user = await Model.user.findById(userId);
        if (!user || !user.stripeCustomerId) {
            return {
                success: false,
                message: messages.USER_OR_STRIPECUSTOMER_NOT_FOUND,
                status: "recordNotFound"
            }
        }
        const subscription = await Model.subscription.findById(subscriptionId);
        const finalSubscription = await Model.subscription.findById(updatedPlanId);
        const newPriceId = finalSubscription.stripePriceId
        console.log('subscription: ', subscription);

        const plan = await Model.subsHistory.findOne({
            userId: userId,
            status: "active",
            stripeSubscriptionId: subscription.stripeSubscriptionId
        })
        console.log('plan: ', plan);
        if (!plan) {
            return {
                success: false,
                message: messages.NO_ACTIVE_PLAN,
                status: "recordNotFound"
            }
        }
        const subsHistory = await stripe.getSubscriptionDetails(plan.stripeSubscriptionId);
        console.log('plan.stripeSubscriptionId: ', plan.stripeSubscriptionId);
        console.log('subsHistory: ', subsHistory);
        const updatedSubscription = await stripe.upgradeSubscription(subsHistory, newPriceId)
        console.log('updatedSubscription: ', updatedSubscription);

        // const fullSubscriptionDetails = await stripe.fullSubscriptionDetails(updatedSubscription.id);
        // console.log('fullSubscriptionDetails: ', fullSubscriptionDetails);

        // await Model.subsHistory.create({
        //     userId: userId,
        //     stripeSubscriptionId: updatedSubscription.parent?.subscription_details?.subscription,
        //     current_period_end: new Date(fullSubscriptionDetails.period_end * 1000),
        //     status: updatedSubscription.status,
        // });

        return ({
            success: true,
            message: messages.SUBS_UPGRADE,
            // data: updatedSubscription,
            status: "success"
        });
    } catch (error) {
        return {
            success: false,
            message: error.message || "something went wrong",
            status: "internalServerError"
        }
    }
}

module.exports = {
    newCar, seeCars, updatedCar, removeCar, carDetails, ratings, listOfRating, addWishlist,
    wishlist, buyCar, webhooks, transactionList, refund, createSubscription, subscriptionList, buySubscription, upgradeSubscription
}