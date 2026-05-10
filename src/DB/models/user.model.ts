import mongoose, { Types } from "mongoose";
import { GenderEnum, providerEnum, RoleEnum } from "../../common/enum/user.enum";
import { hash_password } from "../../common/utils/security/hash_password";




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
    deleteAt?:string,
    profilePicture?: {
        secure_url?: string;
        public_id?: string;
    },
    friends?: Types.ObjectId[],
    provider?:providerEnum,
    
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
            minlength:3,
            maxlength:20
        },
        email: {
        type: String,
        unique:true,
        trim:true,
        required: true
    },
    password: {
            type: String,
            required: function () {
                return this.provider !== providerEnum.google;
            },
            trim: true,
            minlength: 7
        },
    age:{
        type:Number,
        min:18,
        max:60
    },
    gender:{
        type:String,
        enum: Object.values(GenderEnum),
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
    deleteAt: String,

    role:{
        type:String,
        enum:RoleEnum,
        default:RoleEnum.user
        
    },
    profilePicture: {
            secure_url: { type: String, default: null },
            public_id: { type: String, default: null }
        },
    confirmEmail:Boolean,
    friends:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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

// userSchema.pre("save" , function()
// {
//     console.log("....pre save hook is running.....");
//     console.log(this);
//     this.password = hash_password({myPlaintextPassword:this.password})
// })

// userSchema.post("save" , function ()
// {
//     console.log("...............post hook2...........");
//     console.log(this);
    
// })

// userSchema.pre("validate" , function ()
// {
//     console.log("...............pre validate hook1.............");
//     console.log(this);

//     if((this.age! <20))
//     {
//         throw new AppError("age is to small")
        
//     }
    
    
// })

// userSchema.post("validate" , function ()
// {
//     console.log("...............post validate hook2...........");
//     console.log(this);
    
// })

// userSchema.pre("save" , function (this:HydratedDocument<Iuser>&{is_new : boolean})
// {
//     console.log("...............pre hook1.............");
//     console.log(this);
//     this.is_new = this.isNew
//     if(this.isModified("password"))


// userSchema.pre("save" , function (doc)
// {
//     console.log("...............pre hook insert Many...........");
//     console.log(this);
//     console.log(doc);
    
    
// })

// userSchema.post("insertMany" , function (save)
// {
//     console.log("...............pre hook insert Many...........");
//     console.log(this);
//     console.log(save);
    
    
// })

// userSchema.pre("findOne" , function ()
// {
//     console.log("...............pre hook find one ...........");
//     console.log(this.getQuery());
//     const {paranoid, ...rest} = this.getQuery()
//     console.log({rest});
    
//     if(paranoid == false)
//     {
//         this.setQuery({...rest})
//     }else {
//         this.setQuery({...rest, deleteAt: {$exists: false}})
//     }
    
    
    
// })




const userModel = mongoose.models.user || mongoose.model<Iuser>("user" , userSchema)

export default userModel