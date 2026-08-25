import { CreateUserTypeInput } from "../../domain/types/user.types";
import UserModel from "../../models/user.model";
import { BadRequestError } from "../../utils/appError";

export class UserRepository {
    createUser = async ({ name, email, password }: CreateUserTypeInput) => {

        const user = await UserModel.findOne({ email })
        if (user) {
            throw new BadRequestError("User already exists with that email")
        }

        const newUser = new UserModel({
            name, email, password
        })

        await newUser.save()


        return newUser
    }
}