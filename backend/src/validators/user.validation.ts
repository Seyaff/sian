import z from "zod";

export const createUserSchema = z.object({
    name : z.string().trim().max(30,{message : "Name cannot be longer than 30 chars"}),
    email : z.string().trim().email(),
    password : z.string().trim()
})


export const userContextSchema = z.object({
    userAccessToken : z.string().trim()
})