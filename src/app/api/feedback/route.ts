import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 1200;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isFeedbackFocus(value: unknown): value is "author" | "story" | "both" {
  return value === "author" || value === "story" || value === "both";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatFocusLabel(value: "author" | "story" | "both") {
  if (value === "author") {
    return "The author";
  }

  if (value === "story") {
    return "The story";
  }

  return "Both";
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "The feedback request was not valid." }, { status: 400 });
  }

  const data = typeof payload === "object" && payload != null ? payload : {};
  const name = cleanText(Reflect.get(data, "name"), MAX_NAME_LENGTH);
  const email = cleanText(Reflect.get(data, "email"), MAX_EMAIL_LENGTH);
  const message = cleanText(Reflect.get(data, "message"), MAX_MESSAGE_LENGTH);
  const website = cleanText(Reflect.get(data, "website"), 120);
  const focus = isFeedbackFocus(Reflect.get(data, "focus")) ? Reflect.get(data, "focus") : "both";

  if (website.length > 0) {
    return NextResponse.json({ message: "Your thoughts have been received." });
  }

  if (message.length < 12) {
    return NextResponse.json(
      { message: "Please write a slightly longer note before sending it." },
      { status: 400 }
    );
  }

  if (email.length > 0 && !isValidEmail(email)) {
    return NextResponse.json(
      { message: "The reply email looks incomplete. Please check it and try again." },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.FEEDBACK_TO_EMAIL;
  const fromEmail = process.env.FEEDBACK_FROM_EMAIL;

  if (!resendApiKey || !toEmail || !fromEmail) {
    return NextResponse.json(
      {
        message:
          "Feedback inbox is not configured yet. Add RESEND_API_KEY, FEEDBACK_TO_EMAIL, and FEEDBACK_FROM_EMAIL to enable delivery."
      },
      { status: 500 }
    );
  }

  const submittedAt = new Date().toISOString();
  const safeName = escapeHtml(name || "Anonymous reader");
  const safeEmail = escapeHtml(email || "Not provided");
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const focusLabel = formatFocusLabel(focus);

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email || undefined,
      subject: `New site feedback from ${name || "an anonymous reader"}`,
      text: [
        "New feedback received from the site.",
        "",
        `About: ${focusLabel}`,
        `Name: ${name || "Anonymous reader"}`,
        `Reply email: ${email || "Not provided"}`,
        `Submitted at: ${submittedAt}`,
        "",
        message
      ].join("\n"),
      html: `
        <div style="font-family: Georgia, serif; line-height: 1.7; color: #1c1408; padding: 24px; background: #fff8e8;">
          <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #9a6a14;">New feedback received</p>
          <h1 style="margin: 0 0 18px; font-size: 26px; color: #2b1a07;">A reader sent a note through the site</h1>
          <p style="margin: 0 0 8px;"><strong>About:</strong> ${escapeHtml(focusLabel)}</p>
          <p style="margin: 0 0 8px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 0 0 8px;"><strong>Reply email:</strong> ${safeEmail}</p>
          <p style="margin: 0 0 18px;"><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>
          <div style="padding: 18px 20px; border-radius: 18px; background: #fffdf7; border: 1px solid #f1d397;">
            <p style="margin: 0; white-space: normal;">${safeMessage}</p>
          </div>
        </div>
      `
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Feedback delivery failed", errorBody);

    return NextResponse.json(
      { message: "The note could not be delivered right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ message: "Your thoughts have been sent to the author." });
}
