import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchContacts(page);
  }, [page]);

  const fetchContacts = async (p = 1) => {
    try {
      const res = await axios.get(`/.netlify/functions/contacts?page=${p}`);
      setContacts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch contacts");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name || !form.email || !form.phone) return false;
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) return false;
    if (!/^\d{10}$/.test(form.phone)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert("Please enter valid inputs (email format, 10-digit phone).");
      return;
    }
    try {
      const res = await axios.post("/.netlify/functions/contacts", form);
      // Prepend new contact to current list
      setContacts([res.data, ...contacts]);
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add contact");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await axios.delete(`/.netlify/functions/contacts/${id}`);
      setContacts(contacts.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div className="container">
      <h2>Contact Book</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone (10 digits)"
          value={form.phone}
          onChange={handleChange}
        />
        <button type="submit">Add Contact</button>
      </form>

      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      <table className="contact-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No contacts on this page
              </td>
            </tr>
          ) : (
            contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  <button className="del" onClick={() => handleDelete(c.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
