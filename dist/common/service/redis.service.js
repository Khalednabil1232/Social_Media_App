"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_service_1 = require("../../config/config.service");
const event_enum_1 = require("../enum/event.enum");
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: config_service_1.REDIS_URL
        });
        this.handelEvents();
    }
    handelEvents() {
        this.client.on("err", (error) => {
            console.error('sync to connect to the database.......', error);
        });
    }
    async connect() {
        this.client.connect();
        console.log("success to connect with redis........👀");
    }
    revoke_key = ({ userId, jti }) => {
        return `redis_token::${userId}::${jti}`;
    };
    get_keys = ({ userId }) => {
        return `redis_token::${userId}`;
    };
    otp_key = ({ email, subject = event_enum_1.EventEnum.confirmeEmail }) => {
        return `otp::${email}::${subject}`;
    };
    max_otp_key = ({ email }) => {
        return `${this.otp_key({ email })}::max`;
    };
    block_otp_key = ({ email }) => {
        return `${this.otp_key({ email })}::block`;
    };
    setValue = async ({ key, value, ttl }) => {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl ? await this.client.set(key, data, { EX: ttl }) : await this.client.set(key, data);
        }
        catch (error) {
            console.log("error to set data in redis", error);
        }
    };
    update = async ({ key, value, ttl }) => {
        try {
            if (!await this.client.exists(key))
                return 0;
            return await this.setValue({ key, value, ttl });
        }
        catch (error) {
            console.log("error to update data in redis", error);
        }
    };
    getValue = async ({ key }) => {
        try {
            try {
                return JSON.parse(await this.client.get(key));
            }
            catch (error) {
                return await this.client.get(key);
            }
        }
        catch (error) {
            console.log("error to get data in redis", error);
        }
    };
    exists = async ({ key }) => {
        try {
            return await this.client.exists(key);
        }
        catch (error) {
            console.log("error to exists data in redis", error);
        }
    };
    ttl = async ({ key }) => {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            console.log("error to get ttl data in redis", error);
        }
    };
    deleteKey = async ({ key }) => {
        try {
            if (!key.length)
                return 0;
            return await this.client.del(key);
        }
        catch (error) {
            console.log("error to delete data in redis", error);
        }
    };
    expire = async ({ key, ttl }) => {
        try {
            return await this.client.expire(key, ttl);
        }
        catch (error) {
            console.log("error to expire data in redis", error);
        }
    };
    keys = async ({ pattern }) => {
        try {
            return await this.client.keys(`${pattern}*`);
        }
        catch (error) {
            console.log("error to get keys from redis", error);
        }
    };
    incr = async ({ key }) => {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            console.log("error to incr keys from redis", error);
        }
    };
}
exports.default = new RedisService();
