import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
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
    expiresIn: 60 * 60 * 24 * 365 * 2, // 2 years
    updateAge: 60 * 60 * 24 * 30, // 1 month
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
});
