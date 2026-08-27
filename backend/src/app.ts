import "dotenv/config"
import express from "express"
import cors from "cors"
import dns from "dns"
import { Env } from "./config/app.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import agentRoutes from "./modules/agent/agent.routes"
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes"

dns.setServers(["1.1.1.1" , "8.8.8.8"])

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin : "*",
    credentials : true
}))

// --- GLOBAL REQUEST LOGGER MIDDLEWARE ---
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
    next();
})
// -----------------------------------------

app.use(`${Env.BASE_PATH}/agent`, agentRoutes)
app.use(`${Env.BASE_PATH}/whatsapp`, whatsappRoutes)

app.use(errorHandler)

export default app