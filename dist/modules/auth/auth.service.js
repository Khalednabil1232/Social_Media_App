"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const success_respons_1 = __importDefault(require("../../common/utils/success_respons/success.respons"));
const hash_password_1 = require("../../common/utils/security/hash_password");
const global_error_handler_1 = require("../../common/utils/global-error/global-error-handler");
const user_enum_1 = require("../../common/enum/user.enum");
const user_repository_1 = __importDefault(require("../../DB/repositories/user.repository"));
const encrypt_security_1 = require("../../common/utils/security/encrypt.security");
const send_email_1 = require("../../common/utils/email/send.email");
const email_template_1 = require("../../common/utils/email/email.template");
const email_events_1 = require("../../common/utils/email/email.events");
const event_enum_1 = require("../../common/enum/event.enum");
const redis_service_1 = __importDefault(require("../../common/service/redis.service"));
const crypto_1 = require("crypto");
const token_service_1 = __importDefault(require("../../common/utils/token/token.service"));
const google_auth_library_1 = require("google-auth-library");
const config_service_1 = require("../../config/config.service");
const s3_service_1 = require("../../common/service/s3.service");
class UserServies {
    _userModel = new user_repository_1.default();
    _redisService = redis_service_1.default;
    _tokenService = token_service_1.default;
    _s3Service = new s3_service_1.S3Service();
    constructor() { }
    sendEmailOtp = async ({ email, subject }) => {
        const isBlocked = await this._redisService.ttl({
            key: this._redisService.block_otp_key({ email })
        });
        if ((isBlocked ?? 0) > 0) {
            throw new global_error_handler_1.AppError(`Too many attempts. Try again after ${isBlocked} seconds.`, 401);
        }
        const otpTTL = await this._redisService.ttl({
            key: this._redisService.otp_key({ email, subject })
        });
        if ((otpTTL ?? 0) > 0) {
            throw new global_error_handler_1.AppError(`You can resend OTP after ${otpTTL} seconds.`, 400);
        }
        const maxOtp = Number(await this._redisService.getValue({
            key: this._redisService.max_otp_key({ email })
        })) || 0;
        if (maxOtp >= 3) {
            await this._redisService.setValue({
                key: this._redisService.block_otp_key({ email }),
                value: "1",
                ttl: 60
            });
            throw new global_error_handler_1.AppError(`You have exceeded the maximum number of tries.`, 400);
        }
        const otp = await (0, send_email_1.genrateOtp)();
        await (0, send_email_1.sendEmail)({
            to: email,
            subject: "OTP Code",
            html: (0, email_template_1.emailTempalet)(otp)
        });
        await this._redisService.setValue({
            key: this._redisService.otp_key({ email, subject }),
            value: (0, hash_password_1.hash_password)({
                myPlaintextPassword: `${otp}`
            }),
            ttl: 60 * 5
        });
        await this._redisService.incr({
            key: this._redisService.max_otp_key({ email })
        });
    };
    signUpWithGmail = async (req, res, next) => {
        const { idToken } = req.body;
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_service_1.CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new global_error_handler_1.AppError("invalid google token");
        }
        const { email, name, email_verified, picture } = payload;
        if (!email) {
            throw new global_error_handler_1.AppError("email not found");
        }
        let user = await this._userModel.findOne({
            filter: { email }
        });
        if (!user) {
            user = await this._userModel.create({
                email,
                userName: name,
                confirmEmail: email_verified,
                provider: user_enum_1.providerEnum.google,
                profilePicture: {
                    secure_url: picture,
                    public_id: ""
                }
            });
        }
        if (user.provider === user_enum_1.providerEnum.system) {
            throw new global_error_handler_1.AppError("user signed up with system, use email/password");
        }
        const access_token = this._tokenService.generateToken({
            paylod: {
                userId: user._id,
                role: user.role
            },
            seucrit: config_service_1.ACCESS_SEUCRIT_KEY_USER,
            options: {
                expiresIn: "2h"
            }
        });
        (0, success_respons_1.default)({
            res,
            message: "login success",
            data: { access_token }
        });
    };
    signUp = async (req, res, next) => {
        const { userName, email, password, role, phone, gender, age } = req.body;
        if (await this._userModel.findOne({ filter: { email } })) {
            throw new global_error_handler_1.AppError("email already exist", 409);
        }
        const user = await this._userModel.create({
            userName,
            email,
            password: (0, hash_password_1.hash_password)({ myPlaintextPassword: password }),
            role,
            phone: phone ? (0, encrypt_security_1.encrypt)(phone) : null,
            gender,
            age
        });
        const otp = await (0, send_email_1.genrateOtp)();
        email_events_1.eventEmitter.emit(event_enum_1.EventEnum.confirmeEmail, async () => {
            await (0, send_email_1.sendEmail)({
                to: email,
                subject: "welcome to social_Media_App",
                html: (0, email_template_1.emailTempalet)(otp)
            });
            await this._redisService.setValue({
                key: this._redisService.otp_key({ email, subject: event_enum_1.EventEnum.confirmeEmail }),
                value: (0, hash_password_1.hash_password)({ myPlaintextPassword: `${otp}` }),
                ttl: 60 * 2
            });
            await this._redisService.setValue({
                key: this._redisService.max_otp_key({ email }),
                value: "1",
                ttl: 60 * 6
            });
        });
        (0, success_respons_1.default)({ res, data: user });
    };
    confirmeEmail = async (req, res, next) => {
        const { email, code } = req.body;
        const otpValue = await this._redisService.getValue({ key: this._redisService.otp_key({ email }) });
        if (!otpValue) {
            throw new global_error_handler_1.AppError("otp Expired", 404);
        }
        if (!(0, hash_password_1.compare_password)({ plaintextPassword: code, ciphertext: otpValue })) {
            throw new global_error_handler_1.AppError("inValid otp");
        }
        const user = await this._userModel.findOneAndUpdate({
            filter: { email, confirmEmail: { $exists: false }, provider: user_enum_1.providerEnum.system },
            update: { confirmEmail: true }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("user not exisit");
        }
        await this._redisService.deleteKey({ key: this._redisService.otp_key({ email, subject: event_enum_1.EventEnum.confirmeEmail }) });
        (0, success_respons_1.default)({ res, message: "email confirmEmail successfuiiy" });
    };
    resendOtp = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({
            filter: { email, confirmEmail: { $exists: false }, provider: user_enum_1.providerEnum.system }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("user not exist or already confirmEmail", 409);
        }
        await this.sendEmailOtp({ email, subject: event_enum_1.EventEnum.confirmeEmail });
        (0, success_respons_1.default)({ res, message: "email confirmEmail successfuiiy" });
    };
    signIn = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({ filter: { email,
                provider: user_enum_1.providerEnum.system,
                confirmEmail: { $exists: true }
            } });
        if (!user) {
            throw new global_error_handler_1.AppError("Emali Already Exist or provider is not system", 403);
        }
        if (!(0, hash_password_1.compare_password)({ plaintextPassword: password, ciphertext: user.password })) {
            throw new global_error_handler_1.AppError("InValid Password", 409);
        }
        const jwtid = (0, crypto_1.randomUUID)();
        const access_token = this._tokenService.generateToken({ paylod: { userId: user._id },
            seucrit: user?.role == user_enum_1.RoleEnum.user ? config_service_1.ACCESS_SEUCRIT_KEY_USER : config_service_1.ACCESS_SEUCRIT_KEY_ADMIN,
            options: {
                expiresIn: 60 * 3,
                issuer: "http://localhost:3001",
                audience: "http://localhost:4000",
                jwtid
            } });
        const refresh_token = this._tokenService.generateToken({ paylod: { userId: user._id },
            seucrit: user?.role == user_enum_1.RoleEnum.user ? config_service_1.REFRESH_SEUCRIT_KEY_USER : config_service_1.REFRESH_SEUCRIT_KEY_ADMIN,
            options: {
                expiresIn: "1y",
                jwtid
            } });
        (0, success_respons_1.default)({ res, data: { access_token, refresh_token } });
    };
    getProfile = async (req, res, next) => {
        (0, success_respons_1.default)({ res, data: req.user });
    };
    update_Password = async (req, res, next) => {
        let { newPassword, oldPassword } = req.body;
        if (!(0, hash_password_1.compare_password)({ plaintextPassword: oldPassword, ciphertext: req.user.password })) {
            throw new global_error_handler_1.AppError("old password is valid");
        }
        const hash = (0, hash_password_1.hash_password)({ myPlaintextPassword: newPassword });
        req.user.password = hash;
        req.user.changeCredential = new Date();
        await req.user.save();
        (0, success_respons_1.default)({ res });
    };
    logout = async (req, res, next) => {
        const { flag } = req.query;
        if (flag === "all") {
            req.user.changeCredential = new Date();
            await req.user.save();
            const userKeys = await this._redisService.keys({ pattern: this._redisService.get_keys({ userId: req.user._id }) });
            if (userKeys && userKeys.length > 0) {
                await this._redisService.deleteKey({
                    key: userKeys
                });
            }
        }
        else {
            await this._redisService.setValue({
                key: this._redisService.revoke_key({ userId: req.user._id, jti: req.decoded.jti }),
                value: `${req.decoded.jti}`,
                ttl: req.decoded.exp - Math.floor(Date.now() / 1000)
            });
        }
        (0, success_respons_1.default)({ res });
    };
    forgetPassword = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({ filter: { email,
                provider: user_enum_1.providerEnum.system,
                confirmEmail: { $exists: true }
            } });
        if (!user) {
            throw new global_error_handler_1.AppError("Emali Already Exist or provider is not system");
        }
        await this.sendEmailOtp({ email, subject: event_enum_1.EventEnum.forgetPassword });
        (0, success_respons_1.default)({ res, message: "success" });
    };
    resetPassword = async (req, res, next) => {
        const { email, code, password } = req.body;
        const otpValue = await this._redisService.getValue({ key: this._redisService.otp_key({ email, subject: event_enum_1.EventEnum.forgetPassword }) });
        if (!otpValue) {
            throw new global_error_handler_1.AppError("otp expire");
        }
        if (!(0, hash_password_1.compare_password)({ plaintextPassword: code, ciphertext: otpValue })) {
            throw new global_error_handler_1.AppError("inValid otp");
        }
        const user = await this._userModel.findOneAndUpdate({
            filter: { email,
                provider: user_enum_1.providerEnum.system,
                confirmEmail: { $exists: true }
            },
            update: {
                password: (0, hash_password_1.hash_password)({ myPlaintextPassword: password }),
                changeCredential: new Date()
            }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("Emali Already Exist or provider is not system");
        }
        await this._redisService.deleteKey({ key: this._redisService.otp_key({ email, subject: event_enum_1.EventEnum.forgetPassword }) });
        (0, success_respons_1.default)({ res, message: "success" });
    };
    forgetPasswordLink = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                provider: user_enum_1.providerEnum.system,
                confirmEmail: { $exists: true }
            }
        });
        if (!user) {
            throw new global_error_handler_1.AppError("user not found");
        }
        const token = this._tokenService.generateToken({
            paylod: { email },
            seucrit: user?.role == user_enum_1.RoleEnum.user ? config_service_1.ACCESS_SEUCRIT_KEY_USER : config_service_1.ACCESS_SEUCRIT_KEY_ADMIN,
            options: {
                expiresIn: "10m"
            }
        });
        const link = `http://localhost:3001/forget-password-Link/${token}`;
        await (0, send_email_1.sendEmail)({
            to: email,
            subject: "Reset your password",
            html: (0, email_template_1.emailTempaletLink)(link)
        });
        await this._redisService.setValue({
            key: `reset_token::${token}`,
            value: "1",
            ttl: 60 * 10
        });
        (0, success_respons_1.default)({ res, message: "check your email" });
    };
    resetPasswordLink = async (req, res, next) => {
        const token = req.params.token;
        const { password } = req.body;
        const decoded = this._tokenService.verifyToken({
            token,
            seucrit: config_service_1.ACCESS_SEUCRIT_KEY_USER,
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
                provider: user_enum_1.providerEnum.system
            },
            update: {
                password: (0, hash_password_1.hash_password)({
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
        (0, success_respons_1.default)({
            res,
            message: "password updated"
        });
    };
    uploadImage = async (req, res, next) => {
        const { fileName, ContentType } = req.body;
        const { url, Key } = await this._s3Service.createPresigneUrl({
            fileName,
            ContentType,
            path: `users/${req.user._id}`
        });
    };
}
exports.default = new UserServies();
