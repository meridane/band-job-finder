"use client";

import React from "react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  titleFr?: string;
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

type AIJob = {
  title: string | null;
  job: string | null;
  industry: string | null;
  welding_related: boolean;
  location: string | null;
  address: string | null;
  salary: string | null;
  salary_type: string | null;
  phone: string | null;
  fax: string | null;
  experience: string | null;
  education: string | null;
  contract: string | null;
  working_hours: string | null;
  working_days: string | null;
  accommodation: string | null;
  meal: string | null;
  visa: string | null;
  deadline: string | null;
  application_method: string | null;
  company: string | null;
  summary_fr: string | null;
};

const aiFields: Array<[keyof AIJob, string]> = [
  ["job", "Poste"],
  ["industry", "Secteur"],
  ["location", "Région"],
  ["address", "Adresse"],
  ["salary", "Salaire"],
  ["experience", "Expérience"],
  ["education", "Études"],
  ["contract", "Contrat"],
  ["working_hours", "Horaires"],
  ["working_days", "Jours de travail"],
  ["accommodation", "Logement"],
  ["meal", "Repas"],
  ["visa", "Visa"],
  ["deadline", "Date limite"],
  ["application_method", "Candidature"],
  ["company", "Entreprise"],
];

export default function LivingBlogJobs() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [detail, setDetail] = React.useState<JobDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");
  const [ai, setAi] = React.useState<AIJob | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState("");

  async function searchWeldingJobs() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/livingsblog", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Recherche impossible");
      setJobs(data.jobs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur pendant la recherche");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    searchWeldingJobs();
  }, []);

  async function openDetail(job: Job) {
    setSelectedJob(job);
    setDetail(null);
    setAi(null);
    setDetailError("");
    setAiError("");
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

  async function analyzeWithAI() {
    if (!selectedJob) return;
    setAiLoading(true);
    setAiError("");
    try {
      const r = await fetch(`/api/livingsblog/ai?id=${encodeURIComponent(selectedJob.id)}`);
      const data = await r.json();
      if (!r.ok || !data.ok) throw new Error(data.error || "Analyse IA impossible");
      setAi(data.data);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Erreur pendant l'analyse IA");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="shell">
      <header>
        <div>
          <span className="eyebrow">LIVINGBLOG JOB FINDER</span>
          <h1>Offres de soudage</h1>
          <p>
            Recherche automatique des annonces liées au soudage : CO₂, TIG, MIG, Argon,
            tuyauterie, soudage naval, chaudronnerie, structures métalliques, etc.
          </p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{padding:"8px 12px",borderRadius:999,background:"#fff3ed",color:"#d84315",fontWeight:700}}>
            🇰🇷 Busan / région 26000
          </span>
          <button
            onClick={searchWeldingJobs}
            disabled={loading}
            style={{border:0,borderRadius:10,background:"#ff5722",color:"#fff",padding:"10px 14px",fontWeight:700,cursor:"pointer"}}
          >
            {loading ? "Recherche..." : "↻ Actualiser"}
          </button>
          <Link href="/" style={{textDecoration:"none",padding:"10px 14px",borderRadius:10,background:"#ff5722",color:"#fff",fontWeight:700}}>
            ← Job Finder
          </Link>
        </div>
      </header>

      <section className="card">
        <div className="cardhead">
          <h2>{loading ? "Recherche automatique..." : `${jobs.length} offre(s) de soudage`}</h2>
          <span>Filtrage automatique par mots-clés coréens</span>
        </div>
        {error && <p style={{color:"#c62828",marginTop:12}}>⚠️ {error}</p>}

        <div className="table" style={{marginTop:14}}>
          <div className="row head">
            <span>Offre</span>
            <span>Téléphone</span>
            <span>Salaire</span>
            <span>ID</span>
            <span>Action</span>
          </div>

          {jobs.map(job => (
            <div className="row" key={job.id}>
              <span className="job">{job.titleFr || job.title}</span>
              <span>
                {job.phone ? (
                  <>
                    <a href={`tel:${job.phone.replace(/[^0-9+]/g, "")}`}>{job.phone}</a>
                    {job.contactLabel ? <small style={{display:"block",color:"#777"}}>{job.contactLabel}</small> : null}
                  </>
                ) : "—"}
              </span>
              <span>{job.salary || "—"}</span>
              <span style={{fontSize:11}}>{job.id}</span>
              <button
                onClick={() => openDetail(job)}
                style={{border:0,cursor:"pointer",textAlign:"center",borderRadius:9,background:"#ff5722",color:"#fff",padding:"9px 10px",fontWeight:700}}
              >
                Détail
              </button>
            </div>
          ))}

          {!loading && jobs.length === 0 && !error && (
            <p style={{padding:"18px 0"}}>Aucune offre de soudage trouvée.</p>
          )}
        </div>
      </section>

      {selectedJob && (
        <div
          onClick={() => setSelectedJob(null)}
          style={{
            position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,.55)",
            backdropFilter:"blur(5px)",display:"flex",alignItems:"center",
            justifyContent:"center",padding:20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width:"min(900px,100%)",maxHeight:"90vh",overflowY:"auto",
              background:"#fff",borderRadius:20,boxShadow:"0 25px 80px rgba(0,0,0,.3)",
              padding:28,animation:"fadeIn .2s ease-out"
            }}
          >
            <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start"}}>
              <div>
                <span className="eyebrow">OFFRE LIVINGBLOG • EXTRACTION IA</span>
                <h2 style={{fontSize:26,marginTop:8}}>{ai?.title || selectedJob.titleFr || detail?.title || selectedJob.title}</h2>
                <p style={{margin:"4px 0"}}>ID : {selectedJob.id}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{border:0,background:"#eee",borderRadius:999,width:40,height:40,fontSize:22,cursor:"pointer"}}>×</button>
            </div>

            {detailLoading && (
              <div className="card" style={{marginTop:18,textAlign:"center"}}>
                <h2>⏳ Chargement de l'annonce...</h2>
              </div>
            )}

            {detailError && (
              <div className="card" style={{marginTop:18}}>
                <p style={{color:"#c62828"}}>⚠️ {detailError}</p>
              </div>
            )}

            {!ai && !aiLoading && !detailLoading && (
              <div style={{marginTop:18,padding:18,borderRadius:14,background:"#fff7f2",border:"1px solid #ffd7c2"}}>
                <h3 style={{marginTop:0}}>🤖 Extraction intelligente</h3>
                <p style={{margin:"8px 0 14px",color:"#555"}}>
                  L'IA lit l'annonce originale et récupère uniquement les informations réellement présentes.
                </p>
                <button onClick={analyzeWithAI} style={{border:0,borderRadius:10,background:"#ff5722",color:"#fff",padding:"12px 18px",fontWeight:700,cursor:"pointer"}}>
                  🤖 Analyser cette annonce
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="card" style={{marginTop:18,textAlign:"center"}}>
                <h2>🤖 Analyse IA en cours...</h2>
                <p>Extraction et traduction en français.</p>
              </div>
            )}

            {aiError && (
              <div className="card" style={{marginTop:18}}>
                <p style={{color:"#c62828"}}>⚠️ {aiError}</p>
              </div>
            )}

            {ai && !aiLoading && (
              <>
                <div style={{marginTop:18,padding:16,borderRadius:12,background:ai.welding_related ? "#eefaf2" : "#f5f5f5",border:"1px solid #d8e8dc"}}>
                  <strong>{ai.welding_related ? "🔧 Offre liée au soudage" : "📄 Offre analysée"}</strong>
                </div>

                {ai.phone && (
                  <div style={{marginTop:14,padding:16,borderRadius:12,background:"#eef7ff",border:"1px solid #cfe7ff"}}>
                    <strong>📞 Téléphone : </strong>
                    <a href={`tel:${ai.phone.replace(/[^0-9+]/g,"")}`}>{ai.phone}</a>
                  </div>
                )}
                {ai.fax && <div style={{marginTop:10,padding:12,borderRadius:10,background:"#fafafa",border:"1px solid #eee"}}><strong>📠 Fax :</strong> {ai.fax}</div>}

                <div style={{marginTop:18}}>
                  <h3>📋 Informations extraites</h3>
                  {aiFields.map(([key, label]) => {
                    const value = ai[key];
                    if (!value) return null;
                    return (
                      <div key={key} style={{display:"grid",gridTemplateColumns:"210px 1fr",gap:14,padding:"11px 0",borderBottom:"1px solid #eee"}}>
                        <strong>{label}</strong>
                        <span>{value}</span>
                      </div>
                    );
                  })}
                </div>

                {ai.summary_fr && (
                  <div style={{marginTop:22,padding:20,borderRadius:14,background:"#fafafa",border:"1px solid #eee"}}>
                    <h3 style={{marginTop:0}}>📝 Résumé</h3>
                    <p style={{lineHeight:1.8,color:"#333"}}>{ai.summary_fr}</p>
                  </div>
                )}

                <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:20,flexWrap:"wrap"}}>
                  <button onClick={() => {setAi(null);setAiError("");}} style={{border:"1px solid #ddd",padding:"10px 15px",borderRadius:10,background:"#fff"}}>↻ Refaire</button>
                  <a href={detail?.url || selectedJob.url} target="_blank" rel="noreferrer" style={{textDecoration:"none",padding:"10px 15px",borderRadius:10,background:"#eee",color:"#222"}}>Voir l'original</a>
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
