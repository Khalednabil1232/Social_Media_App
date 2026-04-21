import mongoose, { Types } from "mongoose";
import { GenderEnum, RoleEnum } from "../../common/enum/user.enum";




export interface Iuser
{
    _id:Types.ObjectId,
    firstName:string,
    lastName:string,
    email:string,
    password:string,
    userName?:string,
    age?:number,
    gender?:GenderEnum,
    phone?:string,
    address?:string,
    role?:RoleEnum,
    confirmEmail?:boolean,
    createdAt:Date,
    updatedAt:Date,
    changeCredential?: Date;

    
    
}
const userSchema = new mongoose.Schema<Iuser>(
    {
        firstName:{
            type:String,
            required:true,
            trim:true,
            min:3,
            max:20
            
        },
        lastName:{
            type:String,
            required:true,
            trim:true,
            min:3,
            max:20
        },
        email: {
        type: String,
        unique:true,
        trim:true,
        required: true
    },
    password: {
        type: String,
        required: true,
        min:3,
        max:20
    },
    age:{
        type:Number,
        min:18,
        max:60
    },
    gender:{
        type:String,
        enum:GenderEnum,
        default:GenderEnum.male
        
    },
    phone:{
        type:String,
        trim:true
        
    },
    address:{
        type:String,
        trim:true
        
    },
    role:{
        type:String,
        enum:RoleEnum,
        default:RoleEnum.user
        
    },
    confirmEmail:Boolean
    },
    {
        timestamps: true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true},
        strictQuery:true
    }
)
userSchema.virtual("userName")
.get(function()
{
    return this.firstName + " " + this.lastName
})
.set(function(v)
{
    this.firstName = v.split(" ")[0]
    this.lastName = v.split(" ")[1]
})
const userModel = mongoose.models.user || mongoose.model<Iuser>("user" , userSchema)

export default userModel