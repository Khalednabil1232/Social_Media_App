"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const successResponse = ({ res, message = "done", status = 200, data = undefined, }) => {
    return res.status(status).json({ status, message, data });
};
exports.default = successResponse;
