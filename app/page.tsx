"use client";

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
 return <main className="shell">
  <header><div><span className="eyebrow">BAND JOB FINDER</span><h1>Offres détectées</h1><p>Les annonces correspondant à tes critères apparaîtront ici avec le numéro du responsable et le message de candidature à envoyer.</p></div><span className="status">SMS automatique désactivé</span></header>
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
 </main>
}