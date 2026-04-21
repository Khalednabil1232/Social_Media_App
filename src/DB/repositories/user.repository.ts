import { Model } from "mongoose";
import userModel, { Iuser } from "../models/user.model";
import BaseRepository from "./base.repository";




class UserRepository extends BaseRepository<Iuser>
{
    constructor(protected readonly model : Model<Iuser>= userModel)
    {
        super(model)
    }


}

export default UserRepository