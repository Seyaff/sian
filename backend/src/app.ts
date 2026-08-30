import "dotenv/config"
import express, { Request, Response } from "express"
import cors from "cors"
import dns from "dns"
import { Env } from "./config/app.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import agentRoutes from "./modules/agent/agent.routes"
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes"
import restaurantRoutes from "./modules/restaurant/restaurant.routes"
import orderRoutes from "./modules/order/order.routes"
import campaignRoutes from "./modules/campaign/campaign.routes"
import onboardingRoutes from "./modules/onboarding/onboarding.routes"
import { asyncHandler } from "./middlewares/asyncHandler.middleware"

dns.setServers(["1.1.1.1" , "8.8.8.8"])

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin : "*",
    credentials : true
}))


app.use(`${Env.BASE_PATH}/health`, asyncHandler(async(req : Request , res : Response) => {
    return res.send("Yo bro working fine")
}))

app.use(`${Env.BASE_PATH}/agent`, agentRoutes)
app.use(`${Env.BASE_PATH}/restaurants`, restaurantRoutes)
app.use(`${Env.BASE_PATH}/orders`, orderRoutes)
app.use(`${Env.BASE_PATH}/campaigns`, campaignRoutes)
app.use(`${Env.BASE_PATH}/onboarding`, onboardingRoutes)


app.use(`${Env.BASE_PATH}/whatsapp`, whatsappRoutes)

app.use(errorHandler)

export default app