import "dotenv/config"
import { getEnv } from "../utils/getEnv";



const appConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),

  GROQ_API_KEY: getEnv("GROQ_API_KEY"),

  WHATSAPP_PHONENUMBER_ID: getEnv("WHATSAPP_PHONENUMBER_ID"),
  WHATSAPP_BUSINESS_ACCOUNT_ID : getEnv("WHATSAPP_BUSINESS_ACCOUNT_ID"),
  WHATSAPP_TOKEN : getEnv("WHATSAPP_TOKEN"),
  WHATSAPP_VERIFY_TOKEN  : getEnv("WHATSAPP_VERIFY_TOKEN"),

  
  
  MONGO_URI: getEnv("MONGO_URI"),
  GOOGLE_GENERATIVE_AI_API_KEY: getEnv("GOOGLE_GENERATIVE_AI_API_KEY"),
  API_KEY_OF_TAVILY : getEnv("TAVILY_API_KEY"),

});



export const Env = appConfig();