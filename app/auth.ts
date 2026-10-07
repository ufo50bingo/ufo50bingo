import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  baseURL: {
    allowedHosts: ["localhost:3000", "*.vercel.app", "ufo50bingo.com"],
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 400, // 400 days, max allowed
    updateAge: 60 * 60 * 24 * 30, // 1 month
    cookieCache: {
      enabled: true,
      maxAge: 7 * 60 * 60 * 24, // 1 week
    },
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      disableDefaultScope: true,
      scope: ["identify"],
      mapProfileToUser: (profile) => ({
        email: `${profile.id}@discord.placeholder.invalid`,
        username: profile.username,
      }),
    },
  },
  advanced: {
    database: {
      generateId: (options) => {
        if (options.model === "user") {
          return false; // Let PostgreSQL serial generate it
        }
        return crypto.randomUUID(); // UUIDs for session, account, verification
      },
    },
  },
});
