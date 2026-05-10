import mongoose, { Types } from "mongoose";
import { AllowCommentsEnum, Availability_Enum } from "../../common/enum/post.enum";






export interface IPost {
    content?: string,
    attachments?: string[],

    createdBy: Types.ObjectId,

    tags?: Types.ObjectId[],
    likes?: Types.ObjectId[]

    allowComment?: AllowCommentsEnum,
    availability?: Availability_Enum,

    folderId: string
}


const postSchema = new mongoose.Schema<IPost>(
    {
        content:{type:String ,min:1 , required:function(this)
            {
                return ! this.attachments?.length
            }
        },

        attachments:[String],

        createdBy:{type:Types.ObjectId , ref:"user" , required:true},

        tags:{type:Types.ObjectId , ref:"user" },
        likes:{type:Types.ObjectId , ref:"user"},

        allowComment:{type:String , enum:AllowCommentsEnum , default:AllowCommentsEnum.allow},
        availability:{type:String , enum:Availability_Enum , default:Availability_Enum.public},

        folderId: String


        
        
    
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strict:true,
        strictQuery: true
    }
);



// postSchema.pre("findOne" , function ()
// {
//     console.log("...............pre findOne hook1.............");
//     console.log(this.getQuery());
//     const {paranoid,...rest} = this.getQuery()
//     console.log({rest});
//     if(paranoid == false)
//     {
//         this.setQuery({...rest})
//     }
//     else
//     {
//         this.setQuery({...rest , deletedAt:{$exists:false}})
//     }
// })


const postModel = mongoose.models.Post || mongoose.model<IPost>("Post" , postSchema)

export default postModel