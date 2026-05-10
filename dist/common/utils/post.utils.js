"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityposts = void 0;
const post_enum_1 = require("../enum/post.enum");
const availabilityposts = (req) => {
    return {
        $or: [
            { availability: post_enum_1.Availability_Enum.public },
            { availability: post_enum_1.Availability_Enum.only_me, createdBy: req.user._id },
            { availability: post_enum_1.Availability_Enum.friends, createdBy: { $in: [...(req.user?.friends || [])] } },
            { tags: { $in: [req.user?._id] } },
        ]
    };
};
exports.availabilityposts = availabilityposts;
