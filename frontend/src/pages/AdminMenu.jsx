import React, { useEffect, useState } from "react";
import { api, resolveImageUrl } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ImageUploadField from "../components/ImageUploadField.jsx";

const emptyForm = { name: "", description: "", price: "", category: "Mains", image_url: "", badge: "", is_available: true };
const BADGE_OPTIONS = ["", "New", "Popular", "Best Seller", "Limited"];

export default function AdminMenu() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api.getMenu().then(setItems).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.image_url,
      badge: item.badge || "",
      is_available: !!item.is_available,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editingId) {
        await api.updateMenuItem(editingId, payload, token);
        showToast(`${form.name} updated`, "success");
      } else {
        await api.createMenuItem(payload, token);
        showToast(`${form.name} added to the menu`, "success");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteMenuItem(id, token);
      showToast(`${name} deleted`, "info");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Menu items</h2>
        <button className="btn btn-gold btn-shine" onClick={openCreate}>+ Add menu item</button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Badge</th>
                <th>Price</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.image_url ? (
                      <img src={resolveImageUrl(item.image_url)} alt="" className="admin-thumb" />
                    ) : (
                      <div className="admin-thumb admin-thumb-empty">{item.name.charAt(0)}</div>
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.badge && <span className={`product-badge badge-${item.badge.replace(/\s+/g, "-").toLowerCase()}`}>{item.badge}</span>}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.is_available ? "Available" : "Sold out"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id, item.name)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 24 }}>No menu items yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal modal-anim" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? "Edit menu item" : "Add menu item"}</h3>
            <form onSubmit={handleSave}>
              <ImageUploadField value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />

              <div className="field">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="field">
                <label>Price ($)</label>
                <input type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="field">
                <label>Category</label>
                <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="field">
                <label>Badge (optional)</label>
                <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}>
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b || "None"}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                    style={{ width: "auto", marginRight: 8 }}
                  />
                  Available for ordering
                </label>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary btn-shine" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
