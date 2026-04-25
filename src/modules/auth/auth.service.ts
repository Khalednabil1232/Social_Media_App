
import type { NextFunction , Request , Response } from "express"
import successResponse from "../../common/utils/success_respons/success.respons"
import  { Iuser } from "../../DB/models/user.model"
import { IsignupType, confirmeEmailDto, resendOtpDto, signInDto, update_PasswordDto, resetPasswordDto, forgetPasswordDto, forgetPasswordLinkDot, resetPasswordLinkDot, IsignInWithGemailTypes } from './auth.dto';
import { compare_password, hash_password } from "../../common/utils/security/hash_password"
import { HydratedDocument } from "mongoose"
import { AppError } from "../../common/utils/global-error/global-error-handler"
import { providerEnum, RoleEnum } from "../../common/enum/user.enum"
import UserRepository from "../../DB/repositories/user.repository"
import { encrypt } from "../../common/utils/security/encrypt.security"
import { genrateOtp, sendEmail } from "../../common/utils/email/send.email"
import { emailTempalet, emailTempaletLink } from "../../common/utils/email/email.template"
import { eventEmitter } from "../../common/utils/email/email.events"
import { EventEnum } from "../../common/enum/event.enum"
import RedisService from "../../common/service/redis.service";
import { randomUUID} from "crypto";
import TokenService from "../../common/utils/token/token.service";
import {OAuth2Client}  from'google-auth-library';
import { ACCESS_SEUCRIT_KEY_ADMIN, ACCESS_SEUCRIT_KEY_USER, CLIENT_ID, REFRESH_SEUCRIT_KEY_ADMIN, REFRESH_SEUCRIT_KEY_USER } from "../../config/config.service";






class UserServies {

    private readonly _userModel = new UserRepository()
    private readonly _redisService =  RedisService
    private readonly _tokenService =  TokenService

    constructor() {}

sendEmailOtp = async ({
    email,
    subject
}: {
    email: string,
    subject: EventEnum
}) => {

    const isBlocked = await this._redisService.ttl({
        key: this._redisService.block_otp_key({ email })
    });

    if ((isBlocked ?? 0) > 0) {
        throw new AppError(
            `Too many attempts. Try again after ${isBlocked} seconds.`,
            401
        );
    }

    const otpTTL = await this._redisService.ttl({
        key: this._redisService.otp_key({ email, subject })
    });

    if ((otpTTL ?? 0) > 0) {
        throw new AppError(
            `You can resend OTP after ${otpTTL} seconds.`,
            400
        );
    }

    const maxOtp = Number(
        await this._redisService.getValue({
            key: this._redisService.max_otp_key({ email })
        })
    ) || 0;

    if (maxOtp >= 3) {
        await this._redisService.setValue({
            key: this._redisService.block_otp_key({ email }),
            value: "1",
            ttl: 60
        });

        throw new AppError(
            `You have exceeded the maximum number of tries.`,
            400
        );
    }

    const otp = await genrateOtp();

    await sendEmail({
        to: email,
        subject: "OTP Code",
        html: emailTempalet(otp)
    });

    await this._redisService.setValue({
        key: this._redisService.otp_key({ email, subject }),
        value: hash_password({
            myPlaintextPassword: `${otp}`
        }),
        ttl: 60 * 5
    });

    await this._redisService.incr({
        key: this._redisService.max_otp_key({ email })
    });
};

signUpWithGmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { idToken }: { idToken: string } = req.body;

    const client = new OAuth2Client();

    const ticket = await client.verifyIdToken({
        idToken,
        audience:CLIENT_ID!
    });

    const payload = ticket.getPayload();

    if (!payload) {
        throw new AppError("invalid google token");
    }

    const {
        email,
        name,
        email_verified,
        picture
    }: IsignInWithGemailTypes = payload as IsignInWithGemailTypes;

    if (!email) {
        throw new AppError("email not found");
    }

    let user = await this._userModel.findOne({
        filter: { email }
    });

    if (!user) {
        user = await this._userModel.create({
            email,
            userName: name,
            confirmEmail: email_verified,
            provider: providerEnum.google,
            profilePicture: {
                secure_url: picture,
                public_id: ""
            }
        });
    }

    if (user.provider === providerEnum.system) {
        throw new AppError(
            "user signed up with system, use email/password"
        );
    }

    const access_token = this._tokenService.generateToken({
        paylod: {
            userId: user._id,
            role: user.role
        },
        seucrit: ACCESS_SEUCRIT_KEY_USER!,
        options: {
            expiresIn: "2h"
        }
    });

    successResponse({
        res,
        message: "login success",
        data: { access_token }
    });
};

    signUp = async(req: Request , res : Response , next : NextFunction)=>
{
    
    const {userName , email , password , role , phone , gender , age}:IsignupType = req.body

    if(await this._userModel.findOne({filter:{email}}))
    {
        throw new AppError("email already exist" , 409)
    }



    const user: HydratedDocument<Iuser> = await this._userModel.create(
        {
            userName , 
            email , 
            password :hash_password({myPlaintextPassword:password}) , 
            role , 
            phone:phone? encrypt(phone):null , 
            gender , 
            age
        }as Partial <Iuser>
    )

        const otp = await genrateOtp()

    eventEmitter.emit(EventEnum.confirmeEmail , async()=>
    {
            await sendEmail({
        to:email,
        subject:"welcome to social_Media_App",
        html:emailTempalet(otp)
    })

    await this._redisService.setValue({
        key:this._redisService.otp_key({email , subject:EventEnum.confirmeEmail}) ,
        value:hash_password({myPlaintextPassword:`${otp}`}),
        ttl:60 * 2  })

        await this._redisService.setValue({
            key:this._redisService.max_otp_key({email}),
            value:"1",
            ttl:60*6
        })
    })


    successResponse({res  , data:user})

}

    confirmeEmail = async (req: Request , res : Response , next : NextFunction)=>
{
    const {email , code}:confirmeEmailDto = req.body
    const otpValue =await this._redisService.getValue({key:this._redisService.otp_key({email})})

    if(!otpValue)
    {
        throw new AppError("otp Expired",404);
    }

    if(!compare_password({plaintextPassword:code ,ciphertext  :otpValue }))
    {
        throw new AppError("inValid otp");   
    }

    const user = await this._userModel.findOneAndUpdate({
        
        filter:{email , confirmEmail : {$exists:false} , provider:providerEnum.system},
        update:{confirmEmail :true}
    })
    if(!user)
    {
        throw new AppError("user not exisit");
    }
    await this._redisService.deleteKey({key:this._redisService.otp_key({email , subject:EventEnum.confirmeEmail})})
    successResponse({res , message:"email confirmEmail successfuiiy"})
}

    resendOtp = async (req: Request , res : Response , next : NextFunction)=>
{
    const {email}:resendOtpDto = req.body

    const user = await this._userModel.findOne({
        filter:{email , confirmEmail:{$exists :false} , provider : providerEnum.system}
    })
    if(!user)
    {
        throw new AppError("user not exist or already confirmEmail" , 409);
    }

    await this.sendEmailOtp({email , subject:EventEnum.confirmeEmail})

        successResponse({res , message:"email confirmEmail successfuiiy"})

}

    
signIn = async (req: Request , res : Response , next : NextFunction)=>
{
    const { email , password}:signInDto = req.body
    const user = await this._userModel.findOne({ filter:{email ,
        provider:providerEnum.system,
        confirmEmail: {$exists: true}
    }})
    if(!user)
    {
        throw new AppError("Emali Already Exist or provider is not system" , 403);
    }

    if(! compare_password({plaintextPassword:password , ciphertext : user.password}))
    {
        throw new AppError("InValid Password" ,409);
    }

    const jwtid = randomUUID()
    const access_token = this._tokenService.generateToken({paylod:{userId : user._id} , 
        seucrit:user?.role==RoleEnum.user?ACCESS_SEUCRIT_KEY_USER!:ACCESS_SEUCRIT_KEY_ADMIN!,
        options:{
            expiresIn : 60 * 3 ,
            issuer:"http://localhost:3001",
            audience:"http://localhost:4000",
            jwtid
    }})

    const refresh_token = this._tokenService.generateToken({paylod:{userId:user._id},
        seucrit:user?.role==RoleEnum.user?REFRESH_SEUCRIT_KEY_USER!:REFRESH_SEUCRIT_KEY_ADMIN!,
        options:{
            expiresIn:"1y",
            jwtid
        }})
    successResponse({res , data:{access_token , refresh_token}})
}

    getProfile = async (req: Request , res : Response , next : NextFunction)=>
{

    successResponse({res , data:req.user})
}

    update_Password = async(req: Request , res : Response , next : NextFunction)=>
{
    let {newPassword , oldPassword}:update_PasswordDto = req.body
    if(!compare_password({plaintextPassword:oldPassword , ciphertext  :req.user.password}))
    {
        throw new AppError("old password is valid");
    }
    
    const hash = hash_password({myPlaintextPassword:newPassword})
    req.user.password = hash
    req.user.changeCredential = new Date()
    await req.user.save()
    successResponse({res})
}
 /////
    logout = async(req: Request , res : Response , next : NextFunction)=>
{
    const {flag} = req.query
    if(flag === "all")
    {
        req.user.changeCredential = new Date()
        await req.user.save()
        const userKeys = await this._redisService.keys({pattern: this._redisService.get_keys({userId:req.user._id})})
        if (userKeys && userKeys.length > 0) {
            await this._redisService.deleteKey({
                key: userKeys
            });
        }
    
    }
    else
    {

        await this._redisService.setValue({
            key:this._redisService.revoke_key({userId:req.user._id , jti:req.decoded.jti!}),
            value:`${req.decoded.jti}`,
            ttl:req.decoded.exp! - Math.floor(Date.now()/1000)
        })

    }
    successResponse({res})
}

    forgetPassword = async (req: Request , res : Response , next : NextFunction)=>
{
    const { email } :forgetPasswordDto= req.body
    const user = await this._userModel.findOne({ filter:{email ,
        provider:providerEnum.system,
        confirmEmail: {$exists: true}
    }})
    if(!user)
    {
        throw new AppError("Emali Already Exist or provider is not system" );
    }

    await this.sendEmailOtp({email , subject:EventEnum.forgetPassword})
    successResponse({res , message:"success"})
}

    resetPassword = async (req: Request , res : Response , next : NextFunction)=>
{
    const { email , code , password }:resetPasswordDto = req.body

    const otpValue = await this._redisService.getValue({key : this._redisService.otp_key({email , subject:EventEnum.forgetPassword})})
    if(!otpValue)
    {
        throw new AppError("otp expire");
    }

    if(!compare_password({plaintextPassword:code ,ciphertext :otpValue }))
    {
        throw new AppError("inValid otp");
    }

    const user = await this._userModel.findOneAndUpdate({
        filter:{email ,
        provider:providerEnum.system,
        confirmEmail: {$exists: true}
    },
    update:
    {
        password:hash_password({myPlaintextPassword:password}),
        changeCredential: new Date()
    }
})
    if(!user)
    {
        throw new AppError("Emali Already Exist or provider is not system" );
    }

    await this._redisService.deleteKey({key:this._redisService.otp_key({email , subject:EventEnum.forgetPassword})})
    successResponse({res , message:"success"})
}

    forgetPasswordLink = async (req: Request , res : Response , next : NextFunction)=>
{
    const { email }:forgetPasswordLinkDot = req.body

    const user = await this._userModel.findOne({
    
        filter:{
            email,
            provider:providerEnum.system,
            confirmEmail: {$exists: true}
        }
    })

    if(!user){
        throw new AppError("user not found")
    }

    const token = this._tokenService.generateToken({
        paylod:{ email },
        seucrit:user?.role==RoleEnum.user?ACCESS_SEUCRIT_KEY_USER!:ACCESS_SEUCRIT_KEY_ADMIN!,
        options:{
            expiresIn:"10m"
        }
    })

    const link = `http://localhost:3001/forget-password-Link/${token}`

    
await sendEmail({
    to: email,
    subject: "Reset your password",
    html: emailTempaletLink(link)
})
    await this._redisService.setValue({
    key: `reset_token::${token}`,
    value: "1",
    ttl: 60 * 10
    })

    successResponse({res , message:"check your email"})
}

resetPasswordLink = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token as string;
    const { password } :resetPasswordLinkDot= req.body;

    const decoded = this._tokenService.verifyToken({
        token,
        seucrit:ACCESS_SEUCRIT_KEY_USER!,
    });

    if (!decoded?.email) {
        throw new Error("invalid token");
    }

    const tokenKey = `reset_token::${token}`;

    const exists = await this._redisService.getValue({
        key: tokenKey
    });

    if (!exists) {
        throw new Error("token expired or already used");
    }

    const user = await this._userModel.findOneAndUpdate({
        filter: {
            email: decoded.email,
            provider: providerEnum.system
        },
        update: {
            password: hash_password({
                myPlaintextPassword: password
            }),
            changeCredential: new Date()
        }
    });

    if (!user) {
        throw new Error("user not found");
    }

    await this._redisService.deleteKey({
        key: tokenKey
    });

    successResponse({
        res,
        message: "password updated"
    });
}
}

export default new UserServies()