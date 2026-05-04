"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const global_error_handler_1 = require("../utils/global-error/global-error-handler");
const authorization = ({ role = [] }) => {
    return async (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            throw new global_error_handler_1.AppError("Unauthorized - no role found", 401);
        }
        if (!role.includes(userRole)) {
            throw new global_error_handler_1.AppError("Unauthorized", 403);
        }
        next();
    };
};
exports.authorization = authorization;
