import app from "./app"
import { Env } from "./config/app.config"
import connectDatabase from "./config/database.config"


app.listen(Env.PORT , async () => {
    console.log("Server is running on port " + Env.PORT)

    await connectDatabase()
})