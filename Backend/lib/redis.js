import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config()
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);   //redis is a large json file of key-value pairs
// await redis.set("foo3", "bar3");

// export const redis = new Redis("rediss://default:AVyiAAIjcDE5MzQxYjVkMzY2NWY0MmU1YjVhMzM0YTY1ODUzYTc0ZnAxMA@credible-panther-23714.upstash.io:6379");   //redis is a large json file of key-value pairs
// await redis.set("foo3", "bar3");

console.log(process.env.UPSTASH_REDIS_URL);


  
  