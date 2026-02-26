"use client";

import { FormEvent, useMemo, useState } from "react";

interface Contact {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

interface IdentifyResponse {
  contact: Contact;
}

const defaultBaseUrl = "http://localhost:3000";

export default function IdentifyDemo() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResponse | null>(null);

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultBaseUrl,
    []
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedEmail && !trimmedPhone) {
      setError("Provide at least email or phone number");
      return;
    }

    const payload: {
      email?: string;
      phoneNumber?: string;
    } = {};

    if (trimmedEmail) payload.email = trimmedEmail;
    if (trimmedPhone) payload.phoneNumber = trimmedPhone;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/identify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as
        | IdentifyResponse
        | { error?: string };

      if (!response.ok) {
        setResult(null);
        setError(data.error ?? "Request failed");
        return;
      }

      setResult(data as IdentifyResponse);
    } catch {
      setResult(null);
      setError(
        "Could not connect to backend. Start API server and check NEXT_PUBLIC_API_BASE_URL."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid">
      <section className="card">
        <form onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="doc@future.io"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Phone Number
            <input
              type="text"
              placeholder="123456"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Reconciling..." : "Run Identify"}
          </button>

          <p className="hint">
            Request goes to <strong>{apiBaseUrl}/identify</strong>
          </p>

          {error ? <div className="error">{error}</div> : null}
        </form>
      </section>

      <section className="card">
        <p className="success">Response Preview</p>
        <pre>
          {JSON.stringify(
            result ?? {
              contact: {
                primaryContatctId: 0,
                emails: [],
                phoneNumbers: [],
                secondaryContactIds: [],
              },
            },
            null,
            2
          )}
        </pre>
      </section>
    </div>
  );
}
