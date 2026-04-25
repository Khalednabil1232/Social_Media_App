import mongoose from "mongoose";
import { DB_URI } from "../config/config.service";

const checkConnectionDB = async()=>
{
    try {
        await mongoose.connect(DB_URI,{serverSelectionTimeoutMS:5000})
                console.log(`Connected successfully to server${DB_URI}..⏳✅`);

    } catch (error) {
                console.error('sync to connect to the database.......', error);

    }
}
export default checkConnectionDB