import { config } from "dotenv";
import { resolve } from "node:path";


const env = process.env
const NODE_ENV = env.NODE_ENV
config({path:resolve(__dirname , `../../.env.${NODE_ENV}`)})

export const PORT:number = Number(env.PORT) || 5002 
export const WHITLIST = env.WHITLIST?.split(",") || []
export const DB_URI:string = env.DB_URI || ""
export const SALT_ROUNDS:number = Number(env.SALT_ROUNDS) || 12
export const EMAIL:string = env.EMAIL || ""
export const PASSWORD:string = env.PASSWORD|| ""
export const CLOUD_NAME = env.CLOUD_NAME
export const API_KEY:number = Number(env.API_KEY) || 5002 
export const API_SECRET = env.API_SECRET
export const ACCESS_SEUCRIT_KEY_USER = env.ACCESS_SEUCRIT_KEY_USER
export const ACCESS_SEUCRIT_KEY_ADMIN = env.ACCESS_SEUCRIT_KEY_ADMIN
export const REFRESH_SEUCRIT_KEY_USER = env.REFRESH_SEUCRIT_KEY_USER
export const REFRESH_SEUCRIT_KEY_ADMIN = env.REFRESH_SEUCRIT_KEY_ADMIN
export const PERFIX_USER = env.PERFIX_USER
export const PERFIX_ADMIN = env.PERFIX_ADMIN
export const REDIS_URL = env.REDIS_URL
export const CLIENT_ID = env.CLIENT_ID

