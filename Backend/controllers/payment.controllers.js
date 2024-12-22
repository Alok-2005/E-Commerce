import Coupon from "../models/coupon.model.js";
import dotenv from "dotenv";
import twilio from "twilio";
import User from "../models/user.model.js"; // Import the User model
dotenv.config()
import { stripe } from "../lib/stripe.js"; 
import Order from "../models/order.model.js";
import { clearCartFromDB } from "../controllers/cart.controllers.js";


export const createCheckoutSession=async(req,res)=>{
 try {
    const {products,couponCode}=req.body
    if(!Array.isArray(products) || products.length===0){
        return res.status(400).json({message:"No products provided"});
    } 
    let totalAmount=0
    const lineItems=products.map(product=>{
        const amount=Math.round(product.price*100 )   //stripe want us to send amount in percentage format
        totalAmount+=amount*product.quantity

        return{
            price_data:{
                currency:"usd",
                product_data:{
                    name:product.name,
                    images:[product.image],
        },
        unit_amount:amount
    },
    quantity:product.quantity ||1,
    }
    })

    let coupon=null
    if(couponCode){
    coupon= await Coupon.findOne({code:couponCode,userId:req.user._id,isActive:true})     
    if(coupon){
        totalAmount-=totalAmount*(coupon.discountPercentage/100)
    }
    }
const session=await stripe.checkout.sessions.create({
    payment_method_types:["card"],
    line_items:lineItems,
    mode:"payment",
    success_url:`${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:`${process.env.CLIENT_URL}/purchase-cancel`,
    discounts:coupon
    ? [
{
coupon: await createStripeCoupon(coupon.discountPercentage), 
},

    ]:[],

    metadata:{
        userId:req.user._id.toString(),
        couponCode:couponCode || "",
        products:JSON.stringify(
            products.map((p)=>({
               id:p._id,
               quantity:p.quantity,
             price:p.price,
            }))
        ),
        
    }

})

if(totalAmount>=2000){
    await createNewCoupon(req.user._id)
}
res.status(200).json({id:session.id,totalAmount:totalAmount/100})
 } catch (error) {
    console.log("Error in creating checkout session: ",error);
    res.status(500).json({message:"Server error",error:error.message})
 }   
}
 
async function createStripeCoupon(discountPercentage) {
        const coupon=await stripe.coupons.create({
            percent_off:discountPercentage,
            duration:"once",
        })
        return coupon.id
}


async function createNewCoupon(userId) {
    await Coupon.findOneAndDelete({userId})
 const newCoupon=new Coupon({
    code:"GIFT"+Math.random().toString(36).substring(2,8).toUpperCase(),
    discountPercentage:10,
    expirationDate:new Date(Date.now()+30*24*60*60*1000),  //30 days from now
    userId:userId
 })
await newCoupon.save()
return newCoupon
}





// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const checkoutSuccess = async (req, res) => {
  try {
      const { sessionId } = req.body;
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Fetch user details from the database
      const user = await User.findById(session.metadata.userId);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      console.log("Session object:", session);
      console.log("User fullPhoneNumber:", user?.fullPhoneNumber);
      console.log("Payment status:", session.payment_status);

      if (session.payment_status === "paid") {
          // Existing successful payment logic
          if (session.metadata.couponCode) {
              await Coupon.findOneAndUpdate(
                  { code: session.metadata.couponCode, userId: session.metadata.userId },
                  { isActive: false }
              );
          }

          const products = JSON.parse(session.metadata.products);
          const newOrder = new Order({
              user: session.metadata.userId,
              products: products.map(product => ({
                  product: product.id,
                  quantity: product.quantity,
                  price: product.price,
              })),
              totalAmount: session.amount_total / 100,
              stripeSessionID: sessionId,
          });
          await newOrder.save();
          await clearCartFromDB(session.metadata.userId);

          // Send thank you call
          if (user.fullPhoneNumber) {
              try {
                  await client.calls.create({
                      twiml: `<Response><Say>Thank you, ${user.name}, for shopping with us! Your order has been placed successfully. We look forward to serving you again.</Say></Response>`,
                      to: user.fullPhoneNumber,
                      from: process.env.TWILIO_PHONE_NUMBER,
                  });
              } catch (callError) {
                  console.error("Error sending Twilio call:", callError.message);
              }
          }

          res.status(200).json({
              success: true,
              message: "Payment successful, order placed successfully, coupon deactivated if used, and call sent to the user",
              orderId: newOrder._id,
          });

      } else {
          // Handle all non-successful payment statuses
          const failureStatus = session.payment_status;
          let failureMessage = "";

          switch (failureStatus) {
              case "canceled":
                  failureMessage = "Your payment was canceled.";
                  break;
              case "failed":
                  failureMessage = "Your payment failed to process.";
                  break;
              case "expired":
                  failureMessage = "Your payment session expired.";
                  break;
              case "unpaid":
                  failureMessage = "Your payment is pending or incomplete.";
                  break;
              default:
                  failureMessage = "There was an issue with your payment.";
          }

          // Send SMS for any failed payment status
          if (user.fullPhoneNumber) {
              try {
                  const message = await client.messages.create({
                      body: `Dear ${user.name}, ${failureMessage} If this was a mistake, please try again or contact support for assistance.`,
                      to: user.fullPhoneNumber,
                      from: process.env.TWILIO_PHONE_NUMBER,
                  });

                  console.log("Twilio message sent:", message);
              } catch (smsError) {
                  console.error("Error sending Twilio SMS:", smsError.message);
              }
          }

          res.status(400).json({
              success: false,
              message: `${failureMessage} SMS notification sent to the user.`,
          });
      }
  } catch (error) {
      console.log("Error in checkoutSuccess:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};
  

