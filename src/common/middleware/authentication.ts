import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/global-error/global-error-handler.js";
import { ACCESS_SEUCRIT_KEY, PERFIX } from "../../config/config.service.js";
import tokenService from "../utils/token/token.service.js";
import RedisService from "../service/redis.service.js";
import UserRepository from "../../DB/repositories/user.repository.js";

const userModel = new UserRepository()

export const authentication = async (req: Request, res: Response, next: NextFunction) => {

        const { auth } = req.headers;

        if (!auth) {
            throw new AppError("token not exist", 403);
        }
        
        const [perfix, token]: string[] = (auth as string).split(" ");

        if (perfix !== PERFIX) {
            throw new AppError("invalid token prefix", 403);
        }

        if (!token) {
            throw new AppError("token not found", 403);
        }

        const decoded = tokenService.verifyToken({
            token,
            seucrit: ACCESS_SEUCRIT_KEY!
        });

        if (!decoded || !decoded.userId) {
            throw new AppError("invalid token", 401);
        }

        const user = await userModel.findOne({
            filter: { _id: decoded.userId }
        });

        if (!user) {
            throw new AppError("user not found", 404);
        }

        if(!user?.confirmEmail)
        {
            throw new AppError("user not confirmEmail yets", 404);
        }

        const credentialTime = user?.changeCredential?.getTime();
        const tokenTime = decoded?.iat;

        if (credentialTime && tokenTime && credentialTime > tokenTime * 1000) {
            throw new AppError("Token Expired");
    }

        const revokeToken = await RedisService.getValue({
            key: RedisService.revoke_key({
                userId: decoded.userId,
                jti: decoded.jti!
            })
        });

        if (revokeToken) {
            throw new AppError("token revoked", 401);
        }

        req.user = user
        req.decoded = decoded
        next();

    }
