import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

function sendError(res, status, message) {
  return res.writeHead(status).end(JSON.stringify({ error: message }));
}

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: async (req, res) => {
      const { search } = req.query;
      const tasks = await database.select(
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
    handler: async (req, res) => {
      const { title, description } = req.body || {};
      if (!title) return sendError(res, 400, "Informe um título");
      if (!description) return sendError(res, 400, "Informe uma descrição");

      const now = new Date();
      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: now,
        updated_at: now,
      };
      await database.insert("tasks", task);
      return res.writeHead(201).end(JSON.stringify(task));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params || {};
      if (!id) return sendError(res, 400, "Informe um ID");
      const task = (await database.select("tasks", { id }))[0];
      if (!task) return sendError(res, 404, "Tarefa não encontrada");

      const { title, description } = req.body || {};
      if (!title) return sendError(res, 400, "Informe um título");
      if (!description) return sendError(res, 400, "Informe uma descrição");

      task.title = title;
      task.description = description;
      task.updated_at = new Date();
      await database.update("tasks", id, task);
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: async (req, res) => {
      const { id } = req.params || {};
      if (!id) return sendError(res, 400, "Informe um ID");
      const task = (await database.select("tasks", { id }))[0];
      if (!task) return sendError(res, 404, "Tarefa não encontrada");
      await database.delete("tasks", id);
      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: async (req, res) => {
      const { id } = req.params || {};
      if (!id) return sendError(res, 400, "Informe um ID");
      const task = (await database.select("tasks", { id }))[0];
      if (!task) return sendError(res, 404, "Tarefa não encontrada");
      task.completed_at = task.completed_at ? null : new Date();
      await database.update("tasks", id, task);
      return res.writeHead(204).end();
    },
  },
];
