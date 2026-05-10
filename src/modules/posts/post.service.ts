import type { NextFunction , Request , Response } from "express"
import successResponse from "../../common/utils/success_respons/success.respons"
import postRepository from "../../DB/repositories/post.repository"
import RedisService from "../../common/service/redis.service";
import TokenService from "../../common/utils/token/token.service";
import { S3Service } from "../../common/service/s3.service";
import notificationService from "../../common/service/notification.service";
import { createPostDto, PostIdDto, updatePostDto } from "./post.dto";
import { AppError } from "../../common/utils/global-error/global-error-handler";
import { Types } from "mongoose";
import { Store_Enum } from "../../common/enum/multer.enum";
import { randomUUID } from "node:crypto";
import { availabilityposts } from "../../common/utils/post.utils";


class postServies {

    private readonly _postModel = new postRepository()
    private readonly _s3Service = new S3Service()
    private readonly _redisService = RedisService
    private readonly _tokenService = TokenService
    private readonly _notificationService = notificationService



    constructor() {}


    createPost = async (req: Request , res : Response , next : NextFunction)=>
{

        const{availability , allowComment , tags ,  content }:createPostDto= req.body

        let mentions:Types.ObjectId[] = []
        let fcmTokens:string[] = []
        if(tags?.length){

        const mentionTags = await this._postModel.find(
            {
                filter:
                {
                    _id:{$in:tags}
                }
            }
        )

        if(tags.length !== mentionTags.length)
        {
            throw new AppError("inValid tag id")
        }

        for (const mention of mentionTags) {
            mentions.push(mention._id);
(await this._redisService.getFCMs({ userId: mention._id })).map((token: string)=>fcmTokens.push(token))
            }
        }
        let urls : string[] = []
        let folderId = randomUUID()
            if(req?.files){
                urls = await this._s3Service.uploadFiles({
                    files:req.files as Express.Multer.File[],
                    path:`users/${req.user._id}/posts/${folderId}`,
                    store_type:Store_Enum.memory,
                })
            }

            const post = await this._postModel.create({
                attachments:urls,
                content:content!,
                createdBy:req.user._id,
                tags:mentions,
                allowComment:allowComment,
                availability:availability,
                folderId,
            })

            if(!post){
                await this._s3Service.deleteFiles(urls)
                throw new AppError("Failed to create post")
            }

            if(fcmTokens.length){
                await this._notificationService.sendNotifications({
                    tokens:fcmTokens,
                    data:{
                        title:"New Post",
                        body:`${req.user.userName} has mentioned you in a post.`,
                    }
                })
            }
    successResponse({res,data:post,message:"Post created successfully"})
}


    getPosts  = async (req: Request , res : Response , next : NextFunction)=>
{

            const post  = await this._postModel.Paginate({
                page:+req?.query.page!,
                limit:+req?.query.limit!,
                search:{
                    ...availabilityposts(req),
                    ...(req?.query.search ? {content:{$regex:req.query.search as string , $options:"i"}} : {})
                },
                
            })



    successResponse({res,data:post,message:"Post created successfully"})
}

    likePost = async (req: Request , res : Response , next : NextFunction)=>
{

    const{postId} = req.params
    const{flag} = req.query

    let updateQuery : any = {
        $addToSet:{
            likes:req.user._id
        }
    }
    if(flag && flag === "unlike")
    {
        updateQuery = {
            $pull:{
            likes:req.user?._id
        }}
    }

            const post  = await this._postModel.findOneAndUpdate({
                filter:{
                    _id:postId,
                    ...availabilityposts(req)

                },
                update:{
                    $addToSet:{
                        likes:req.user._id
                    }
                }
            })

            if (!post) {
                throw new AppError("Post not found or you don't have access to it",404)
            }



    successResponse({res,data:post,message:"Post created successfully"})
}

    updatePost = async (req: Request , res : Response , next : NextFunction)=>
{

        const{postId} : PostIdDto= req.params
        const{availability , allowComment , tags ,  content , removeTags , removeFiles }:updatePostDto= req.body

        const post = await this._postModel.findOne({
            filter:{
                _id:postId,
                createdBy:req?.user._id
            }
        })
        if(!post)
        {
            throw new AppError("Post not found or Not authorized",404)
        }

        if(removeFiles?.length){
            const invalidFiles = removeFiles.attachments?.filter((file:string)=>{
                return !post.attachments?.includes(file)
            })
            if(invalidFiles?.length){
                throw new AppError("Invalid files to remove")
            }
            await this._s3Service.deleteFiles(removeFiles)

            post.attachments = post.attachments?.filter((file:string)=> {
                return !removeFiles.attachments?.includes(file)
            })as string[]
        }

        const updateTags = new Set(post?.tags?.map(id => id.toString()))

        removeTags?.forEach((tag:string)=>{
            return updateTags.delete(tag)
        })

        let fcmTokens:string[] = []
        if(tags?.length){

        const mentionTags = await this._postModel.find(
            {
                filter:
                {
                    _id:{$in:tags}
                }
            }
        )

        if(tags.length !== mentionTags.length)
        {
            throw new AppError("inValid tag id")
        }

        for (const tag of mentionTags) {
            if(tag._id.toString() === req.user._id.toString()){
                throw new AppError("You can't tag yourself")
            }
            updateTags.add(tag._id.toString());
            (await this._redisService.getFCMs({ userId: tag._id })).map((token: string)=>fcmTokens.push(token))
            }

        }
        post.tags = [...updateTags].map((id : string) => new Types.ObjectId(id))

        
            if(req?.files?.length){
                let urls = await this._s3Service.uploadFiles({
                    files:req.files as Express.Multer.File[],
                    path:`users/${req.user._id}/posts/${post.folderId}`,
                    store_type:Store_Enum.memory,
                })
                post.attachments?.push(...urls)
            }

            if(fcmTokens.length){
                await this._notificationService.sendNotifications({
                    tokens:fcmTokens,
                    data:{
                        title:"New Post Update",
                        body:`${req.user.userName} has updated a post and mentioned you.`,
                    }
                })
            
            } 
            if(content) post.content = content
            if(allowComment) post.allowComment = allowComment
            if(availability) post.availability = availability
            
            await post.save()



    successResponse({res })
}



}



export default new postServies()