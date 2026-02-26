type ServerlessRequest = {
  method?: string;
};

type ServerlessResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => ServerlessResponse;
  json: (body: unknown) => void;
};

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).json({});
  }

  return res.status(200).json({
    message: "BiteSpeed Identity API",
    usage: {
      endpoint: "/identify",
      method: "POST",
      contentType: "application/json",
      body: {
        email: "doc@example.com",
        phoneNumber: "123456",
      },
    },
  });
}
