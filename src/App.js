import { useEffect, useState } from "react";

function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  // Fetch contacts from Netlify Function
  const loadContacts = async () => {
    try {
      const res = await fetch("/.netlify/functions/contacts");
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add a new contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/.netlify/functions/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "", phone: "" });
      loadContacts(); // refresh list
    } catch (err) {
      console.error("Error adding contact:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">📒 Contact Book</h1>

      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="w-full p-2 mb-3 border rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="w-full p-2 mb-3 border rounded"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 mb-3 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Contact
        </button>
      </form>

      {/* Contact List */}
      <ul className="mt-6 w-full max-w-md">
        {contacts.map((c) => (
          <li
            key={c.id}
            className="bg-white p-4 rounded-lg shadow mb-3 flex justify-between"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-600">{c.email}</p>
              <p className="text-sm text-gray-600">{c.phone}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
