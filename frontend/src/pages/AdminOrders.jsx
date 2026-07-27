import React, { useEffect, useMemo, useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const STATUS_OPTIONS = ["placed", "preparing", "out_for_delivery", "completed", "cancelled"];
const STATUS_LABEL = {
  placed: "Placed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};
const PAGE_SIZE = 8;

export default function AdminOrders() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    api.getAllOrders(token).then(setOrders).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleStatusChange(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status, token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      showToast(`Order #${orderId} marked ${STATUS_LABEL[status]}`, "success");
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = useMemo(() => {
    let result = filter === "all" ? orders : orders.filter((o) => o.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) => o.customer_name.toLowerCase().includes(q) || String(o.id).includes(q) || o.customer_phone.includes(q)
      );
    }
    return result;
  }, [orders, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [filter, search]);

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Orders</h2>
        <div className="toolbar-filters">
          <div className="search-input">
            <Search />
            <input placeholder="Search by name, phone, or #ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select-pill" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList />
          <h3>No orders found</h3>
          <p>Try a different search or filter.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}<br /><span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{order.created_at}</span></td>
                    <td>{order.customer_name}<br /><span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{order.customer_phone}</span></td>
                    <td>{order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <select
                        className="select-pill"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
