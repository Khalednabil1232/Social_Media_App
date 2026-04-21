import { HydratedDocument } from "mongoose";
import { Iuser } from "../../DB/models/user.model";
import { JwtPayload } from "jsonwebtoken";
import { RoleEnum } from "../enum/user.enum";




declare module "express-serve-static-core"
{
    interface Request{
        user :HydratedDocument<Iuser>;
        decoded:JwtPayload
    }
}