"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    constructor() { }
    generateToken = ({ paylod, seucrit, options = {} }) => {
        return jsonwebtoken_1.default.sign(paylod, seucrit, options);
    };
    verifyToken = ({ token, seucrit, options = {} }) => {
        return jsonwebtoken_1.default.verify(token, seucrit, options);
    };
}
exports.default = new TokenService();
