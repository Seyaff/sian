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

// Add this in app.ts before app.use(`${Env.BASE_PATH}/whatsapp`, whatsappRoutes)
app.use((req, res, next) => {
  console.log("\n--- [INCOMING REQUEST DETECTED] ---");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.originalUrl}`);
  console.log(`User-Agent: ${req.headers["user-agent"]}`);
  console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`Query Params:`, JSON.stringify(req.query, null, 2));
  console.log("------------------------------------\n");
  next();
});
app.use(`${Env.BASE_PATH}/whatsapp`, whatsappRoutes)

app.use(errorHandler)

export default app