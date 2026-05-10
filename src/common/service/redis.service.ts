import { createClient, RedisClientType } from "redis"
import { REDIS_URL } from "../../config/config.service";
import { Types } from "mongoose";
import { EventEnum } from "../enum/event.enum";


class RedisService{
    private readonly client : RedisClientType
    constructor(){
        this.client =createClient({
        url:REDIS_URL!
        });
        this.handelEvents()
    }

    handelEvents()
    {
        this.client.on("err" , (error)=>
        {
        console.error('sync to connect to the database.......', error);
        })
    }
    async connect()
    {
        this.client.connect()
        console.log("success to connect with redis........👀");
    }

    
    revoke_key = ({userId , jti}:{userId:Types.ObjectId , jti:string})=>
    {
        return `redis_token::${userId}::${jti}`
    }
    
    get_keys = ({userId}:{userId:Types.ObjectId})=>
    {
        return `redis_token::${userId}`
    }
    
    otp_key = ({email , subject = EventEnum.confirmeEmail}:{email:string , subject?: EventEnum})=>
    {
        return `otp::${email}::${subject}`
    }
    
    max_otp_key = ({email}:{email:string})=>
    {
        return `${this.otp_key({email})}::max`
    }
    
    block_otp_key = ({email}:{email:string})=>
    {
        return `${this.otp_key({email})}::block`
    }
    
    
    setValue = async({key , value , ttl}:{key:string , value:string|object , ttl:number})=>
    {
        try {
            const data = typeof value === "string" ? value :JSON.stringify(value)
            return ttl ? await this.client.set(key , data , {EX:ttl}): await this.client.set(key , data)
    
    
        } catch (error) {
            console.log("error to set data in redis" , error);
            
        }
    }
    
    update = async({key , value , ttl}:{key:string , value:string , ttl:number})=>
    {
        try {
            if(!await this.client.exists(key))return 0
            return await this.setValue({key , value , ttl})
        } catch (error) {
            console.log("error to update data in redis" , error);
            
        }
    }
    
    getValue = async({key}:{key:string})=>
    {
        try {
            try {
                return JSON.parse(await this.client.get(key) as string)
            } catch (error) {
                return await this.client.get(key)
            }
    
        } catch (error) {
            console.log("error to get data in redis" , error);
            
        }
    }
    
    exists = async ({key}:{key:string})=>
    {
        try {
            return await this.client.exists(key)
        } catch (error) {
            console.log("error to exists data in redis" , error);
        }
    }
    
    ttl = async ({key}:{key:string})=>
    {
        try {
            return await this.client.ttl(key)
        } catch (error) {
            console.log("error to get ttl data in redis" , error);
        }
    }
    
    deleteKey = async ({key}:{key:string|string[]})=>
    {
        try {
    
            if(!key.length) return 0
            return await this.client.del(key)
        } catch (error) {
            console.log("error to delete data in redis" , error);
        }
    }
    
    expire = async ({key , ttl}:{key:string , ttl:number})=>
    {
        try {
            return await this.client.expire(key , ttl)
            
        } catch (error) {
            console.log("error to expire data in redis" , error);
        }
    }
    
    keys = async ({pattern}:{pattern:string})=>
    {
        try {
            return await this.client.keys(`${pattern}*`)
        } catch (error) {
            console.log("error to get keys from redis" , error);
        }
    }
    
    incr = async ({key}:{key:string})=>
    {
        try {
            return await this.client.incr(key)
        } catch (error) {
            console.log("error to incr keys from redis" , error);
        }
    }

        key(userId:Types.ObjectId) {
            return `user: FCM: ${userId}` ;
            }
        async addFCM({userId, FCMToken}:{userId:Types.ObjectId,FCMToken:string}) {
            return await this.client.sAdd(this.key(userId), FCMToken);
        }
        async removeFCM({userId, FCMToken}:{userId:Types.ObjectId,FCMToken:string}) {
            return await this.client.sRem(this.key(userId), FCMToken);
        }
        async getFCMs({userId}:{userId:Types.ObjectId}) {
            return await this.client.sMembers(this.key(userId));
        }
        async hasFCMs({userId}:{userId:Types.ObjectId}) {
            return await this.client.sCard(this.key(userId));
        }
            async removeFCMUser({userId}:{userId:Types.ObjectId}) {
        return await this.client.del(this.key(userId));
        }






}

export default new RedisService()