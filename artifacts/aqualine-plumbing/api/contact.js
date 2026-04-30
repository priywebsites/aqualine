// =============================================================================
// Vercel serverless function — POST /api/contact
//
// Lives inside the Vercel deployment root (artifacts/aqualine-plumbing/api/)
// so the live AquaLine Winnipeg Plumbing website can submit its lead form to
// /api/contact in production. On Vercel, any file under /api becomes a
// serverless route automatically.
//
// Environment variables (configure in Vercel project settings):
//   SMTP_USER       Gmail address used to send the notification.
//   SMTP_PASS       Gmail App Password (NOT the account password).
//   LEAD_TO_EMAIL   Inbox that receives the lead notifications.
//
// SECURITY: SMTP credentials must NEVER be committed to source or shipped to
// the browser. They are only ever read here, on the server, from env vars.
// =============================================================================

import nodemailer from "nodemailer";

const BUSINESS_NAME = "AquaLine Winnipeg Plumbing";
const SUBJECT = `New Plumbing Lead - ${BUSINESS_NAME}`;
const PHONE_DISPLAY = "431-997-3415";

let cachedTransporter = null;

function getTransporter(user, pass) {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  return cachedTransporter;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildText(lead, submittedAt) {
  return [
    `New plumbing service request — ${BUSINESS_NAME}`,
    "",
    `Full Name: ${lead.fullName}`,
    `Phone Number: ${lead.phone}`,
    `Email Address: ${lead.email}`,
    `Service Needed: ${lead.service}`,
    `Description / Requirements: ${lead.description?.trim() || "—"}`,
    `Preferred Date / Date Needed: ${lead.dateNeeded?.trim() || "—"}`,
    `Urgency: ${lead.urgency}`,
    `Page / Form Source: ${lead.source?.trim() || "Website request form"}`,
    `Submission Time: ${submittedAt}`,
    "",
    `Reply directly to this email to reach the homeowner at ${lead.email}.`,
  ].join("\n");
}

function buildHtml(lead, submittedAt) {
  const row = (label, value) => `
    <tr>
      <td style="padding:8px 12px;background:#ecfeff;font-weight:600;color:#0e7490;width:200px;border:1px solid #cffafe;vertical-align:top;">${label}</td>
      <td style="padding:8px 12px;color:#0f172a;border:1px solid #cffafe;white-space:pre-wrap;">${value ? escapeHtml(value) : "—"}</td>
    </tr>`;
  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:680px;">
      <h2 style="color:#0e7490;margin:0 0 8px;">New Plumbing Lead</h2>
      <p style="color:#475569;margin:0 0 16px;">A homeowner submitted the request form on the ${BUSINESS_NAME} website.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        ${row("Full Name", lead.fullName)}
        ${row("Phone Number", lead.phone)}
        ${row("Email Address", lead.email)}
        ${row("Service Needed", lead.service)}
        ${row("Description / Requirements", lead.description)}
        ${row("Preferred Date / Date Needed", lead.dateNeeded)}
        ${row("Urgency", lead.urgency)}
        ${row("Page / Form Source", lead.source ?? "Website request form")}
        ${row("Submission Time", submittedAt)}
      </table>
      <p style="color:#64748b;margin:16px 0 0;font-size:13px;">Reply directly to this email to reach the homeowner.</p>
    </div>
  `;
}

function readBody(req) {
  // Vercel parses JSON automatically when content-type is application/json,
  // but fall back to manual parse if a string slipped through.
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function validate(body) {
  const errors = [];
  const get = (k) => (typeof body[k] === "string" ? body[k].trim() : "");

  const fullName = get("fullName");
  const phone = get("phone");
  const email = get("email");
  const service = get("service");
  const urgency = get("urgency");

  if (fullName.length < 2) errors.push("Full name is required");
  if (phone.length < 7) errors.push("Phone number is required");
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required");
  if (service.length < 1) errors.push("Service is required");
  if (urgency.length < 1) errors.push("Urgency is required");

  return {
    errors,
    lead: {
      fullName,
      phone,
      email,
      service,
      description: get("description") || null,
      dateNeeded: get("dateNeeded") || null,
      urgency,
      source: get("source") || `${BUSINESS_NAME} website request form`,
    },
  };
}

export default async function handler(req, res) {
  // ---- Method gate ---------------------------------------------------------
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // ---- Parse + validate ----------------------------------------------------
  const body = readBody(req);
  const { errors, lead } = validate(body);

  if (errors.length) {
    return res.status(400).json({
      success: false,
      error: "Please fill out all required fields.",
      issues: errors,
    });
  }

  // ---- Env config ----------------------------------------------------------
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.LEAD_TO_EMAIL;

  if (!user || !pass || !to) {
    console.error(
      "[/api/contact] Missing one of SMTP_USER, SMTP_PASS, LEAD_TO_EMAIL. " +
        `Set them in Vercel project settings. Have: ` +
        `SMTP_USER=${user ? "yes" : "no"}, ` +
        `SMTP_PASS=${pass ? "yes" : "no"}, ` +
        `LEAD_TO_EMAIL=${to ? "yes" : "no"}.`,
    );
    return res.status(500).json({
      success: false,
      error: "Email failed to send",
    });
  }

  // ---- Send ----------------------------------------------------------------
  const submittedAt = new Date().toLocaleString("en-CA", {
    timeZone: "America/Winnipeg",
    dateStyle: "full",
    timeStyle: "short",
  });

  try {
    const transporter = getTransporter(user, pass);
    await transporter.sendMail({
      from: `${BUSINESS_NAME} <${user}>`,
      to,
      replyTo: lead.email,
      subject: SUBJECT,
      text: buildText(lead, submittedAt),
      html: buildHtml(lead, submittedAt),
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    // Surface the real SMTP error in Vercel logs so it can be diagnosed.
    console.error("[/api/contact] Nodemailer/Gmail SMTP send failed", {
      message: err?.message,
      code: err?.code,
      command: err?.command,
      response: err?.response,
      responseCode: err?.responseCode,
      stack: err?.stack,
    });
    return res.status(500).json({
      success: false,
      error: "Email failed to send",
    });
  }
}

// Reminder for the operator deploying this site:
//   - On Vercel, set SMTP_USER, SMTP_PASS, and LEAD_TO_EMAIL in
//     Project → Settings → Environment Variables (Production + Preview).
//   - SMTP_PASS must be a Gmail App Password (account 2FA must be enabled).
//   - For phone support, the website also displays ${PHONE_DISPLAY}.
