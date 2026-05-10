
import * as z from "zod"
import { GenderEnum, RoleEnum } from "../../common/enum/user.enum"

export const signUpSchema = {
    body:z.object({
    userName: z.string().min(3).max(25),
    password: z.string().min(6).max(25),
    cPassword: z.string().min(6).max(25),
    email: z.string().email(),
    phone: z.string().min(10).max(15).optional(),
    address: z.string().min(10).max(100).optional(),
    role: z.enum(RoleEnum).optional(),
    confirmEmail: z.boolean().optional(),
    gender: z.enum(GenderEnum).optional(),
    age: z.number().min(18).max(60).optional(),

}).superRefine((data , ctx)=>
{
    if(data.password !== data.cPassword)
    {
        ctx.addIssue({
            code:"custom",
            path:["cpassword"],
            message:"passwoed not match..🤐💀"
        })
    }
})

// .refine((data)=>{
//     return data.password == data.cpassword
// },{
//     message:"passwoed not match..🤐",
//     path:["cpassword" , "password"]
// })
}




export const confirmeEmailSchema:any = {
    body:z.strictObject({
    code: z.string().regex(/^\d{6}$/),
    email: z.email(),

})}

export const resendOtpSchema:any = {
    body:z.strictObject({
    email: z.email(),
})}

export const signInSchema:any = {
    body:z.strictObject({
    password: z.string().min(6).max(25).optional(),
    email: z.string().email(),
    fcm: z.string(),
})}

export const update_PasswordSchema: any = {
    body: z.strictObject({
        oldPassword: z.string().min(6).max(25),
        newPassword: z.string().min(6).max(25),
        cPassword: z.string().min(6).max(25),
    }).superRefine((data, ctx) => {
        if (data.newPassword !== data.cPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["cPassword"],
                message: "Passwords do not match"
            });
        }
    })
};

export const forgetPasswordSchema:any = {
    body:z.strictObject({
    email: z.string().email(),
})}

export const resetPasswordSchema: any = {
    body: z.strictObject({
        email: z.string().email(),
        code: z.string().regex(/^\d{6}$/),
        password: z.string().min(6).max(25),
        cPassword: z.string().min(6).max(25),
    }).superRefine((data, ctx) => {
        if (data.password !== data.cPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["cPassword"],
                message: "password not match..🤐💀"
            });
        }
    })
}


export const forgetPasswordLinkSchema: any = {
    body: z.strictObject({
        email: z.string().email()
    })
}


export const resetPasswordLinkSchema: any = {
    body: z.strictObject({
        password: z.string().min(6).max(25),
        cPassword: z.string().min(6).max(25)
    }).superRefine((data, ctx) => {
        if (data.password !== data.cPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["cPassword"],
                message: "password not match..🤐💀"
            });
        }
    }),

    params: z.strictObject({
        token: z.string().min(1)
    })
}