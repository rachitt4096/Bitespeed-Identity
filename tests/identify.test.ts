import { validateIdentifyInput } from "../src/modules/identify/identify.validator";

describe("validateIdentifyInput", () => {
  test("accepts payload with email only", () => {
    expect(
      validateIdentifyInput({ email: "doc@example.com" })
    ).toEqual({
      email: "doc@example.com",
      phoneNumber: undefined,
    });
  });

  test("accepts payload with phoneNumber only", () => {
    expect(
      validateIdentifyInput({ phoneNumber: "9999999999" })
    ).toEqual({
      email: undefined,
      phoneNumber: "9999999999",
    });
  });

  test("normalizes numeric phoneNumber", () => {
    expect(
      validateIdentifyInput({ phoneNumber: 9999999999 })
    ).toEqual({
      email: undefined,
      phoneNumber: "9999999999",
    });
  });

  test("throws when neither email nor phoneNumber is present", () => {
    expect(() => validateIdentifyInput({})).toThrow(
      "Either email or phoneNumber must be provided"
    );
  });

  test("throws for invalid request body", () => {
    expect(() => validateIdentifyInput(null)).toThrow(
      "request body must be a JSON object"
    );
  });
});
