"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_service_1 = require("../config/config.service");
const checkConnectionDB = async () => {
    try {
        await mongoose_1.default.connect(config_service_1.DB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log(`Connected successfully to server${config_service_1.DB_URI}..⏳✅`);
    }
    catch (error) {
        console.error('sync to connect to the database.......', error);
    }
};
exports.default = checkConnectionDB;
