"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const global_error_handler_1 = require("../utils/global-error/global-error-handler");
const validation = (schema) => {
    return async (req, res, next) => {
        const validationError = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const result = schema[key].safeParse(req[key]);
            if (!result.success) {
                validationError.push(result.error.message);
            }
        }
        if (validationError.length > 0) {
            throw new global_error_handler_1.AppError(JSON.parse(validationError), 409);
        }
        next();
    };
};
exports.validation = validation;
