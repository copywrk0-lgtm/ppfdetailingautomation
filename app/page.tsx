 "use client";

import { useMemo, useState } from "react";

type Msg = { role: "user"|"assistant"; content: string };

const starter = "Hey! 👋 Thanks for reaching out to Premium Auto Detail. I can help you get the right PPF option. What vehicle are you looking to protect?";

function now(){ return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}); }

export default function Home(){
  const [messages,setMessages]=useState<Msg[]>([{role:"assistant",content:starter}]);
  const [input,setInput]=useState("");
  const [vehicle,setVehicle]=useState("BMW M3");
  const [condition,setCondition]=useState("Brand new");
  const [coverage,setCoverage]=useState("Full-body PPF");
  const [lead,setLead]=useState(false);
  const [loading,setLoading]=useState(false);
  const [provider,setProvider]=useState("Demo mode");

  const lastUser=useMemo(()=>[...messages].reverse().find(m=>m.role==="user")?.content||"",[messages]);

  async function send(text=input){
    const value=text.trim(); if(!value||loading)return;
    const next=[...messages,{role:"user" as const,content:value}];
    setMessages(next); setInput(""); setLoading(true);
    const lower=value.toLowerCase();
    if(lower.includes("bmw")||lower.includes("mercedes")||lower.includes("audi")||lower.includes("porsche")||lower.includes("toyota")||lower.includes("honda")||lower.includes("hyundai")||lower.includes("kia")||lower.includes("mahindra")||lower.includes("tata")||lower.includes("volkswagen")||lower.includes("skoda")||lower.includes("ford")||lower.includes("jeep")||lower.includes("mg")){
      setVehicle(value);
    }
    if(lower.includes("brand new")||lower.includes("new car"))setCondition("Brand new");
    if(lower.includes("already driven")||lower.includes("used"))setCondition("Already driven");
    if(lower.includes("full"))setCoverage("Full-body PPF");
    if(lower.includes("front")||lower.includes("high-impact"))setCoverage("Front / high-impact");
    if(/\+?\d[\d\s-]{8,}/.test(value)||lower.includes("my number")||lower.includes("phone")){
      setLead(true);
    }
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})});
      const data=await r.json();
      setProvider(data.provider||"Demo mode");
      setMessages(prev=>[...prev,{role:"assistant",content:data.answer}]);
    }catch{
      setMessages(prev=>[...prev,{role:"assistant",content:"Got it 👌 I’ve captured that. What’s the best name and WhatsApp number for the quote?"}]);
    }finally{setLoading(false);}
  }

  return <main className="page">
    <header className="top"><div className="brand">copywrk<span>.</span></div><div className="pill">LIVE PRODUCT DEMO · {provider}</div></header>
    <section className="hero">
      <div className="eyebrow">PPF LEAD CONVERSION SYSTEM</div>
      <h1>Turn “How much for PPF?” into a qualified lead.</h1>
      <p>Let the assistant handle the repetitive first conversation, qualify the customer and hand your team a structured enquiry — instantly.</p>
      <div className="chips"><span>Instant response</span><span>AI qualification</span><span>Lead capture</span><span>Follow-up ready</span></div>
    </section>
    <section className="grid">
      <div className="card chatCard">
        <div className="chatHead"><div className="avatar">P</div><div><b>Premium Auto Detail</b><small>● online · automated assistant</small></div><div className="verified">✓</div></div>
        <div className="chat" id="chat">
          {messages.map((m,i)=><div key={i} className={"msg "+(m.role==="user"?"user":"bot")}>{m.content}<small>{now()}</small></div>)}
          {loading&&<div className="typing"><i></i><i></i><i></i></div>}
        </div>
        <div className="quick">
          {["BMW M3","Brand new","Full-body PPF","Front / high-impact"].map(x=><button key={x} onClick={()=>send(x)}>{x}</button>)}
        </div>
        <div className="composer"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message…" /><button onClick={()=>send()}>Send ↗</button></div>
      </div>
      <aside className="card dashboard">
        <div className="eyebrow">BUSINESS VIEW</div>
        <div className="dashTitle"><div><h2>Qualified lead</h2><p>What the team sees after the conversation.</p></div><span className={lead?"hot":"pending"}>{lead?"HOT LEAD":"LIVE"}</span></div>
        <div className="score"><div><small>Lead score</small><strong>{lead?"92":"78"}/100</strong></div><div className="bar"><span style={{width:lead?"92%":"78%"}}/></div></div>
        <div className="rows">
          <div><span>Vehicle</span><b>{vehicle}</b></div>
          <div><span>Condition</span><b>{condition}</b></div>
          <div><span>Coverage</span><b>{coverage}</b></div>
          <div><span>Intent</span><b>{lead?"Ready for quote":"Enquiry"}</b></div>
        </div>
        <div className="timeline">
          <div className="done"><span>✓</span><div><b>Enquiry received</b><small>Customer started a conversation</small></div></div>
          <div className={lead?"done":"active"}><span>{lead?"✓":"2"}</span><div><b>Qualification</b><small>Vehicle + service details captured</small></div></div>
          <div className={lead?"done":"dim"}><span>{lead?"✓":"3"}</span><div><b>Team handoff</b><small>Ready for human follow-up</small></div></div>
          <div className="dim"><span>4</span><div><b>Automatic follow-up</b><small>Re-engage if the customer goes quiet</small></div></div>
        </div>
        <button className="cta" onClick={()=>alert("This is where the real deployment would connect the lead to the studio's WhatsApp + CRM workflow.")}>Connect this to my workflow →</button>
        <p className="fine">Demo interface · The real deployment can connect to WhatsApp, n8n and the studio's existing lead process.</p>
      </aside>
    </section>
    <section className="proof"><div><b>WITHOUT</b><span>“How much?” → wait → missed enquiry</span></div><div className="arrow">→</div><div><b>WITH COPYWRK</b><span>Instant reply → qualification → qualified lead</span></div></section>
  </main>
}