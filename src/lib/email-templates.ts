// Email templates with Apple-style design but zombie pixel art theme

export const resetPasswordTemplate = (url: string, userEmail: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablece tu contraseña - Zombie Story</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1d1d1f;
            background-color: #f5f5f7;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(255, 0, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 99, 71, 0.1) 0%, transparent 50%);
        }
        
        .logo {
            font-family: 'Press Start 2P', monospace;
            font-size: 24px;
            color: #ff0000;
            margin-bottom: 10px;
            text-shadow: 2px 2px 0px #000000;
            position: relative;
            z-index: 1;
        }
        
        .subtitle {
            color: #f97316;
            font-size: 14px;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #424245;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        
        .cta-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
            border: 2px solid #ff0000;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4);
        }
        
        .warning-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            border-left: 4px solid #f39c12;
        }
        
        .warning-icon {
            font-size: 20px;
            margin-right: 10px;
        }
        
        .warning-text {
            color: #856404;
            font-size: 14px;
            font-weight: 500;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e7;
        }
        
        .footer-text {
            color: #86868b;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .pixel-decoration {
            font-family: 'Press Start 2P', monospace;
            font-size: 12px;
            color: #ff0000;
        }
        
        .security-note {
            background-color: #f0f0f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #007aff;
        }
        
        .security-text {
            color: #424245;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 18px;
            }
            
            .greeting {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🧟‍♂️ ZOMBIE STORY</div>
            <div class="subtitle">Survival Adventure Game</div>
        </div>
        
        <div class="content">
            <div class="greeting">¡Hola, superviviente!</div>
            
            <div class="message">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Zombie Story</strong>.
                Si fuiste tú quien la solicitó, haz clic en el botón de abajo para crear una nueva contraseña.
            </div>
            
            <div class="cta-container">
                <a href="${url}" class="cta-button">
                    🔐 Restablecer Contraseña
                </a>
            </div>
            
            <div class="warning-box">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">
                    <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad. Si no solicitaste este cambio, puedes ignorar este email de forma segura.
                </span>
            </div>
            
            <div class="security-note">
                <div class="security-text">
                    <strong>💡 Consejo de seguridad:</strong> En el apocalipsis zombie, mantener tus credenciales seguras es tan importante como encontrar un refugio. Usa una contraseña fuerte y única.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Este email fue enviado a <strong>${userEmail}</strong>
            </div>
            <div class="footer-text">
                Si tienes problemas con el botón, copia y pega este enlace en tu navegador:
            </div>
            <div style="word-break: break-all; color: #007aff; font-size: 12px; margin-top: 10px;">
                ${url}
            </div>
            <div class="pixel-decoration" style="margin-top: 20px;">
                ⚡ STAY ALIVE ⚡
            </div>
        </div>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (userEmail: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Bienvenido a Zombie Story!</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1d1d1f;
            background-color: #f5f5f7;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(255, 0, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 99, 71, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.05) 0%, transparent 70%);
        }
        
        .logo {
            font-family: 'Press Start 2P', monospace;
            font-size: 28px;
            color: #ff0000;
            margin-bottom: 15px;
            text-shadow: 2px 2px 0px #000000;
            position: relative;
            z-index: 1;
        }
        
        .subtitle {
            color: #f97316;
            font-size: 16px;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 28px;
            font-weight: 700;
            color: #1d1d1f;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .welcome-message {
            font-size: 18px;
            color: #424245;
            margin-bottom: 30px;
            text-align: center;
            font-weight: 500;
        }
        
        .account-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #dee2e6;
        }
        
        .account-title {
            font-size: 16px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .account-email {
            font-size: 16px;
            color: #007aff;
            font-weight: 500;
            background-color: #ffffff;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #c7d2fe;
        }
        
        .features-section {
            margin: 40px 0;
        }
        
        .features-title {
            font-size: 20px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 25px;
            text-align: center;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .feature-item {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #e9ecef;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
            display: block;
        }
        
        .feature-text {
            font-size: 14px;
            color: #424245;
            font-weight: 500;
        }
        
        .survival-tips {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border-left: 4px solid #f39c12;
        }
        
        .tips-title {
            font-size: 16px;
            font-weight: 600;
            color: #856404;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .tips-list {
            list-style: none;
            padding: 0;
        }
        
        .tips-list li {
            color: #856404;
            font-size: 14px;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .tips-list li::before {
            content: '⚡';
            position: absolute;
            left: 0;
            font-size: 12px;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
            border: 1px solid #bae6fd;
        }
        
        .cta-title {
            font-size: 18px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 15px;
        }
        
        .cta-text {
            font-size: 14px;
            color: #424245;
            margin-bottom: 20px;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e7;
        }
        
        .footer-text {
            color: #86868b;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .pixel-decoration {
            font-family: 'Press Start 2P', monospace;
            font-size: 12px;
            color: #ff0000;
            margin-top: 20px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 20px;
            }
            
            .greeting {
                font-size: 24px;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🧟‍♂️ ZOMBIE STORY</div>
            <div class="subtitle">Survival Adventure Game</div>
        </div>
        
        <div class="content">
            <div class="greeting">¡Bienvenido, superviviente!</div>
            
            <div class="welcome-message">
                Tu cuenta ha sido creada exitosamente. ¡Estás listo para enfrentar el apocalipsis zombie!
            </div>
            
            <div class="account-info">
                <div class="account-title">
                    👤 Información de tu cuenta
                </div>
                <div class="account-email">${userEmail}</div>
            </div>
            
            <div class="features-section">
                <div class="features-title">🎮 ¿Qué puedes hacer ahora?</div>
                
                <div class="features-grid">
                    <div class="feature-item">
                        <span class="feature-icon">🎭</span>
                        <div class="feature-text">Crear tu personaje único</div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🗺️</span>
                        <div class="feature-text">Explorar el mundo post-apocalíptico</div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">⚔️</span>
                        <div class="feature-text">Enfrentar hordas de zombies</div>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🏆</span>
                        <div class="feature-text">Completar misiones épicas</div>
                    </div>
                </div>
            </div>
            
            <div class="survival-tips">
                <div class="tips-title">
                    💡 Consejos de supervivencia
                </div>
                <ul class="tips-list">
                    <li>Mantén siempre tu inventario organizado</li>
                    <li>Busca refugios seguros antes del anochecer</li>
                    <li>Conserva tus recursos, nunca sabes cuándo los necesitarás</li>
                    <li>Forma alianzas con otros supervivientes</li>
                    <li>Mantén tus credenciales de cuenta seguras</li>
                </ul>
            </div>
            
            <div class="cta-section">
                <div class="cta-title">🚀 ¡Comienza tu aventura!</div>
                <div class="cta-text">
                    Inicia sesión en tu cuenta y crea tu primer personaje para comenzar a explorar el mundo de Zombie Story.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Este email fue enviado a <strong>${userEmail}</strong>
            </div>
            <div class="footer-text">
                Gracias por unirte a nuestra comunidad de supervivientes.
            </div>
            <div class="pixel-decoration">
                ⚡ STAY ALIVE ⚡
            </div>
        </div>
    </div>
</body>
</html>
`;