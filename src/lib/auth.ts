import { betterAuth } from "better-auth";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { resetPasswordTemplate, welcomeEmailTemplate } from "./email-templates";

// Create email transporter for Mailtrap
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST!,
  port: parseInt(process.env.EMAIL_PORT!),
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL!,
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  
  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    autoSignIn: true, // Auto sign in after registration
    sendResetPassword: async ({ user, url }) => {
      // Send password reset email with Apple-style design
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: '🧟‍♂️ Restablece tu contraseña - Zombie Story',
        html: resetPasswordTemplate(url, user.email),
      });
    },
  },
  
  // Configure email notifications
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user }) => {
      // Send welcome email with Apple-style design
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: '🧟‍♂️ ¡Bienvenido a Zombie Story!',
        html: welcomeEmailTemplate(user.email),
      });
    },
  },
  
  // Configure session settings
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // Configure user fields to include in session
  user: {
    additionalFields: {
      characterName: {
        type: "string",
        required: false,
      },
      characterLastName: {
        type: "string", 
        required: false,
      },
      characterDescription: {
        type: "string",
        required: false,
      },
      characterSpecialty: {
        type: "string",
        required: false,
      },
      characterImageUrl: {
        type: "string",
        required: false,
      },
      characterVisualPrompt: {
        type: "string",
        required: false,
      },
    },
  },
  
  // Add social providers if needed later
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID as string,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //   },
  // },
});

// Export types for TypeScript (server-side)
export type ServerSession = typeof auth.$Infer.Session;
export type ServerUser = typeof auth.$Infer.Session.user;