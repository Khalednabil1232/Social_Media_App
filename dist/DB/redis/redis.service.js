"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incr = exports.keys = exports.expire = exports.deleteKey = exports.ttl = exports.exists = exports.getValue = exports.update = exports.setValue = exports.block_otp_key = exports.max_otp_key = exports.otp_key = exports.get_keys = exports.revoke_key = void 0;
const event_enum_1 = require("../../common/enum/event.enum");
const redis_db_1 = require("./redis.db");
const revoke_key = ({ userId, jti }) => {
    return `redis_token::${userId}::${jti}`;
};
exports.revoke_key = revoke_key;
const get_keys = ({ userId }) => {
    return `redis_token::${userId}`;
};
exports.get_keys = get_keys;
const otp_key = ({ email, subject = event_enum_1.EventEnum.confirmeEmail }) => {
    return `otp::${email}::${subject}`;
};
exports.otp_key = otp_key;
const max_otp_key = ({ email }) => {
    return `${(0, exports.otp_key)({ email })}::max`;
};
exports.max_otp_key = max_otp_key;
const block_otp_key = ({ email }) => {
    return `${(0, exports.otp_key)({ email })}::block`;
};
exports.block_otp_key = block_otp_key;
const setValue = async ({ key, value, ttl }) => {
    try {
        const data = typeof value === "string" ? value : JSON.stringify(value);
        return ttl ? await redis_db_1.redisClient.set(key, data, { EX: ttl }) : await redis_db_1.redisClient.set(key, data);
    }
    catch (error) {
        console.log("error to set data in redis", error);
    }
};
exports.setValue = setValue;
const update = async ({ key, value, ttl }) => {
    try {
        if (!await redis_db_1.redisClient.exists(key))
            return 0;
        return await (0, exports.setValue)({ key, value, ttl });
    }
    catch (error) {
        console.log("error to update data in redis", error);
    }
};
exports.update = update;
const getValue = async ({ key }) => {
    try {
        try {
            return JSON.parse(await redis_db_1.redisClient.get(key));
        }
        catch (error) {
            return await redis_db_1.redisClient.get(key);
        }
    }
    catch (error) {
        console.log("error to get data in redis", error);
    }
};
exports.getValue = getValue;
const exists = async ({ key }) => {
    try {
        return await redis_db_1.redisClient.exists(key);
    }
    catch (error) {
        console.log("error to exists data in redis", error);
    }
};
exports.exists = exists;
const ttl = async ({ key }) => {
    try {
        return await redis_db_1.redisClient.ttl(key);
    }
    catch (error) {
        console.log("error to get ttl data in redis", error);
    }
};
exports.ttl = ttl;
const deleteKey = async ({ key }) => {
    try {
        if (!key.length)
            return 0;
        return await redis_db_1.redisClient.del(key);
    }
    catch (error) {
        console.log("error to delete data in redis", error);
    }
};
exports.deleteKey = deleteKey;
const expire = async ({ key, ttl }) => {
    try {
        return await redis_db_1.redisClient.expire(key, ttl);
    }
    catch (error) {
        console.log("error to expire data in redis", error);
    }
};
exports.expire = expire;
const keys = async ({ pattern }) => {
    try {
        return await redis_db_1.redisClient.keys(`${pattern}*`);
    }
    catch (error) {
        console.log("error to get keys from redis", error);
    }
};
exports.keys = keys;
const incr = async ({ key }) => {
    try {
        return await redis_db_1.redisClient.incr(key);
    }
    catch (error) {
        console.log("error to incr keys from redis", error);
    }
};
exports.incr = incr;
