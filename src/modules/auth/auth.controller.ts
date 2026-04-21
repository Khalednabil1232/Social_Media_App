import { Router } from "express";
import  AS from "./auth.service"
import * as  AV from "./auth.validation"
import { validation } from "../../common/middleware/validation";
import { authentication } from "../../common/middleware/authentication";


const authRouter = Router()

authRouter.post("/signUp" ,validation(AV.signUpSchema), AS.signUp )
authRouter.post("/confirmeEmail" ,validation(AV.confirmeEmailSchema), AS.confirmeEmail )
authRouter.post("/resendOtp" ,validation(AV.resendOtpSchema), AS.resendOtp )
authRouter.post("/signIn" ,validation(AV.signInSchema), AS.signIn )
authRouter.get("/getProfile" ,authentication, AS.getProfile )
authRouter.patch("/update_Password" ,validation(AV.update_PasswordSchema) , authentication, AS.update_Password )
authRouter.patch("/forget-password", validation(AV.forgetPasswordSchema),AS.forgetPassword)                                        
authRouter.patch("/reset-password", validation(AV.resetPasswordSchema),AS.resetPassword)
authRouter.patch("/forget-password-Link", validation(AV.forgetPasswordLinkSchema),AS.forgetPasswordLink)                                        
authRouter.patch("/reset-password-Link/:token", validation(AV.resetPasswordLinkSchema),AS.resetPasswordLink)
//
authRouter.post("/logout"  , authentication, AS.logout )






export default authRouter