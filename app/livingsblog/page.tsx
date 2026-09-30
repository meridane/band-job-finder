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

type JobDetail = {
  id: string;
  title: string;
  url: string;
  contact: { number: string; type: string } | null;
  fields: { key: string; label: string; valueFr: string }[];
  descriptionFr: string;
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
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [detail, setDetail] = React.useState<JobDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");

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

  async function openDetail(job: Job) {
    setSelectedJob(job);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const r = await fetch(`/api/livingsblog/detail?id=${encodeURIComponent(job.id)}`);
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Impossible de charger les détails");
      setDetail(data);
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setDetailLoading(false);
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
              <button onClick={() => openDetail(job)} style={{ border: 0, cursor: "pointer", textAlign: "center", borderRadius: 9, background: "#ff5722", color: "#fff", padding: "9px 10px", fontWeight: 700 }}>Détail FR</button>
            </div>
          ))}
          {!loading && jobs.length === 0 && <p style={{ padding: "18px 0" }}>Lance une recherche pour récupérer les annonces.</p>}
        </div>
      </section>


      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,.55)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "min(900px, 100%)", maxHeight: "90vh", overflowY: "auto",
              background: "#fff", borderRadius: 20, boxShadow: "0 25px 80px rgba(0,0,0,.3)",
              padding: 28, animation: "fadeIn .2s ease-out"
            }}
          >
            <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start"}}>
              <div>
                <span className="eyebrow">OFFRE LIVINGBLOG • TRADUITE EN FRANÇAIS</span>
                <h2 style={{fontSize:26,marginTop:8}}>{detail?.title || selectedJob.title}</h2>
                <p style={{margin:"4px 0"}}>ID : {selectedJob.id}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{border:0,background:"#eee",borderRadius:999,width:40,height:40,fontSize:22,cursor:"pointer"}}>×</button>
            </div>

            {detailLoading && <div className="card" style={{marginTop:18,textAlign:"center"}}><h2>⏳ Chargement et traduction...</h2></div>}
            {detailError && <div className="card" style={{marginTop:18}}><p style={{color:"#c62828"}}>⚠️ {detailError}</p></div>}

            {detail && !detailLoading && (
              <>
                {detail.contact && (
                  <div style={{marginTop:18,padding:16,borderRadius:12,background:"#eef7ff",border:"1px solid #cfe7ff"}}>
                    <strong>📞 Contact : </strong>
                    <a href={`tel:${detail.contact.number.replace(/[^0-9+]/g,"")}`}>{detail.contact.number}</a>
                    <span style={{marginLeft:8,color:"#666"}}>({detail.contact.type})</span>
                  </div>
                )}

                <div style={{marginTop:18}}>
                  <h3>📋 Informations de l'offre</h3>
                  {detail.fields.map(field => (
                    <div key={field.key} style={{display:"grid",gridTemplateColumns:"210px 1fr",gap:14,padding:"11px 0",borderBottom:"1px solid #eee"}}>
                      <strong>{field.label}</strong>
                      <span>{field.valueFr}</span>
                    </div>
                  ))}
                </div>

                <div style={{marginTop:22,padding:20,borderRadius:14,background:"#fafafa",border:"1px solid #eee"}}>
                  <h3 style={{marginTop:0}}>📝 Description de l'offre</h3>
                  <p style={{whiteSpace:"pre-wrap",lineHeight:1.8,color:"#333"}}>{detail.descriptionFr}</p>
                </div>

                <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20}}>
                  <a href={detail.url} target="_blank" rel="noreferrer" style={{textDecoration:"none",padding:"10px 15px",borderRadius:10,background:"#eee",color:"#222"}}>Voir l'original</a>
                  <button onClick={() => setSelectedJob(null)} style={{border:0,padding:"10px 15px",borderRadius:10,background:"#ff5722",color:"#fff",fontWeight:700}}>Fermer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
