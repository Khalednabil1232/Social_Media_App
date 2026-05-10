import * as z from "zod"
import { AllowCommentsEnum, Availability_Enum } from "../../common/enum/post.enum"
import { GeneralRules } from "../../common/utils/security/generalRules.util"


export const createPostSchema:any = {
    body:z.strictObject({
        content: z.string().optional(),
        attachments : z.array(GeneralRules.file).optional(),
        tags: z.array(GeneralRules.id).optional(),

        allowComment: z.enum(AllowCommentsEnum).default(AllowCommentsEnum.allow),
        availability: z.enum(Availability_Enum).default(Availability_Enum.friends)
    
}).superRefine((args , ctx)=>
{
    if(!args.content && !args.attachments?.length)
    {
        ctx.addIssue(
            {
                code:"custom",
                path:["content"],
                message:"content is requierd"
            }
        )
    }

    if(args?.tags)
    {
        const uniqeTags = new Set(args.tags)
        if(args.tags.length !== uniqeTags.size)
        {
            ctx.addIssue({
                code:"custom",
                path:["tags"],
                message:"Duplicate tags"
            })
        }
    }
})
}


export const likePostSchema:any = {
    params:z.strictObject({
    postId: GeneralRules.id,

})
}

export const updatePostSchema:any = {
    body:z.strictObject({
        content: z.string().optional(),
        attachments : z.array(GeneralRules.file).optional(),
        removeFiles : z.array(z.string()).optional(),
        tags: z.array(GeneralRules.id).optional(),
        removeTags: z.array(GeneralRules.id).optional(),
        allowComment: z.enum(AllowCommentsEnum).default(AllowCommentsEnum.allow),
        availability: z.enum(Availability_Enum).default(Availability_Enum.friends)
    
}).superRefine((args , ctx)=>
{
    
    

    if(args?.tags)
    {
        const uniqeTags = new Set(args.tags)
        if(args.tags.length !== uniqeTags.size)
        {
            ctx.addIssue({
                code:"custom",
                path:["tags"],
                message:"Duplicate tags"
            })
        }
    }
}), 
    params:likePostSchema.params
}




