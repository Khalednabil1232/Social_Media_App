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
import userModel from "./DB/models/user.model"
import { S3Service } from "./common/service/s3.service"
import { pipeline } from "stream/promises"
import NotificationService from "./common/service/notification.service"


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
        successResponse({ res, data: "welcome to social media app..💬❤️"  , status:201 , message: "doone"})
    })



    app.post("/send-notification", async (req: Request, res: Response, next: NextFunction) => {

        await NotificationService.sendNotification({
            token:req.body.token,
            data:{ 
                title:"Hello from social media app",
                body:"This is a test notification sent from the social media app."}
        })
        console.log({token:req.body.token});
        

    })


    app.get("/upload" , async(req: Request, res: Response, next: NextFunction)=>
    {
        
        const {folderName} = req.query as {folderName:string}
        
        let result = await new S3Service().getFiles(folderName)
        let resultMap = result.Contents?.map((file)=>
        {
            return {Key:file.Key}
        })
        
        
        successResponse({res , data:resultMap})
    })


        app.get("/upload/deleteFile" , async(req: Request, res: Response, next: NextFunction)=>
    {
        
        const {Key} = req.query as {Key:string}
        
        const result = await new S3Service().deleteFile(Key)
        successResponse({res , data:result})
    })


        app.get("/upload/deleteFiles" , async(req: Request, res: Response, next: NextFunction)=>
    {
        
        const {Keys} = req.body as {Keys:string[]}
        
        const result = await new S3Service().deleteFiles(Keys)
        successResponse({res , data:result})
    })


        app.get("/upload/deleteFolder" , async(req: Request, res: Response, next: NextFunction)=>
    {
        
        const {folderName} = req.body as {folderName:string}
        
        const result = await new S3Service().deleteFolder(folderName)
        successResponse({res , data:result})
    })


        app.get("/upload/pre-signed/*path" , async(req: Request, res: Response, next: NextFunction)=>
    {
        const {path} = req.params as {path:string[]}
        const {download} = req.query as {download:string}
        const Key = path.join("/")
        const url = await new S3Service().getPresigneUrl({Key , download:download?download:undefined})
        
        
        successResponse({res , data:url})
    })



    app.get("/upload/*path" , async(req: Request, res: Response, next: NextFunction)=>
    {
        const {path} = req.params as {path:string[]}
        const {download} = req.query
        const Key = path.join("/")
        const result = await new S3Service().getFile(Key)
        const stream = result.Body as NodeJS.ReadableStream
        res.setHeader("Content-Type" , result.ContentType!)
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if(download && download === "true")
        {
            res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`); 
        }
        await pipeline(stream , res)
        
        successResponse({res , data:Key})
    })



    // async function test(){
    //     const user = new userModel({
    //         userName:"khaled Nabil",
    //         email:`khaled${Date.now()}@gmail.com`,
    //         password:"12345678",
    //         age:25,
    //     })
    //     await user.save({validateBeforeSave:true})
    //     user.age = 25
    //     user.password = "552004"
    //     await user.save()
    //     console.log("user created");
        
    // }

    // test()

    // async function test(){
    //     const user = new userModel({
    //         firstName:"khaled",
    //         email:`khaled${Date.now()}@gmail.com`,
    //         age:20
    //     })
    //     await user.updateOne({age:25})
    //     console.log("user updated");
    // }
    // test()

//     async function test() {
//     const user = await userModel.findOne({
//         firstName: "khaled",
//         paranoid: true

        
//     });
    
//     console.log({user});
// }

// test();

    app.use("/auth" , authRouter)


    app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
        throw new AppError(`Url ${req.originalUrl} Not Foun`, 408)
    })

    app.use(error_handler)

    app.listen(port , ()=>
    {
        console.log(`Server is running on port ${port}......⏳✅`);
    })

}

export default boootstrap