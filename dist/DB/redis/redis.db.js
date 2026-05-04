"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnecition = exports.redisClient = void 0;
const redis_1 = require("redis");
const config_service_1 = require("../../config/config.service");
exports.redisClient = (0, redis_1.createClient)({
    url: config_service_1.REDIS_URL
});
const redisConnecition = async () => {
    try {
        await exports.redisClient.connect();
        console.log("success to connect with redis........👀");
    }
    catch (error) {
        console.log("error to connect with redis......", error);
    }
};
exports.redisConnecition = redisConnecition;
