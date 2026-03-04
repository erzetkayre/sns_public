import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

// db connection adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// prisma client
const prisma = new PrismaClient({
    adapter
});

export default prisma;