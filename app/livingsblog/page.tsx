"use client";

import React from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  phone: string;
  contactLabel?: string;
  salary: string;
  address: string;
  keyword: string;
  region: string;
  url: string;
};

const keywords = [
  ["용접", "용접"],
  ["조선소", "조선소"],
  ["알곤/TIG", "알곤"],
  ["CO2", "CO2"],
  ["배관용접", "배관용접"],
  ["기계", "기계"],
];

export default function LivingBlogJobs() {
  const [keyword, setKeyword] = React.useState("용접");
  const [region, setRegion] = React.useState("26000");
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function search() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/livingsblog?keyword=${encodeURIComponent(keyword)}&region=${encodeURIComponent(region)}`);
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "검색 실패");
      setJobs(data.jobs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "검색 중 오류");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header>
        <div>
          <span className="eyebrow">LIVINGBLOG JOB FINDER</span>
          <h1>Livingsblog 구인 검색</h1>
          <p>현재 API가 없는 BAND / Saramin을 기다리는 동안 Livingsblog에서 공개된 채용공고를 검색합니다.</p>
        </div>
        <Link href="/" style={{ textDecoration: "none", padding: "10px 14px", borderRadius: 10, background: "#ff5722", color: "#fff", fontWeight: 700 }}>
          ← Job Finder
        </Link>
      </header>

      <section className="card">
        <div className="cardhead"><h2>검색 조건</h2><span>Source: job.livingsblog.com</span></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="용접" style={{ flex: 1, minWidth: 180, padding: 12, border: "1px solid #ddd", borderRadius: 10 }} />
          <input value={region} onChange={e => setRegion(e.target.value)} placeholder="26000" style={{ width: 130, padding: 12, border: "1px solid #ddd", borderRadius: 10 }} />
          <button onClick={search} disabled={loading} style={{ border: 0, borderRadius: 10, background: "#ff5722", color: "#fff", padding: "12px 18px", fontWeight: 700 }}>
            {loading ? "Recherche..." : "🔎 Rechercher"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {keywords.map(([label, value]) => <button key={value} onClick={() => setKeyword(value)} style={{ border: "1px solid #ddd", borderRadius: 999, background: "#fff", padding: "7px 11px" }}>{label}</button>)}
        </div>
        {error && <p style={{ color: "#c62828", marginTop: 12 }}>⚠️ {error}</p>}
      </section>

      <section className="card">
        <div className="cardhead"><h2>{jobs.length} annonce(s)</h2><span>Les détails sont ouverts via job_detail</span></div>
        <div className="table">
          <div className="row head"><span>Offre</span><span>Lieu</span><span>Téléphone</span><span>Conditions</span><span>ID</span><span>Action</span></div>
          {jobs.map(job => (
            <div className="row" key={job.id}>
              <span className="job">{job.title}</span>
              <span>{job.address || job.region}</span>
              <span>{job.phone ? <>{job.phone}{job.contactLabel ? <small style={{display:"block",color:"#777"}}>{job.contactLabel}</small> : null}</> : "—"}</span>
              <span>{job.salary || "—"}</span>
              <span style={{ fontSize: 11 }}>{job.id}</span>
              <Link href={`/livingsblog/${encodeURIComponent(job.id)}`} style={{ textDecoration: "none", textAlign: "center", borderRadius: 9, background: "#ff5722", color: "#fff", padding: "9px 10px", fontWeight: 700 }}>Détail FR</Link>
            </div>
          ))}
          {!loading && jobs.length === 0 && <p style={{ padding: "18px 0" }}>Lance une recherche pour récupérer les annonces.</p>}
        </div>
      </section>
    </main>
  );
}
