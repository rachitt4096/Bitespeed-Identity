import { identifyService } from "../src/modules/identify/identify.service";
import {
  ValidationError,
  validateIdentifyInput,
} from "../src/modules/identify/identify.validator";

type ServerlessRequest = {
  method?: string;
  body?: unknown;
};

type ServerlessResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => ServerlessResponse;
  json: (body: unknown) => void;
};

function parseBody(body: unknown): unknown {
  if (typeof body !== "string") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new ValidationError("request body must be valid JSON");
  }
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).json({});
  }

  if (req.method === "GET") {
    return res.status(200).json({
      message: "Use POST /identify with JSON body",
      example: {
        email: "doc@example.com",
        phoneNumber: "123456",
      },
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  try {
    const payload = parseBody(req.body);
    const { email, phoneNumber } = validateIdentifyInput(payload);
    const result = await identifyService(email, phoneNumber);

    return res.status(200).json({
      contact: result,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Identify Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}
