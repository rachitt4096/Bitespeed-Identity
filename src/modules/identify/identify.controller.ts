import { Request, Response } from "express";
import { identifyService } from "./identify.service";
import {
  ValidationError,
  validateIdentifyInput,
} from "./identify.validator";

export const identifyController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, phoneNumber } =
      validateIdentifyInput(req.body);

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
};
