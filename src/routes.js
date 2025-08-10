import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      if (!req.body?.title)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Informe um título" }));

      if (!req.body?.description)
        return res.writeHead(400).end(JSON.stringify("Informe uma descrição"));

      const { title, description } = req.body;
      const now = new Date();

      const user = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: now,
        updated_at: now,
      };
      database.insert("tasks", user);

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      if (!req.params?.id)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Informe um ID" }));

      const { id } = req.params;
      console.log(id);
      const [task] = database.select("tasks", { id });
      console.log(task);
      if (!task)
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));

      if (!req.body?.title)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Informe um título" }));

      if (!req.body?.description)
        return res.writeHead(400).end(JSON.stringify("Informe uma descrição"));

      const { title, description } = req.body;

      task.title = title;
      task.description = description;
      task.updated_at = new Date();
      database.update("tasks", id, task);

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      if (!req.params?.id)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Informe um ID" }));

      const { id } = req.params;
      const [task] = database.select("tasks", { id });
      if (!task)
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));

      if (!database.select("tasks", { id }))
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      if (!req.params?.id)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Informe um ID" }));

      const { id } = req.params;
      const [task] = database.select("tasks", { id });
      if (!task)
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));

      if (!task)
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));

      task.completed_at = !!task.completed_at ? null : new Date();
      database.update("tasks", id, task);

      return res.writeHead(204).end();
    },
  },
];
