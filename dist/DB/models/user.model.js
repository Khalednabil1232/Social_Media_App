"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../../common/enum/user.enum");
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 20
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider !== user_enum_1.providerEnum.google;
        },
        trim: true,
        minlength: 7
    },
    age: {
        type: Number,
        min: 18,
        max: 60
    },
    gender: {
        type: String,
        enum: Object.values(user_enum_1.GenderEnum),
        default: user_enum_1.GenderEnum.male
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    deleteAt: String,
    role: {
        type: String,
        enum: user_enum_1.RoleEnum,
        default: user_enum_1.RoleEnum.user
    },
    profilePicture: {
        secure_url: { type: String, default: null },
        public_id: { type: String, default: null }
    },
    confirmEmail: Boolean,
    friends: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
});
userSchema.virtual("userName")
    .get(function () {
    return this.firstName + " " + this.lastName;
})
    .set(function (v) {
    this.firstName = v.split(" ")[0];
    this.lastName = v.split(" ")[1];
});
const userModel = mongoose_1.default.models.user || mongoose_1.default.model("user", userSchema);
exports.default = userModel;
