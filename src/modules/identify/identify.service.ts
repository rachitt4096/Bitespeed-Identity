import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { IdentifyResponse } from "./identify.types";
import {
  findMatchingContacts,
  findGroupByIds,
  createContact,
  updateContact,
  ContactRow,
} from "./identify.repository";

const dedupe = (values: (string | null)[]): string[] => {
  return [...new Set(values.filter((v): v is string => !!v))];
};

export const identifyService = async (
  email?: string,
  phoneNumber?: string
): Promise<IdentifyResponse> => {
  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const matches = await findMatchingContacts(email, phoneNumber, tx);

      // No matches → create new primary
      if (matches.length === 0) {
        const created = await createContact(
          {
            email,
            phoneNumber,
            linkPrecedence: "primary",
          },
          tx
        );

        return {
          primaryContatctId: created.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        };
      }

      // Resolve identity group
      const seedIds = Array.from(
        new Set(matches.flatMap((c) => [c.id, c.linkedId ?? c.id]))
      );

      const group = await findGroupByIds(seedIds, tx);

      if (group.length === 0) {
        throw new Error("Failed to resolve identity group");
      }

      // Find oldest primary
      const primaries = group.filter(
        (c) => c.linkPrecedence === "primary"
      );

      const candidates =
        primaries.length > 0 ? primaries : group;

      if (candidates.length === 0) {
        throw new Error("No valid contact candidates found");
      }

      const oldestPrimary = candidates.reduce(
        (oldest, current) => {
          if (current.createdAt < oldest.createdAt)
            return current;

          if (
            current.createdAt.getTime() ===
              oldest.createdAt.getTime() &&
            current.id < oldest.id
          ) {
            return current;
          }

          return oldest;
        }
      );

      // Demote other primaries
      for (const contact of primaries) {
        if (contact.id !== oldestPrimary.id) {
          await updateContact(
            contact.id,
            {
              linkPrecedence: "secondary",
              linkedId: oldestPrimary.id,
            },
            tx
          );
        }
      }

      // Ensure oldest is correctly marked
      if (
        oldestPrimary.linkPrecedence !== "primary" ||
        oldestPrimary.linkedId !== null
      ) {
        await updateContact(
          oldestPrimary.id,
          {
            linkPrecedence: "primary",
            linkedId: null,
          },
          tx
        );
      }

      const updatedGroup = await findGroupByIds(
        [oldestPrimary.id],
        tx
      );

      const existingEmails = new Set(
        updatedGroup
          .map((c) => c.email)
          .filter((v): v is string => !!v)
      );

      const existingPhones = new Set(
        updatedGroup
          .map((c) => c.phoneNumber)
          .filter((v): v is string => !!v)
      );

      const isNewEmail =
        !!email && !existingEmails.has(email);

      const isNewPhone =
        !!phoneNumber && !existingPhones.has(phoneNumber);

      if (isNewEmail || isNewPhone) {
        await createContact(
          {
            email,
            phoneNumber,
            linkPrecedence: "secondary",
            linkedId: oldestPrimary.id,
          },
          tx
        );

        const finalGroup = await findGroupByIds(
          [oldestPrimary.id],
          tx
        );

        return buildResponse(
          oldestPrimary.id,
          finalGroup
        );
      }

      return buildResponse(
        oldestPrimary.id,
        updatedGroup
      );
    }
  );
};

function buildResponse(
  primaryId: number,
  group: ContactRow[]
): IdentifyResponse {
  const sorted = [...group].sort((a, b) => {
    if (a.createdAt.getTime() !== b.createdAt.getTime()) {
      return (
        a.createdAt.getTime() -
        b.createdAt.getTime()
      );
    }
    return a.id - b.id;
  });

  const primary = sorted.find(
    (c) => c.id === primaryId
  );

  if (!primary) {
    throw new Error(
      "Primary contact missing from group"
    );
  }

  const secondaries = sorted.filter(
    (c) => c.id !== primaryId
  );

  const emails = dedupe([
    primary.email,
    ...secondaries.map((c) => c.email),
  ]);

  const phoneNumbers = dedupe([
    primary.phoneNumber,
    ...secondaries.map((c) => c.phoneNumber),
  ]);

  return {
    primaryContatctId: primaryId,
    emails,
    phoneNumbers,
    secondaryContactIds: secondaries.map(
      (c) => c.id
    ),
  };
}
