"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_service_1 = require("../../config/config.service");
const node_crypto_1 = require("node:crypto");
const multer_enum_1 = require("../enum/multer.enum");
const node_fs_1 = __importDefault(require("node:fs"));
const global_error_handler_1 = require("../utils/global-error/global-error-handler");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_service_1.AWS_REGION,
            credentials: {
                accessKeyId: config_service_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_service_1.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async upload({ store_type = multer_enum_1.Store_Enum.memory, file, path = "General", ACL = client_s3_1.ObjectCannedACL.private }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            ACL,
            Key: `social_Media_App/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
            Body: store_type === multer_enum_1.Store_Enum.memory ? file.buffer : node_fs_1.default.createReadStream(file.path),
            ContentType: file.mimetype,
        });
        await this.client.send(command);
        if (!command.input.Key) {
            throw new global_error_handler_1.AppError(`fail to upload file`);
        }
        return command.input.Key;
    }
    async uploadLargeFile({ store_type = multer_enum_1.Store_Enum.disk, file, path = "General", ACL = client_s3_1.ObjectCannedACL.private }) {
        const command = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: config_service_1.AWS_BUCKET_NAME,
                ACL,
                Key: `social_Media_App/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
                Body: store_type === multer_enum_1.Store_Enum.memory ? file.buffer : node_fs_1.default.createReadStream(file.path),
                ContentType: file.mimetype,
            }
        });
        command.on("httpUploadProgress", (progress) => {
            console.log(progress);
        });
        const result = await command.done();
        return result.Key;
    }
    async uploadFiles({ isLarge = false, store_type = multer_enum_1.Store_Enum.disk, files, path = "General", ACL = client_s3_1.ObjectCannedACL.private }) {
        let urls = [];
        if (isLarge) {
            urls = await Promise.all(files.map((file) => {
                return this.uploadLargeFile({ store_type, file, path, ACL });
            }));
        }
        else {
            urls = await Promise.all(files.map((file) => {
                return this.upload({ store_type, file, path, ACL });
            }));
        }
        return urls;
    }
    async createPresigneUrl({ fileName, path, ContentType, expiresIn = 60 }) {
        const cleanFileName = fileName.replace(/\//g, "_");
        const Key = `social_Media_App/${path}/${(0, node_crypto_1.randomUUID)()}__${cleanFileName}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key,
            ContentType
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return { url, Key };
    }
    async getFile(Key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key
        });
        return await this.client.send(command);
    }
    async getPresigneUrl({ Key, expiresIn = 60, download }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key,
            ResponseContentDisposition: download ? `attachment; filename="${Key.split("/").pop()}"` : undefined
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
        return url;
    }
    async getFiles(folderName) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Prefix: `social_Media_App/${folderName}`
        });
        return await this.client.send(command);
    }
    async deleteFile(Key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Key
        });
        return await this.client.send(command);
    }
    async deleteFiles(Keys) {
        const keyMapped = Keys.map((K) => {
            return { Key: K };
        });
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket: config_service_1.AWS_BUCKET_NAME,
            Delete: {
                Objects: keyMapped,
            }
        });
        return await this.client.send(command);
    }
    async deleteFolder(folderName) {
        const data = await this.getFiles(folderName);
        const keyMapped = data?.Contents?.map((K) => {
            return K.Key;
        });
        return await this.deleteFiles(keyMapped);
    }
}
exports.S3Service = S3Service;
