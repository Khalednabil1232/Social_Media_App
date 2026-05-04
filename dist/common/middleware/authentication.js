"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const global_error_handler_js_1 = require("../utils/global-error/global-error-handler.js");
const config_service_js_1 = require("../../config/config.service.js");
const token_service_js_1 = __importDefault(require("../utils/token/token.service.js"));
const redis_service_js_1 = __importDefault(require("../service/redis.service.js"));
const user_repository_js_1 = __importDefault(require("../../DB/repositories/user.repository.js"));
const userModel = new user_repository_js_1.default();
const authentication = async (req, res, next) => {
    const { auth } = req.headers;
    if (!auth) {
        throw new global_error_handler_js_1.AppError("token not exist", 403);
    }
    const [perfix, token] = auth.split(" ");
    if (!token) {
        throw new global_error_handler_js_1.AppError("token not found", 403);
    }
    let ACCESS_SEUCRIT_KEY = "";
    if (perfix == config_service_js_1.PERFIX_USER) {
        ACCESS_SEUCRIT_KEY = config_service_js_1.ACCESS_SEUCRIT_KEY_USER;
    }
    else if (perfix == config_service_js_1.PERFIX_ADMIN) {
        ACCESS_SEUCRIT_KEY = config_service_js_1.ACCESS_SEUCRIT_KEY_ADMIN;
    }
    else {
        throw new global_error_handler_js_1.AppError("invalid token prefix", 403);
    }
    const decoded = token_service_js_1.default.verifyToken({
        token,
        seucrit: ACCESS_SEUCRIT_KEY
    });
    if (!decoded || !decoded.userId) {
        throw new global_error_handler_js_1.AppError("invalid token", 401);
    }
    const user = await userModel.findOne({
        filter: { _id: decoded.userId }
    });
    if (!user) {
        throw new global_error_handler_js_1.AppError("user not found", 404);
    }
    if (!user?.confirmEmail) {
        throw new global_error_handler_js_1.AppError("user not confirmEmail yets", 404);
    }
    const credentialTime = user?.changeCredential?.getTime();
    const tokenTime = decoded?.iat;
    if (credentialTime && tokenTime && credentialTime > tokenTime * 1000) {
        throw new global_error_handler_js_1.AppError("Token Expired");
    }
    const revokeToken = await redis_service_js_1.default.getValue({
        key: redis_service_js_1.default.revoke_key({
            userId: decoded.userId,
            jti: decoded.jti
        })
    });
    if (revokeToken) {
        throw new global_error_handler_js_1.AppError("token revoked", 401);
    }
    req.user = user;
    req.decoded = decoded;
    next();
};
exports.authentication = authentication;
