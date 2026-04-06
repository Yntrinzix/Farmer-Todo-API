import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: { email: "demo@example.com", password },
  });

  console.log(`Seeded user: ${user.email}`);

  const todos = [
    { title: "Mow lawn - Smith residence",   state: "scheduled", latitude: -26.2041, longitude: 28.0473 },
    { title: "Trim hedges - Johnson house",  state: "scheduled", latitude: -26.1076, longitude: 28.0567 },
    { title: "Plant roses - Williams garden",state: "scheduled", latitude: -26.1952, longitude: 28.0340 },
    { title: "Fertilize lawn - Brown estate",state: "todo",      latitude: -26.1500, longitude: 28.0700 },
    { title: "Install irrigation - Davis",   state: "done",      latitude: -26.2200, longitude: 28.0100 },
  ];

  for (const todo of todos) {
    await prisma.todo.create({ data: { ...todo, userId: user.id } });
  }

  console.log(`Seeded ${todos.length} todos`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
