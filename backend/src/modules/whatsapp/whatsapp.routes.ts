import { Router } from "express";
import { whatsappController } from "./whatsapp.module";

const whatsappRoutes = Router()



whatsappRoutes.get("/test" , whatsappController.test)
whatsappRoutes.get("/webhook" , whatsappController.verifyWebhook)
whatsappRoutes.post("/webhook" , whatsappController.handleWebhook)

export default whatsappRoutes