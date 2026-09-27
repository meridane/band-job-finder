const rows=[
 {job:"용접사 구인",place:"울산",contact:"010-1234-5678",details:"알곤(TIG), CO2",pay:"160,000원",source:"BAND"},
 {job:"조선소 용접",place:"거제",contact:"010-2345-6789",details:"배관 / 알곤",pay:"170,000원",source:"BAND"},
 {job:"플랜트 배관용접",place:"부산",contact:"010-3456-7890",details:"TIG",pay:"협의",source:"BAND"}
];

export default function Home(){
 return <main className="shell">
  <header><div><span className="eyebrow">BAND JOB FINDER</span><h1>Offres détectées</h1><p>Les annonces correspondant à tes critères apparaîtront ici avec le numéro du responsable et le message de candidature à envoyer.</p></div><span className="status">SMS automatique désactivé</span></header>
  <section className="stats">
   <div><b>0</b><span>Nouvelles offres</span></div><div><b>0</b><span>À traiter</span></div><div><b>0</b><span>Candidatures préparées</span></div><div><b>7</b><span>Filtres actifs</span></div>
  </section>
  <section className="card">
   <div className="cardhead"><h2>Offres détectées</h2><span>Connexion BAND à configurer</span></div>
   <div className="table">
    <div className="row head"><span>Offre</span><span>Lieu</span><span>Responsable</span><span>Conditions</span><span>Salaire</span><span>Action</span></div>
    {rows.map((r,i)=><div className="row" key={i}><span className="job">{r.job}</span><span>{r.place}</span><span>{r.contact}</span><span>{r.details}</span><span>{r.pay}</span><button>Voir l'offre</button></div>)}
   </div>
  </section>
  <section className="card grid">
   <div><h2>Ce que l'application détecte</h2><p>용접사 · 알곤용접 · TIG · CO2용접 · 배관용접 · 조선소 · 플랜트 · 제관용접</p></div>
   <div><h2>Candidature</h2><p>Pour chaque offre, le dashboard affichera le numéro trouvé dans l'annonce, le contenu de l'offre et le message coréen à envoyer. Aucun SMS ne sera envoyé automatiquement.</p></div>
  </section>
 </main>
}