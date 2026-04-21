import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/global-error/global-error-handler";

export const authorization = ({ role = [] }: { role: string[] }) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const userRole = req.user?.role;

        if (!userRole) {
            throw new AppError("Unauthorized - no role found", 401);
        }

        if (!role.includes(userRole)) {
            throw new AppError("Unauthorized", 403);
        }

        next();
    };
};