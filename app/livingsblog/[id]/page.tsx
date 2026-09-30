"use client";

import React from "react";
import Link from "next/link";

type Detail = {
  id: string;
  url: string;
  title: string;
  titleOriginal: string;
  contact: { number: string; type: string } | null;
  fields: { key: string; label: string; valueFr: string; valueOriginal: string }[];
  descriptionFr: string;
};

export default function JobDetail({ params }: { params: { id: string } }) {
  const [data, setData] = React.useState<Detail | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/livingsblog/detail?id=${encodeURIComponent(params.id)}`)
      .then(async r => {
        const json = await r.json();
        if (!r.ok || !json.ok) throw new Error(json.error || "Impossible de charger l'offre");
        return json;
      })
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="shell"><div className="card"><h2>⏳ Chargement de l'offre...</h2></div></main>;
  if (error) return <main className="shell"><div className="card"><h2>⚠️ Erreur</h2><p>{error}</p><Link href="/livingsblog">← Retour</Link></div></main>;
  if (!data) return null;

  return (
    <main className="shell">
      <header>
        <div>
          <span className="eyebrow">LIVINGBLOG • DÉTAIL DE L'OFFRE</span>
          <h1>{data.title}</h1>
          <p>ID : {data.id}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/livingsblog" style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, background: "#171717", color: "#fff", fontWeight: 700 }}>← Retour</Link>
          <a href={data.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, background: "#ff5722", color: "#fff", fontWeight: 700 }}>Voir l'original</a>
        </div>
      </header>

      {data.contact && (
        <section className="card">
          <h2>📞 Contact</h2>
          <p><strong>{data.contact.type} :</strong> <a href={`tel:${data.contact.number.replace(/[^0-9+]/g, "")}`}>{data.contact.number}</a></p>
        </section>
      )}

      <section className="card">
        <h2>📋 Informations de l'offre</h2>
        {data.fields.map(field => (
          <div key={field.key} style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 16, padding: "12px 0", borderBottom: "1px solid #eee" }}>
            <strong>{field.label}</strong>
            <span>{field.valueFr}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>📝 Description en français</h2>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{data.descriptionFr}</p>
      </section>
    </main>
  );
}
