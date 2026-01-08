// =======================================================
// Prisma Config — Prisma v7+
// =======================================================

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },

  migrations: {
    seed: "npx ts-node prisma/seed.ts",
  },
});