"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const success_respons_1 = __importDefault(require("../../common/utils/success_respons/success.respons"));
const post_repository_1 = __importDefault(require("../../DB/repositories/post.repository"));
const redis_service_1 = __importDefault(require("../../common/service/redis.service"));
const token_service_1 = __importDefault(require("../../common/utils/token/token.service"));
const s3_service_1 = require("../../common/service/s3.service");
const notification_service_1 = __importDefault(require("../../common/service/notification.service"));
const global_error_handler_1 = require("../../common/utils/global-error/global-error-handler");
const mongoose_1 = require("mongoose");
const multer_enum_1 = require("../../common/enum/multer.enum");
const node_crypto_1 = require("node:crypto");
const post_utils_1 = require("../../common/utils/post.utils");
class postServies {
    _postModel = new post_repository_1.default();
    _s3Service = new s3_service_1.S3Service();
    _redisService = redis_service_1.default;
    _tokenService = token_service_1.default;
    _notificationService = notification_service_1.default;
    constructor() { }
    createPost = async (req, res, next) => {
        const { availability, allowComment, tags, content } = req.body;
        let mentions = [];
        let fcmTokens = [];
        if (tags?.length) {
            const mentionTags = await this._postModel.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (tags.length !== mentionTags.length) {
                throw new global_error_handler_1.AppError("inValid tag id");
            }
            for (const mention of mentionTags) {
                mentions.push(mention._id);
                (await this._redisService.getFCMs({ userId: mention._id })).map((token) => fcmTokens.push(token));
            }
        }
        let urls = [];
        let folderId = (0, node_crypto_1.randomUUID)();
        if (req?.files) {
            urls = await this._s3Service.uploadFiles({
                files: req.files,
                path: `users/${req.user._id}/posts/${folderId}`,
                store_type: multer_enum_1.Store_Enum.memory,
            });
        }
        const post = await this._postModel.create({
            attachments: urls,
            content: content,
            createdBy: req.user._id,
            tags: mentions,
            allowComment: allowComment,
            availability: availability,
            folderId,
        });
        if (!post) {
            await this._s3Service.deleteFiles(urls);
            throw new global_error_handler_1.AppError("Failed to create post");
        }
        if (fcmTokens.length) {
            await this._notificationService.sendNotifications({
                tokens: fcmTokens,
                data: {
                    title: "New Post",
                    body: `${req.user.userName} has mentioned you in a post.`,
                }
            });
        }
        (0, success_respons_1.default)({ res, data: post, message: "Post created successfully" });
    };
    getPosts = async (req, res, next) => {
        const post = await this._postModel.Paginate({
            page: +req?.query.page,
            limit: +req?.query.limit,
            search: {
                ...(0, post_utils_1.availabilityposts)(req),
                ...(req?.query.search ? { content: { $regex: req.query.search, $options: "i" } } : {})
            },
        });
        (0, success_respons_1.default)({ res, data: post, message: "Post created successfully" });
    };
    likePost = async (req, res, next) => {
        const { postId } = req.params;
        const { flag } = req.query;
        let updateQuery = {
            $addToSet: {
                likes: req.user._id
            }
        };
        if (flag && flag === "unlike") {
            updateQuery = {
                $pull: {
                    likes: req.user?._id
                }
            };
        }
        const post = await this._postModel.findOneAndUpdate({
            filter: {
                _id: postId,
                ...(0, post_utils_1.availabilityposts)(req)
            },
            update: {
                $addToSet: {
                    likes: req.user._id
                }
            }
        });
        if (!post) {
            throw new global_error_handler_1.AppError("Post not found or you don't have access to it", 404);
        }
        (0, success_respons_1.default)({ res, data: post, message: "Post created successfully" });
    };
    updatePost = async (req, res, next) => {
        const { postId } = req.params;
        const { availability, allowComment, tags, content, removeTags, removeFiles } = req.body;
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                createdBy: req?.user._id
            }
        });
        if (!post) {
            throw new global_error_handler_1.AppError("Post not found or Not authorized", 404);
        }
        if (removeFiles?.length) {
            const invalidFiles = removeFiles.attachments?.filter((file) => {
                return !post.attachments?.includes(file);
            });
            if (invalidFiles?.length) {
                throw new global_error_handler_1.AppError("Invalid files to remove");
            }
            await this._s3Service.deleteFiles(removeFiles);
            post.attachments = post.attachments?.filter((file) => {
                return !removeFiles.attachments?.includes(file);
            });
        }
        const updateTags = new Set(post?.tags?.map(id => id.toString()));
        removeTags?.forEach((tag) => {
            return updateTags.delete(tag);
        });
        let fcmTokens = [];
        if (tags?.length) {
            const mentionTags = await this._postModel.find({
                filter: {
                    _id: { $in: tags }
                }
            });
            if (tags.length !== mentionTags.length) {
                throw new global_error_handler_1.AppError("inValid tag id");
            }
            for (const tag of mentionTags) {
                if (tag._id.toString() === req.user._id.toString()) {
                    throw new global_error_handler_1.AppError("You can't tag yourself");
                }
                updateTags.add(tag._id.toString());
                (await this._redisService.getFCMs({ userId: tag._id })).map((token) => fcmTokens.push(token));
            }
        }
        post.tags = [...updateTags].map((id) => new mongoose_1.Types.ObjectId(id));
        if (req?.files?.length) {
            let urls = await this._s3Service.uploadFiles({
                files: req.files,
                path: `users/${req.user._id}/posts/${post.folderId}`,
                store_type: multer_enum_1.Store_Enum.memory,
            });
            post.attachments?.push(...urls);
        }
        if (fcmTokens.length) {
            await this._notificationService.sendNotifications({
                tokens: fcmTokens,
                data: {
                    title: "New Post Update",
                    body: `${req.user.userName} has updated a post and mentioned you.`,
                }
            });
        }
        if (content)
            post.content = content;
        if (allowComment)
            post.allowComment = allowComment;
        if (availability)
            post.availability = availability;
        await post.save();
        (0, success_respons_1.default)({ res });
    };
}
exports.default = new postServies();
