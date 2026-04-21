import { Response } from "express";
interface IsucsseParams {
    res : Response,
    status ?: number , 
    message ?: string,
    data ?: any|undefined, 
}

const successResponse = ({
res,
message = "done",
status = 200,
data = undefined,
}: IsucsseParams) => {
return res.status(status).json({  status,message, data });
};

export default successResponse;
