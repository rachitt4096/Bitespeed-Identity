import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export type ContactRow = Awaited<
  ReturnType<typeof prisma.contact.findMany>
>[number];

const getClient = (tx?: Prisma.TransactionClient) => tx ?? prisma;

/**
 * Find contacts matching email OR phone number (non-deleted only).
 */
export async function findMatchingContacts(
  email?: string,
  phoneNumber?: string,
  tx?: Prisma.TransactionClient
): Promise<ContactRow[]> {
  const client = getClient(tx);

  const conditions: Array<{
    email?: string;
    phoneNumber?: string;
  }> = [];

  if (email) conditions.push({ email });
  if (phoneNumber) conditions.push({ phoneNumber });

  if (conditions.length === 0) return [];

  return client.contact.findMany({
    where: {
      deletedAt: null,
      OR: conditions,
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

/**
 * Resolve full identity group using iterative expansion.
 * This ensures we fetch transitive connections (A → B → C).
 */
export async function findGroupByIds(
  ids: number[],
  tx?: Prisma.TransactionClient
): Promise<ContactRow[]> {
  const client = getClient(tx);

  if (ids.length === 0) return [];

  const visited = new Set<number>(ids);
  let expanded = true;

  while (expanded) {
    expanded = false;

    const results = await client.contact.findMany({
      where: {
        deletedAt: null,
        OR: [
          { id: { in: Array.from(visited) } },
          { linkedId: { in: Array.from(visited) } },
        ],
      },
    });

    for (const contact of results) {
      if (!visited.has(contact.id)) {
        visited.add(contact.id);
        expanded = true;
      }

      if (
        contact.linkedId &&
        !visited.has(contact.linkedId)
      ) {
        visited.add(contact.linkedId);
        expanded = true;
      }
    }
  }

  return client.contact.findMany({
    where: {
      deletedAt: null,
      id: { in: Array.from(visited) },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export interface CreateContactInput {
  email?: string;
  phoneNumber?: string;
  linkPrecedence: "primary" | "secondary";
  linkedId?: number;
}

export async function createContact(
  input: CreateContactInput,
  tx?: Prisma.TransactionClient
): Promise<ContactRow> {
  const client = getClient(tx);

  return client.contact.create({
    data: {
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      linkPrecedence: input.linkPrecedence,
      linkedId: input.linkedId ?? null,
    },
  });
}

export interface UpdateContactInput {
  linkPrecedence?: "primary" | "secondary";
  linkedId?: number | null;
}

export async function updateContact(
  id: number,
  input: UpdateContactInput,
  tx?: Prisma.TransactionClient
): Promise<ContactRow> {
  const client = getClient(tx);

  return client.contact.update({
    where: { id },
    data: {
      ...(input.linkPrecedence !== undefined && {
        linkPrecedence: input.linkPrecedence,
      }),
      ...(Object.prototype.hasOwnProperty.call(
        input,
        "linkedId"
      ) && {
        linkedId: input.linkedId,
      }),
    },
  });
}
