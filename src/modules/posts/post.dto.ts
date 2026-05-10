import * as z from "zod"
import { GenderEnum, RoleEnum } from "../../common/enum/user.enum";
import { createPostSchema, updatePostSchema } from "./post.validation";


export type createPostDto = z.infer<typeof createPostSchema.body>
export type updatePostDto = z.infer<typeof updatePostSchema.body>
export type PostIdDto = z.infer<typeof updatePostSchema.params>