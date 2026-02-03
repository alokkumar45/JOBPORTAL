import multer from "multer";
class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode

    }
}
export const errorMiddleware =(err,req,res,next)=>{
    err.statusCode = err.statusCode||500;
    err.message = err.message||"Internal server error."

    if(err.name === "CastError"){
    const message = `Invalid..${err.path}`;
    err = new ErrorHandler(message,400)
    }
    
    if(err.code === 11000){
        const message = `duplicate ${Object.keys(err.keyvalue)} Entered`
        err = new ErrorHandler(message,400)
    }
    if(err.name === "jsonwebTokenError"){
    const message = `json Web token is Invalid, try  again .`;
    err = new ErrorHandler(message,400)
    }
    if(err.name === "TokenExpiredError"){
    const message = `json web Token is expiered ,Try again.`;
    err = new ErrorHandler(message,400)
    }

    return res.status(err.statusCode).json({
        success:false,
        message:err.message,
        
    })
}
export default ErrorHandler