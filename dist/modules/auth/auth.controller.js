"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const AV = __importStar(require("./auth.validation"));
const validation_1 = require("../../common/middleware/validation");
const authentication_1 = require("../../common/middleware/authentication");
const multer_cloud_1 = __importDefault(require("../../common/middleware/multer.cloud"));
const multer_enum_1 = require("../../common/enum/multer.enum");
const authRouter = (0, express_1.Router)();
authRouter.post("/signUp/gmail", auth_service_1.default.signUpWithGmail);
authRouter.post("/signUp", (0, validation_1.validation)(AV.signUpSchema), auth_service_1.default.signUp);
authRouter.post("/confirmeEmail", (0, validation_1.validation)(AV.confirmeEmailSchema), auth_service_1.default.confirmeEmail);
authRouter.post("/resendOtp", (0, validation_1.validation)(AV.resendOtpSchema), auth_service_1.default.resendOtp);
authRouter.post("/signIn", (0, validation_1.validation)(AV.signInSchema), auth_service_1.default.signIn);
authRouter.get("/getProfile", authentication_1.authentication, auth_service_1.default.getProfile);
authRouter.patch("/update_Password", (0, validation_1.validation)(AV.update_PasswordSchema), authentication_1.authentication, auth_service_1.default.update_Password);
authRouter.patch("/forget-password", (0, validation_1.validation)(AV.forgetPasswordSchema), auth_service_1.default.forgetPassword);
authRouter.patch("/reset-password", (0, validation_1.validation)(AV.resetPasswordSchema), auth_service_1.default.resetPassword);
authRouter.patch("/forget-password-Link", (0, validation_1.validation)(AV.forgetPasswordLinkSchema), auth_service_1.default.forgetPasswordLink);
authRouter.patch("/reset-password-Link/:token", (0, validation_1.validation)(AV.resetPasswordLinkSchema), auth_service_1.default.resetPasswordLink);
authRouter.post("/logout", authentication_1.authentication, auth_service_1.default.logout);
authRouter.post("/uploadLargeFile", (0, multer_cloud_1.default)({ store_type: multer_enum_1.Store_Enum.disk }).single("attachment"), auth_service_1.default.uploadImage);
exports.default = authRouter;
