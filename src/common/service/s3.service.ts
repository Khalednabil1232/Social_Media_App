import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectAclCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_BUCKET_NAME, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "../../config/config.service";
import { randomUUID } from "node:crypto";
import { Store_Enum } from "../enum/multer.enum";
import fs from 'node:fs';
import { AppError } from "../utils/global-error/global-error-handler";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



export class S3Service
{
    private client :S3Client
    constructor() {
        this.client = new S3Client(
            {
                region:AWS_REGION!,
                credentials:
                {
                    accessKeyId:AWS_ACCESS_KEY_ID!,
                    secretAccessKey:AWS_SECRET_ACCESS_KEY!
                }
            }
        )
    }

    async upload ({store_type=Store_Enum.memory,file,path="General",ACL=ObjectCannedACL.private}:
        {store_type?:Store_Enum,file:Express.Multer.File,path?:string,ACL?:ObjectCannedACL}):Promise<string>
    {
        
        const command = new PutObjectCommand(
            {
                Bucket:AWS_BUCKET_NAME!,
                ACL,
                Key:`social_Media_App/${path}/${randomUUID()}__${file.originalname}`,
                Body:store_type === Store_Enum.memory ?file.buffer: fs.createReadStream(file.path),
                ContentType:file.mimetype,
            }
        )

        await this.client.send(command)
        if(!command.input.Key)
        {
            throw new AppError(`fail to upload file`)
        }
        return command.input.Key
    }

    async uploadLargeFile ({store_type=Store_Enum.disk,file,path="General",ACL=ObjectCannedACL.private}:
        {store_type?:Store_Enum,file:Express.Multer.File,path?:string,ACL?:ObjectCannedACL}):Promise<string>
    {
        const command = new Upload(
            {
                client:this.client,
                params:
                {
                Bucket:AWS_BUCKET_NAME!,
                ACL,
                Key:`social_Media_App/${path}/${randomUUID()}__${file.originalname}`,
                Body:store_type === Store_Enum.memory ?file.buffer: fs.createReadStream(file.path),
                ContentType:file.mimetype,
                }
            }
        )


        command.on("httpUploadProgress", (progress) => {
        console.log(progress);
        });

        const result =  await command.done()

        return result.Key!
    }

        async uploadFiles ({isLarge = false,store_type=Store_Enum.disk,files,path="General",ACL=ObjectCannedACL.private}:
        {isLarge?: boolean,store_type?:Store_Enum,files:Express.Multer.File[],path?:string,ACL?:ObjectCannedACL})
        {
            let urls:string[]=[]
            if(isLarge)
            {
                urls=  await Promise.all(files.map((file)=>
            {
                return this.uploadLargeFile({store_type , file , path , ACL })
            }))
            }else
            {
                urls=  await Promise.all(files.map((file)=>
            {
                return this.upload({store_type , file , path , ACL })
            }))
            }

            return urls
            

        }


        async createPresigneUrl ({
            fileName,
            path,
            ContentType,
            expiresIn = 60


        }:{
            fileName:string,
            path:string,
            ContentType:string,
            expiresIn?:number
        })
        {
            const cleanFileName = fileName.replace(/\//g, "_");
            const Key = `social_Media_App/${path}/${randomUUID()}__${cleanFileName}`
            const command = new PutObjectCommand(
                {
                    Bucket:AWS_BUCKET_NAME,
                    Key,
                    ContentType
                })

                const url = await getSignedUrl(this.client , command , {expiresIn})
                return {url , Key}

        }


        async getFile (Key:string)
        {

            const command = new GetObjectCommand(
                {
                    Bucket:AWS_BUCKET_NAME,
                    Key
                })
                    return await this.client.send(command) 

        }

        async getPresigneUrl ({
            Key,
            expiresIn = 60,
            download
        }:{
            Key:string,
            expiresIn?:number,
            download?:string | undefined
        })
        {
            
            const command = new GetObjectCommand(
                {
                    Bucket:AWS_BUCKET_NAME,
                    Key,
                    ResponseContentDisposition:download? `attachment; filename="${Key.split("/").pop()}"`:undefined
                    
                })

                const url = await getSignedUrl(this.client , command , {expiresIn})
                return url 

        }


        async getFiles (folderName:string)
        {

            const command = new ListObjectsV2Command(
                {
                    Bucket:AWS_BUCKET_NAME,
                    Prefix:`social_Media_App/${folderName}`
                    
                })
                    return await this.client.send(command) 

        }


        async deleteFile (Key:string)
        {

            const command = new DeleteObjectCommand(
                {
                    Bucket:AWS_BUCKET_NAME,
                    Key
                })
                    return await this.client.send(command) 

        }


        async deleteFiles (Keys:string[])
        {
            const keyMapped = Keys.map((K)=>
            {
                return {Key:K}
            })
            const command = new DeleteObjectsCommand(
                {
                    Bucket:AWS_BUCKET_NAME,
                    Delete:
                    {
                        Objects:keyMapped,
                        // Quiet:false
                    }
                })
                    return await this.client.send(command) 

        }


        async deleteFolder (folderName:string)
        {
            const data = await this.getFiles(folderName)

            const keyMapped = data?.Contents?.map((K)=>
            {
                return K.Key
            })
                    return await this.deleteFiles(keyMapped as string[]) 

        }
}