"use client";

import React from "react";
import Link from "next/link";

const contacts = [
  "010-8684-4541","010-5066-1667","010-3943-8889","010-5217-9487",
  "010-7484-4944","010-2114-2519","010-3637-4144","010-5012-6575",
  "010-5558-8253","010-3779-5854","010-2864-5200","010-2508-3141",
  "010-4444-9151","010-5574-9151","010-4882-3071","010-7196-1012",
  "010-8191-0775","010-8952-0028","010-6264-1884","010-9389-6438",
  "010-2410-0969","010-5208-6999","010-4390-0300","010-5646-1232",
  "010-2059-5061","010-6508-4441","010-4787-1402","010-5641-1810",
  "010-5950-3330","010-7511-2329","010-2248-9089","010-3814-7897"
];

const message = `안녕하세요.
저는 모로코 출신이고 37살입니다. 한국에 거주한 지 10년 정도 되어 한국어로 의사소통하는 데 문제가 없습니다.

현재 합법적인 비자를 가지고 있으며 정식 근로계약이 가능합니다.
CO₂ 및 아르곤(알곤) 용접 경력이 6년 정도 있습니다.

혹시 현재 용접공을 모집하고 계시다면 연락 부탁드립니다.
성실하게 오래 일할 수 있습니다.
감사합니다.`;

const STORAGE_KEY = "band-job-finder-sms-sent";

export default function ContactsPage() {
  const [sent, setSent] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setSent(saved);
    } catch {}
  }, []);

  function sendSms(phone: string) {
    const normalized = phone.replace(/[^0-9+]/g, "");
    const next = sent.includes(phone) ? sent : [...sent, phone];

    setSent(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    window.location.href = `sms:${normalized}?body=${encodeURIComponent(message)}`;
  }

  function resetSent() {
    setSent([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="shell">
      <header>
        <div>
          <span className="eyebrow">BAND JOB FINDER</span>
          <h1>Contacts soudeurs</h1>
          <p>Appuie sur <b>Envoyer SMS</b> pour ouvrir Messages avec ton texte déjà rempli.</p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={resetSent} style={{padding:"10px 14px",borderRadius:10,border:"1px solid #ddd",background:"#fff",fontWeight:700,cursor:"pointer"}}>
            Réinitialiser
          </button>
          <Link href="/" style={{textDecoration:"none",padding:"10px 14px",borderRadius:10,background:"#111",color:"#fff",fontWeight:700}}>
            ← Retour
          </Link>
        </div>
      </header>

      <section className="card">
        <div className="cardhead">
          <h2>{contacts.length} contacts</h2>
          <span>{sent.length} candidature(s) marquée(s) SENDED</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12,marginTop:18}}>
          {contacts.map((phone, index) => {
            const isSent = sent.includes(phone);

            return (
              <div key={phone} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,border:"1px solid #e6e8eb",borderRadius:14,background:"#fff",padding:"12px 14px"}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700}}>
                    <span style={{color:"#ff5722",marginRight:8}}>📱</span>{phone}
                  </div>
                  <small style={{display:"block",marginTop:5,color:"#667085"}}>
                    Contact {index + 1}
                  </small>
                </div>

                <button
                  onClick={() => sendSms(phone)}
                  style={{
                    minWidth:125,border:0,borderRadius:10,padding:"11px 12px",
                    background:isSent ? "#16a34a" : "#dc2626",
                    color:"#fff",fontWeight:800,cursor:"pointer"
                  }}
                >
                  {isSent ? "✓ SENDED" : "📤 Envoyer SMS"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>Message de candidature</h2>
        <pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",lineHeight:1.7,color:"#475467",background:"#f8fafc",padding:16,borderRadius:12}}>
          {message}
        </pre>
        <p style={{fontSize:13}}>
          Le clic ouvre l'application Messages avec le numéro et le texte préremplis. Le bouton devient vert <b>SENDED</b> et garde cet état même après ton retour sur la page.
        </p>
      </section>
    </main>
  );
}
