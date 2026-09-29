"use client";

import React from "react";

type Job = {
  source: "band" | "saramin" | "manual";
  sourceJobId: string;
  sourceUrl?: string | null;
  title: string;
  company?: string | null;
  location?: string | null;
  salary?: string | null;
  contactPhone?: string | null;
  description?: string | null;
  matchedKeywords?: string[];
};

const demoJobs: Job[] = [
  { source:"band", sourceJobId:"demo-band-1", title:"용접사 구인", company:"BAND 공고", location:"울산", salary:"일당 160,000원", contactPhone:"010-1234-5678", matchedKeywords:["CO2","알곤","용접"] },
  { source:"saramin", sourceJobId:"demo-saramin-1", title:"조선소 용접원 모집", company:"Saramin 공고", location:"거제", salary:"월 400만원", contactPhone:null, matchedKeywords:["조선소","CO2","용접"] },
];

function prepareSms(phone:string, title:string){
  const body = `안녕하세요. ${title} 구인 공고를 보고 연락드립니다.
용접 경력이 있으며 지원하고 싶습니다.
근무조건과 면접 일정 안내 부탁드립니다.
감사합니다.`;
  window.location.href = `sms:${phone.replace(/[^0-9+]/g,"")}?body=${encodeURIComponent(body)}`;
}

export default function Home(){
  const [keyword,setKeyword]=React.useState("용접");
  const [location,setLocation]=React.useState("");
  const [jobs,setJobs]=React.useState<Job[]>(demoJobs);
  const [loading,setLoading]=React.useState(false);
  const [searched,setSearched]=React.useState(false);
  const [sourceBand,setSourceBand]=React.useState(true);
  const [sourceSaramin,setSourceSaramin]=React.useState(true);

  async function search(){
    setLoading(true); setSearched(true);
    try{
      const qs=new URLSearchParams();
      if(keyword) qs.set("keyword",keyword);
      if(location) qs.set("location",location);
      const res=await fetch(`/api/jobs/search?${qs.toString()}`);
      const data=await res.json();
      const filtered=(data.jobs ?? []).filter((j:Job)=>
        (j.source==="band" && sourceBand)||(j.source==="saramin" && sourceSaramin)
      );
      setJobs(filtered.length ? filtered : []);
    }catch{
      setJobs([]);
    }finally{setLoading(false);}
  }

  return <main className="shell">
    <header>
      <div>
        <span className="eyebrow">JOB FINDER · KOREA</span>
        <h1>Trouve ton prochain emploi</h1>
        <p>BAND + Saramin dans une seule recherche.</p>
      </div>
      <span className="status">Multi-source</span>
    </header>

    <section className="searchbox">
      <div className="searchgrid">
        <label>Mot-clé<input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="용접, TIG, CO2..." /></label>
        <label>Ville<input value={location} onChange={e=>setLocation(e.target.value)} placeholder="울산, 부산, 거제..." /></label>
        <button className="searchbtn" onClick={search} disabled={loading}>{loading ? "Recherche..." : "🔎 Rechercher"}</button>
      </div>
      <div className="sources">
        <label><input type="checkbox" checked={sourceBand} onChange={e=>setSourceBand(e.target.checked)}/> 🟢 BAND</label>
        <label><input type="checkbox" checked={sourceSaramin} onChange={e=>setSourceSaramin(e.target.checked)}/> 🔵 Saramin</label>
      </div>
    </section>

    <section className="stats">
      <div><b>{jobs.length}</b><span>Offres affichées</span></div>
      <div><b>{jobs.filter(j=>j.source==="band").length}</b><span>BAND</span></div>
      <div><b>{jobs.filter(j=>j.source==="saramin").length}</b><span>Saramin</span></div>
      <div><b>{searched ? "✓" : "—"}</b><span>Dernière recherche</span></div>
    </section>

    <section className="card">
      <div className="cardhead"><h2>Offres d'emploi</h2><span>{loading ? "Recherche en cours..." : "Résultats unifiés"}</span></div>
      {jobs.length===0 && searched && !loading && <div className="empty">Aucune offre disponible avec ces critères. Vérifie aussi que les clés API sont configurées.</div>}
      <div className="jobs">
        {jobs.map((j,i)=><article className="jobcard" key={`${j.source}-${j.sourceJobId}-${i}`}>
          <div className="jobtop">
            <span className={`badge ${j.source}`}>{j.source==="band" ? "🟢 BAND" : "🔵 Saramin"}</span>
            {j.salary && <strong>{j.salary}</strong>}
          </div>
          <h3>{j.title}</h3>
          <p className="company">{j.company ?? "Entreprise non renseignée"}</p>
          <div className="meta">📍 {j.location ?? "Lieu non renseigné"} {j.contactPhone && <> · 📞 {j.contactPhone}</>}</div>
          <div className="keywords">{(j.matchedKeywords ?? []).map(k=><span key={k}>{k}</span>)}</div>
          <div className="actions">
            {j.sourceUrl && <a href={j.sourceUrl} target="_blank" rel="noreferrer">Voir l'annonce ↗</a>}
            {j.contactPhone && <button onClick={()=>prepareSms(j.contactPhone!,j.title)}>📱 Préparer SMS</button>}
          </div>
        </article>)}
      </div>
    </section>

    <section className="card">
      <h2>Importer une annonce BAND</h2>
      <p>Tu peux toujours coller une page BAND complète dans le parser manuel existant. Cette fonction restera notre solution de secours pour les annonces difficiles à récupérer par API.</p>
    </section>
  </main>
}