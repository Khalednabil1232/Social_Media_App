"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const config_service_1 = require("./config/config.service");
const success_respons_1 = __importDefault(require("./common/utils/success_respons/success.respons"));
const global_error_handler_1 = require("./common/utils/global-error/global-error-handler");
const connectionDB_1 = __importDefault(require("./DB/connectionDB"));
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
const redis_service_1 = __importDefault(require("./common/service/redis.service"));
const s3_service_1 = require("./common/service/s3.service");
const promises_1 = require("stream/promises");
const app = (0, express_1.default)();
const port = Number(config_service_1.PORT);
const boootstrap = async () => {
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 60 * 5 * 1000,
        limit: 20,
        message: "Game Over",
        requestPropertyName: "rate_limit",
        handler: (req, res, next) => {
            throw new global_error_handler_1.AppError("Requests limit reached. Try again later.", 429);
        },
        skipFailedRequests: false,
        legacyHeaders: false
    });
    const corsOptions = {
        origin: function (origin, callback) {
            if ([...config_service_1.WHITLIST, undefined].includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error("not allow by cors"));
            }
        }
    };
    app.use(express_1.default.json());
    app.use((0, cors_1.default)(corsOptions), (0, helmet_1.default)(), limiter);
    await (0, connectionDB_1.default)();
    await redis_service_1.default.connect();
    app.get("/", (req, res, next) => {
        (0, success_respons_1.default)({ res, data: "welcome to social media app..💬❤️", status: 201, message: "doone" });
    });
    app.get("/upload", async (req, res, next) => {
        const { folderName } = req.query;
        let result = await new s3_service_1.S3Service().getFiles(folderName);
        let resultMap = result.Contents?.map((file) => {
            return { Key: file.Key };
        });
        (0, success_respons_1.default)({ res, data: resultMap });
    });
    app.get("/upload/deleteFile", async (req, res, next) => {
        const { Key } = req.query;
        const result = await new s3_service_1.S3Service().deleteFile(Key);
        (0, success_respons_1.default)({ res, data: result });
    });
    app.get("/upload/deleteFiles", async (req, res, next) => {
        const { Keys } = req.body;
        const result = await new s3_service_1.S3Service().deleteFiles(Keys);
        (0, success_respons_1.default)({ res, data: result });
    });
    app.get("/upload/deleteFolder", async (req, res, next) => {
        const { folderName } = req.body;
        const result = await new s3_service_1.S3Service().deleteFolder(folderName);
        (0, success_respons_1.default)({ res, data: result });
    });
    app.get("/upload/pre-signed/*path", async (req, res, next) => {
        const { path } = req.params;
        const { download } = req.query;
        const Key = path.join("/");
        const url = await new s3_service_1.S3Service().getPresigneUrl({ Key, download: download ? download : undefined });
        (0, success_respons_1.default)({ res, data: url });
    });
    app.get("/upload/*path", async (req, res, next) => {
        const { path } = req.params;
        const { download } = req.query;
        const Key = path.join("/");
        const result = await new s3_service_1.S3Service().getFile(Key);
        const stream = result.Body;
        res.setHeader("Content-Type", result.ContentType);
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        if (download && download === "true") {
            res.setHeader("Content-Disposition", `attachment; filename="${path.pop()}"`);
        }
        await (0, promises_1.pipeline)(stream, res);
        (0, success_respons_1.default)({ res, data: Key });
    });
    app.use("/auth", auth_controller_1.default);
    app.use("{/*demo}", (req, res, next) => {
        throw new global_error_handler_1.AppError(`Url ${req.originalUrl} Not Foun`, 408);
    });
    app.use(global_error_handler_1.error_handler);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}......⏳✅`);
    });
};
exports.default = boootstrap;
