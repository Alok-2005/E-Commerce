import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, "Please Enter Your Phone Number"],
        trim: true
    },
    countryCode: {
        type: String,
        required: [true, "Please Select Country Code"],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\+\d+$/.test(v);
            },
            message: props => `${props.value} is not a valid country code!`
        }
    },
    fullPhoneNumber: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    cartItems: [{
        quantity: {
            type: Number,
            default: 1,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    }],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    }
}, {
    timestamps: true,
});

// Pre-save hook to generate fullPhoneNumber
userSchema.pre("save", async function(next) {
    // Generate fullPhoneNumber by combining countryCode and phone
    if (this.isModified('phone') || this.isModified('countryCode')) {
        this.fullPhoneNumber = `${this.countryCode}${this.phone}`;
    }

    // Hash password if modified
    if (this.isModified("password")) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Add index to ensure fullPhoneNumber is unique and not null
userSchema.index({ fullPhoneNumber: 1 }, { 
    unique: true,
    sparse: true // This ensures that null values don't trigger uniqueness constraint
});

userSchema.methods.comparePasswords = async function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;