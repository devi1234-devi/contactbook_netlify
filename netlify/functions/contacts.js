import { Client } from "pg";

export async function handler(event) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
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
    // Read page & limit from query params
    const page = parseInt(event.queryStringParameters?.page) || 1;
    const limit = parseInt(event.queryStringParameters?.limit) || 5;
    const offset = (page - 1) * limit;

    // Fetch contacts with limit + offset
    const result = await client.query(
      "SELECT * FROM contacts ORDER BY id DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // Check if next page exists
    const nextCheck = await client.query(
      "SELECT COUNT(*) FROM contacts"
    );
    const totalContacts = parseInt(nextCheck.rows[0].count, 10);
    const hasNextPage = page * limit < totalContacts;

    await client.end();
    return {
      statusCode: 200,
      body: JSON.stringify({
        contacts: result.rows,
        hasNextPage,
      }),
    };
  }

  if (event.httpMethod === "DELETE") {
    const { id } = JSON.parse(event.body);

    if (!id) {
      await client.end();
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Contact ID required for deletion" }),
      };
    }

    const result = await client.query(
      "DELETE FROM contacts WHERE id = $1 RETURNING *",
      [id]
    );
    await client.end();

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Contact not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, deleted: result.rows[0] }),
    };
  }

  await client.end();
  return { statusCode: 405, body: "Method Not Allowed" };
}
