import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/auth";
import { appendEvent } from "../services/eventStore";
import { planRoute } from "../services/routePlanner";

const prisma = new PrismaClient();
const VALID_STATES = ["todo", "scheduled", "done"];

export async function createTodo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, state = "todo", latitude, longitude } = req.body;
    const userId = req.userId!;

    if (!title || latitude == null || longitude == null) {
      res.status(400).json({ error: "title, latitude, and longitude are required" });
      return;
    }
    if (!VALID_STATES.includes(state)) {
      res.status(400).json({ error: `state must be one of: ${VALID_STATES.join(", ")}` });
      return;
    }

    const id = uuidv4();
    await appendEvent(id, { type: "TodoCreated", data: { id, title, state, latitude, longitude } }, userId);
    const todo = await prisma.todo.create({ data: { id, title, state, latitude, longitude, userId } });

    res.status(201).json(todo);
  } catch {
    res.status(500).json({ error: "Failed to create todo" });
  }
}

export async function getTodos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });
    res.json(todos);
  } catch {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
}

export async function getTodoById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const todo = await prisma.todo.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!todo) { res.status(404).json({ error: "Todo not found" }); return; }
    res.json(todo);
  } catch {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
}

export async function updateTodo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, state, latitude, longitude } = req.body;
    const userId = req.userId!;

    if (state && !VALID_STATES.includes(state)) {
      res.status(400).json({ error: `state must be one of: ${VALID_STATES.join(", ")}` });
      return;
    }

    const existing = await prisma.todo.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) { res.status(404).json({ error: "Todo not found" }); return; }

    const changes: Record<string, unknown> = {};
    if (title !== undefined) changes.title = title;
    if (state !== undefined) changes.state = state;
    if (latitude !== undefined) changes.latitude = latitude;
    if (longitude !== undefined) changes.longitude = longitude;

    await appendEvent(req.params.id, { type: "TodoUpdated", data: changes }, userId);
    const todo = await prisma.todo.update({ where: { id: req.params.id }, data: changes });

    res.json(todo);
  } catch {
    res.status(500).json({ error: "Failed to update todo" });
  }
}

export async function deleteTodo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const existing = await prisma.todo.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) { res.status(404).json({ error: "Todo not found" }); return; }

    await appendEvent(req.params.id, { type: "TodoDeleted", data: {} as never }, userId);
    await prisma.todo.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete todo" });
  }
}

export async function getRoute(req: AuthRequest, res: Response): Promise<void> {
  try {
    const todos = await prisma.todo.findMany({ where: { userId: req.userId!, state: "scheduled" } });
    if (todos.length < 2) { res.json({ route: todos, totalDistance: 0 }); return; }

    const locations = todos.map((t) => ({ id: t.id, latitude: t.latitude, longitude: t.longitude }));
    const result = planRoute(locations);
    const todoMap = new Map(todos.map((t) => [t.id, t]));
    const route = result.route.map((loc) => todoMap.get(loc.id)!);

    res.json({ route, totalDistance: result.totalDistance });
  } catch {
    res.status(500).json({ error: "Failed to plan route" });
  }
}

export async function getNextRoute(req: AuthRequest, res: Response): Promise<void> {
  try {
    const todos = await prisma.todo.findMany({ where: { userId: req.userId!, state: "scheduled" } });
    if (todos.length === 0) { res.json(null); return; }

    const locations = todos.map((t) => ({ id: t.id, latitude: t.latitude, longitude: t.longitude }));
    const result = planRoute(locations);
    const next = todos.find((t) => t.id === result.route[0].id)!;

    res.json(next);
  } catch {
    res.status(500).json({ error: "Failed to get next route" });
  }
}
