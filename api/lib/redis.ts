import dotenv from "dotenv"
import IORedis from "ioredis"
dotenv.config({path: "dev.env"});

  export const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
}