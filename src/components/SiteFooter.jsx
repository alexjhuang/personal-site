import { useEffect, useState } from "react";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function SiteFooter() {
  const [updatedAt, setUpdatedAt] = useState("2026-01-12");

  useEffect(() => {
    fetch("/last-updated.json")
      .then((response) => response.json())
      .then((data) => {
        if (data?.updatedAt) setUpdatedAt(data.updatedAt);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="site-footer">
      <span>Last updated · {formatDate(updatedAt)}</span>
    </footer>
  );
}

export default SiteFooter;
