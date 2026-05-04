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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordLinkSchema = exports.forgetPasswordLinkSchema = exports.resetPasswordSchema = exports.forgetPasswordSchema = exports.update_PasswordSchema = exports.signInSchema = exports.resendOtpSchema = exports.confirmeEmailSchema = exports.signUpSchema = void 0;
const z = __importStar(require("zod"));
const user_enum_1 = require("../../common/enum/user.enum");
exports.signUpSchema = {
    body: z.object({
        userName: z.string().min(3).max(25),
        password: z.string().min(6).max(25),
        cPassword: z.string().min(6).max(25),
        email: z.string().email(),
        phone: z.string().min(10).max(15).optional(),
        address: z.string().min(10).max(100).optional(),
        role: z.enum(user_enum_1.RoleEnum).optional(),
        confirmEmail: z.boolean().optional(),
        gender: z.enum(user_enum_1.GenderEnum).optional(),
        age: z.number().min(18).max(60).optional(),
    }).superRefine((data, ctx) => {
        if (data.password !== data.cPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["cpassword"],
                message: "passwoed not match..🤐💀"
            });
        }
    })
};
exports.confirmeEmailSchema = {
    body: z.strictObject({
        code: z.string().regex(/^\d{6}$/),
        email: z.email(),
    })
};
exports.resendOtpSchema = {
    body: z.strictObject({
        email: z.email(),
    })
};
exports.signInSchema = {
    body: z.strictObject({
        password: z.string().min(6).max(25).optional(),
        email: z.string().email(),
    })
};
exports.update_PasswordSchema = {
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
exports.forgetPasswordSchema = {
    body: z.strictObject({
        email: z.string().email(),
    })
};
exports.resetPasswordSchema = {
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
};
exports.forgetPasswordLinkSchema = {
    body: z.strictObject({
        email: z.string().email()
    })
};
exports.resetPasswordLinkSchema = {
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
};
