import { Client } from "pg";

export async function handler(event) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon
  });

  await client.connect();

  // Ensure table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT
    );
  `);

  if (event.httpMethod === "POST") {
    const { name, email, phone } = JSON.parse(event.body);
    const result = await client.query(
      "INSERT INTO contacts (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone]
    );
    await client.end();
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  }

  if (event.httpMethod === "GET") {
    const result = await client.query("SELECT * FROM contacts ORDER BY id DESC");
    await client.end();
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  }

  await client.end();
  return { statusCode: 405, body: "Method Not Allowed" };
}
