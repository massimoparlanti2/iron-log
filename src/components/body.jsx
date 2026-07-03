// ── NUTR TREND CHART ──
function NutrChart({nutrEntries,C}){
  const [metric,setMetric]=useState("kcal");
  const days=[];for(let i=29;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(localISO(d));}
  const raw=days.map(date=>{const n=nutrEntries[date];return n?{date,v:metric==="kcal"?n.kcal:metric==="prot"?n.prot:metric==="carb"?n.carb:n.fat}:null;}).filter(Boolean);
  const metrics=[["kcal","🔥 Calorie","#f97316"],["prot","🥩 Proteine","#ef4444"],["carb","🍞 Carboidrati","#f59e0b"],["fat","🧈 Grassi","#3b82f6"]];
  const cur=metrics.find(m=>m[0]===metric);
  const col=cur[2];
  const unit=metric==="kcal"?"kcal":"g";
  if(raw.length<2)return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {metrics.map(([k,label,c])=><button key={k} onClick={()=>setMetric(k)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${metric===k?c:C.border2}`,background:metric===k?c+"22":"transparent",color:metric===k?c:C.text3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:metric===k?700:400}}>{label}</button>)}
      </div>
      <p style={{fontSize:9,color:C.text3,textAlign:"center",padding:"10px 0"}}>Inserisci almeno 2 giorni di dati per vedere il trend</p>
    </div>
  );
  const W=300,H=80,PX=30,PY=8;
  const vals=raw.map(d=>d.v),maxV=Math.max(...vals),minV=Math.min(...vals),span=maxV-minV||1;
  const pts=raw.map((d,i)=>({x:PX+(i/(raw.length-1))*(W-PX*2),y:H-PY-((d.v-minV)/span)*(H-PY*2),...d}));
  const lD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const aD=`M${pts[0].x},${H-PY} ${lD.slice(1)} L${pts[pts.length-1].x},${H-PY} Z`;
  const gid=`ng_${metric}`;
  const avg=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
  const last=raw[raw.length-1];
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {metrics.map(([k,label,c])=><button key={k} onClick={()=>setMetric(k)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${metric===k?c:C.border2}`,background:metric===k?c+"22":"transparent",color:metric===k?c:C.text3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:metric===k?700:400}}>{label}</button>)}
      </div>
      <div style={{display:"flex",gap:12,marginBottom:8}}>
        <div><p style={{margin:0,fontSize:7,color:C.text3}}>ULTIMO</p><p style={{margin:0,fontSize:15,fontWeight:900,color:col}}>{last.v}{unit}</p></div>
        <div><p style={{margin:0,fontSize:7,color:C.text3}}>MEDIA 30gg</p><p style={{margin:0,fontSize:15,fontWeight:900,color:C.text}}>{avg}{unit}</p></div>
        <div><p style={{margin:0,fontSize:7,color:C.text3}}>MAX</p><p style={{margin:0,fontSize:15,fontWeight:900,color:C.text2}}>{maxV}{unit}</p></div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} style={{display:"block",overflow:"visible"}}>
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity="0.25"/><stop offset="100%" stopColor={col} stopOpacity="0"/></linearGradient></defs>
        <path d={aD} fill={`url(#${gid})`}/>
        <path d={lD} fill="none" stroke={col} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
        {pts.filter((_,i)=>i===0||i===pts.length-1||i===Math.floor(pts.length/2)).map((p,i)=>(
          <g key={i}><circle cx={p.x} cy={p.y} r={3.5} fill={col} stroke={C.bg2} strokeWidth={1.5}/><text x={p.x} y={H+16} fill={C.text3} fontSize={7} textAnchor="middle">{p.date.slice(5)}</text></g>
        ))}
        <text x={2} y={PY+4} fill={C.text3} fontSize={7}>{maxV}{unit}</text>
        <text x={2} y={H-PY+5} fill={C.text3} fontSize={7}>{minV}{unit}</text>
      </svg>
    </div>
  );
}

// ── BODY TREND CHART ──
function BodyChart({bwEntries,C}){
  const [metric,setMetric]=useState("peso");
  const metrics=[["peso","⚖ Peso","#3b82f6"],["bmi","📊 BMI","#8b5cf6"],["fat","🔥 Body Fat","#f97316"],["lean","💪 Massa Magra","#10b981"]];
  const cur=metrics.find(m=>m[0]===metric);
  const col=cur[2];
  const raw=bwEntries.map(e=>{
    const v=metric==="peso"?e.w:metric==="bmi"?e.bmi:metric==="fat"?e.fat:e.lean;
    return v!=null&&v>0?{date:e.date,v}:null;
  }).filter(Boolean);
  const unit=metric==="peso"?"kg":metric==="bmi"?"":metric==="fat"?"%":"kg";
  if(raw.length<2)return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {metrics.map(([k,label,c])=><button key={k} onClick={()=>setMetric(k)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${metric===k?c:C.border2}`,background:metric===k?c+"22":"transparent",color:metric===k?c:C.text3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:metric===k?700:400}}>{label}</button>)}
      </div>
      <p style={{fontSize:9,color:C.text3,textAlign:"center",padding:"10px 0"}}>Inserisci almeno 2 rilevazioni per vedere il trend</p>
    </div>
  );
  const W=300,H=80,PX=32,PY=8;
  const vals=raw.map(d=>d.v),maxV=Math.max(...vals),minV=Math.min(...vals),span=maxV-minV||0.1;
  const pts=raw.map((d,i)=>({x:PX+(i/(raw.length-1))*(W-PX*2),y:H-PY-((d.v-minV)/span)*(H-PY*2),...d}));
  const lD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const aD=`M${pts[0].x},${H-PY} ${lD.slice(1)} L${pts[pts.length-1].x},${H-PY} Z`;
  const gid=`bg_${metric}`;
  const first=raw[0],last=raw[raw.length-1];
  const delta=Math.round((last.v-first.v)*10)/10;
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {metrics.map(([k,label,c])=><button key={k} onClick={()=>setMetric(k)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${metric===k?c:C.border2}`,background:metric===k?c+"22":"transparent",color:metric===k?c:C.text3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:metric===k?700:400}}>{label}</button>)}
      </div>
      <div style={{display:"flex",gap:12,marginBottom:8}}>
        <div><p style={{margin:0,fontSize:7,color:C.text3}}>ATTUALE</p><p style={{margin:0,fontSize:15,fontWeight:900,color:col}}>{last.v}{unit}</p></div>
        <div><p style={{margin:0,fontSize:7,color:C.text3}}>INIZIO</p><p style={{margin:0,fontSize:15,fontWeight:900,color:C.text2}}>{first.v}{unit}</p></div>
        <div><p style={{margin:0,fontSize:7,color:C.text3}}>DELTA</p><p style={{margin:0,fontSize:15,fontWeight:900,color:delta<=0?"#10b981":"#ef4444"}}>{delta>0?"+":""}{delta}{unit}</p></div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} style={{display:"block",overflow:"visible"}}>
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity="0.25"/><stop offset="100%" stopColor={col} stopOpacity="0"/></linearGradient></defs>
        <path d={aD} fill={`url(#${gid})`}/>
        <path d={lD} fill="none" stroke={col} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
        {pts.filter((_,i)=>i===0||i===pts.length-1||i===Math.floor(pts.length/2)).map((p,i)=>(
          <g key={i}><circle cx={p.x} cy={p.y} r={3.5} fill={col} stroke={C.bg2} strokeWidth={1.5}/><text x={p.x} y={H+16} fill={C.text3} fontSize={7} textAnchor="middle">{p.date.slice(5)}</text></g>
        ))}
        <text x={0} y={PY+4} fill={C.text3} fontSize={7}>{maxV}{unit}</text>
        <text x={0} y={H-PY+5} fill={C.text3} fontSize={7}>{minV}{unit}</text>
      </svg>
    </div>
  );
}

// ── SURPLUS/DEFICIT CHART ──
function SurplusChart({nutrEntries,tdeeEntries,C}){
  // Build last 14 days of data
  const days=[];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(localISO(d));}
  const data=days.map(date=>{
    const kcalIn=nutrEntries[date]?.kcal||null;
    const kcalOut=tdeeEntries[date]||null;
    const balance=(kcalIn!=null&&kcalOut!=null)?kcalIn-kcalOut:null;
    return{date,kcalIn,kcalOut,balance};
  }).filter(d=>d.balance!=null);
  if(data.length<1)return(
    <div style={{textAlign:"center",padding:"18px 0"}}>
      <p style={{fontSize:10,color:C.text3,margin:0}}>Inserisci calorie introdotte (Nutrizione) e calorie bruciate per vedere il grafico</p>
    </div>
  );
  const W=320,H=90,PX=8,PY=10;
  const maxAbs=Math.max(...data.map(d=>Math.abs(d.balance)),1);
  const midY=H/2;
  const barW=Math.max(2,Math.floor((W-PX*2)/data.length)-2);
  return(
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+24}`} style={{display:"block",overflow:"visible"}}>
        {/* zero line */}
        <line x1={PX} y1={midY} x2={W-PX} y2={midY} stroke={C.border2} strokeWidth={1} strokeDasharray="4 3"/>
        <text x={2} y={midY-3} fill={C.text3} fontSize={7}>0</text>
        {data.map((d,i)=>{
          const x=PX+i*((W-PX*2)/data.length)+(((W-PX*2)/data.length)-barW)/2;
          const barH=Math.max(2,(Math.abs(d.balance)/maxAbs)*(midY-PY));
          const surplus=d.balance>0;
          const barY=surplus?midY-barH:midY;
          const col=surplus?"#10b981":"#ef4444";
          const isToday=d.date===todayISO();
          return(
            <g key={d.date}>
              <rect x={x} y={barY} width={barW} height={barH} fill={col} opacity={isToday?1:0.65} rx={2}/>
              {isToday&&<rect x={x-1} y={barY-1} width={barW+2} height={barH+2} fill="none" stroke={col} strokeWidth={1.5} rx={2}/>}
              {(i===0||i===data.length-1||isToday)&&(
                <text x={x+barW/2} y={H+18} fill={isToday?C.text:C.text3} fontSize={7} textAnchor="middle">{d.date.slice(5)}</text>
              )}
              {isToday&&(
                <text x={x+barW/2} y={surplus?barY-3:barY+barH+9} fill={col} fontSize={8} fontWeight="bold" textAnchor="middle">
                  {d.balance>0?"+":""}{d.balance}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{display:"flex",gap:14,marginTop:4}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,background:"#10b981",borderRadius:2}}/><span style={{fontSize:8,color:C.text3}}>SURPLUS</span></div>
        <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,background:"#ef4444",borderRadius:2}}/><span style={{fontSize:8,color:C.text3}}>DEFICIT</span></div>
        {data.length>0&&(()=>{const avg=Math.round(data.reduce((s,d)=>s+d.balance,0)/data.length);return<span style={{fontSize:8,color:avg>=0?"#10b981":"#ef4444",marginLeft:"auto",fontWeight:700}}>Media: {avg>=0?"+":""}{avg} kcal/g</span>;})()}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════
// ── SCHERMATA FISICO ──
// ══════════════════════════════════════════════

// ── Daily Calorie Ring ──
function CalRing({kcalIn,kcalOut,C}){
  const pct=kcalOut>0?Math.min(kcalIn/kcalOut,1.3):0;
  const r=44,circ=2*Math.PI*r;
  const over=pct>1;
  const col=over?"#f59e0b":kcalIn>0?"#10b981":"#444";
  const bal=kcalIn-kcalOut;
  return(
    <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
      <svg width={100} height={100} style={{transform:"rotate(-90deg)"}}>
        <circle cx={50} cy={50} r={r} fill="none" stroke={C.bg4} strokeWidth={8}/>
        <circle cx={50} cy={50} r={r} fill="none" stroke={col} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={circ*(1-Math.min(pct,1))}
          strokeLinecap="round" style={{transition:"stroke-dashoffset 0.8s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {kcalIn>0&&kcalOut>0?(
          <>
            <span style={{fontSize:10,fontWeight:900,color:over?"#f59e0b":bal<0?"#10b981":"#ef4444",lineHeight:1}}>{bal>0?"+":""}{bal}</span>
            <span style={{fontSize:7,color:C.text3,letterSpacing:1}}>{over?"SURPLUS":"DEFICIT"}</span>
          </>
        ):<span style={{fontSize:8,color:C.text4}}>—</span>}
      </div>
    </div>
  );
}

// ── Macro Bar ──
function MacroBar({prot,carb,fat,kcal,bwKg,C}){
  if(!kcal)return null;
  const protCal=prot*4,carbCal=carb*4,fatCal=fat*9;
  const protPct=Math.round(protCal/kcal*100)||0;
  const carbPct=Math.round(carbCal/kcal*100)||0;
  const fatPct=Math.round(fatCal/kcal*100)||0;
  const protTarget=bwKg?Math.round(bwKg*1.8):140;
  const protOk=prot>=protTarget*0.9;
  return(
    <div>
      <div style={{height:10,borderRadius:5,background:C.bg4,overflow:"hidden",display:"flex",marginBottom:8}}>
        <div style={{height:"100%",width:`${protPct}%`,background:"#ef4444",transition:"width 0.5s"}}/>
        <div style={{height:"100%",width:`${carbPct}%`,background:"#f59e0b",transition:"width 0.5s"}}/>
        <div style={{height:"100%",width:`${fatPct}%`,background:"#3b82f6",transition:"width 0.5s"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
        {[["🥩 Prot",prot+"g",`${protPct}%`,"#ef4444",!protOk],
          ["🍞 Carb",carb+"g",`${carbPct}%`,"#f59e0b",false],
          ["🧈 Grassi",fat+"g",`${fatPct}%`,"#3b82f6",false]].map(([l,v,p,col,warn])=>(
          <div key={l} style={{background:col+"14",borderRadius:8,padding:"6px 8px",border:warn?`1px solid ${col}55`:"none"}}>
            <p style={{margin:0,fontSize:8,color:col,letterSpacing:0}}>{l}{warn?" ⚠":""}</p>
            <p style={{margin:0,fontSize:14,fontWeight:900,color:col,lineHeight:1.2}}>{v}</p>
            <p style={{margin:0,fontSize:8,color:col,opacity:0.7}}>{p}</p>
          </div>
        ))}
      </div>
      {bwKg&&!protOk&&(
        <p style={{margin:"6px 0 0",fontSize:9,color:"#f59e0b",lineHeight:1.4}}>
          ⚠ Proteine basse: {prot}g su {protTarget}g target ({bwKg}kg × 1.8). Aggiungi ~{protTarget-prot}g.
        </p>
      )}
    </div>
  );
}

// ── Activity Burn Summary ──
function ActivityBurnRow({acts,gymKcal,tdeeManual,C}){
  const actKcal=acts.reduce((t,a)=>t+(a.kcal||0),0);
  const actMin=acts.reduce((t,a)=>t+(a.min||0),0);
  const total=tdeeManual||(actKcal+(gymKcal||0));
  return(
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {gymKcal>0&&<span style={{fontSize:10,background:"#ef444420",color:"#ef4444",borderRadius:6,padding:"3px 8px"}}>🏋 {gymKcal} kcal</span>}
      {acts.map((a,i)=><span key={i} style={{fontSize:10,background:"#10b98120",color:"#10b981",borderRadius:6,padding:"3px 8px"}}>{ACT_ICONS[a.type]||"🏅"} {a.type} {a.kcal>0?a.kcal+"kcal":""} {a.min>0?a.min+"min":""}</span>)}
      {tdeeManual&&<span style={{fontSize:10,background:"#3b82f620",color:"#3b82f6",borderRadius:6,padding:"3px 8px"}}>📱 TDEE manuale</span>}
      {total>0&&<span style={{fontSize:10,fontWeight:700,color:C.text2,marginLeft:"auto"}}>Tot: {total} kcal</span>}
    </div>
  );
}

// ── 14-day calorie timeline ──
function CalTimeline({nutrEntries,tdeeEntries,actEntries,sessions,C}){
  const days=[];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(localISO(d));}
  const data=days.map(date=>{
    const n=nutrEntries[date];
    const acts=actEntries[date]||[];
    const gym=sessions.filter(s=>s.date===date).reduce((t,s)=>t+(s.kcal||0),0);
    const actBurn=acts.reduce((t,a)=>t+(a.kcal||0),0);
    const kcalOut=tdeeEntries[date]||(gym+actBurn)||null;
    const kcalIn=n?.kcal||null;
    const bal=kcalIn&&kcalOut?kcalIn-kcalOut:null;
    return{date,kcalIn,kcalOut,bal,prot:n?.prot||0,hasGym:sessions.some(s=>s.date===date),hasAct:acts.length>0};
  });
  const hasAny=data.some(d=>d.kcalIn||d.kcalOut);
  if(!hasAny)return<p style={{fontSize:9,color:C.text4,textAlign:"center",padding:"16px 0"}}>Nessun dato ancora</p>;
  const maxKcal=Math.max(...data.map(d=>Math.max(d.kcalIn||0,d.kcalOut||0)),1);
  const W=320,H=80,PX=4;
  const bw=(W-PX*2)/14-2;
  const dl=["L","M","M","G","V","S","D"];
  return(
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+28}`} style={{display:"block",overflow:"visible"}}>
        {data.map((d,i)=>{
          const x=PX+i*((W-PX*2)/14)+(((W-PX*2)/14)-bw)/2;
          const hIn=d.kcalIn?(d.kcalIn/maxKcal)*(H-4):0;
          const hOut=d.kcalOut?(d.kcalOut/maxKcal)*(H-4):0;
          const surplus=d.bal!=null&&d.bal>0;
          const deficit=d.bal!=null&&d.bal<=0;
          const isToday=d.date===days[13];
          return(
            <g key={d.date}>
              {/* out bar (background) */}
              {hOut>0&&<rect x={x} y={H-hOut} width={bw} height={hOut} fill={C.bg4} rx={2}/>}
              {/* in bar (foreground) */}
              {hIn>0&&<rect x={x} y={H-hIn} width={bw} height={hIn} fill={surplus?"#f59e0b":deficit?"#10b981":"#ef4444"} opacity={isToday?1:0.7} rx={2}/>}
              {/* activity dot */}
              {(d.hasGym||d.hasAct)&&<circle cx={x+bw/2} cy={H+5} r={2.5} fill={d.hasGym?"#ef4444":"#10b981"}/>}
              {/* day label */}
              <text x={x+bw/2} y={H+18} fill={isToday?"#ef4444":C.text3} fontSize={7} textAnchor="middle" fontWeight={isToday?700:400}>
                {isToday?"●":dl[new Date(d.date).getDay()]}
              </text>
              {/* date label every 7 */}
              {(i===0||i===6||i===13)&&<text x={x+bw/2} y={H+27} fill={C.text4} fontSize={6} textAnchor="middle">{d.date.slice(5)}</text>}
            </g>
          );
        })}
      </svg>
      <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:4}}>
        {[["#f59e0b","Surplus"],["#10b981","Deficit"],["#ef4444","Mangiato (no out)"],["#ef4444","Allenamento","circle"],["#10b981","Attività","circle"]].slice(0,4).map(([col,lbl])=>(
          <div key={lbl} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:8,height:8,borderRadius:2,background:col}}/>
            <span style={{fontSize:7,color:C.text3}}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Protein 7-day streak ──
function ProtStreak({nutrEntries,bwKg,C}){
  const target=bwKg?Math.round(bwKg*1.8):140;
  const days=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(localISO(d));}
  const streak=days.map(date=>{
    const n=nutrEntries[date];
    const ok=n&&n.prot>=target*0.9;
    return{date,prot:n?.prot||0,ok,dl:["D","L","M","M","G","V","S"][new Date(date).getDay()]};
  });
  const cnt=streak.filter(d=>d.ok).length;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1}}>
        <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:C.text3}}>PROTEINE — ULTIMI 7 GIORNI (target {target}g)</p>
        <div style={{display:"flex",gap:4}}>
          {streak.map(d=>(
            <div key={d.date} style={{flex:1,textAlign:"center"}}>
              <div style={{width:"100%",paddingBottom:"100%",position:"relative",marginBottom:3}}>
                <div style={{position:"absolute",inset:0,borderRadius:6,background:d.ok?"#10b981":d.prot>0?"#ef444440":C.bg4,border:d.ok?"none":`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {d.prot>0&&<span style={{fontSize:8,fontWeight:700,color:d.ok?"#fff":"#ef4444"}}>{d.prot}</span>}
                </div>
              </div>
              <span style={{fontSize:7,color:C.text4}}>{d.dl}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{textAlign:"center",flexShrink:0}}>
        <p style={{margin:0,fontSize:22,fontWeight:900,color:cnt>=5?"#10b981":cnt>=3?"#f59e0b":"#ef4444"}}>{cnt}/7</p>
        <p style={{margin:0,fontSize:7,color:C.text3}}>giorni OK</p>
      </div>
    </div>
  );
}

// ── BW GOAL CARD ──
// ══════════════════════════════════════════════
// ── KCAL GOAL PANEL ──
// ══════════════════════════════════════════════
function KcalGoalPanel({nutrEntries,tdeeEntries,actEntries,sessions,bwEntries,C,S}){
  const [goal,setGoalState]=useState(()=>db(KCAL_GOAL_KEY)||{mode:"deficit",pct:20,kcalOverride:null});
  const [editing,setEditing]=useState(false);
  const [editMode,setEditMode]=useState(goal.mode||"deficit");
  const [editPct,setEditPct]=useState(goal.pct||20);
  const [editOverride,setEditOverride]=useState(goal.kcalOverride||"");

  const saveGoal=()=>{
    const g={mode:editMode,pct:parseInt(editPct)||20,kcalOverride:editOverride?parseInt(editOverride):null};
    db(KCAL_GOAL_KEY,g);setGoalState(g);setEditing(false);
  };

  // Calcola TDEE medio degli ultimi 7 giorni disponibili
  const today=todayISO();
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return localISO(d);});
  const tdeeValues=last7.map(d=>{
    if(tdeeEntries[d]) return tdeeEntries[d];
    const acts=actEntries[d]||[];
    const gym=(sessions||[]).filter(s=>s.date===d).reduce((t,s)=>t+(s.kcal||0),0);
    const act=acts.reduce((t,a)=>t+(a.kcal||0),0);
    return gym+act>0?gym+act:null;
  }).filter(Boolean);
  const avgTdee=tdeeValues.length?Math.round(tdeeValues.reduce((a,b)=>a+b,0)/tdeeValues.length):null;

  // BMR per safety floor
  const lastBw=bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const heightCm=parseInt(db("il_height"))||175;
  const bmrVal=lastBw?calcBMR(lastBw.w,heightCm,30,true):null;

  const tdeeForCalc=avgTdee||(bmrVal?Math.round(bmrVal*1.5):null);
  const kcalTarget=getKcalTarget(goal,tdeeForCalc,bmrVal);

  // Dati settimanali
  const weekData=last7.reverse().map(d=>{
    const n=nutrEntries[d];
    const kcalIn=n?.kcal||null;
    const acts=actEntries[d]||[];
    const gym=(sessions||[]).filter(s=>s.date===d).reduce((t,s)=>t+(s.kcal||0),0);
    const act=acts.reduce((t,a)=>t+(a.kcal||0),0);
    const tdeeManual=tdeeEntries[d]||null;
    const kcalOut=tdeeManual||(avgTdee||(gym+act||null));
    const bal=kcalIn&&kcalOut?kcalIn-kcalOut:null;
    const vsTarget=kcalIn&&kcalTarget?kcalIn-kcalTarget:null;
    return{d,kcalIn,kcalOut,bal,vsTarget,isToday:d===today};
  });
  const daysLogged=weekData.filter(x=>x.kcalIn).length;
  const weekDeficit=weekData.reduce((t,x)=>t+(x.vsTarget||0),0);
  const weekDeficitKg=kcalToKg(Math.abs(weekDeficit));
  const todayData=weekData[weekData.length-1];
  const todayRemaining=kcalTarget&&todayData.kcalIn!=null?kcalTarget-todayData.kcalIn:null;
  const belowBMR=todayData.kcalIn&&bmrVal&&todayData.kcalIn<bmrVal;

  // Proiezione peso dal deficit medio
  const avgDailyDelta=daysLogged?weekData.filter(x=>x.vsTarget!=null).reduce((t,x)=>t+(x.vsTarget||0),0)/daysLogged:null;
  const projKgPerWeek=avgDailyDelta?kcalToKg(avgDailyDelta*7):null;

  const modeColors={deficit:"#10b981",surplus:"#f59e0b",maintain:"#3b82f6"};
  const modeLabels={deficit:"DEFICIT",surplus:"SURPLUS",maintain:"MANTENIMENTO"};
  const modeIcons={deficit:"📉",surplus:"📈",maintain:"⚖️"};
  const col=modeColors[goal.mode]||"#3b82f6";

  return(
    <div style={{...S.card,borderLeft:`3px solid ${col}`}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{modeIcons[goal.mode]||"⚖️"}</span>
          <div>
            <p style={{margin:0,fontSize:9,letterSpacing:2,color:col}}>{modeLabels[goal.mode]||"OBIETTIVO"} CALORICO</p>
            {kcalTarget&&<p style={{margin:0,fontSize:13,fontWeight:900,color:C.text}}>{kcalTarget} kcal/giorno</p>}
          </div>
        </div>
        <button onClick={()=>{setEditing(v=>!v);setEditMode(goal.mode);setEditPct(goal.pct);setEditOverride(goal.kcalOverride||"");}}
          style={{background:"none",border:"none",color:C.text3,cursor:"pointer",fontSize:12,padding:"0 4px"}}>✏</button>
      </div>

      {/* Form modifica */}
      {editing&&(
        <div style={{background:C.bg3,borderRadius:10,padding:"12px",marginBottom:12}}>
          <p style={{margin:"0 0 10px",fontSize:8,letterSpacing:2,color:C.text3}}>CONFIGURA OBIETTIVO</p>
          {/* Modalità */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
            {[["deficit","📉 Deficit","Perdi peso"],["maintain","⚖️ Mantieni","Ricomposizione"],["surplus","📈 Surplus","Metti massa"]].map(([m,label,sub])=>(
              <button key={m} onClick={()=>setEditMode(m)} style={{padding:"10px 6px",borderRadius:8,border:`2px solid ${editMode===m?modeColors[m]:C.border2}`,background:editMode===m?modeColors[m]+"22":"transparent",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                <p style={{margin:"0 0 2px",fontSize:12,color:editMode===m?modeColors[m]:C.text3}}>{label}</p>
                <p style={{margin:0,fontSize:8,color:C.text4}}>{sub}</p>
              </button>
            ))}
          </div>
          {/* % deficit/surplus */}
          {editMode!=="maintain"&&(
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>{editMode==="deficit"?"% deficit sul TDEE":"% surplus sul TDEE"}</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                {(editMode==="deficit"?[10,15,20,25,30]:[5,10,15,20]).map(p=>(
                  <button key={p} onClick={()=>setEditPct(p)} style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${editPct===p?col:C.border2}`,background:editPct===p?col+"22":"transparent",color:editPct===p?col:C.text3,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:editPct===p?700:400}}>
                    {p}%
                  </button>
                ))}
              </div>
              {tdeeForCalc&&<p style={{margin:0,fontSize:9,color:C.text3}}>
                TDEE stimato: {tdeeForCalc} kcal → target: <strong style={{color:col}}>{getKcalTarget({mode:editMode,pct:editPct},tdeeForCalc,bmrVal)} kcal</strong>
                {editMode==="deficit"&&<span style={{color:"#f59e0b"}}> ({kcalToKg((tdeeForCalc-getKcalTarget({mode:editMode,pct:editPct},tdeeForCalc,bmrVal))*7)}kg/sett stimati)</span>}
              </p>}
            </div>
          )}
          {/* Override manuale */}
          <div style={{marginBottom:10}}>
            <label style={S.lbl}>Oppure imposta valore fisso (kcal) — sovrascrive il calcolo</label>
            <input type="number" inputMode="numeric" style={S.inp} placeholder={tdeeForCalc?`es. ${getKcalTarget({mode:editMode,pct:editPct},tdeeForCalc,bmrVal)||2000}`:"es. 1800"} value={editOverride} onChange={e=>setEditOverride(e.target.value)}/>
            {editOverride&&bmrVal&&parseInt(editOverride)<bmrVal&&<p style={{margin:"4px 0 0",fontSize:9,color:"#ef4444"}}>⚠ Sotto il BMR ({bmrVal} kcal) — non raccomandato senza supervisione medica.</p>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.btn("red"),flex:1,padding:11}} onClick={saveGoal}>💾 SALVA</button>
            <button style={{...S.btn("ghost"),padding:11}} onClick={()=>setEditing(false)}>Annulla</button>
          </div>
        </div>
      )}

      {/* Oggi */}
      {kcalTarget&&!editing&&(
        <>
          {/* Kcal rimanenti oggi */}
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:9,color:C.text3}}>Oggi — {todayData.kcalIn||0} / {kcalTarget} kcal</span>
              <span style={{fontSize:11,fontWeight:700,color:todayRemaining>=0?col:"#ef4444"}}>
                {todayRemaining!=null?(todayRemaining>=0?`${todayRemaining} rimanenti`:`+${Math.abs(todayRemaining)} oltre target`):"—"}
              </span>
            </div>
            <div style={{height:8,borderRadius:4,background:C.bg4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min((todayData.kcalIn||0)/kcalTarget*100,100)}%`,
                background:todayData.kcalIn>kcalTarget?"#ef4444":col,borderRadius:4,transition:"width 0.5s"}}/>
            </div>
            {/* Avviso sotto BMR */}
            {belowBMR&&<div style={{marginTop:6,background:"#ef444418",borderRadius:6,padding:"5px 10px",display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11}}>⚠️</span>
              <p style={{margin:0,fontSize:9,color:"#ef4444"}}>Stai mangiando sotto il tuo BMR ({bmrVal} kcal) — rischio perdita di massa muscolare.</p>
            </div>}
          </div>

          {/* Settimana: barre giornaliere */}
          <div style={{marginBottom:10}}>
            <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:C.text3}}>QUESTA SETTIMANA ({daysLogged}/7 giorni registrati)</p>
            <div style={{display:"flex",gap:3,alignItems:"flex-end"}}>
              {weekData.map(({d,kcalIn,vsTarget,isToday})=>{
                const pct=kcalIn&&kcalTarget?Math.min(kcalIn/kcalTarget,1.3):0;
                const over=kcalIn>kcalTarget;
                const barH=Math.max(pct*52,2);
                const barCol=!kcalIn?C.bg4:over?"#ef4444":col;
                const dl=["L","M","M","G","V","S","D"][(new Date(d).getDay()+6)%7];
                return(
                  <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    {kcalIn&&<span style={{fontSize:7,color:over?"#ef4444":C.text4}}>{kcalIn>999?`${(kcalIn/1000).toFixed(1)}k`:kcalIn}</span>}
                    <div style={{width:"100%",height:52,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                      <div style={{width:"100%",height:barH,background:barCol,borderRadius:3,opacity:isToday?1:0.75}}/>
                    </div>
                    {/* linea target */}
                    <span style={{fontSize:7,color:isToday?"#ef4444":C.text4,fontWeight:isToday?700:400}}>{dl}</span>
                  </div>
                );
              })}
            </div>
            {/* linea target visiva */}
            <div style={{position:"relative",height:1,background:col+"60",marginTop:-56,marginBottom:56,pointerEvents:"none"}}>
              <span style={{position:"absolute",right:0,top:-8,fontSize:7,color:col}}>target</span>
            </div>
          </div>

          {/* Deficit/surplus accumulato settimana */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div style={{background:C.bg3,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <p style={{margin:"0 0 2px",fontSize:7,color:C.text3,letterSpacing:1}}>ACCUMULATO 7GG</p>
              <p style={{margin:0,fontSize:14,fontWeight:900,color:weekDeficit<=0?col:"#ef4444"}}>{weekDeficit>0?"+":""}{weekDeficit}</p>
              <p style={{margin:0,fontSize:7,color:C.text4}}>kcal vs target</p>
            </div>
            <div style={{background:C.bg3,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <p style={{margin:"0 0 2px",fontSize:7,color:C.text3,letterSpacing:1}}>EQUIVALE A</p>
              <p style={{margin:0,fontSize:14,fontWeight:900,color:weekDeficit<=0?col:"#ef4444"}}>{weekDeficit<=0?"-":"+"}~{weekDeficitKg}kg</p>
              <p style={{margin:0,fontSize:7,color:C.text4}}>grasso stimato</p>
            </div>
            <div style={{background:C.bg3,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
              <p style={{margin:"0 0 2px",fontSize:7,color:C.text3,letterSpacing:1}}>PROIEZIONE</p>
              <p style={{margin:0,fontSize:14,fontWeight:900,color:projKgPerWeek&&projKgPerWeek<0?col:"#ef4444"}}>
                {projKgPerWeek!=null?(projKgPerWeek<0?`${projKgPerWeek}`:projKgPerWeek>0?`+${projKgPerWeek}`:"0"):"—"}
              </p>
              <p style={{margin:0,fontSize:7,color:C.text4}}>kg/settimana</p>
            </div>
          </div>

          {/* TDEE info */}
          {tdeeForCalc&&<p style={{margin:0,fontSize:8,color:C.text4}}>
            TDEE base: {tdeeForCalc} kcal
            {avgTdee?` (media ${tdeeValues.length} giorni)`:` (stima da BMR)`}
            {goal.kcalOverride?" · target fisso impostato manualmente":""}
          </p>}
        </>
      )}

      {!kcalTarget&&!editing&&(
        <p style={{fontSize:10,color:C.text3}}>
          {tdeeForCalc?`TDEE stimato: ${tdeeForCalc} kcal — configura un obiettivo con ✏`:"Inserisci il TDEE manuale o registra allenamenti per stimare il TDEE."}
        </p>
      )}
    </div>
  );
}

function BwGoalCard({bwEntries,lastBw,C,S}){
  const [bwGoal,setBwGoalState]=useState(()=>db(BW_GOAL_KEY)||"");
  const [editGoal,setEditGoal]=useState(false);
  const [goalInput,setGoalInput]=useState(()=>db(BW_GOAL_KEY)||"");
  const [window,setWindow]=useState(30); // giorni per la regressione
  const saveGoal=()=>{db(BW_GOAL_KEY,goalInput);setBwGoalState(goalInput);setEditGoal(false);};

  const goalKg=parseFloat(bwGoal)||0;
  const diffKg=lastBw&&goalKg?Math.round((goalKg-lastBw.w)*10)/10:null;
  const goalOk=diffKg!==null&&Math.abs(diffKg)<0.3;

  // Regressione lineare su date reali (giorni dall'epoca)
  const projection=(()=>{
    if(bwEntries.length<3||!bwGoal)return null;
    const target=parseFloat(bwGoal);
    const now=new Date();
    // Filtra per finestra temporale selezionata
    const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-window);
    const pts=bwEntries
      .filter(e=>new Date(e.date)>=cutoff)
      .map(e=>({x:Math.round((new Date(e.date)-new Date(bwEntries[0].date))/86400000),y:e.w,date:e.date}));
    if(pts.length<2)return{err:"Pochi dati nel periodo selezionato"};
    // Regressione lineare OLS
    const n=pts.length;
    const sumX=pts.reduce((t,p)=>t+p.x,0);
    const sumY=pts.reduce((t,p)=>t+p.y,0);
    const sumXY=pts.reduce((t,p)=>t+p.x*p.y,0);
    const sumX2=pts.reduce((t,p)=>t+p.x*p.x,0);
    const denom=n*sumX2-sumX*sumX;
    if(!denom)return{err:"Dati insufficienti"};
    const slope=(n*sumXY-sumX*sumY)/denom; // kg/giorno
    const intercept=(sumY-slope*sumX)/n;
    // R² per valutare affidabilità
    const yMean=sumY/n;
    const ssTot=pts.reduce((t,p)=>t+(p.y-yMean)**2,0);
    const ssRes=pts.reduce((t,p)=>t+(p.y-(slope*p.x+intercept))**2,0);
    const r2=ssTot>0?Math.round((1-ssRes/ssTot)*100):0;
    const current=lastBw.w;
    const todayX=Math.round((now-new Date(bwEntries[0].date))/86400000);
    const diff=target-current;
    if(Math.abs(slope)<0.0001)return{slope:0,weeklyRate:0,current,target,diff,r2,pts,intercept,todayX,err:null};
    const daysNeeded=Math.round(diff/slope);
    const weeklyRate=Math.round(slope*7*100)/100;
    const eta=new Date(now);eta.setDate(eta.getDate()+daysNeeded);
    const etaStr=daysNeeded>0&&daysNeeded<730?eta.toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"numeric"}):null;
    return{slope,weeklyRate,current,target,diff,daysNeeded,etaStr,r2,pts,intercept,todayX,err:null};
  })();

  // Mini grafico SVG con trend line e proiezione
  const Chart=(()=>{
    if(!projection||projection.err||!projection.pts||projection.pts.length<2)return null;
    const {pts,slope,intercept,todayX,target}=projection;
    const W=280,H=70,PX=32,PY=8;
    // estendi fino alla data target per il grafico
    const daysNeeded=projection.daysNeeded||0;
    const projX=daysNeeded>0&&daysNeeded<365?todayX+daysNeeded:null;
    const allX=[...pts.map(p=>p.x),projX||todayX];
    const allY=[...pts.map(p=>p.y),target];
    const minX=Math.min(...allX),maxX=Math.max(...allX);
    const minY=Math.min(...allY)-0.5,maxY=Math.max(...allY)+0.5;
    const spanX=maxX-minX||1,spanY=maxY-minY||1;
    const px=(x)=>PX+(x-minX)/spanX*(W-PX*2);
    const py=(y)=>H-PY-((y-minY)/spanY)*(H-PY*2);
    // punti reali
    const dotPath=pts.map((p,i)=>`${i===0?"M":"L"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");
    // linea di trend
    const tx0=pts[0].x,tx1=projX||todayX;
    const ty0=slope*tx0+intercept,ty1=slope*tx1+intercept;
    // area fill
    const areaPath=`M${px(tx0).toFixed(1)},${py(ty0).toFixed(1)} L${px(tx1).toFixed(1)},${py(ty1).toFixed(1)} L${px(tx1).toFixed(1)},${H-PY} L${px(tx0).toFixed(1)},${H-PY} Z`;
    const trendColor=slope<0?"#10b981":slope>0?"#ef4444":"#3b82f6";
    const targetY=py(target);
    return(
      <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} style={{display:"block",overflow:"visible",marginBottom:6}}>
        {/* area tendenza */}
        <path d={areaPath} fill={trendColor} opacity="0.08"/>
        {/* linea target orizzontale */}
        <line x1={PX} y1={targetY} x2={W-PX} y2={targetY} stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3"/>
        <text x={W-PX+2} y={targetY+4} fill="#3b82f6" fontSize={7}>{target}kg</text>
        {/* punti reali */}
        <path d={dotPath} fill="none" stroke={C.text3} strokeWidth={1.5} strokeLinejoin="round"/>
        {pts.map((p,i)=><circle key={i} cx={px(p.x)} cy={py(p.y)} r={2.5} fill={C.text2}/>)}
        {/* linea trend */}
        <line x1={px(tx0)} y1={py(ty0)} x2={px(tx1)} y2={py(ty1)} stroke={trendColor} strokeWidth={2} strokeLinecap="round" strokeDasharray={projX?"6 4":"none"}/>
        {/* punto proiezione */}
        {projX&&<circle cx={px(projX)} cy={py(target)} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1.5}/>}
        {/* punto oggi */}
        <circle cx={px(todayX)} cy={py(projection.current)} r={4} fill={trendColor} stroke="#fff" strokeWidth={1.5}/>
        {/* etichette asse X */}
        {[pts[0],pts[Math.floor(pts.length/2)],pts[pts.length-1]].filter((p,i,a)=>a.indexOf(p)===i).map((p,i)=>(
          <text key={i} x={px(p.x)} y={H+14} fill={C.text4} fontSize={6} textAnchor="middle">{p.date.slice(5)}</text>
        ))}
        {/* asse Y */}
        <text x={2} y={PY+5} fill={C.text4} fontSize={6}>{maxY.toFixed(1)}</text>
        <text x={2} y={H-PY+2} fill={C.text4} fontSize={6}>{minY.toFixed(1)}</text>
      </svg>
    );
  })();

  if(!lastBw&&!bwGoal&&!editGoal)return null;
  return(
    <div style={{...S.card,borderLeft:`3px solid ${goalOk?"#10b981":"#3b82f6"}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:"#3b82f6"}}>🎯 OBIETTIVO PESO</p>
        <button onClick={()=>{setEditGoal(v=>!v);setGoalInput(bwGoal||"");}} style={{background:"none",border:"none",color:C.text3,cursor:"pointer",fontSize:12,padding:"0 4px"}}>✏</button>
      </div>
      {editGoal?(
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <div style={{flex:1}}>
            <label style={S.lbl}>Peso target (kg)</label>
            <input type="number" inputMode="decimal" style={S.inp} placeholder="es. 72" value={goalInput} onChange={e=>setGoalInput(e.target.value)}/>
          </div>
          <button style={{...S.btn("red"),padding:"11px 14px",flexShrink:0}} onClick={saveGoal}>💾</button>
          {bwGoal&&<button style={{...S.btn("ghost"),padding:"11px 10px",flexShrink:0}} onClick={()=>{db(BW_GOAL_KEY,"");setBwGoalState("");setEditGoal(false);}}>🗑</button>}
        </div>
      ):(
        <>
          {bwGoal&&lastBw&&(
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:C.text}}>{lastBw.w}kg <span style={{fontSize:9,color:C.text3,fontWeight:400}}>ora</span></span>
                <span style={{fontSize:9,color:C.text3}}>→</span>
                <span style={{fontSize:12,fontWeight:700,color:"#3b82f6"}}>{goalKg}kg <span style={{fontSize:9,color:C.text3,fontWeight:400}}>target</span></span>
              </div>
              <div style={{height:6,borderRadius:3,background:C.bg4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(Math.max((lastBw.w-(lastBw.w-Math.abs(diffKg||0)))/Math.abs(diffKg||1)*100,2),100)}%`,background:goalOk?"#10b981":"#3b82f6",borderRadius:3,transition:"width 0.6s"}}/>
              </div>
              <p style={{margin:"4px 0 0",fontSize:9,color:goalOk?"#10b981":C.text3}}>
                {goalOk?"🎉 Obiettivo raggiunto!":diffKg!==null?(diffKg>0?`+${diffKg}kg da guadagnare`:`${Math.abs(diffKg)}kg da perdere`):""}
              </p>
            </div>
          )}

          {/* Selettore finestra temporale */}
          {bwGoal&&bwEntries.length>=3&&(
            <div style={{display:"flex",gap:5,marginBottom:10}}>
              {[[14,"2 sett."],[30,"1 mese"],[60,"2 mesi"],[90,"3 mesi"],[bwEntries.length>0?Math.round((new Date()-new Date(bwEntries[0].date))/86400000):180,"Tutto"]].map(([d,label])=>(
                <button key={d} onClick={()=>setWindow(d)} style={{flex:1,padding:"4px 2px",borderRadius:6,border:`1px solid ${window===d?"#3b82f6":C.border2}`,background:window===d?"#3b82f618":"transparent",color:window===d?"#3b82f6":C.text3,fontSize:9,cursor:"pointer",fontFamily:"inherit",fontWeight:window===d?700:400}}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Grafico */}
          {Chart}

          {/* Risultato proiezione */}
          {projection&&!projection.err&&bwGoal&&!goalOk&&(
            <div style={{background:"#3b82f618",borderRadius:8,padding:"10px 12px"}}>
              {projection.weeklyRate===0?(
                <p style={{margin:0,fontSize:10,color:C.text3}}>Peso stabile nel periodo selezionato — nessuna tendenza rilevata.</p>
              ):(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:projection.etaStr?8:0}}>
                    <div style={{textAlign:"center"}}>
                      <p style={{margin:"0 0 2px",fontSize:7,color:C.text3,letterSpacing:1}}>RITMO/SETT</p>
                      <p style={{margin:0,fontSize:14,fontWeight:900,color:projection.weeklyRate<0?"#10b981":"#ef4444"}}>{projection.weeklyRate>0?"+":""}{projection.weeklyRate}kg</p>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <p style={{margin:"0 0 2px",fontSize:7,color:C.text3,letterSpacing:1}}>R² AFFIDAB.</p>
                      <p style={{margin:0,fontSize:14,fontWeight:900,color:projection.r2>=70?"#10b981":projection.r2>=40?"#f59e0b":"#ef4444"}}>{projection.r2}%</p>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <p style={{margin:"0 0 2px",fontSize:7,color:C.text3,letterSpacing:1}}>PUNTI DATI</p>
                      <p style={{margin:0,fontSize:14,fontWeight:900,color:C.text}}>{projection.pts.length}</p>
                    </div>
                  </div>
                  {projection.etaStr&&(
                    <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                      <p style={{margin:"0 0 2px",fontSize:8,color:"#3b82f6",letterSpacing:1}}>ARRIVO STIMATO</p>
                      <p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{projection.etaStr} <span style={{fontSize:9,color:C.text3,fontWeight:400}}>({projection.daysNeeded} giorni)</span></p>
                    </div>
                  )}
                  {projection.r2<40&&<p style={{margin:"6px 0 0",fontSize:9,color:"#f59e0b"}}>⚠ Affidabilità bassa ({projection.r2}%) — il peso oscilla molto, prova una finestra più lunga.</p>}
                </>
              )}
            </div>
          )}
          {projection?.err&&<p style={{margin:0,fontSize:10,color:C.text3}}>{projection.err}</p>}
          {!bwGoal&&<p style={{margin:0,fontSize:10,color:C.text3,cursor:"pointer"}} onClick={()=>setEditGoal(true)}>Tocca ✏ per impostare un obiettivo di peso</p>}
        </>
      )}
    </div>
  );
}

// ── MONTHLY CALENDAR ──
function MonthlyCalendar({sessions,actEntries,dayColorMap,C,S}){
  const [calMonth,setCalMonth]=useState(()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;});
  const [yr,mo]=calMonth.split("-").map(Number);
  const firstDay=new Date(yr,mo-1,1);
  const lastDay=new Date(yr,mo,0);
  const startDow=(firstDay.getDay()||7)-1;
  const totalDays=lastDay.getDate();
  const cells=[];
  for(let i=0;i<startDow;i++)cells.push(null);
  for(let d=1;d<=totalDays;d++)cells.push(d);
  const dayMap={};
  sessions.forEach(s=>{if(s.date.startsWith(calMonth))dayMap[parseInt(s.date.slice(8))]={name:s.dayName,color:s.dayColor||dayColorMap[`${s.programId}:${s.dayName}`]||dayColorMap[s.dayName]};});
  const actMap={};
  Object.entries(actEntries||{}).forEach(([date,acts])=>{if(date.startsWith(calMonth))actMap[parseInt(date.slice(8))]=acts;});
  const prevMonth=()=>{const d=new Date(yr,mo-2,1);setCalMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);};
  const nextMonth=()=>{const d=new Date(yr,mo,1);if(d<=new Date())setCalMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);};
  const monthNames=["","Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
  return(
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>📅 CALENDARIO MENSILE</p>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={prevMonth} style={{background:"none",border:"none",color:C.text2,fontSize:18,cursor:"pointer",padding:"0 4px",lineHeight:1}}>‹</button>
          <span style={{fontSize:11,fontWeight:700,color:C.text}}>{monthNames[mo]} {yr}</span>
          <button onClick={nextMonth} style={{background:"none",border:"none",color:new Date(yr,mo,1)>new Date()?C.text4:C.text2,fontSize:18,cursor:"pointer",padding:"0 4px",lineHeight:1}}>›</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
        {["L","M","M","G","V","S","D"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:C.text4,padding:"2px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d)return<div key={i}/>;
          const hasGym=!!dayMap[d];const hasAct=!!actMap[d];
          const isToday=`${yr}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`===todayISO();
          const gymCol=dayMap[d]?.color||"#ef4444";
          return(
            <div key={i} style={{aspectRatio:"1",borderRadius:6,background:hasGym?gymCol+"cc":hasAct?"#10b98166":C.bg3,border:isToday?"2px solid #ef4444":`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1}}>
              <span style={{fontSize:10,fontWeight:isToday?900:400,color:hasGym?"#fff":hasAct?"#10b981":C.text3,lineHeight:1}}>{d}</span>
              {hasAct&&!hasGym&&<span style={{fontSize:7,lineHeight:1}}>{ACT_ICONS[(actMap[d]||[])[0]?.type]||"🏅"}</span>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:12,marginTop:10,flexWrap:"wrap"}}>
        {[...new Map(Object.values(dayMap).map(x=>[x.name,x])).values()].map(item=>(
          <div key={item.name} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:10,height:10,borderRadius:3,background:item.color||"#ef4444"}}/>
            <span style={{fontSize:8,color:C.text3}}>{item.name}</span>
          </div>
        ))}
        {Object.keys(actMap).length>0&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,background:"#10b98166"}}/><span style={{fontSize:8,color:C.text3}}>Attività</span></div>}
      </div>
    </div>
  );
}

// ── HISTORY LOG FILTER ──
function HistoryLogFilter({sessions,weekGroups,program,actEntries,deleteSession,setEditingSession,C,S}){
  const [histFilter,setHistFilter]=useState("");
  const [histDay,setHistDay]=useState("tutti");
  const dayNames=["tutti",...[...new Set([...(program?.days||[]).map(d=>d.name),...sessions.map(s=>s.dayName).filter(Boolean)])]];
  const filtered=weekGroups.map(([wk,wkS])=>{
    const fSess=wkS.filter(s=>{
      const dayOk=histDay==="tutti"||s.dayName===histDay;
      const textOk=!histFilter||s.exercises.some(e=>e.name.toLowerCase().includes(histFilter.toLowerCase()))||s.dayName.toLowerCase().includes(histFilter.toLowerCase());
      return dayOk&&textOk;
    });
    return[wk,fSess];
  }).filter(([,wkS])=>wkS.length>0);
  return(
    <>
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <input style={{...S.inp,flex:1,padding:"9px 12px",fontSize:13}} placeholder="Cerca esercizio..." value={histFilter} onChange={e=>setHistFilter(e.target.value)}/>
        {histFilter&&<button onClick={()=>setHistFilter("")} style={{background:"none",border:"none",color:C.text3,fontSize:18,cursor:"pointer",padding:"0 4px",flexShrink:0}}>✕</button>}
      </div>
      {dayNames.length>2&&(
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
          {dayNames.map(d=>(
            <button key={d} onClick={()=>setHistDay(d)} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${histDay===d?"#ef4444":C.border2}`,background:histDay===d?"#ef444420":"transparent",color:histDay===d?"#ef4444":C.text3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:histDay===d?700:400}}>
              {d==="tutti"?"Tutti":d}
            </button>
          ))}
        </div>
      )}
      {filtered.length===0&&<p style={{fontSize:10,color:C.text4,textAlign:"center",padding:"16px 0"}}>Nessuna sessione trovata</p>}
      {filtered.map(([wk,wkS])=><WeekGroup key={wk} weekKey={wk} weekSessions={wkS} program={program} actEntries={actEntries} onDeleteSession={deleteSession} onEditSession={setEditingSession} C={C} S={S}/>)}
    </>
  );
}


function FisicoScreen({C,S,bwEntries,setBwEntries,nutrEntries,setNutrEntries,actEntries,setActEntries,tdeeEntries,setTdeeEntries,sessions}){
  const [height,setHeight]=useState(()=>db("il_height")||"");
  const [tab,setTab]=useState("giorno");
  const today=todayISO();
  const [selDate,setSelDate]=useState(today);

  // peso form
  const [wVal,setWVal]=useState("");const [fatVal,setFatVal]=useState("");const [leanVal,setLeanVal]=useState("");
  const [weightDate,setWeightDate]=useState(today);
  // nutr form (linked to selDate)
  const [kcalIn,setKcalIn]=useState(()=>(nutrEntries[today]?.kcal)||"");
  const [prot,setProt]=useState(()=>(nutrEntries[today]?.prot)||"");
  const [carb,setCarb]=useState(()=>(nutrEntries[today]?.carb)||"");
  const [fat,setFat]=useState(()=>(nutrEntries[today]?.fat)||"");
  const loadNutr=(date)=>{
    const ex=nutrEntries[date];
    setKcalIn(ex?.kcal||"");setProt(ex?.prot||"");setCarb(ex?.carb||"");setFat(ex?.fat||"");
  };
  // attività form
  const [actType,setActType]=useState(ACTIVITIES[0]);
  const [actKcal,setActKcal]=useState("");
  const [actMin,setActMin]=useState("");
  // calorie bruciate totali giornata
  const [tdeeVal,setTdeeVal]=useState(()=>tdeeEntries[today]||"");

  const lastBw=bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const bwKg=lastBw?.w||null;

  const addWeight=()=>{
    if(!wVal)return;
    const e={date:weightDate,w:parseFloat(wVal),fat:parseFloat(fatVal)||null,lean:parseFloat(leanVal)||null,bmi:bmi(parseFloat(wVal),parseInt(height))};
    const updated=[...bwEntries.filter(x=>x.date!==weightDate),e].sort((a,b)=>a.date.localeCompare(b.date));
    setBwEntries(updated);setWVal("");setFatVal("");setLeanVal("");
  };
  const deleteWeight=(date)=>setBwEntries(bwEntries.filter(x=>x.date!==date));

  const saveNutr=()=>{
    const p=parseInt(prot)||0,c=parseInt(carb)||0,f=parseInt(fat)||0;
    const macroKcal=p*4+c*4+f*9;
    const finalKcal=parseInt(kcalIn)||macroKcal||0;
    setNutrEntries({...nutrEntries,[selDate]:{kcal:finalKcal,prot:p,carb:c,fat:f}});
  };
  const deleteNutr=(date)=>{
    const updated={...nutrEntries};delete updated[date];setNutrEntries(updated);
  };
  const addActivity=()=>{
    if(!actMin)return;
    const day=actEntries[selDate]||[];
    const updated={...actEntries,[selDate]:[...day,{type:actType,kcal:parseInt(actKcal)||0,min:parseInt(actMin)||0,id:Date.now()}]};
    setActEntries(updated);setActKcal("");setActMin("");
  };
  const deleteActivity=(date,id)=>{
    const updated={...actEntries,[date]:(actEntries[date]||[]).filter(a=>a.id!==id)};
    if(!updated[date]?.length)delete updated[date];
    setActEntries(updated);
  };
  const saveTdee=()=>{
    if(!tdeeVal)return;
    setTdeeEntries({...tdeeEntries,[selDate]:parseInt(tdeeVal)||0});
  };
  const deleteTdee=(date)=>{
    const updated={...tdeeEntries};delete updated[date];setTdeeEntries(updated);
  };

  // change selected date and load data
  const changeDate=(date)=>{
    setSelDate(date);
    loadNutr(date);
    setTdeeVal(tdeeEntries[date]||"");
  };

  // derived data for selDate
  const selNutr=nutrEntries[selDate];
  const selActs=actEntries[selDate]||[];
  const selGymSess=(sessions||[]).filter(s=>s.date===selDate);
  const selGymKcal=selGymSess.reduce((t,s)=>t+(s.kcal||0),0);
  const selActKcal=selActs.reduce((t,a)=>t+(a.kcal||0),0);
  const selTdeeManual=tdeeEntries[selDate]||null;
  // TDEE stimato: usa BMR (Mifflin-St Jeor) + attività registrate se non c'è TDEE manuale
  const heightCm=parseInt(height)||175;
  const bmrVal=bwKg?calcBMR(bwKg,heightCm,30,true):null;
  const tdeeEstimated=!selTdeeManual&&bmrVal?(Math.round(bmrVal*1.3)+selGymKcal+selActKcal):null;
  const selKcalOut=selTdeeManual||(tdeeEstimated)||((selGymKcal+selActKcal)||null);
  const isTdeeEstimated=!selTdeeManual&&!!tdeeEstimated;
  const selKcalIn=selNutr?.kcal||null;
  const selBal=selKcalIn&&selKcalOut?selKcalIn-selKcalOut:null;
  const isToday=selDate===today;

  // navigate days
  const prevDay=()=>{const d=dateFromISO(selDate);d.setDate(d.getDate()-1);changeDate(localISO(d));};
  const nextDay=()=>{const d=dateFromISO(selDate);d.setDate(d.getDate()+1);if(localISO(d)<=today)changeDate(localISO(d));};

  const tabs=[["giorno","📅 GIORNO"],["settimana","📊 TREND"],["peso","⚖ CORPO"]];

  return(
    <div style={S.app}>
      <div style={{...S.wrap,paddingTop:14}}>
        {/* Tab selector */}
        <div style={{display:"flex",gap:4,marginBottom:14,background:C.bg3,borderRadius:10,padding:4}}>
          {tabs.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"8px 4px",borderRadius:8,border:"none",background:tab===k?C.bg2:"transparent",color:tab===k?C.text:C.text3,fontSize:10,fontWeight:tab===k?700:400,cursor:"pointer",fontFamily:"inherit",letterSpacing:0.5,transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>

        {/* ── TAB GIORNO ── */}
        {tab==="giorno"&&(
          <div className="fade-up">
            {/* Day navigator */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <button onClick={prevDay} style={{background:"none",border:"none",color:C.text2,fontSize:22,cursor:"pointer",padding:"0 8px",lineHeight:1}}>‹</button>
              <div style={{textAlign:"center"}}>
                <p style={{margin:0,fontSize:14,fontWeight:700,color:isToday?"#ef4444":C.text}}>{isToday?"OGGI":selDate}</p>
                {isToday&&<p style={{margin:0,fontSize:9,color:C.text3}}>{selDate}</p>}
              </div>
              <button onClick={nextDay} style={{background:"none",border:"none",color:selDate>=today?C.text4:C.text2,fontSize:22,cursor:"pointer",padding:"0 8px",lineHeight:1}}>›</button>
            </div>

            {/* Bilancio calorico unificato */}
            <div style={{...S.card,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                <CalRing kcalIn={selKcalIn||0} kcalOut={selKcalOut||0} C={C}/>
                <div style={{flex:1}}>
                  <p style={{margin:"0 0 8px",fontSize:8,letterSpacing:2,color:C.text3}}>BILANCIO CALORICO</p>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <div>
                      <p style={{margin:0,fontSize:7,color:"#f97316",letterSpacing:1}}>MANGIATO</p>
                      <p style={{margin:0,fontSize:20,fontWeight:900,color:"#f97316",lineHeight:1}}>{selKcalIn||"—"}</p>
                    </div>
                    <div style={{color:C.text4,fontSize:18,alignSelf:"center"}}>vs</div>
                    <div>
                      <p style={{margin:0,fontSize:7,color:"#3b82f6",letterSpacing:1}}>BRUCIATO{isTdeeEstimated?" (stima)":""}</p>
                      <p style={{margin:0,fontSize:20,fontWeight:900,color:"#3b82f6",lineHeight:1}}>{selKcalOut||"—"}</p>
                      {isTdeeEstimated&&<p style={{margin:0,fontSize:7,color:C.text4}}>BMR+attività</p>}
                    </div>
                  </div>
                  {selBal!=null&&(
                    <div style={{marginTop:6,background:selBal>0?"#f59e0b18":"#10b98118",borderRadius:6,padding:"4px 10px",display:"inline-block",border:`1px solid ${selBal>0?"#f59e0b44":"#10b98144"}`}}>
                      <span style={{fontSize:11,fontWeight:900,color:selBal>0?"#f59e0b":"#10b981"}}>{selBal>0?"▲ SURPLUS":"▼ DEFICIT"} {Math.abs(selBal)} kcal</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Attività del giorno */}
              {(selGymKcal>0||selActs.length>0||selTdeeManual)&&(
                <ActivityBurnRow acts={selActs} gymKcal={selGymKcal} tdeeManual={selTdeeManual} C={C}/>
              )}
              {/* Kcal rimanenti rispetto all'obiettivo */}
              {(()=>{
                const kcalGoal=db(KCAL_GOAL_KEY);
                if(!kcalGoal||!selKcalIn)return null;
                const tdeeApprox=selKcalOut||(db("il_height")&&bwKg?Math.round(calcBMR(bwKg,parseInt(db("il_height"))||175,30,true)*1.5):null);
                const bmrApprox=bwKg?calcBMR(bwKg,parseInt(db("il_height"))||175,30,true):null;
                const target=getKcalTarget(kcalGoal,tdeeApprox,bmrApprox);
                if(!target)return null;
                const remaining=target-selKcalIn;
                const over=remaining<0;
                const modeCol={deficit:"#10b981",surplus:"#f59e0b",maintain:"#3b82f6"}[kcalGoal.mode]||"#3b82f6";
                return(
                  <div style={{marginTop:8,display:"flex",alignItems:"center",justifyContent:"space-between",background:over?"#ef444414":modeCol+"14",borderRadius:8,padding:"6px 12px",border:`1px solid ${over?"#ef444430":modeCol+"30"}`}}>
                    <span style={{fontSize:9,color:C.text3}}>Obiettivo: {target} kcal</span>
                    <span style={{fontSize:12,fontWeight:900,color:over?"#ef4444":modeCol}}>{over?`+${Math.abs(remaining)} oltre`:`${remaining} rimanenti`}</span>
                  </div>
                );
              })()}
            </div>

            {/* Macro breakdown */}
            {selNutr&&(
              <div style={{...S.card,marginBottom:10}}>
                <p style={{margin:"0 0 10px",fontSize:8,letterSpacing:2,color:C.text3}}>MACRONUTRIENTI</p>
                <MacroBar prot={selNutr.prot} carb={selNutr.carb} fat={selNutr.fat} kcal={selNutr.kcal} bwKg={bwKg} C={C}/>
              </div>
            )}

            {/* Form inserimento nutrizione */}
            <div style={{...S.card,marginBottom:10}}>
              <p style={{margin:"0 0 10px",fontSize:8,letterSpacing:2,color:C.text3}}>🍽 INSERISCI PASTI — {selDate}</p>
              {(()=>{
                const p=parseInt(prot)||0,c=parseInt(carb)||0,f=parseInt(fat)||0;
                const macroKcal=p*4+c*4+f*9;
                const discrepancy=kcalIn&&macroKcal>0?Math.abs(parseInt(kcalIn)-macroKcal):0;
                const protTarget=bwKg?Math.round(bwKg*1.8):140;
                return(
                  <>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div>
                        <label style={S.lbl}>🥩 Proteine (g)</label>
                        <input type="number" inputMode="numeric" style={{...S.inp,borderColor:p>=protTarget?"#10b981":p>=protTarget*0.8?"#f59e0b":C.border2}} placeholder={String(protTarget)} value={prot} onChange={e=>setProt(e.target.value)}/>
                        {p>0&&<p style={{margin:"3px 0 0",fontSize:8,color:p>=protTarget?"#10b981":"#f59e0b"}}>{p>=protTarget?"✓ target":p>=protTarget*0.8?"quasi":`−${protTarget-p}g al target`}</p>}
                      </div>
                      <div>
                        <label style={S.lbl}>🍞 Carboidrati (g)</label>
                        <input type="number" inputMode="numeric" style={S.inp} placeholder="220" value={carb} onChange={e=>setCarb(e.target.value)}/>
                      </div>
                      <div>
                        <label style={S.lbl}>🧈 Grassi (g)</label>
                        <input type="number" inputMode="numeric" style={S.inp} placeholder="70" value={fat} onChange={e=>setFat(e.target.value)}/>
                      </div>
                      <div>
                        <label style={S.lbl}>🔥 Calorie (kcal)</label>
                        <input type="number" inputMode="numeric" style={{...S.inp,borderColor:discrepancy>150?"#f59e0b":C.border2}} placeholder={macroKcal>0?String(macroKcal):"2200"} value={kcalIn} onChange={e=>setKcalIn(e.target.value)}/>
                        {macroKcal>0&&<p style={{margin:"3px 0 0",fontSize:8,color:discrepancy>150?"#f59e0b":C.text4}}>dai macro: {macroKcal} kcal{discrepancy>150?` ⚠ diff. ${discrepancy}`:""}</p>}
                      </div>
                    </div>
                    {/* Live macro preview */}
                    {macroKcal>0&&(
                      <div style={{height:6,borderRadius:3,background:C.bg4,overflow:"hidden",display:"flex",marginBottom:8}}>
                        {[[p*4,"#ef4444"],[c*4,"#f59e0b"],[f*9,"#3b82f6"]].map(([cal,col],i)=>(
                          <div key={i} style={{height:"100%",width:`${Math.round(cal/macroKcal*100)||0}%`,background:col,transition:"width 0.3s"}}/>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
              <button style={{...S.btn("red"),width:"100%",padding:12}} onClick={saveNutr}>💾 SALVA</button>
              {selNutr&&<button style={{...S.btn("ghost"),width:"100%",padding:8,marginTop:6,fontSize:9}} onClick={()=>deleteNutr(selDate)}>🗑 Cancella dati nutrizione</button>}
            </div>

            {/* Form attività */}
            <div style={{...S.card,marginBottom:10}}>
              <p style={{margin:"0 0 10px",fontSize:8,letterSpacing:2,color:C.text3}}>🏃 ATTIVITÀ EXTRA — {selDate}</p>
              {selActs.length>0&&(
                <div style={{marginBottom:10}}>
                  {selActs.map((a,i)=>(
                    <div key={a.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontSize:11}}>{ACT_ICONS[a.type]||"🏅"} <span style={{color:C.text2,fontWeight:600}}>{a.type}</span></span>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        {a.min>0&&<span style={{fontSize:10,color:C.text3}}>⏱{a.min}min</span>}
                        {a.kcal>0&&<span style={{fontSize:10,color:"#f97316"}}>🔥{a.kcal}</span>}
                        <button onClick={()=>deleteActivity(selDate,a.id)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:14,padding:"0 2px"}}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div>
                  <label style={S.lbl}>Tipo</label>
                  <select style={S.inp} value={actType} onChange={e=>setActType(e.target.value)}>
                    {ACTIVITIES.map(a=><option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>⏱ Minuti</label><input type="number" inputMode="numeric" style={S.inp} placeholder="60" value={actMin} onChange={e=>setActMin(e.target.value)}/></div>
                <div><label style={S.lbl}>🔥 Kcal (opz.)</label><input type="number" inputMode="numeric" style={S.inp} placeholder="400" value={actKcal} onChange={e=>setActKcal(e.target.value)}/></div>
              </div>
              <button style={{...S.btn("red"),width:"100%",padding:12}} onClick={addActivity}>+ AGGIUNGI ATTIVITÀ</button>
            </div>

            {/* Form TDEE manuale */}
            <div style={{...S.card,borderLeft:"3px solid #3b82f6"}}>
              <p style={{margin:"0 0 4px",fontSize:8,letterSpacing:2,color:"#3b82f6"}}>📱 TDEE TOTALE GIORNALIERO (opzionale)</p>
              <p style={{margin:"0 0 10px",fontSize:9,color:C.text3,lineHeight:1.4}}>Se hai un tracker (Garmin, Apple Watch ecc.) inserisci qui il totale kcal bruciate. Sovrascrive il calcolo automatico.</p>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <label style={S.lbl}>Kcal totali bruciate</label>
                  <input type="number" inputMode="numeric" style={S.inp} placeholder="es. 2500" value={tdeeVal} onChange={e=>setTdeeVal(e.target.value)}/>
                </div>
                <button style={{...S.btn("red"),padding:"11px 14px",flexShrink:0}} onClick={saveTdee}>💾</button>
                {selTdeeManual&&<button style={{...S.btn("ghost"),padding:"11px 10px",flexShrink:0}} onClick={()=>deleteTdee(selDate)}>🗑</button>}
              </div>
              {selTdeeManual&&<p style={{margin:"6px 0 0",fontSize:9,color:"#3b82f6"}}>✓ {selTdeeManual} kcal registrate</p>}
            </div>
          </div>
        )}

        {/* ── TAB TREND ── */}
        {tab==="settimana"&&(
          <div className="fade-up">
            {/* Obiettivo calorico */}
            <KcalGoalPanel nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} actEntries={actEntries} sessions={sessions||[]} bwEntries={bwEntries} C={C} S={S}/>

            {/* Protein streak */}
            <div style={S.card}>
              <ProtStreak nutrEntries={nutrEntries} bwKg={bwKg} C={C}/>
            </div>

            {/* Timeline 14 giorni */}
            <div style={S.card}>
              <p style={{margin:"0 0 10px",fontSize:8,letterSpacing:2,color:C.text3}}>CALORIE — ULTIMI 14 GIORNI</p>
              <CalTimeline nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} actEntries={actEntries} sessions={sessions||[]} C={C}/>
            </div>

            {/* NutrChart esistente */}
            {Object.keys(nutrEntries).length>=2&&(
              <div style={S.card}>
                <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 12px"}}>TREND NUTRIZIONE — 30 GIORNI</p>
                <NutrChart nutrEntries={nutrEntries} C={C}/>
              </div>
            )}

            {/* SurplusChart esistente */}
            <div style={S.card}>
              <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 10px"}}>SURPLUS / DEFICIT — ULTIMI 14 GIORNI</p>
              <SurplusChart nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} C={C}/>
            </div>

            {/* Storico nutrizione compatto */}
            {Object.keys(nutrEntries).length>0&&(
              <div style={S.card}>
                <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 10px"}}>STORICO NUTRIZIONE</p>
                {Object.entries(nutrEntries).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,14).map(([date,n])=>{
                  const tdeeOut=tdeeEntries[date]||null;
                  const acts=actEntries[date]||[];
                  const gymK=(sessions||[]).filter(s=>s.date===date).reduce((t,s)=>t+(s.kcal||0),0);
                  const actK=acts.reduce((t,a)=>t+(a.kcal||0),0);
                  const out=tdeeOut||(gymK+actK)||null;
                  const bal=out?n.kcal-out:null;
                  return(
                    <div key={date} onClick={()=>{setTab("giorno");changeDate(date);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
                      <div>
                        <span style={{fontSize:10,color:C.text3,display:"block"}}>{date}</span>
                        <span style={{fontSize:9,color:"#ef4444"}}>{n.prot}g P · {n.carb}g C · {n.fat}g F</span>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:12,fontWeight:700,color:"#f97316"}}>{n.kcal}</span>
                        {bal!=null&&<span style={{fontSize:10,fontWeight:700,color:bal>0?"#f59e0b":"#10b981",background:bal>0?"#f59e0b18":"#10b98118",borderRadius:4,padding:"1px 6px"}}>{bal>0?"+":""}{bal}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB CORPO ── */}
        {tab==="peso"&&(
          <div className="fade-up">
            {lastBw&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                {[["⚖ PESO",lastBw.w+"kg","#ef4444"],lastBw.fat?["🔥 GRASSO",lastBw.fat+"%","#f97316"]:null,lastBw.lean?["💪 MAGRA",lastBw.lean+"kg","#10b981"]:null,lastBw.bmi?["📊 BMI",""+lastBw.bmi,"#8b5cf6"]:null].filter(Boolean).map(([l,v,col])=>(
                  <div key={l} style={{...S.card,textAlign:"center",padding:"10px 8px",marginBottom:0}}>
                    <p style={{margin:"0 0 2px",fontSize:8,color:C.text3,letterSpacing:1}}>{l}</p>
                    <p style={{margin:0,fontSize:18,fontWeight:900,color:col}}>{v}</p>
                  </div>
                ))}
              </div>
            )}
            {bwEntries.length>=2&&(
              <div style={S.card}>
                <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 12px"}}>TREND CORPOREO</p>
                <BodyChart bwEntries={bwEntries} C={C}/>
              </div>
            )}
            {/* Obiettivo peso con proiezione */}
            <BwGoalCard bwEntries={bwEntries} lastBw={lastBw} C={C} S={S}/>
            <div style={S.card}>
              <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 12px"}}>INSERISCI MISURE</p>
              <label style={S.lbl}>Altezza (cm) — una volta sola</label>
              <input type="number" inputMode="numeric" style={{...S.inp,marginBottom:10}} placeholder="es. 175" value={height} onChange={e=>{setHeight(e.target.value);db("il_height",e.target.value);}}/>
              <label style={S.lbl}>📅 Data misurazione</label>
              <input type="date" style={{...S.inp,marginBottom:10}} value={weightDate} max={today} onChange={e=>{setWeightDate(e.target.value);const ex=bwEntries.find(x=>x.date===e.target.value);if(ex){setWVal(ex.w);setFatVal(ex.fat||"");setLeanVal(ex.lean||"");}else{setWVal("");setFatVal("");setLeanVal("");}}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                <div><label style={S.lbl}>Peso (kg)</label><input type="number" inputMode="decimal" style={S.inp} placeholder="75.5" value={wVal} onChange={e=>setWVal(e.target.value)}/></div>
                <div><label style={S.lbl}>% Grasso</label><input type="number" inputMode="decimal" style={S.inp} placeholder="15" value={fatVal} onChange={e=>setFatVal(e.target.value)}/></div>
                <div><label style={S.lbl}>Massa magra</label><input type="number" inputMode="decimal" style={S.inp} placeholder="kg" value={leanVal} onChange={e=>setLeanVal(e.target.value)}/></div>
              </div>
              {height&&wVal&&<p style={{margin:"0 0 8px",fontSize:10,color:C.text3}}>BMI stimato: <strong style={{color:"#ef4444"}}>{bmi(parseFloat(wVal),parseInt(height))}</strong></p>}
              <button style={{...S.btn("red"),width:"100%",padding:12}} onClick={addWeight}>💾 SALVA MISURE</button>
            </div>
            {bwEntries.length>0&&(
              <div style={S.card}>
                <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 10px"}}>STORICO ({bwEntries.length})</p>
                {[...bwEntries].reverse().slice(0,12).map((e,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:10,color:C.text3}}>{e.date}</span>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontSize:11,fontWeight:700,color:C.text}}>{e.w}kg</span>
                      {e.fat&&<span style={{fontSize:10,color:"#f97316"}}>{e.fat}%</span>}
                      {e.bmi>0&&<span style={{fontSize:10,color:C.text3}}>BMI {e.bmi}</span>}
                      <button onClick={()=>deleteWeight(e.date)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:14,padding:"0 2px",lineHeight:1}}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
