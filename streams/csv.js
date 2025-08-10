import * as csv from "csv";
import fs from "node:fs";
import { resolve } from "node:path";

async function run() {
  const csvFile = resolve("streams", "tasks.csv");
  const stream = fs.createReadStream(csvFile).pipe(
    csv.parse({
      delimiter: ",",
      fromLine: 2,
      skipEmptyLines: true,
    })
  );

  for await (const line of stream) {
    const [title, description] = line;
    await fetch("http://localhost:3333/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });
  }
  console.info("Importação de tarefas concluída com sucesso!");
}

run();
