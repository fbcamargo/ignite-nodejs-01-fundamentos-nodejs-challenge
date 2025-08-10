import fs from "node:fs/promises";

const databasePath = new URL("db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    this.#init();
  }

  async #init() {
    try {
      const data = await fs.readFile(databasePath, "utf8");
      this.#database = JSON.parse(data);
    } catch (err) {
      await this.#persist();
    }
  }

  async #persist() {
    try {
      await fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2));
    } catch (err) {
      console.error("Erro ao persistir o banco de dados:", err);
    }
  }

  #ensureTable(table) {
    if (!this.#database[table]) {
      this.#database[table] = [];
    }
  }

  select(table, search) {
    this.#ensureTable(table);
    let data = this.#database[table];
    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key]?.toLowerCase().includes(value.toLowerCase());
        });
      });
    }
    return data;
  }

  insert(table, data) {
    this.#ensureTable(table);
    this.#database[table].push(data);
    this.#persist();
    return data;
  }

  delete(table, id) {
    this.#ensureTable(table);
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);
    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
      return true;
    }
    return false;
  }

  update(table, id, data) {
    this.#ensureTable(table);
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);
    if (rowIndex > -1) {
      const row = this.#database[table][rowIndex];
      this.#database[table][rowIndex] = { ...row, ...data, id };
      this.#persist();
      return true;
    }
    return false;
  }
}
