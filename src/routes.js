import path from "node:path";
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
      const { title, description } = req.body;
      const now = new Date();

      if (!title)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Informe um título" }));

      if (!description)
        return res.writeHead(400).end(JSON.stringify("Informe uma descrição"));

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
      const { id } = req.params;
      const { title, description } = req.body;

      const task = database.select("tasks", { id });
      if (!task)
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));

      if (!title)
        return res
          .writeHead(400)
          .end(JSON.stringify({ error: "Informe um título" }));

      if (!description)
        return res.writeHead(400).end(JSON.stringify("Informe uma descrição"));

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
      const { id } = req.params;
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
      const { id } = req.params;

      const task = database.select("tasks", { id });
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
