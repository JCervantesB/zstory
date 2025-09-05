import { betterAuth } from "better-auth";
import { Pool } from "pg";
import nodemailer from "nodemailer";

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
      // Send password reset email
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: '🧟‍♂️ Restablece tu contraseña - Zombie Story',
        html: `
          <div style="font-family: monospace; background: #1a1a1a; color: #f97316; padding: 20px;">
            <h1 style="color: #ff0000;">🧟‍♂️ ZOMBIE STORY</h1>
            <p>Hola superviviente,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <a href="${url}" style="background: #f97316; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 4px;">RESTABLECER CONTRASEÑA</a>
            <p>Si no solicitaste esto, ignora este email.</p>
            <p>¡Mantente con vida!</p>
          </div>
        `,
      });
    },
  },
  
  // Configure email notifications
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user }) => {
      // Send welcome email notification (not verification)
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: '🧟‍♂️ ¡Bienvenido a Zombie Story!',
        html: `
          <div style="font-family: monospace; background: #1a1a1a; color: #f97316; padding: 20px;">
            <h1 style="color: #ff0000;">🧟‍♂️ ZOMBIE STORY</h1>
            <p>¡Bienvenido, superviviente!</p>
            <p>Tu cuenta ha sido creada exitosamente con el email: <strong>${user.email}</strong></p>
            <p>Ahora puedes crear tu personaje y comenzar tu aventura apocalíptica.</p>
            <div style="margin: 20px 0; padding: 15px; background: #2a2a2a; border-left: 4px solid #ff0000;">
              <p style="margin: 0; color: #ff6666;">⚠️ <strong>Importante:</strong> Mantén tus credenciales seguras. En el apocalipsis zombie, la seguridad es vital.</p>
            </div>
            <p>¡Que tengas suerte en tu supervivencia!</p>
            <p style="color: #666;">- El equipo de Zombie Story</p>
          </div>
        `,
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