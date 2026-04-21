import jwt, { JwtPayload, Secret, SignOptions, VerifyOptions } from "jsonwebtoken"

class TokenService
{
    constructor(){}

    generateToken = ({paylod, seucrit , options={}}:{paylod:object , seucrit: Secret,options?:SignOptions }):string=>{
    return jwt.sign(paylod , seucrit , options)
}

    verifyToken = ({token, seucrit , options={}}:{token:string ,seucrit:Secret , options?:VerifyOptions }):JwtPayload=>{
    return jwt.verify(token , seucrit , options) as JwtPayload
}
}

export default new TokenService()