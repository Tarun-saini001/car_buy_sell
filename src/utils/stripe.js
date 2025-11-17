const stripe = require("stripe");
const Model = require("../models");
const { default: mongoose } = require("mongoose");
const client = stripe(process.env.STRIPE_SECRET_KEY);

const createCustomer = async (name, email) => {
    const customer = await client.customers.create({
        name,
        email
    })
    return customer
}

const createPaymentIntent = async (amt, curr, p_method, customerId, id) => {
    const paymentIntent = await client.paymentIntents.create({
        amount: Math.round(amt * 100),
        currency: curr || "INR",
        payment_method_types: p_method || ["card"],
        customer: customerId,
        metadata: { userId: id.toString() }
    })
    console.log('paymentIntent: ', paymentIntent);
    return paymentIntent
}

const paymentIntentData = async (paymentIntentId) => {
    const paymentIntent = await client.paymentIntents.retrieve(paymentIntentId, { expand: ["charges"], }
    )
    return paymentIntent
}

const createRefund = async (chargeId, amount) => {
    try {
        const refunData = {
            charge: chargeId,
            reason: "requested_by_customer"
        }
        if (amount) {
            refunData.amount = Math.round(amount * 100);
        }
        const refund = await client.refunds.create(refunData);
        return refund
    } catch (error) {
        console.log("something went wrong in createRefund function in stripe.js ", error.message)
    }

}

const createProduct = async (name) => {
    try {
        const product = await client.products.create({
            name: name
        })
        return product
    } catch (error) {
        console.log("something went wrong in createProduct function in stripe.js ", error.message)
    }
}

const createRecurringPrice = async (amount, curr, interval, productId) => {
    try {

        const price = await client.prices.create({
            unit_amount: amount * 100,
            currency: curr,
            recurring: { interval: interval },
            product: productId,
        });

        console.log("Recurring price created:", price.id);
        return price;
    } catch (error) {
        console.log("something went wrong in createRecurringPrice function in stripe.js ", error.message)
    }
}

// const createOneTimeSubscription = async (stripeCustomerId, priceId) => {
//     try {
//         const subscription = await client.subscriptions.create({
//             customer: stripeCustomerId,
//             items: [{ price: priceId }],
//             payment_behavior: "default_incomplete",
//             collection_method: "charge_automatically",
//             expand: ["latest_invoice.payment_intent"],
//             default_payment_method: "pm_xxx",
//         })
//         return subscription
//     } catch (error) {
//         console.log("something went wrong in createOneTimeSubscription function in stripe.js ", error.message)
//     }
// }

const createCheckoutSession = async (stripeCustomerId, priceId, userId, subscriptionId) => {
    try {
        const session = await client.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "https://example.com/cancel",
            metadata: {
                userId: userId.toString(),
                subsPlanId: subscriptionId.toString()
            },
        });
        return session
    } catch (error) {
        console.log("something went wrong in createCheckoutSession function in stripe.js ", error.message)
    }
}
const getSubscriptionDetails = async (stripeSubscriptionId) => {
    try {
        const subsHistory = await client.subscriptions.retrieve(stripeSubscriptionId);
        return subsHistory;
    } catch (error) {
        console.log("something went wrong in getSubscripionDetails function in stripe.js ", error.message)
    }
}
const upgradeSubscription = async (subsHistory, newPriceId) => {
    try {
        const updatedSubscription = await client.subscriptions.update(subsHistory.id, {
            cancel_at_period_end: false, // immediately switch to new plan
            proration_behavior: "always_invoice", // charge the difference
            items: [
                {
                    id: subsHistory.items.data[0].id,
                    price: newPriceId, // new plan price id
                },
            ],
        });

        return updatedSubscription
    } catch (error) {
        console.log("something went wrong in upgradeSubscription function in stripe.js ", error.message)
    }
}

const fullSubscriptionDetails = async (id) => {
    try {
        const fullSubscriptionDetails = await client.subscriptions.retrieve(id, {
            expand: [
                "latest_invoice",
                'latest_invoice.subscription_details',
                'items.data.price.product'
            ],
        });
        return fullSubscriptionDetails;
    } catch (error) {
        console.log("something went wrong in fullSubscriptionDetails function in stripe.js ", error.message)
    }
}

const Webhook = async (request) => {
    let event;

    if (process.env.END_POINT_SECRETE) {
        // Get the signature sent by Stripe
        const signature = request.headers['stripe-signature'];
        try {
            event = client.webhooks.constructEvent(
                request.body,
                signature,
                process.env.END_POINT_SECRETE
            );
        } catch (err) {
            console.log(`⚠️ Webhook signature verification failed.`, err.message);
            return {
                success: false,
                message: err.message || "Webhook signature verification failed",
                status: "internalServerError"
            }
        }
        // Handle the event
        console.log("event type", event.type)
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntentSucc = event.data.object;
                console.log('paymentIntentSucc: ', paymentIntentSucc);
                const transaction = await Model.transaction.findOneAndUpdate(
                    { paymentId: paymentIntentSucc.id },
                    { $set: { status: 3 } },
                    { new: true })
                console.log('transaction: ', transaction);
                // Then define and call a method to handle the successful payment intent.
                // handlePaymentIntentSucceeded(paymentIntent);
                console.log("payment successfull")

                return {
                    success: true,
                    // message: "payment successfull",
                    // data: paymentIntentSucc,
                    // status: "success"
                }
                break;
            // case 'payment_method.attached':
            //     const paymentMethod = event.data.object;
            //     // Then define and call a method to handle the successful attachment of a PaymentMethod.
            //     // handlePaymentMethodAttached(paymentMethod);
            //     break;
            case 'payment_intent.payment_failed':
                const paymentIntentFailed = event.data.object;
                const transaction1 = await Model.transaction.findOneAndUpdate(
                    { paymentId: paymentIntentFailed.id },
                    { $set: { status: 4 } },
                    { new: true })
                console.log('transaction1: ', transaction1);
                console.log("payment failed")

                return {
                    success: false,
                    // message: "payment failed",
                    // data: paymentIntentFailed,
                    // status: "validation"
                }
            case 'payment_intent.created':
                const paymentIntentCreated = event.data.object;
                const transaction2 = await Model.transaction.findOneAndUpdate(
                    { paymentId: paymentIntentCreated.id },
                    { $set: { status: 1 } },
                    { new: true })
                console.log('transaction2: ', transaction2);
                console.log("payment intent created")
                return {
                    success: true,
                    message: "payment intent created",
                    data: paymentIntentCreated,
                    status: "success"
                }
            case 'payment_intent.canceled':
                const paymentIntentCanceled = event.data.object;
                const transaction3 = await Model.transaction.findOneAndUpdate(
                    { paymentId: paymentIntentCanceled.id },
                    { $set: { status: 2 } },
                    { new: true })
                console.log('transaction3: ', transaction3);
                console.log("payment canceled")
                return {
                    success: true,
                    // message: "payment canceled",
                    // data: paymentIntentCanceled,
                    // status: "validation"
                }
            case 'charge.refunded':
                const chagreRefunded = event.data.object;
                console.log("refund successfull");
                return {
                    success: true
                }
            case 'refund.created':
                const refundCreated = event.data.object;
                console.log("refund created");
                return {
                    success: true
                }
            case 'refund.failed':
                const refundFailed = event.data.object;
                console.log("refund failed");
                return {
                    success: true
                }
            case 'refund.updated':
                const refundUpdated = event.data.object;
                console.log("refund  updated");
                return {
                    success: true
                }
            case 'checkout.session.async_payment_failed':
                const sessionFailed = event.data.object;
                console.log("session payment failed");
                return {
                    success: true
                }
            case 'checkout.session.async_payment_succeeded':
                const sessionSucceeded = event.data.object;
                console.log("session payment succeeded");
                return {
                    success: true
                }
            case 'checkout.session.completed':
                const sessionCompleted = event.data.object;
                console.log('sessionCompleted -------: ', sessionCompleted);
                try {
                    // ✅ Use correct variable name
                    const userId = sessionCompleted.metadata?.userId; // Make sure you sent this metadata when creating the checkout session
                    const paymentIntentId = sessionCompleted.payment_intent;
                    const subscriptionId = sessionCompleted.metadata?.subsPlanId;
                    const stripeSubscriptionId = sessionCompleted.subscription // ✅ corrected
                    const amount = sessionCompleted.amount_total / 100;

                    if (!userId) {
                        console.log("⚠️ Missing userId in session metadata");
                        break;
                    }

                    const plan = await Model.subscription.findByIdAndUpdate(subscriptionId,
                        { $set: { stripeSubscriptionId: stripeSubscriptionId } },
                        { new: true })
                    console.log('plan: ', plan);

                    // const subsTransaction = await Model.transaction.create({
                    //     userId,
                    //     amount,
                    //     paymentType: "recurring subscription", // ✅ updated
                    //     paymentId: paymentIntentId,
                    //     subscriptionId,
                    //     status: 3, // success
                    // });

                    // console.log('✅ subsTransaction created:', subsTransaction);
                } catch (err) {
                    console.error("❌ Error creating subsTransaction:", err.message);
                }

                console.log("session completed");
                return { success: true };
            //     const sessionCompleted = event.data.object;
            //     console.log('sessionCompleted: ', sessionCompleted);

            //     const userId = sessionCompleted.metadata.userId; 
            //     const paymentIntentId = sessionCompleted.payment_intent;
            //     const subscriptionId = session.subscription;
            //     const amount = sessionCompleted.amount_total / 100;

            //    const subsTransaction= await Model.transaction.create({
            //        userId,
            //        amount,
            //        paymentType: "one time subscription",
            //        paymentId: paymentIntentId,
            //        subscriptionId,
            //        status: 3,
            //     });
            //     console.log('subsTransaction: ', subsTransaction);
            //     console.log("session completed");
            //     return {
            //         success: true
            //     }
            case 'checkout.session.expired':
                const sessionExpired = event.data.object;
                console.log("session expired");
                return {
                    success: true
                }
            case 'subscription_schedule.canceled':
                const subCanceled = event.data.object;
                console.log("subscription schedule canceled");
                return {
                    success: true
                }
            case 'subscription_schedule.completed':
                const subCompleted = event.data.object;
                console.log("subscription schedule completed");
                return {
                    success: true
                }
            case 'subscription_schedule.created':
                const subCreated = event.data.object;
                console.log("subscription schedule created");
                return {
                    success: true
                }
            case 'subscription_schedule.expiring':
                const subExpired = event.data.object;
                console.log("subscription schedule expired");
                return {
                    success: true
                }
            case 'subscription_schedule.updated':
                const subUpdated = event.data.object;
                console.log("subscription schedule updated");
                return {
                    success: true
                }
            case 'invoice_payment.paid':
                const invoicePaid = event.data.object;
                console.log("invoice payment  paid successfully");
                return {
                    success: true
                }
            case 'invoice.voided':
                const invoiceVoid = event.data.object;
                console.log("invoice voided");
                return {
                    success: true
                }
            case 'invoice.updated':
                const invoiceUpdated = event.data.object;
                console.log("invoice updated");
                return {
                    success: true
                }
            case 'invoice.payment_succeeded':
                const invoice = event.data.object;
                console.log('invoice (invoice payment succeeded): ', invoice);
                console.log("Invoice payment succeeded:", invoice.id);
                // This is the auto-renew event
                const customerId = invoice.customer;
                const subscriptionId = invoice.parent?.subscription_details?.subscription;
                console.log('subscriptionId (inside invoice payment succeed): ', subscriptionId);

                const amount = invoice.amount_paid / 100;
                const periodStart = new Date(invoice.lines.data[0]?.period?.start * 1000);
                const periodEnd = new Date(invoice.lines.data[0]?.period?.end * 1000);
                // Find user by stripeCustomerId (you should store this during initial setup)
                const user = await Model.user.findOne({ stripeCustomerId: customerId });
                if (!user) {
                    console.log("⚠️ No user found for customer:", customerId);
                    break;
                }

                const reason = invoice.billing_reason;
                if (reason == 'subscription_create') {
                    await Model.transaction.create({
                        userId: user._id,
                        amount,
                        paymentType: "recurring subscription",
                        paymentId: invoice.payment_intent,
                        subscriptionId,
                        status: 3,
                    });

                    // Create new subscription history record for this renewal
                    const subsCreated = await Model.subsHistory.create({
                        userId: user._id,
                        stripeSubscriptionId: subscriptionId,
                        amount,
                        current_period_start: periodStart,
                        current_period_end: periodEnd,
                        status: "active",
                    });
                    console.log('subsCreated: ', subsCreated);
                    console.log("♻️ Subscription created successfully for user:", user._id);
                }
                else if (reason == 'subscription_cycle') {
                    // Create renewal transaction
                    await Model.transaction.create({
                        userId: user._id,
                        amount,
                        paymentType: "recurring subscription renewal",
                        paymentId: invoice.payment_intent,
                        subscriptionId,
                        status: 3,
                    });

                    // Create new subscription history record for this renewal
                    const subsRenew = await Model.subsHistory.create({
                        userId: user._id,
                        stripeSubscriptionId: subscriptionId,
                        amount,
                        current_period_start: periodStart,
                        current_period_end: periodEnd,
                        status: "active",
                    });
                    console.log('subsRenew: ', subsRenew);
                    console.log("♻️ Subscription renewed successfully for user:", user._id);
                }
                else if (reason == 'subscription_update') {
                    await Model.transaction.create({
                        userId: user._id,
                        amount,
                        paymentType: "recurring subscription renewal",
                        paymentId: invoice.payment_intent,
                        subscriptionId,
                        status: 3,
                    });

                    const subsHistory = await client.subscriptions.retrieve(subscriptionId);
                    console.log('subsHistory(webhook): ', subsHistory);
                    const updatedHistory = await Model.subsHistory.findOneAndUpdate(
                        { userId: user._id, stripeSubscriptionId: subscriptionId },
                        { $set: { amount: subsHistory.plan.amount / 100 } },
                        { new: true, upsert: true }
                    );
                    console.log('updatedHistory: ', updatedHistory);
                    console.log("♻️ Subscription renewed successfully for user:", user._id);
                }
                return { success: true };
                

            case 'customer.subscription.updated':
                const subscription = event.data.object;
                console.log("inside (customer.subscription.updated)", subscription);
                const userr = await Model.user.findOne({ stripeCustomerId: subscription.customer });

                await SubsHistory.findOneAndUpdate(
                    { userId: userr._id, stripeSubscriptionId: subscription.id },
                    {
                        $set: {
                            amount: subscription.items.data[0].price.unit_amount / 100,
                            current_period_start: new Date(subscription.current_period_start * 1000),
                            current_period_end: new Date(subscription.current_period_end * 1000),
                            status: subscription.status,
                        },
                    },
                    { new: true, upsert: true }
                );
                 return { success: true };
                
            case 'invoice.payment_failed':
                const invoicePaymentFail = event.data.object;
                console.log("invoice payment failed");
                return {
                    success: true
                }
            case 'invoice.deleted':
                const invoiceDelete = event.data.object;
                console.log("invoice deleted");
                return {
                    success: true
                }
            case 'invoice.created':
                const invoiceCreated = event.data.object;
                console.log('invoiceCreated: ', invoiceCreated);
                console.log("invoice created successfully");
                // const plan = await Model.subscription.findByIdAndUpdate(subscriptionId,
                //         { $set: { stripeSubscriptionId: stripeSubscriptionId } },
                //         { new: true })
                //     console.log('plan: ', plan);
                return {
                    success: true
                }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event

    }
}

module.exports = {
    createCustomer, createPaymentIntent, Webhook, paymentIntentData, createRefund, createProduct, createRecurringPrice, //createOneTimeSubscription
    createCheckoutSession, getSubscriptionDetails, upgradeSubscription, fullSubscriptionDetails
}

// make a payment history model and add pament ID , UPDATE PAYMENT   succeed or failed , refrence of user id of user ,
