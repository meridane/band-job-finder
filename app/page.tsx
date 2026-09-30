"use client";

import React from "react";
import Link from "next/link";
import { parseBandPost } from "../lib/band-parser";

const rows=[
 {job:"용접사 구인",place:"울산",contact:"010-1234-5678",details:"알곤(TIG), CO2",pay:"160,000원"},
 {job:"조선소 용접",place:"거제",contact:"010-2345-6789",details:"배관 / 알곤",pay:"170,000원"},
 {job:"플랜트 배관용접",place:"부산",contact:"010-3456-7890",details:"TIG",pay:"협의"}
];

const message=(r:typeof rows[number]) =>
`안녕하세요. ${r.job} 구인 공고를 보고 연락드립니다.
알곤(TIG) 및 CO2 용접 경력이 있으며 지원하고 싶습니다.
현재 근무 가능합니다.
근무조건과 면접 일정 안내 부탁드립니다.
감사합니다.`;

function prepareSms(phone:string, body:string){
 const normalized=phone.replace(/[^0-9+]/g,"");
 const encoded=encodeURIComponent(body);
 const isWindows=/Windows/i.test(navigator.userAgent);
 if(isWindows){
   // Official Windows messaging URI. The user still confirms/sends the message.
   window.location.href=`ms-chat:?Addresses=${encodeURIComponent(normalized)}&Body=${encoded}`;
 }else{
   // Android/iPhone: open the device's SMS composer.
   window.location.href=`sms:${normalized}?body=${encoded}`;
 }
}

export default function Home(){
 const [bandPage,setBandPage]=React.useState("");
 const [parsedPage,setParsedPage]=React.useState<ReturnType<typeof parseBandPost>[]|null>(null);
 const analyzeBandPage=()=>{
  const blocks=bandPage.split(/\\n(?=# Posted on|#\\s*Posted on)/).filter(Boolean);
  const results=blocks.map((block)=>parseBandPost(block)).filter((item)=>item.isRelevant || item.phones.length || item.locations.length || item.salary);
  setParsedPage(results);
 };
 return <main className="shell">
  <header><div><span className="eyebrow">BAND JOB FINDER</span><h1>Offres détectées</h1><p>Les annonces correspondant à tes critères apparaîtront ici avec le numéro du responsable et le message de candidature à envoyer.</p></div><div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><Link href="/contacts" style={{textDecoration:"none",padding:"10px 14px",borderRadius:10,background:"#ff5722",color:"#fff",fontWeight:700}}>📱 Contacts & SMS</Link><span className="status">SMS automatique désactivé</span></div></header>
  <section className="stats">
   <div><b>0</b><span>Nouvelles offres</span></div><div><b>0</b><span>À traiter</span></div><div><b>0</b><span>Candidatures préparées</span></div><div><b>7</b><span>Filtres actifs</span></div>
  </section>
  <section className="card">
   <div className="cardhead"><h2>Offres détectées</h2><span>Filtrage + extraction actifs</span></div>
   <div className="table">
    <div className="row head"><span>Offre</span><span>Lieu</span><span>Responsable</span><span>Conditions</span><span>Salaire</span><span>Action</span></div>
    {rows.map((r,i)=>{
 const parsed=parseBandPost(`${r.job} ${r.place} ${r.details} ${r.pay} ${r.contact}`);
 return <div className="row" key={i}>
  <span className="job">{r.job}</span>
  <span>{parsed.locations.join(", ") || r.place}</span>
  <span>{parsed.phones[0] || r.contact}</span>
  <span>{parsed.matchedKeywords.slice(0,3).join(" · ")}</span>
  <span>{parsed.salary || r.pay}</span>
  <button onClick={()=>prepareSms(parsed.phones[0] || r.contact,message(r))}>📱 Préparer SMS</button>
 </div>
})}
   </div>
  </section>
  <section className="card grid">
   <div><h2>Ce que l'application détecte</h2><p>용접사 · 알곤용접 · TIG · CO2용접 · 배관용접 · 조선소 · 플랜트 · 제관용접 · 철골용접</p><p>Le moteur extrait aussi les numéros 010-xxxx-xxxx, les villes et les indications de salaire.</p></div>
   <div><h2>Candidature</h2><p>Mobile : ouvre le composeur SMS. Windows : ouvre le système de messagerie Windows avec le numéro et le message préremplis. Aucun SMS n'est envoyé automatiquement.</p></div>
  </section>

  <section className="card">
   <div className="cardhead"><h2>Importer une page BAND</h2><span>Mode manuel</span></div>
   <p>Copie-colle le contenu d'une page BAND complète ici. L'application extrait les annonces pertinentes, téléphones, villes, mots-clés et salaires.</p>
   <textarea
    value={bandPage}
    onChange={(e)=>setBandPage(e.target.value)}
    placeholder="Colle ici toute la page BAND copiée..."
    style={{width:"100%",minHeight:220,padding:16,borderRadius:12,border:"1px solid #ddd",fontFamily:"inherit",resize:"vertical"}}
   />
   <div style={{marginTop:12,display:"flex",gap:12,alignItems:"center"}}>
    <button onClick={analyzeBandPage} disabled={!bandPage.trim()}>🔎 Analyser la page</button>
    <span>{bandPage ? `${bandPage.length.toLocaleString()} caractères` : "Aucune donnée"}</span>
   </div>
   {parsedPage && <div style={{marginTop:20}}>
    <h3>{parsedPage.length} annonce(s) détectée(s)</h3>
    {parsedPage.map((item,i)=><div key={i} style={{padding:"14px 0",borderBottom:"1px solid #eee"}}>
     <strong>{item.matchedKeywords.join(" · ") || "Information détectée"}</strong>
     <div>📍 {item.locations.join(", ") || "Lieu non détecté"} · 📞 {item.phones.join(", ") || "Téléphone non détecté"} · 💰 {item.salary || "Salaire non détecté"}</div>
    </div>)}
   </div>}
  </section>

  <section className="card app-description">
   <div>
    <span className="eyebrow">ABOUT BAND JOB FINDER</span>
    <h2>Application Description / 앱 소개</h2>

    <h3>🇬🇧 English</h3>
    <p>
     BAND Job Finder is a personal job-search assistant designed to help users find relevant welding and industrial job postings shared on BAND.
     The application uses the BAND Open API to retrieve authorized BAND posts, then filters them by job-related keywords such as welding, TIG, CO2, pipe welding, shipyard and plant work.
     It extracts useful information already published in the posts, such as location, contact phone number and salary information, and presents the results in a simple dashboard.
    </p>
    <p>
     The application does not automatically send messages, publish posts or contact BAND members.
     When a user chooses to apply, the application only prepares an SMS with the phone number and a predefined application message; the user reviews and sends the message manually.
     The purpose is to help the user organize publicly/shared job information and respond individually to relevant job opportunities.
    </p>

    <h3>🇰🇷 한국어</h3>
    <p>
     BAND Job Finder는 BAND에 공유된 용접 및 산업 현장 구인 정보를 사용자가 쉽게 찾을 수 있도록 도와주는 개인용 구직 보조 애플리케이션입니다.
     BAND Open API를 통해 허가된 게시물을 가져온 후 용접, 알곤(TIG), CO2, 배관용접, 조선소, 플랜트 등 구직 관련 키워드를 기준으로 관련 게시물을 필터링합니다.
     게시물에 이미 포함되어 있는 근무 지역, 연락처, 급여 등의 정보를 추출하여 간단한 대시보드에서 확인할 수 있도록 제공합니다.
    </p>
    <p>
     본 애플리케이션은 자동으로 메시지를 발송하거나 게시물을 작성하거나 BAND 회원에게 자동으로 연락하지 않습니다.
     사용자가 지원을 선택하면 연락처와 지원 메시지를 SMS 작성 화면에 미리 입력해 주며, 최종 확인 및 발송은 사용자가 직접 수행합니다.
     목적은 사용자가 관련 구인 정보를 정리하고 필요한 채용 공고에 개별적으로 지원할 수 있도록 돕는 것입니다.
    </p>

    <div className="notice">
     <strong>Privacy & API Use / 개인정보 및 API 사용</strong>
     <p>
      The application uses only data made available through the authorized BAND API and is intended for personal job-search use.
      API credentials are stored server-side and are not exposed in the browser.
     </p>
     <p>
      본 애플리케이션은 승인된 BAND API를 통해 제공되는 정보만 사용하며 개인적인 구직 목적으로 사용됩니다.
      API 인증 정보는 서버 측에 안전하게 보관하며 브라우저에 노출하지 않습니다.
     </p>
    </div>
   </div>
  </section>
 </main>
}