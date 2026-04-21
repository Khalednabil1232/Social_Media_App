import express from "express"
import type { NextFunction, Request, Response } from "express"
import cors from "cors"
import helmet from "helmet"
import { rateLimit } from 'express-rate-limit'
import { PORT, WHITLIST } from "./config/config.service"
import successResponse from "./common/utils/success_respons/success.respons"
import  { AppError, error_handler } from "./common/utils/global-error/global-error-handler"
import checkConnectionDB from "./DB/connectionDB"
import authRouter from "./modules/auth/auth.controller"
import redisService from "./common/service/redis.service"

const app:express.Application = express()
const port:number = Number(PORT)

const boootstrap = async ()=>
{

    const limiter = rateLimit({
        windowMs:60 * 5 * 1000,
        limit:20,
        message:"Game Over",
        requestPropertyName: "rate_limit",
            handler:(req: Request , res: Response , next:NextFunction)=>
            {
                throw new AppError("Requests limit reached. Try again later.", 429)
            },
            skipFailedRequests:false,
            legacyHeaders:false

    }) 

    const corsOptions = {
origin: function (origin:any, callback:any) {

    if([...WHITLIST ,undefined].includes(origin))
    {
        callback(null , true)
    }else
    {
        callback(new Error("not allow by cors"))
    }
    
}}

    app.use(express.json())
    app.use(cors(corsOptions) , helmet() , limiter)

    await checkConnectionDB()
    await redisService.connect()
    

    app.get("/", (req: Request, res: Response, next: NextFunction) => {
        successResponse({ res, data: "welcome to social media app..👻❤"  , status:201 , message: "doone"})
    })

    app.use("/auth" , authRouter)


    app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
        throw new AppError(`Url ${req.originalUrl} Not Foun`, 408)
    })

    app.use(error_handler)

    app.listen(port , ()=>
    {
        console.log(`Server is running on port ${port}......👻`);
    })

}

export default boootstrap