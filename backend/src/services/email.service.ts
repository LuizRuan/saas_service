import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

const BRAND_COLOR = '#10b981';
const BRAND_NAME = 'MãoCerta';

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '#';
    return esc(url);
  } catch {
    return '#';
  }
}

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND_COLOR},#0d9488);padding:32px 40px;text-align:center;">
            <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🔧 ${BRAND_NAME}</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Você recebeu este e-mail porque tem uma conta no ${BRAND_NAME}.<br/>
              © ${new Date().getFullYear()} ${BRAND_NAME}. Todos os direitos reservados.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(label: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${safeUrl(url)}" style="display:inline-block;background:linear-gradient(135deg,${BRAND_COLOR},#0d9488);color:#ffffff;
      text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;">
      ${esc(label)}
    </a>
  </div>`;
}

function h2(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">${text}</h2>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${text}</p>`;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 're_dev_placeholder') {
    console.log(`[email:dev] Para: ${to} | Assunto: ${subject}`);
    return;
  }
  const { error } = await resend.emails.send({
    from: `${BRAND_NAME} <${env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
  if (error) console.error('[email] Falha ao enviar:', error);
}

export const emailService = {
  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    const html = baseTemplate('Redefinir senha', `
      ${h2(`Olá, ${esc(name)}!`)}
      ${p('Recebemos uma solicitação para redefinir a senha da sua conta no MãoCerta.')}
      ${p('Clique no botão abaixo para criar uma nova senha. Este link expira em <strong>1 hora</strong>.')}
      ${btn('Redefinir minha senha', resetUrl)}
      ${p('<span style="color:#6b7280;font-size:13px;">Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece a mesma.</span>')}
    `);
    await send(to, 'Redefinir senha — MãoCerta', html);
  },

  async sendWelcome(to: string, name: string, role: 'client' | 'provider'): Promise<void> {
    const roleMsg = role === 'provider'
      ? 'Seu perfil de prestador foi criado e está em <strong>análise</strong>. Você receberá uma notificação assim que for aprovado.'
      : 'Sua conta está ativa. Explore os melhores profissionais da sua região!';
    const html = baseTemplate('Bem-vindo ao MãoCerta', `
      ${h2(`Bem-vindo, ${esc(name)}! 🎉`)}
      ${p('Sua conta foi criada com sucesso no MãoCerta.')}
      ${p(roleMsg)}
      ${btn('Acessar plataforma', env.APP_URL)}
    `);
    await send(to, 'Bem-vindo ao MãoCerta!', html);
  },

  async sendNewQuoteReceived(to: string, clientName: string, requestTitle: string, providerName: string, dashboardUrl: string): Promise<void> {
    const html = baseTemplate('Novo orçamento recebido', `
      ${h2(`Olá, ${esc(clientName)}!`)}
      ${p(`Você recebeu um novo orçamento de <strong>${esc(providerName)}</strong> para a solicitação:`)}
      <div style="background:#f0fdf4;border-left:4px solid ${BRAND_COLOR};padding:12px 16px;border-radius:4px;margin:0 0 20px;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#065f46;">${esc(requestTitle)}</p>
      </div>
      ${p('Acesse a plataforma para ver os detalhes e aceitar ou recusar o orçamento.')}
      ${btn('Ver orçamento', dashboardUrl)}
    `);
    await send(to, `Novo orçamento recebido — ${requestTitle}`, html);
  },

  async sendQuoteAccepted(to: string, providerName: string, requestTitle: string, ordersUrl: string): Promise<void> {
    const html = baseTemplate('Orçamento aceito!', `
      ${h2(`Parabéns, ${esc(providerName)}! 🎉`)}
      ${p(`Seu orçamento para a solicitação abaixo foi <strong>aceito</strong> pelo cliente:`)}
      <div style="background:#f0fdf4;border-left:4px solid ${BRAND_COLOR};padding:12px 16px;border-radius:4px;margin:0 0 20px;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#065f46;">${esc(requestTitle)}</p>
      </div>
      ${p('Uma ordem de serviço foi criada. Acesse a plataforma para ver os detalhes e combinar a data do serviço.')}
      ${btn('Ver ordem de serviço', ordersUrl)}
    `);
    await send(to, 'Orçamento aceito — MãoCerta', html);
  },

  async sendOrderStatusChange(to: string, name: string, status: string, ordersUrl: string): Promise<void> {
    const statusLabels: Record<string, string> = {
      scheduled: 'agendado',
      in_progress: 'em andamento',
      waiting_approval: 'aguardando sua aprovação',
      completed: 'concluído',
      cancelled: 'cancelado',
    };
    // label comes from a fixed dictionary — esc() is still applied as defence-in-depth
    const label = esc(statusLabels[status] ?? status);
    const html = baseTemplate('Atualização de ordem', `
      ${h2(`Olá, ${esc(name)}!`)}
      ${p(`Houve uma atualização na sua ordem de serviço. O novo status é: <strong>${label}</strong>.`)}
      ${btn('Ver ordem de serviço', ordersUrl)}
    `);
    await send(to, `Ordem de serviço ${label} — MãoCerta`, html);
  },
};
