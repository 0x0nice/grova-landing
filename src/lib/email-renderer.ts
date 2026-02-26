// ── CLIENT-SIDE EMAIL PREVIEW RENDERER ──
// Pure function that renders email HTML for the dashboard preview.
// MIRROR: Keep in sync with grova-api/src/email-templates.js

const FONT_SERIF =
  "'Instrument Serif', Georgia, 'Times New Roman', serif";
const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const SIGNOFF_PHRASES = [
  "warm regards",
  "best regards",
  "best",
  "cheers",
  "thanks",
  "thank you",
  "sincerely",
  "with love",
  "take care",
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Convert plain text body to styled HTML paragraphs.
 */
function bodyToHtml(bodyText: string, brandColor: string): string {
  const paragraphs = bodyText.split("\n\n");
  const result: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    const lines = para.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;
    const firstLine = lines[0].trim();

    // ── Greeting line ──
    if (i === 0 && /^(Hi|Hey|Hello|Dear)\b/.test(firstLine)) {
      result.push(
        `<p style="margin:0 0 20px 0;font-family:${FONT_SERIF};font-size:20px;color:#1a1a1a;line-height:1.3;">${lines.join("<br>")}</p>`
      );
      continue;
    }

    // ── Sign-off block ──
    const isLastPara = i === paragraphs.length - 1;
    const isSecondLast = i === paragraphs.length - 2;
    const looksLikeSignoff = SIGNOFF_PHRASES.some((p) =>
      firstLine.toLowerCase().startsWith(p)
    );

    if ((isLastPara || isSecondLast) && looksLikeSignoff) {
      const signoffLine = lines[0];
      const nameLine =
        lines.length > 1 ? lines.slice(1).join("<br>") : null;

      let html = `<p style="margin:24px 0 0 0;font-family:${FONT_SERIF};font-style:italic;font-size:16px;color:#555;line-height:1.4;">${signoffLine}</p>`;
      if (nameLine) {
        html += `<p style="margin:4px 0 0 0;font-family:${FONT_SERIF};font-size:17px;color:#1a1a1a;line-height:1.4;">${nameLine}</p>`;
      }
      result.push(html);

      if (isSecondLast && paragraphs[i + 1]) {
        const nextPara = paragraphs[i + 1].trim();
        if (
          !SIGNOFF_PHRASES.some((p) =>
            nextPara.toLowerCase().startsWith(p)
          )
        ) {
          result.push(
            `<p style="margin:4px 0 0 0;font-family:${FONT_SERIF};font-size:17px;color:#1a1a1a;line-height:1.4;">${nextPara}</p>`
          );
        }
        i++;
      }
      continue;
    }

    // ── Standalone name after sign-off ──
    if (
      isLastPara &&
      lines.length === 1 &&
      firstLine.length < 60 &&
      !firstLine.endsWith(".") &&
      result.length > 0
    ) {
      const lastResult = result[result.length - 1];
      if (lastResult.includes("font-style:italic")) {
        result.push(
          `<p style="margin:4px 0 0 0;font-family:${FONT_SERIF};font-size:17px;color:#1a1a1a;line-height:1.4;">${firstLine}</p>`
        );
        continue;
      }
    }

    // ── URL on its own line → CTA button ──
    if (
      lines.length === 1 &&
      /^https?:\/\/\S+$/.test(firstLine) &&
      firstLine !== "#"
    ) {
      const label =
        firstLine.includes("review") ||
        firstLine.includes("google") ||
        firstLine.includes("yelp")
          ? "Leave a Review &#8594;"
          : "Visit Link &#8594;";
      result.push(
        `<div style="margin:8px 0 20px;text-align:center;">
          <a href="${firstLine}" style="display:inline-block;padding:14px 32px;background:${brandColor};color:#ffffff;font-family:${FONT_SANS};font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">${label}</a>
        </div>`
      );
      continue;
    }

    // ── Regular paragraph ──
    let html = lines.join("<br>");
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      `<a href="$1" style="color:${brandColor};text-decoration:underline;">$1</a>`
    );
    result.push(
      `<p style="margin:0 0 18px 0;font-family:${FONT_SANS};font-size:15px;color:#2a2a2a;line-height:1.65;">${html}</p>`
    );
  }

  return result.join("\n");
}

export interface EmailRenderOptions {
  body: string;
  subject: string;
  brandColor?: string;
  logoUrl?: string;
  ownerName?: string;
  isInternal?: boolean;
}

/**
 * Render plain-text email body into a beautiful branded HTML email.
 * Used for the preview iframe in the dashboard.
 */
export function renderEmailPreviewHtml(opts: EmailRenderOptions): string {
  const brandColor = opts.brandColor || "#00c87a";
  const logoUrl = opts.logoUrl || "";
  const ownerName = opts.ownerName || "The Team";
  const isInternal = opts.isInternal || false;
  const accentColor = isInternal ? "#ef4444" : brandColor;

  const bodyHtml = bodyToHtml(opts.body, brandColor);

  const logoBlock = logoUrl
    ? `<tr><td style="padding:32px 36px 0;" align="center"><img src="${esc(logoUrl)}" alt="" style="max-height:44px;max-width:200px;" /></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <title>${esc(opts.subject || "")}</title>
  <style>
    body { margin:0; padding:0; background:#f8f8f6; -webkit-text-size-adjust:100%; }
    a { color: ${brandColor}; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f8f8f6;font-family:${FONT_SANS};-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8f8f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">
          <!-- Accent top bar -->
          <tr>
            <td style="height:2px;background:${accentColor};border-radius:4px 4px 0 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-left:1px solid #e8e8e5;border-right:1px solid #e8e8e5;border-bottom:1px solid #e8e8e5;border-radius:0 0 4px 4px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${logoBlock}
                ${
                  isInternal
                    ? `<tr><td style="padding:28px 36px 0;"><span style="display:inline-block;padding:4px 12px;background:#fef2f2;color:#dc2626;border-radius:4px;font-family:${FONT_SANS};font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Internal &mdash; Do not forward</span></td></tr>`
                    : ""
                }
                <tr>
                  <td style="padding:${logoUrl || isInternal ? "24px" : "32px"} 36px 32px;">
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 16px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${
                  isInternal
                    ? `<tr><td align="center"><p style="margin:0;font-family:${FONT_SANS};font-size:12px;color:#999;line-height:1.5;">Sent by Grova Smart Actions</p></td></tr>`
                    : `<tr>
                        <td align="center">
                          <p style="margin:0 0 6px;font-family:${FONT_SANS};font-size:12px;color:#999;line-height:1.5;">
                            Sent on behalf of ${esc(ownerName)}
                          </p>
                          <p style="margin:0 0 10px;font-family:${FONT_SANS};font-size:12px;color:#bbb;line-height:1.5;">
                            <span style="display:inline-block;width:6px;height:6px;background:#00c87a;border-radius:50%;vertical-align:middle;margin-right:4px;"></span>
                            <span style="vertical-align:middle;">Powered by <a href="https://grova.dev" style="color:#999;text-decoration:none;">Grova</a></span>
                          </p>
                          <p style="margin:0;">
                            <a href="#" style="font-family:${FONT_SANS};font-size:11px;color:#ccc;text-decoration:underline;">Unsubscribe</a>
                          </p>
                        </td>
                      </tr>`
                }
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
