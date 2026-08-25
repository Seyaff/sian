import "dotenv/config"

import express from "express"
import cors from "cors"
import dns from "dns"
import { Env } from "./config/app.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import agentRoutes from "./modules/agent/agent.routes"


dns.setServers(["1.1.1.1" , "8.8.8.8"])



const app = express()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin : "*",
    credentials : true
}))



app.use(`${Env.BASE_PATH}/agent`, agentRoutes)


app.use((req, res ,next) => {
    console.log("asdf")

    next()
})
app.use(errorHandler)

export default app