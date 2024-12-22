import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); //get all products from DB
    res.json({ products });
  } catch (error) {
    console.log("Error getting all products: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // First we will check for freatured products in redis
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    // If not in redis, we will fetch from DB
    // .lean to convert Mongoose documents to plain JavaScript objects
    // which is good for performance
    featuredProducts = await Product.find({ isFeatured: true }).lean(); //get all featuredproducts from DB
    if (!featuredProducts) {
      return res.json({ message: "No featured products found" });
    }
    // If featured products are found in DB, we will store them in redis for future quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error getting featured products: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {  //upload image to cloudinary
        folder: "products",
      });
    }

    // also put all the data in DB
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url : "",
      category,
    });
    res.status(201).json(product);
  } catch (error) {
    console.log("Error creating product: ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
try {
    const product=await Product.findById(req.params.id)
    if(!product){
return res.status(404).json({message:"Product not found"})
    }
    if(product.image){
        const publicID=product.image.split("/").pop().split(".")[0]  //this gets the id of image
        try {
            await cloudinary.uploader.destroy(`products/${publicID}`)   //Deletes image from cloudinary
            console.log("Image deleted from cloudinary");
        } catch (error) {
            console.log("Error deleting image from cloudinary: ",error)

        }
    }

    // delete product from DB
    await Product.findByIdAndDelete(req.params.id)
     res.json ({ message: "Product deleted successfully" });
} catch (error) {
    console.log("Error deleting product: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
}
}

export const getRecommendedProducts = async (req, res) => {
try {
    const products = await Product.aggregate([
        {
             $sample:{size:4}    //this will get 3 random remcommended products
        },
        {
            $project:{
                _id:1,
                name:1,
                price:1,
                image:1,
                description:1
            }
        }
    ])
    res.json(products)
} catch (error) {
    console.log("Error getting recommended products: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
}
}

export const getProductByCategory = async (req, res) => {
const {category}=req.params
try {
    const products=await Product.find({category})
    res.json({products})
} catch (error) {
    console.log("Error getting products by category: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
}
}

export const toggleFeaturedProduct = async (req, res) => {
try {
    const product=await Product.findById(req.params.id)
    if(product){
        product.isFeatured=!product.isFeatured
const updatedProduct=await product.save()
await updateFeaturedProductsCache()
res.json(updatedProduct)
    }else{
        res.status(404).json({message:"Product not found"})
    }
} catch (error) {
    console.log("Error toggling featured product: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
}
}
 
async function updateFeaturedProductsCache() {
 try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
 } catch (error) {
     console.log("Error updating featured products cache: ", error);
      
 }
}