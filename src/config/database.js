import { PrismaClient } from "@prisma/client";
import { Logger } from "./logging.js";

export const prismaClient = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prismaClient.$on("error", (e) => {
  Logger.error(`Prisma error: ${e.message || e}`);
});

prismaClient.$on("info", (e) => {
  Logger.info(`Prisma info: ${e.message || e}`);
});

prismaClient.$on("warn", (e) => {
  Logger.warn(`Prisma warning: ${e.message || e}`);
});

prismaClient.$on("query", (e) => {
  Logger.info(`Prisma query: ${e.query}`);
});

