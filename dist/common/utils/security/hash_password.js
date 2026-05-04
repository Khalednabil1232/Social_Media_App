"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare_password = exports.hash_password = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_service_1 = require("../../../config/config.service");
const hash_password = ({ myPlaintextPassword, saltRounds = config_service_1.SALT_ROUNDS }) => {
    return bcrypt_1.default.hashSync(myPlaintextPassword.toString(), Number(saltRounds));
};
exports.hash_password = hash_password;
const compare_password = ({ plaintextPassword, ciphertext }) => {
    return bcrypt_1.default.compareSync(plaintextPassword, ciphertext);
};
exports.compare_password = compare_password;
