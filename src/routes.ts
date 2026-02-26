import { Router } from "express";
import { identifyController } from "./modules/identify/identify.controller";

const router = Router();

router.get("/identify", (_req, res) => {
  return res.status(200).json({
    message: "Use POST /identify with JSON body",
    example: {
      email: "doc@example.com",
      phoneNumber: "123456",
    },
  });
});

router.post("/identify", identifyController);

export default router;
