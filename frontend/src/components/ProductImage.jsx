import React, { useState } from "react";
import { resolveImageUrl } from "../api.js";

export default function ProductImage({ src, alt, initial }) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(src);

  if (!resolved || failed) {
    return <div className="menu-card-media">{initial}</div>;
  }

  return (
    <div className="menu-card-media menu-card-media-img">
      <img src={resolved} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}
