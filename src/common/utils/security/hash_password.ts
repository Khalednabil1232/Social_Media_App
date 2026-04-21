
import bcrypt from "bcrypt"
import { SALT_ROUNDS } from "../../../config/config.service"


interface Ihash {
    myPlaintextPassword : string,
    saltRounds? :number,
}

interface ICompare {
    plaintextPassword: string
    ciphertext: string
}


export const hash_password = ({myPlaintextPassword , saltRounds = SALT_ROUNDS } :Ihash)=>
{
    return bcrypt.hashSync(myPlaintextPassword.toString() , Number(saltRounds) )
}

export const compare_password = ({plaintextPassword   , ciphertext  } :ICompare):boolean=>
{
    return bcrypt.compareSync(plaintextPassword   , ciphertext  )
}