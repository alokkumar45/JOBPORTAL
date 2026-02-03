import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import multer from "multer";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: [3, "Name must contain at least 3 characters."],
        maxLength: [30, "Name cannot exceed 30 characters."]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email."]
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return validator.isMobilePhone(v);
            },
            message: "Please provide a valid phone number."
        }
    },
    address: {
        type: String,
        required: true
    },
    niches: {
        firstNiche: String,
        secondNiche: String,
        thirdNiche: String
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password must contain at least 8 characters."],
        maxLength: [32, "Password cannot exceed 32 characters."],
        select: false
    },
    resume: {
        public_id: String,
        url: String
    },
    coverLetter: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ["Job Seeker", "Employer"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);5
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET || "your_jwt_secret_key",
        {
            expiresIn: process.env.JWT_EXPIRE || "7d" 
        }
    );
};



userSchema.methods.getJWTToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "7d" } 
    );
};

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

export const User = mongoose.model("User", userSchema);