// middlewares/auth.js or similar
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import multer from "multer";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;
    
    if (!token) {
        return next(new ErrorHandler("User not authenticated", 401));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    next();
});

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    }
};