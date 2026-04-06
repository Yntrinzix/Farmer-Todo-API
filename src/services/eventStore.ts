import { PrismaClient } from "@prisma/client";
import { TodoEvent } from "../events/types";

const prisma = new PrismaClient();

export async function appendEvent(aggregateId: string, event: TodoEvent, userId: string) {
  return prisma.event.create({
    data: { aggregateId, type: event.type, data: event.data as object, userId },
  });
}

// Replay all events for a single todo (used to reconstruct state from event log)
export async function getEventsForAggregate(aggregateId: string) {
  return prisma.event.findMany({ where: { aggregateId }, orderBy: { createdAt: "asc" } });
}

// Replay all events for a user (used to rebuild entire read model)
export async function getEventsForUser(userId: string) {
  return prisma.event.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}
