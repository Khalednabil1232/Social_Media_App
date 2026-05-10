import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import  PS from "../posts/post.service"
import * as  PV from "../posts/post.validation"
import multerCloud from "../../common/middleware/multer.cloud";
import { Store_Enum } from "../../common/enum/multer.enum";
import { validation } from "../../common/middleware/validation";

const postRouter=Router()


postRouter.post("/upload"  ,authentication,
    multerCloud({store_type:Store_Enum.disk}).array("attachments"),
    validation(PV.createPostSchema),
    PS.createPost )


postRouter.put("/update/:postId",authentication,
    multerCloud({store_type:Store_Enum.disk}).array("attachments"),
    validation(PV.updatePostSchema),
    PS.updatePost )

postRouter.get("/get-posts",
        authentication,
        PS.getPosts )

postRouter.patch("/:postId",
        authentication,
        validation(PV.likePostSchema),
        PS.likePost )

export default postRouter