import Product from "../models/product.model.js"
import User from "../models/user.model.js"
export const getCartProducts=async(req,res)=>{   // This is an async function for handling the process of fetching cart products for a user.
    try {
        // Step 1: Fetch all products from the database that are in the user's cart.
        // req.user.cartItems contains an array of product IDs (with a possible quantity), 
        // and we use `$in` operator to find products matching those IDs.
        const products=await  Product.find({_id:{$in:req.user.cartItems}})

       // Step 2: After fetching products from the database, we need to map through each product
        // and add the quantity based on the user's cart data (which comes from req.user.cartItems).
        const cartItems = products.map((product)=> {
            // Find the corresponding item in the user's cart (req.user.cartItems).
            // `item` will be the object in the cart containing the product ID and quantity.
             const item=req.user.cartItems.find((cartItem)=>cartItem.id===product.id)

             // Return a new object that includes all properties of the product and adds the `quantity` property.
             return {
                
                 ...product.toJSON(),   // Converts Mongoose document to a plain object.
                 quantity:item.quantity   // Add quantity from the cart item.

             }
        })
        // Step 3: Send the array of cart products as a response to the client.
        res.json(cartItems)
    } catch (error) {
        console.log("Error getting cart products: ",error);
        res.status(500).json({message:"Server error",error:error.message})
    }
}

export const addToCart = async (req, res) => {
try {
    const {productId}=req.body
    const user=req.user

     const existingItem=user.cartItems.find((item)=>item.id===productId)
     if(existingItem){
        existingItem.quantity+=1
     }else{
        user.cartItems.push(productId)
     }

     await user.save()
     res.json(user.cartItems)
} catch (error) {
    console.log("Error adding to cart: ",error); 
    res.status(500).json({message:"Server error",error:error.message})
    
}
}

// This is an async function for handling the removal of products from the user's cart
export const removeAllFromCart=async(req,res)=>{
try {
    // Step 1: Extract the `productID` from the request body.
        // This is the ID of the product that the user wants to remove from their cart.
    const {productId}=req.body

    // Step 2: Get the user from the request object.
        // It's assumed that `req.user` contains the authenticated user's data, including their cart items.
    const user=req.user

    // Step 3: Check if a `productID` is provided in the request body.
        // If no `productID` is given, this means the user wants to clear the entire cart.
    if(!productId){
        user.cartItems=[]
    }
    else{
        // If `productID` is provided, filter out the item from the cart with the given product ID.
            // This removes the item from the user's cart based on its `id`.
        user.cartItems=user.cartItems.filter((item)=>item.id!==productId)

        // The .filter() method is a built-in JavaScript array function that creates a new array by including only the elements that satisfy the condition specified in the callback function

        // item.id: This is the ID of the product in the cart.
// productID: This is the ID of the product that we want to remove from the cart.
// If the condition item.id !== productID evaluates to true, the item remains in the filtered array. If the condition evaluates to false (meaning the current item’s ID matches productID), the item is excluded from the new array.

    }
    await user.save()
    res.json(user.cartItems)

    // the cart is now updated with the filtered list of items, effectively removing the item that had the specified productID.

}
 catch  (error) {
    console.log("Error removing from cart: ",error);
    res.status(500).json({message:"Server error",error:error.message})
}

}

// This is an async function for handling updates to the quantity of a product in the user's cart.
export const updateQuantity = async (req, res) => {
    try {
        // Step 1: Extract the product ID from request parameters and quantity from the request body.
        // The `productID` identifies which product's quantity needs to be updated.
        const { id: productId } = req.params;
        const { quantity } = req.body;

        // Step 2: Get the user from the request object.
        // We assume that `req.user` contains the authenticated user's data, including their cart items.
        const user = req.user;

        // Step 3: Find the existing item in the user's cart that matches the given `productID`.
        const existingItem = user.cartItems.find((item) => item.id === productId);

        // Step 4: Check if the product exists in the cart.
        if (existingItem) {
            // Step 5: If `quantity` is 0, remove the item from the cart.
            if (quantity === 0) {
                // Use `filter()` to remove the item from `cartItems` where `item.id` matches `productID`.
                user.cartItems = user.cartItems.filter((item) => item.id !== productId);
                
                // Save the updated user object to the database after removing the item.
                await user.save();
                
                // Respond with the updated cart after removal.
                return res.json(user.cartItems);
            }

            // Step 6: If quantity is greater than 0, update the `quantity` of the item in the cart.
            existingItem.quantity = quantity;

            // Save the updated user object to the database after updating the quantity.
            await user.save();

            // Send the updated cart to the client.
            res.json(user.cartItems);
        } else {
            // Step 7: If the product was not found in the cart, send a 404 response with a not-found message.
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        // Step 8: Handle any errors that occur during the process.
        // Log the error and send a 500 status response with the error message.
        console.log("Error updating quantity: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// In your cart.controller.js or a separate utility file
export const clearCartFromDB = async (userId) => {
    try {
      const user = await User.findById(userId); // Assuming you're using a User model for the user data
  
      if (user) {
        // Clear the cart items (assuming cartItems is an array in the user schema)
        user.cartItems = [];
        await user.save(); // Save the updated user data with an empty cart
        console.log("Cart cleared from database.");
      } else {
        console.log("User not found, cannot clear cart.");
      }
    } catch (error) {
      console.error("Error clearing cart from DB:", error);
    }
  };
  