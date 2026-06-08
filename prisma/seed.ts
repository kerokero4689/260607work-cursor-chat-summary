import { PrismaClient } from "@prisma/client";
import { DEFAULT_TAGS } from "../src/lib/default-tags";

const prisma = new PrismaClient();

async function main() {
  for (const tag of DEFAULT_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { color: tag.color },
      create: { name: tag.name, color: tag.color },
    });
  }
  console.log("Default tags seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
