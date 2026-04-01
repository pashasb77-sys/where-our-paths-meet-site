"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type FeedbackFocus = "author" | "story" | "both";

type FeedbackFormState = {
  name: string;
  email: string;
  focus: FeedbackFocus;
  message: string;
  website: string;
};

type FeedbackStatus =
  | { type: "idle"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const INITIAL_FORM: FeedbackFormState = {
  name: "",
  email: "",
  focus: "both",
  message: "",
  website: ""
};

const MAX_MESSAGE_LENGTH = 1200;

export function FeedbackSection() {
  const [form, setForm] = useState<FeedbackFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FeedbackStatus>({ type: "idle", message: "" });

  const remainingCharacters = useMemo(() => MAX_MESSAGE_LENGTH - form.message.length, [form.message.length]);
  const canSubmit = form.message.trim().length >= 12 && !isSubmitting;

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "message" ? value.slice(0, MAX_MESSAGE_LENGTH) : value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setStatus({
        type: "error",
        message: "Write at least a short thought first, then we can send it."
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "The feedback could not be delivered right now.");
      }

      setForm(INITIAL_FORM);
      setStatus({
        type: "success",
        message: payload?.message ?? "Your thoughts have been sent to the author."
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "The feedback could not be delivered right now."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="feedback-section" aria-labelledby="feedback-title">
      <div className="feedback-shell">
        <div className="feedback-copy">
          <p className="feedback-kicker">Feedback</p>
          <h2 id="feedback-title" className="feedback-title">
            Send a thought back to the author
          </h2>
          <p className="feedback-body">
            If this story made you feel something, leave a note here. It can be about the writing,
            the author, or simply what stayed with you after reading.
          </p>
          <p className="feedback-body feedback-body-soft">
            Your message is sent privately through the site&apos;s feedback inbox.
          </p>
        </div>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-grid">
            <label className="feedback-field">
              <span className="feedback-label">Your name</span>
              <input
                className="feedback-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Optional"
                autoComplete="name"
              />
            </label>

            <label className="feedback-field">
              <span className="feedback-label">Reply email</span>
              <input
                className="feedback-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Optional"
                autoComplete="email"
              />
            </label>
          </div>

          <label className="feedback-field">
            <span className="feedback-label">Your note is mainly about</span>
            <select className="feedback-input" name="focus" value={form.focus} onChange={handleChange}>
              <option value="author">The author</option>
              <option value="story">The story</option>
              <option value="both">Both</option>
            </select>
          </label>

          <label className="feedback-field">
            <span className="feedback-label">Your thoughts</span>
            <textarea
              className="feedback-textarea"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write what you honestly felt while reading this."
              rows={7}
              required
            />
          </label>

          <input
            className="feedback-honeypot"
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="feedback-actions">
            <p className="feedback-meta">{remainingCharacters} characters left</p>
            <button className="feedback-submit" type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Sending..." : "Send feedback"}
            </button>
          </div>

          {status.message ? (
            <p
              className={status.type === "error" ? "feedback-status feedback-status-error" : "feedback-status"}
              role="status"
            >
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
