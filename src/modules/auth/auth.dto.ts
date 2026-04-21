import * as z from "zod"
import { GenderEnum, RoleEnum } from "../../common/enum/user.enum";
import { confirmeEmailSchema, forgetPasswordLinkSchema, forgetPasswordSchema, resendOtpSchema, resetPasswordLinkSchema, resetPasswordSchema, signInSchema, update_PasswordSchema } from "./auth.validation";

//-------------signUp-------------//  

export interface IsignupType  {
    userName:string,
    email: string,
    password: string,
    age?:number,
    gender?:GenderEnum,
    phone?:string,
    role?:RoleEnum,
    confirmEmail?:boolean,
    address?:string
}


//-------------signIn-------------//      

export interface IsignInType  {
    userName:string,
    email: string,
    password: string,
    role?:RoleEnum,
    confirmEmail?:boolean,
}

export type confirmeEmailDto = z.infer<typeof confirmeEmailSchema.body>
export type resendOtpDto = z.infer<typeof resendOtpSchema.body>
export type signInDto = z.infer<typeof signInSchema.body>
export type update_PasswordDto = z.infer<typeof update_PasswordSchema.body>
export type forgetPasswordDto = z.infer<typeof forgetPasswordSchema.body>
export type resetPasswordDto = z.infer<typeof resetPasswordSchema.body>
export type forgetPasswordLinkDot = z.infer<typeof forgetPasswordLinkSchema.body>
export type resetPasswordLinkDot = z.infer<typeof resetPasswordLinkSchema.body>




