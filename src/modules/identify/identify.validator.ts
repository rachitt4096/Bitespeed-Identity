export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function normalizeEmail(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value !== "string") {
    throw new ValidationError("email must be a string");
  }

  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

function normalizePhoneNumber(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "string") {
    throw new ValidationError("phoneNumber must be a string or number");
  }

  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
}

export function validateIdentifyInput(body: unknown): IdentifyRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("request body must be a JSON object");
  }

  const payload = body as Record<string, unknown>;

  const email = normalizeEmail(payload.email);
  const phoneNumber = normalizePhoneNumber(payload.phoneNumber);

  if (!email && !phoneNumber) {
    throw new ValidationError(
      "Either email or phoneNumber must be provided"
    );
  }

  return { email, phoneNumber };
}
