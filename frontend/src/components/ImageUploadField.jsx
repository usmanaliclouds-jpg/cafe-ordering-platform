import React, { useRef, useState } from "react";
import { api, resolveImageUrl } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUploadField({ value, onChange }) {
  const { token } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Only JPG, PNG, or WebP images are supported.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be under 5MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file, token);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field">
      <label>Product image</label>

      {value ? (
        <div className="image-preview-wrap">
          <img src={resolveImageUrl(value)} alt="Preview" className="image-preview" />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange("")}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Drag & drop an image here, or click to choose a file"}
          <div style={{ fontSize: "0.75rem", marginTop: 4, color: "var(--ink-soft)" }}>
            JPG, PNG, or WebP · up to 5MB
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <div className="error-banner" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
