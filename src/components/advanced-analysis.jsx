// ── FATICA INDEX CARD ──
// ══════════════════════════════════════════════
function FaticaCard({sessions,actEntries,C,S}){
  const fi=calcFaticaIndex(sessions,actEntries);
  const deload=getDeloadSuggestion(sessions);
  const statusColor={OVERREACHING:"#ef4444",["CARICO ALTO"]:"#f97316",OTTIMALE:"#10b981",FRESCO:"#3b82f6",DETRAINING:"#8b5cf6"}[fi.status]||"#6b7280";
  const tsbAbs=Math.abs(fi.tsb);
  const barW=Math.min(tsbAbs,100);
  return(
    <div style={{...S.card,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>⚡ INDICE DI FATICA (ATL/CTL)</p>
        <span style={{fontSize:10,fontWeight:900,color:statusColor,background:statusColor+"18",borderRadius:6,padding:"2px 8px",letterSpacing:1}}>{fi.status}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        {[["ATL 7gg",fi.atl+"kg","Volume acuto giornaliero"],["CTL 28gg",fi.ctl+"kg","Carico cronico medio"],["TSB",(fi.tsb>=0?"+":"")+fi.tsb+"%","Stress balance"]].map(([l,v,sub])=>(
          <div key={l} style={{background:C.bg3,borderRadius:8,padding:"8px",textAlign:"center"}}>
            <p style={{margin:"0 0 1px",fontSize:7,color:C.text4,letterSpacing:1}}>{l}</p>
            <p style={{margin:"0 0 1px",fontSize:15,fontWeight:900,color:l==="TSB"?statusColor:C.text}}>{v}</p>
            <p style={{margin:0,fontSize:6,color:C.text4,lineHeight:1.3}}>{sub}</p>
          </div>
        ))}
      </div>
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize:7,color:"#3b82f6"}}>FRESCO</span>
          <span style={{fontSize:7,color:"#10b981"}}>OTTIMALE</span>
          <span style={{fontSize:7,color:"#ef4444"}}>OVERREACH</span>
        </div>
        <div style={{height:8,borderRadius:4,background:`linear-gradient(90deg,#3b82f6,#10b981 40%,#f97316 70%,#ef4444)`,position:"relative"}}>
          <div style={{position:"absolute",top:-3,left:`${Math.min(Math.max((fi.tsb+30)/90*100,2),97)}%`,width:14,height:14,borderRadius:"50%",background:"#fff",border:`3px solid ${statusColor}`,transform:"translateX(-50%)",boxShadow:"0 2px 8px #0008",transition:"left 0.8s ease"}}/>
        </div>
      </div>
      {deload&&(
        <div style={{background:"#f97316"+"18",border:"1px solid #f9741644",borderRadius:8,padding:"8px 10px",display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontSize:16,flexShrink:0}}>⚠</span>
          <div>
            <p style={{margin:"0 0 2px",fontSize:9,fontWeight:700,color:"#f97316",letterSpacing:1}}>SUGGERIMENTO DELOAD</p>
            <p style={{margin:0,fontSize:10,color:C.text2,lineHeight:1.4}}>{deload.msg}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── MONTHLY COMPARE ──
// ══════════════════════════════════════════════
function MonthlyCompare({sessions,nutrEntries,tdeeEntries,actEntries,C,S}){
  const months=getMonthlyStats(sessions,nutrEntries,tdeeEntries,actEntries);
  if(months.length<2)return null;
  const monthNames=["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
  const maxVol=Math.max(...months.map(([,v])=>v.volume),1);
  const maxSess=Math.max(...months.map(([,v])=>v.sessions),1);
  const [metric,setMetric]=React.useState("volume");
  const metrics=[["volume","📦 Volume"],["sessions","🗓 Sessioni"],["duration","⏱ Tempo"],["kcalBurned","🔥 Kcal"],["actMin","🏃 Attività"]];
  const getValue=(v)=>({volume:v.volume,sessions:v.sessions,duration:v.duration+(v.actMin||0),kcalBurned:v.kcalBurned,actMin:v.actMin||0}[metric]||0);
  const formatV=(v,m)=>{
    if(m==="volume")return v>=1000?(v/1000).toFixed(1)+"t":v+"kg";
    if(m==="sessions")return v+"";
    if(m==="duration")return fmtDur(v);
    if(m==="kcalBurned")return v>999?(v/1000).toFixed(1)+"k":v+"";
    if(m==="actMin")return v+"min";
    return v+"";
  };
  const vals=months.map(([,v])=>getValue(v));
  const maxVal=Math.max(...vals,1);
  // delta mese attuale vs precedente
  const last=months[months.length-1][1];
  const prev=months[months.length-2][1];
  const delta=prev.sessions>0?Math.round((last.sessions-prev.sessions)/prev.sessions*100):null;
  const volDelta=prev.volume>0?Math.round((last.volume-prev.volume)/prev.volume*100):null;
  return(
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>📅 CONFRONTO MENSILE</p>
        {delta!==null&&<span style={{fontSize:10,fontWeight:900,color:delta>=0?"#10b981":"#ef4444"}}>{delta>=0?"+":""}{delta}% sessioni</span>}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
        {metrics.map(([k,label])=>(
          <button key={k} onClick={()=>setMetric(k)} style={{padding:"4px 8px",borderRadius:6,border:"none",background:metric===k?"#ef4444":C.bg3,color:metric===k?"#fff":C.text3,fontSize:9,cursor:"pointer",fontFamily:"inherit",fontWeight:metric===k?700:400}}>{label}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:4,alignItems:"flex-end",height:80}}>
        {months.map(([key,v],i)=>{
          const val=getValue(v);
          const h=maxVal>0?Math.max(val/maxVal*64,val>0?4:1):1;
          const isLast=i===months.length-1;
          const mName=monthNames[parseInt(key.slice(5,7))-1];
          return(
            <div key={key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontSize:isLast?8:6,color:isLast?"#ef4444":C.text4,fontWeight:isLast?700:400,lineHeight:1,whiteSpace:"nowrap"}}>{formatV(val,metric)}</span>
              <div style={{width:"100%",height:h,background:isLast?"#ef4444":`#ef444455`,borderRadius:"3px 3px 0 0",transition:"height 0.5s"}}/>
              <span style={{fontSize:7,color:isLast?"#ef4444":C.text3,fontWeight:isLast?700:400}}>{mName}</span>
            </div>
          );
        })}
      </div>
      {volDelta!==null&&(
        <div style={{marginTop:8,display:"flex",gap:12,borderTop:`1px solid ${C.border}`,paddingTop:8}}>
          {[["Volume",volDelta],["Sessioni",delta]].filter(([,d])=>d!==null).map(([l,d])=>(
            <div key={l}><p style={{margin:0,fontSize:7,color:C.text4}}>{l} vs mese scorso</p><p style={{margin:0,fontSize:13,fontWeight:900,color:d>=0?"#10b981":"#ef4444"}}>{d>=0?"+":""}{d}%</p></div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── NUTRITION NERD DASHBOARD ──
// ══════════════════════════════════════════════
function NutrNerdDash({nutrEntries,tdeeEntries,bwEntries,sessions,C,S}){
  const st=getNutrStats(nutrEntries,tdeeEntries,bwEntries,sessions);
  if(!st)return(
    <div style={{...S.card,textAlign:"center",padding:"24px 12px"}}>
      <p style={{fontSize:28,margin:"0 0 8px"}}>🍎</p>
      <p style={{fontSize:11,color:C.text3}}>Registra la nutrizione nella tab Fisico per vedere le statistiche avanzate.</p>
    </div>
  );
  const macroColors={P:"#10b981",C:"#3b82f6",F:"#f59e0b"};
  // sparkline bilancio ultime 14gg
  const balLast=st.balDays.slice(-14);
  const W=280,H=48,PX=6,PY=4;
  const balVals=balLast.map(x=>x.bal);
  const maxB=Math.max(...balVals.map(Math.abs),100);
  const midY=H/2;
  const pts=balLast.map((d,i)=>({x:PX+(i/(Math.max(balLast.length-1,1)))*(W-PX*2),y:midY-d/maxB*(midY-PY)}));
  const lD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  return(
    <div>
      {/* Header stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
        {[
          ["📊 Giorni registrati",st.loggedDays,"","#3b82f6"],
          ["🍽 Kcal media/giorno",st.avgKcal,"kcal","#f97316"],
          ["💪 Proteine media/giorno",st.avgProt+"g","","#10b981"],
          st.protPerKg?["⚖ Proteine per kg corpo",st.protPerKg,"g/kg","#10b981"]:["🥦 Carboidrati medi",st.avgCarb+"g","","#3b82f6"],
        ].map(([l,v,unit,col])=>(
          <div key={l} style={{...S.card,marginBottom:0,padding:"10px 12px"}}>
            <p style={{margin:"0 0 2px",fontSize:8,color:C.text3,lineHeight:1.3}}>{l}</p>
            <p style={{margin:0,fontSize:18,fontWeight:900,color:col}}>{v}<span style={{fontSize:10,fontWeight:400,color:C.text3}}> {unit}</span></p>
          </div>
        ))}
      </div>

      {/* Macro split donut-style */}
      <div style={{...S.card,marginBottom:10}}>
        <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>SPLIT MACRONUTRIENTI</p>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <svg width={80} height={80} viewBox="0 0 36 36">
            {(()=>{const segs=[{pct:st.protPct,col:"#10b981"},{pct:st.carbPct,col:"#3b82f6"},{pct:st.fatPct,col:"#f59e0b"}];let off=0;const r=15.9,circ=2*Math.PI*r;return segs.map((sg,i)=>{const len=sg.pct/100*circ;const dashOffset=-off*circ/100+circ*0.25;off+=sg.pct;return(<circle key={i} cx="18" cy="18" r={r} fill="none" stroke={sg.col} strokeWidth={5} strokeDasharray={len+" "+(circ-len)} strokeDashoffset={dashOffset} strokeLinecap="butt"/>);});})()} 
            <text x="18" y="20" textAnchor="middle" fontSize="7" fill="#f0f0f0" fontWeight="bold">{st.avgKcal}</text>
          </svg>
          <div style={{flex:1}}>
            {[["P","Proteine",st.avgProt+"g",st.protPct],["C","Carboidrati",st.avgCarb+"g",st.carbPct],["F","Grassi",st.avgFat+"g",st.fatPct]].map(([k,name,val,pct])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                <span style={{width:8,height:8,borderRadius:2,background:macroColors[k],flexShrink:0,display:"block"}}/>
                <span style={{fontSize:9,color:C.text2,flex:1}}>{name}</span>
                <span style={{fontSize:10,fontWeight:700,color:macroColors[k]}}>{val}</span>
                <span style={{fontSize:8,color:C.text4,minWidth:28,textAlign:"right"}}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Train vs rest kcal */}
      {(st.avgKcalTrain>0||st.avgKcalRest>0)&&(
        <div style={{...S.card,marginBottom:10}}>
          <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>KCAL: GIORNO ALLENAMENTO VS RIPOSO</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["🏋 Giorno allenamento",st.avgKcalTrain,"#ef4444"],["😴 Giorno di riposo",st.avgKcalRest,"#3b82f6"]].map(([l,v,col])=>(
              <div key={l} style={{background:C.bg3,borderRadius:10,padding:"10px",textAlign:"center"}}>
                <p style={{margin:"0 0 4px",fontSize:9,color:C.text3,lineHeight:1.3}}>{l}</p>
                <p style={{margin:0,fontSize:20,fontWeight:900,color:col}}>{v}</p>
                <p style={{margin:0,fontSize:8,color:C.text4}}>kcal medi</p>
              </div>
            ))}
          </div>
          {st.avgKcalTrain>0&&st.avgKcalRest>0&&(
            <p style={{margin:"8px 0 0",fontSize:9,color:C.text3,textAlign:"center"}}>
              Differenza: <span style={{fontWeight:700,color:st.avgKcalTrain>st.avgKcalRest?"#10b981":"#f97316"}}>{st.avgKcalTrain>st.avgKcalRest?"+":""}{st.avgKcalTrain-st.avgKcalRest} kcal</span> nei giorni di allenamento
            </p>
          )}
        </div>
      )}

      {/* Balance chart */}
      {balLast.length>=3&&(
        <div style={{...S.card,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>BILANCIO CALORICO — 14 GIORNI</p>
            {st.avgBal!==null&&<span style={{fontSize:10,fontWeight:900,color:st.avgBal>=0?"#f59e0b":"#10b981"}}>{st.avgBal>=0?"SURPLUS":"DEFICIT"} {Math.abs(st.avgBal)} kcal/g</span>}
          </div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block",overflow:"visible"}}>
            <line x1={PX} y1={midY} x2={W-PX} y2={midY} stroke={C.border2} strokeWidth={1} strokeDasharray="3 3"/>
            {balLast.map((d,i)=>{
              const x=PX+(i/(Math.max(balLast.length-1,1)))*(W-PX*2);
              const y=midY-d.bal/maxB*(midY-PY);
              return(
                <g key={i}>
                  <line x1={x} y1={midY} x2={x} y2={y} stroke={d.bal>=0?"#f59e0b":"#10b981"} strokeWidth={3} strokeLinecap="round" opacity={0.7}/>
                  <circle cx={x} cy={y} r={3} fill={d.bal>=0?"#f59e0b":"#10b981"}/>
                </g>
              );
            })}
            <text x={PX} y={PY+6} fill="#f59e0b" fontSize={7}>surplus</text>
            <text x={PX} y={H-2} fill="#10b981" fontSize={7}>deficit</text>
          </svg>
          <div style={{display:"flex",gap:16,marginTop:6}}>
            {[["🌿 Giorni deficit",st.deficitDays,"#10b981"],["📈 Giorni surplus",st.surplusDays,"#f59e0b"]].map(([l,v,col])=>(
              <div key={l}><p style={{margin:0,fontSize:7,color:C.text4}}>{l}</p><p style={{margin:0,fontSize:14,fontWeight:900,color:col}}>{v}</p></div>
            ))}
            {st.trend30!==null&&<div style={{marginLeft:"auto"}}><p style={{margin:0,fontSize:7,color:C.text4}}>Trend 30gg</p><p style={{margin:0,fontSize:12,fontWeight:900,color:st.trend30>=0?"#f97316":"#10b981"}}>{st.trend30>=0?"+":""}{st.trend30} kcal</p></div>}
          </div>
        </div>
      )}

      {/* Protein target */}
      {st.protPerKg!==null&&(
        <div style={{...S.card}}>
          <p style={{margin:"0 0 8px",fontSize:9,letterSpacing:2,color:C.text3}}>🥩 ADEGUATEZZA PROTEICA</p>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:9,color:C.text2}}>Attuale: <strong style={{color:"#10b981"}}>{st.protPerKg} g/kg</strong></span>
                <span style={{fontSize:9,color:C.text4}}>Target: 1.6–2.2 g/kg</span>
              </div>
              <div style={{height:8,borderRadius:4,background:C.bg4,position:"relative",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(st.protPerKg/2.4*100,100)}%`,background:st.protPerKg>=1.6&&st.protPerKg<=2.2?"#10b981":st.protPerKg<1.6?"#ef4444":"#f59e0b",borderRadius:4,transition:"width 0.7s"}}/>
                <div style={{position:"absolute",top:0,left:`${1.6/2.4*100}%`,width:2,height:"100%",background:"#ffffff40"}}/>
                <div style={{position:"absolute",top:0,left:`${2.2/2.4*100}%`,width:2,height:"100%",background:"#ffffff40"}}/>
              </div>
            </div>
            <span style={{fontSize:22}}>{st.protPerKg>=1.6&&st.protPerKg<=2.2?"✅":st.protPerKg<1.6?"⚠":"🔝"}</span>
          </div>
          <p style={{margin:"6px 0 0",fontSize:9,color:C.text3}}>
            {st.protPerKg<1.6?"Aumenta le proteine per ottimizzare il recupero muscolare.":st.protPerKg<=2.2?"Assunzione proteica ottimale per la composizione corporea! 🎯":"Assunzione molto elevata. Verifica di avere adeguata idratazione."}
          </p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── NOTIFICATION CENTER ──
// ══════════════════════════════════════════════
function NotificationCenter({sessions,actEntries,C,S}){
  const [perm,setPerm]=React.useState(()=>typeof Notification!=='undefined'?Notification.permission:'denied');
  const [remHour,setRemHour]=React.useState(()=>db("il_notif_hour")||8);
  const [remEnabled,setRemEnabled]=React.useState(()=>db("il_notif_on")||false);
  const [lastTest,setLastTest]=React.useState(null);
  const requestPerm=async()=>{
    if(typeof Notification==='undefined')return;
    const r=await Notification.requestPermission();
    setPerm(r);
  };
  const sendTestNotif=()=>{
    if(perm!=='granted')return;
    try{new Notification('⚡ Iron Log',{body:'Notifiche attive! Ci vediamo in palestra 💪',icon:'⚡'});}catch(_){
      if(navigator.serviceWorker.controller){navigator.serviceWorker.controller.postMessage({type:'NOTIFY',title:'⚡ Iron Log',body:'Notifiche attive! 💪'});}
    }
    setLastTest(new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}));
  };
  const toggleReminder=()=>{
    const next=!remEnabled;
    setRemEnabled(next);
    db("il_notif_on",next);
    if(next&&perm==='granted'){
      sendTestNotif();
    }
  };
  const permColor={granted:"#10b981",denied:"#ef4444",default:"#f59e0b"}[perm]||"#6b7280";
  const streak=getStreak(sessions,actEntries);
  return(
    <div style={S.card}>
      <p style={{margin:"0 0 12px",fontSize:9,letterSpacing:2,color:C.text3}}>🔔 NOTIFICHE & REMINDER</p>
      {/* Permission status */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:C.bg3,borderRadius:10,marginBottom:10}}>
        <div>
          <p style={{margin:"0 0 2px",fontSize:10,fontWeight:700,color:C.text}}>Permesso notifiche</p>
          <p style={{margin:0,fontSize:9,color:permColor,letterSpacing:1}}>{perm==="granted"?"✓ CONCESSO":perm==="denied"?"✗ NEGATO":"IN ATTESA"}</p>
        </div>
        {perm!=="granted"&&<button onClick={requestPerm} style={{...S.btn("red"),padding:"8px 12px",fontSize:10}}>Abilita</button>}
        {perm==="granted"&&<span style={{fontSize:20}}>✅</span>}
      </div>
      {/* Reminder toggle */}
      {perm==="granted"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:C.bg3,borderRadius:10,marginBottom:8}}>
            <div>
              <p style={{margin:"0 0 2px",fontSize:10,fontWeight:700,color:C.text}}>Reminder allenamento</p>
              <p style={{margin:0,fontSize:9,color:C.text4}}>Notifica di prova all'attivazione</p>
            </div>
            <div onClick={toggleReminder} style={{width:44,height:24,borderRadius:12,background:remEnabled?"#ef4444":C.bg4,cursor:"pointer",position:"relative",transition:"background 0.3s"}}>
              <div style={{position:"absolute",top:3,left:remEnabled?20:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.3s",boxShadow:"0 2px 4px #0006"}}/>
            </div>
          </div>
          <button onClick={sendTestNotif} style={{...S.btn("ghost"),width:"100%",padding:"10px",fontSize:10,marginBottom:8}}>🔔 Invia notifica di test</button>
          {lastTest&&<p style={{margin:0,fontSize:9,color:"#10b981",textAlign:"center"}}>✓ Notifica inviata alle {lastTest}</p>}
        </>
      )}
      {/* Stats notifiche */}
      <div style={{marginTop:10,padding:"10px 12px",background:C.bg3,borderRadius:10}}>
        <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:C.text4}}>STATO APP</p>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {[["Sessioni salvate",sessions.length],["Streak attuale",streak+"w"],["Dati offline","✓ localStorage"]].map(([l,v])=>(
            <div key={l}><p style={{margin:"0 0 1px",fontSize:7,color:C.text4}}>{l}</p><p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{v}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════
// ── STRENGTH STANDARDS CARD ──
// ══════════════════════════════════════════════
function StrengthStandardsCard({sessions,bwEntries,C,S}){
  const [gender,setGender]=React.useState(()=>db("il_gender")||"m");
  const records=getRecords(sessions);
  const lastBw=bwEntries&&bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const bwKg=lastBw?lastBw.w:null;
  const mainLifts=["Panca Piana","Squat","Stacchi","Lento Avanti","Rematore Bilanciere","Curl Bilanciere"];
  const liftsWithData=mainLifts.filter(l=>records[l]);
  const pp=getPushPullBalance(sessions);

  // Wilks (Big 3)
  const big3=["Panca Piana","Squat","Stacchi"];
  const big3Total=big3.reduce((t,n)=>t+(records[n]?records[n].orm:0),0);
  const wilks=calcWilks(big3Total,bwKg);
  const wilksLabel=!wilks?"N/D":wilks>=500?"Elite":wilks>=400?"Avanzato":wilks>=300?"Intermedio":wilks>=200?"Novice":"Principiante";
  const wilksColor=!wilks?"#555":wilks>=500?"#ef4444":wilks>=400?"#f59e0b":wilks>=300?"#10b981":wilks>=200?"#3b82f6":"#6b7280";

  return(
    <div style={{marginBottom:10}}>
      {/* Gender toggle */}
      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <span style={{fontSize:9,color:C.text3,letterSpacing:1}}>SESSO:</span>
        {[["m","♂ Uomo"],["f","♀ Donna"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setGender(k);db("il_gender",k);}}
            style={{padding:"5px 14px",borderRadius:8,border:"none",background:gender===k?"#ef4444":C.bg3,
              color:gender===k?"#fff":C.text3,fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:gender===k?700:400}}>
            {l}
          </button>
        ))}
      </div>

      {/* Wilks Score */}
      <div style={{...S.card,background:`linear-gradient(135deg,${C.bg2},${C.bg3})`,borderLeft:"3px solid "+wilksColor,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{margin:"0 0 2px",fontSize:9,letterSpacing:2,color:C.text3}}>WILKS SCORE (Big 3)</p>
            <p style={{margin:"0 0 4px",fontSize:7,color:C.text4}}>Panca+Squat+Stacchi 1RM stimato</p>
            <p style={{margin:0,fontSize:28,fontWeight:900,color:wilksColor,lineHeight:1}}>{wilks||"—"}</p>
          </div>
          <div style={{textAlign:"right"}}>
            <span style={{fontSize:10,fontWeight:700,color:wilksColor,background:wilksColor+"18",borderRadius:6,padding:"4px 10px",letterSpacing:1}}>{wilksLabel}</span>
            {bwKg&&<p style={{margin:"6px 0 0",fontSize:8,color:C.text4}}>BW: {bwKg}kg · Big3: {big3Total}kg</p>}
            {!bwKg&&<p style={{margin:"6px 0 0",fontSize:8,color:"#f97316"}}>Inserisci peso corpo nella tab Fisico</p>}
          </div>
        </div>
        {wilks&&(
          <div style={{marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              {[200,300,400,500].map(v=>(
                <span key={v} style={{fontSize:7,color:wilks>=v?"#fff":C.text4,fontWeight:wilks>=v?700:400}}>{v}</span>
              ))}
            </div>
            <div style={{height:8,borderRadius:4,background:`linear-gradient(90deg,#6b7280,#3b82f6 33%,#10b981 55%,#f59e0b 75%,#ef4444)`,position:"relative"}}>
              <div style={{position:"absolute",top:-3,left:`${Math.min((wilks/600)*100,97)}%`,
                width:14,height:14,borderRadius:"50%",background:"#fff",border:"3px solid "+wilksColor,
                transform:"translateX(-50%)",boxShadow:"0 2px 8px #0008",transition:"left 0.8s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
              {["Princ.","Novice","Inter.","Avanz.","Elite"].map((l,i)=>(
                <span key={l} style={{fontSize:6,color:C.text4,flex:1,textAlign:i===0?"left":i===4?"right":"center"}}>{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Per-exercise standards */}
      {liftsWithData.length>0&&(
        <div style={S.card}>
          <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>STRENGTH STANDARDS PER ESERCIZIO</p>
          {liftsWithData.map(name=>{
            const rec=records[name];
            const std=getStrengthStd(name,rec.orm,bwKg,gender==="m");
            if(!std)return(
              <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid "+C.border}}>
                <span style={{fontSize:10,color:C.text2}}>{name}</span>
                <span style={{fontSize:10,fontWeight:700,color:"#ef4444"}}>{rec.orm}kg 1RM</span>
                <span style={{fontSize:8,color:C.text4}}>Inserisci BW</span>
              </div>
            );
            const pct=std.next?Math.min(std.ratio/std.next*100,100):100;
            return(
              <div key={name} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.text}}>{name}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:10,fontWeight:900,color:C.text3}}>{rec.orm}kg</span>
                    <span style={{fontSize:9,fontWeight:700,color:std.color,background:std.color+"18",borderRadius:5,padding:"2px 8px"}}>{std.label}</span>
                  </div>
                </div>
                <div style={{height:6,borderRadius:3,background:C.bg4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,${std.color}88,${std.color})`,borderRadius:3,transition:"width 0.6s"}}/>
                </div>
                {std.next&&<p style={{margin:"3px 0 0",fontSize:7,color:C.text4}}>Prossimo livello: {Math.round(std.next*bwKg)}kg ({std.ratio}× BW → {std.next}×)</p>}
              </div>
            );
          })}
          {!bwKg&&<p style={{margin:"8px 0 0",fontSize:9,color:"#f97316",textAlign:"center"}}>⚠ Inserisci il tuo peso corporeo nella tab Fisico per vedere i livelli</p>}
        </div>
      )}

      {/* Push/Pull balance */}
      {pp&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>PUSH / PULL BALANCE (4 settimane)</p>
            <span style={{fontSize:9,fontWeight:700,
              color:pp.status==="BILANCIATO"?"#10b981":pp.status==="PULL DOMINANTE"?"#3b82f6":"#f97316",
              background:(pp.status==="BILANCIATO"?"#10b981":pp.status==="PULL DOMINANTE"?"#3b82f6":"#f97316")+"18",
              borderRadius:5,padding:"2px 8px",letterSpacing:0.5}}>{pp.status}</span>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            {[["🔴 PUSH",pp.pushVol,pp.pushPct,"#ef4444"],["🔵 PULL",pp.pullVol,pp.pullPct,"#3b82f6"]].map(([l,v,pct,col])=>(
              <div key={l} style={{flex:1,background:C.bg3,borderRadius:10,padding:"10px",textAlign:"center"}}>
                <p style={{margin:"0 0 2px",fontSize:9,color:col,fontWeight:700}}>{l}</p>
                <p style={{margin:"0 0 1px",fontSize:16,fontWeight:900,color:C.text}}>{v>=1000?(v/1000).toFixed(1)+"t":v+"kg"}</p>
                <p style={{margin:0,fontSize:11,color:C.text3}}>{pct}%</p>
              </div>
            ))}
          </div>
          <div style={{height:10,borderRadius:5,background:C.bg4,overflow:"hidden",display:"flex"}}>
            <div style={{width:pp.pushPct+"%",background:"#ef4444",transition:"width 0.6s"}}/>
            <div style={{flex:1,background:"#3b82f6"}}/>
          </div>
          {pp.ratio&&(
            <p style={{margin:"6px 0 0",fontSize:9,color:C.text3}}>
              Rapporto Push:Pull = <strong style={{color:pp.ratio>=0.8&&pp.ratio<=1.3?"#10b981":"#f97316"}}>{pp.ratio}:1</strong>
              {" "}(ideale: 0.8–1.2)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── SMART TDEE CARD ──
// ══════════════════════════════════════════════
function SmartTDEECard({sessions,bwEntries,actEntries,nutrEntries,C,S}){
  const [age,setAge]=React.useState(()=>db("il_age")||25);
  const [height,setHeight]=React.useState(()=>db("il_height")||175);
  const [gender,setGender]=React.useState(()=>db("il_gender")||"m");
  const lastBw=bwEntries&&bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const bwKg=lastBw?lastBw.w:null;
  const bmr=calcBMR(bwKg,height,age,gender==="m");
  const tdeeData=calcSmartTDEE(bmr,sessions,actEntries);
  const save=()=>{db("il_age",age);db("il_height",height);};

  return(
    <div style={{...S.card,marginBottom:10}}>
      <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>🧮 TDEE INTELLIGENTE (Mifflin-St Jeor)</p>
      {/* Inputs */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <div>
          <label style={{fontSize:8,color:C.text4,letterSpacing:1,display:"block",marginBottom:3}}>ETÀ</label>
          <input type="number" inputMode="numeric" value={age} onBlur={save}
            onChange={e=>{setAge(parseInt(e.target.value)||25);}}
            style={{width:"100%",background:C.bg3,border:"1px solid "+C.border2,borderRadius:8,padding:"8px 10px",
              color:C.text,fontSize:16,fontFamily:"inherit",outline:"none",textAlign:"center",fontWeight:700}}/>
        </div>
        <div>
          <label style={{fontSize:8,color:C.text4,letterSpacing:1,display:"block",marginBottom:3}}>ALTEZZA (cm)</label>
          <input type="number" inputMode="numeric" value={height} onBlur={save}
            onChange={e=>{setHeight(parseInt(e.target.value)||175);}}
            style={{width:"100%",background:C.bg3,border:"1px solid "+C.border2,borderRadius:8,padding:"8px 10px",
              color:C.text,fontSize:16,fontFamily:"inherit",outline:"none",textAlign:"center",fontWeight:700}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {[["m","♂"],["f","♀"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setGender(k);db("il_gender",k);}}
            style={{flex:1,padding:"7px",borderRadius:8,border:"none",
              background:gender===k?"#ef4444":C.bg3,color:gender===k?"#fff":C.text3,
              fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:gender===k?700:400}}>
            {l}
          </button>
        ))}
      </div>

      {bmr?(
        <>
          {/* BMR */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            background:C.bg3,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <div>
              <p style={{margin:"0 0 1px",fontSize:8,color:C.text4,letterSpacing:1}}>BMR (a riposo totale)</p>
              <p style={{margin:0,fontSize:7,color:C.text4}}>Calorie bruciate senza fare nulla</p>
            </div>
            <p style={{margin:0,fontSize:20,fontWeight:900,color:C.text}}>{bmr} <span style={{fontSize:10,color:C.text4}}>kcal</span></p>
          </div>
          {tdeeData&&(
            <>
              {/* TDEE */}
              <div style={{background:`linear-gradient(135deg,#ef444418,#f9731618)`,border:"1px solid #ef444430",
                borderRadius:12,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <p style={{margin:"0 0 1px",fontSize:9,letterSpacing:2,color:"#ef4444"}}>TDEE CALCOLATO</p>
                    <p style={{margin:0,fontSize:7,color:C.text4}}>Basato su {tdeeData.wkFreq} allenamenti/settimana (4w)</p>
                  </div>
                  <p style={{margin:0,fontSize:28,fontWeight:900,color:"#ef4444"}}>{tdeeData.tdee}</p>
                </div>
                <p style={{margin:0,fontSize:8,color:C.text3}}>Moltiplicatore attività: <strong style={{color:"#ef4444"}}>{tdeeData.mult}x</strong></p>
              </div>
              {/* Goals */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {[["🏗 Bulk",tdeeData.bulk,"#10b981","deficit+300"],
                  ["⚖️ Maintain",tdeeData.maintain,"#3b82f6",""],
                  ["✂️ Cut",tdeeData.cut,"#ef4444","-500"]].map(([l,v,col,sub])=>(
                  <div key={l} style={{background:C.bg3,borderRadius:10,padding:"10px 6px",textAlign:"center",border:"1px solid "+col+"33"}}>
                    <p style={{margin:"0 0 2px",fontSize:9,color:col,fontWeight:700}}>{l}</p>
                    <p style={{margin:"0 0 1px",fontSize:16,fontWeight:900,color:C.text}}>{v}</p>
                    <p style={{margin:0,fontSize:7,color:C.text4}}>kcal/giorno</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {!bwKg&&<p style={{margin:"8px 0 0",fontSize:9,color:"#f97316",textAlign:"center"}}>⚠ Inserisci il peso corporeo nella tab Fisico per il calcolo TDEE</p>}
        </>
      ):(
        <p style={{textAlign:"center",color:C.text4,fontSize:10,padding:"16px 0"}}>Inserisci età, altezza e peso corporeo per calcolare il TDEE</p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── CARB CYCLING CARD ──
// ══════════════════════════════════════════════
function CarbCyclingCard({nutrEntries,sessions,bwEntries,actEntries,C,S}){
  const [age]=React.useState(()=>db("il_age")||25);
  const [height]=React.useState(()=>db("il_height")||175);
  const [gender]=React.useState(()=>db("il_gender")||"m");
  const lastBw=bwEntries&&bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const bwKg=lastBw?lastBw.w:null;
  const bmr=calcBMR(bwKg,height,age,gender==="m");
  const tdeeData=calcSmartTDEE(bmr,sessions,actEntries);
  const cc=getCarbCycling(nutrEntries,sessions,tdeeData?tdeeData.tdee:null);
  const pts=getProteinTimingScore(nutrEntries,sessions);

  if(!cc)return(
    <div style={{...S.card,textAlign:"center",padding:"20px 12px",marginBottom:10}}>
      <p style={{fontSize:24,margin:"0 0 8px"}}>🔄</p>
      <p style={{fontSize:10,color:C.text3}}>Registra almeno 5 giorni di nutrizione e configura il TDEE per le raccomandazioni carb cycling.</p>
    </div>
  );

  const trainDates=new Set(sessions.map(s=>s.date));
  const lastDays=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-i);
    return localISO(d);
  }).reverse();

  return(
    <div style={{marginBottom:10}}>
      <div style={{...S.card,marginBottom:10}}>
        <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>🔄 CARB CYCLING PROTOCOL</p>
        <div style={{background:"#3b82f618",border:"1px solid #3b82f630",borderRadius:10,padding:"10px 12px",marginBottom:10}}>
          <p style={{margin:"0 0 6px",fontSize:9,fontWeight:700,color:"#3b82f6",letterSpacing:1}}>💡 RACCOMANDAZIONE</p>
          <p style={{margin:0,fontSize:10,color:C.text2,lineHeight:1.5}}>{cc.recommendation}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[
            ["🏋️ GIORNO ALLENAMENTO",cc.highCarbKcal,cc.highCarb,cc.highProt,"#ef4444"],
            ["😴 GIORNO RIPOSO",cc.lowCarbKcal,cc.lowCarb,cc.lowProt,"#3b82f6"],
          ].map(([label,kcal,carb,prot,col])=>(
            <div key={label} style={{background:C.bg3,borderRadius:12,padding:"12px 10px",border:"1px solid "+col+"33"}}>
              <p style={{margin:"0 0 8px",fontSize:8,color:col,fontWeight:700,letterSpacing:0.5}}>{label}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                {[["Kcal",kcal,"#f97316"],["Carb",carb+"g","#f59e0b"],["Prot",prot+"g","#10b981"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <p style={{margin:"0 0 1px",fontSize:7,color:C.text4}}>{l}</p>
                    <p style={{margin:0,fontSize:13,fontWeight:900,color:c}}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* 7-day plan */}
        <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:C.text4}}>PIANO 7 GIORNI</p>
        <div style={{display:"flex",gap:3}}>
          {lastDays.map(d=>{
            const isTrain=trainDates.has(d);
            const dow=["L","M","M","G","V","S","D"][(new Date(d).getDay()+6)%7];
            const isToday=d===todayISO();
            return(
              <div key={d} style={{flex:1,textAlign:"center"}}>
                <div style={{width:"100%",paddingBottom:"100%",borderRadius:8,position:"relative",
                  background:isTrain?"#ef444433":"#3b82f633",
                  border:isToday?"2px solid "+(isTrain?"#ef4444":"#3b82f6"):"2px solid transparent"}}>
                  <span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                    fontSize:11}}>{isTrain?"🏋":"😴"}</span>
                </div>
                <p style={{margin:"3px 0 0",fontSize:7,color:isToday?C.text:C.text4,fontWeight:isToday?700:400}}>{dow}</p>
                <p style={{margin:0,fontSize:6,color:isTrain?"#ef4444":"#3b82f6",fontWeight:700}}>{isTrain?"HIGH":"LOW"}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Protein timing */}
      {pts!==null&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>⏰ PROTEIN TIMING SCORE</p>
            <span style={{fontSize:18,fontWeight:900,color:pts>=70?"#10b981":pts>=40?"#f59e0b":"#ef4444"}}>{pts}/100</span>
          </div>
          <div style={{height:8,borderRadius:4,background:C.bg4,overflow:"hidden",marginBottom:8}}>
            <div style={{height:"100%",width:pts+"%",background:pts>=70?"#10b981":pts>=40?"#f59e0b":"#ef4444",
              borderRadius:4,transition:"width 0.7s"}}/>
          </div>
          <p style={{margin:0,fontSize:9,color:C.text3,lineHeight:1.5}}>
            {pts>=70?"Ottima distribuzione proteica! Stai massimizzando la sintesi proteica muscolare.":
             pts>=40?"Distribuzione discreta. Prova a mantenere le proteine costanti fra 120–160g/giorno.":
             "Assunzione proteica irregolare. La consistenza è fondamentale per la composizione corporea."}
          </p>
        </div>
      )}
    </div>
  );
}


// ── ANALISI PANEL (proper component - no hooks in IIFE) ──
function AnalisiPanel({sessions,bwEntries,actEntries,nutrEntries,tdeeEntries,records,themePrefs,setThemePrefs,C,S}){
  const [atab,setAtab]=React.useState("forza");
  const atabs=[["forza","📐 Forza"],["nutriscienza","🧪 Nutri"],["dashboard","🧬 Stats"],["tema","🎨"],["notifiche","🔔"]];
  return(
    <div className="fade-up">
      <div style={{display:"flex",gap:3,marginBottom:12,background:C.bg3,borderRadius:10,padding:4}}>
        {atabs.map(([k,l])=>(
          <button key={k} onClick={()=>setAtab(k)}
            style={{flex:1,padding:"7px 2px",borderRadius:8,border:"none",
              background:atab===k?C.bg2:"transparent",color:atab===k?C.text:C.text3,
              fontSize:9,fontWeight:atab===k?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
            {l}
          </button>
        ))}
      </div>
      {atab==="forza"&&(
        <div>
          <StrengthStandardsCard sessions={sessions} bwEntries={bwEntries} C={C} S={S}/>
          <VolumeLandmarkPanel sessions={sessions} C={C} S={S}/>
          <PlateauProjectionPanel sessions={sessions} C={C} S={S}/>
        </div>
      )}
      {atab==="nutriscienza"&&(
        <div>
          <SmartTDEECard sessions={sessions} bwEntries={bwEntries} actEntries={actEntries} nutrEntries={nutrEntries} C={C} S={S}/>
          <CarbCyclingCard nutrEntries={nutrEntries} sessions={sessions} bwEntries={bwEntries} actEntries={actEntries} C={C} S={S}/>
          <NutrPerfPanel sessions={sessions} nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} bwEntries={bwEntries} C={C} S={S}/>
        </div>
      )}
      {atab==="dashboard"&&(
        <div>
          <FaticaCard sessions={sessions} actEntries={actEntries} C={C} S={S}/>
          <FFMIPanel bwEntries={bwEntries} C={C} S={S}/>
          <MonthlyCompare sessions={sessions} nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} actEntries={actEntries} C={C} S={S}/>
          <div style={S.card}>
            <p style={{margin:"0 0 12px",fontSize:9,letterSpacing:2,color:C.text3}}>🍎 NUTRIZIONE AVANZATA</p>
            <NutrNerdDash nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} bwEntries={bwEntries} sessions={sessions} C={C} S={S}/>
          </div>
        </div>
      )}
      {atab==="tema"&&(
        <div>
          <ThemePanel themePrefs={themePrefs} setThemePrefs={setThemePrefs} C={C} S={S}/>
        </div>
      )}
      {atab==="notifiche"&&(
        <div>
          <NotificationCenter sessions={sessions} actEntries={actEntries} C={C} S={S}/>
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════
// ── VOLUME LANDMARKS PANEL ──
// ══════════════════════════════════════════════
function VolumeLandmarkPanel({sessions,C,S}){
  const avg = getWeeklySetsByMuscle(sessions, 4);
  const muscles = MUSCLE_GROUPS.filter(m => VOLUME_LANDMARKS[m]);
  return(
    <div style={S.card}>
      <p style={{margin:"0 0 4px",fontSize:9,letterSpacing:2,color:C.text3}}>📊 VOLUME LANDMARKS — SERIE/SETTIMANA (media 4w)</p>
      <p style={{margin:"0 0 12px",fontSize:8,color:C.text4}}>MEV = Minimo Efficace · MAV = Massimo Adattativo · MRV = Massimo Recuperabile</p>
      {muscles.map(m => {
        const lm = VOLUME_LANDMARKS[m];
        const s = avg[m] || 0;
        const st = getVolumeStatus(m, s);
        const barW = st ? Math.min(st.pct, 100) : 0;
        return(
          <div key={m} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:10,fontWeight:700,color:MUSCLE_COLORS[m]}}>{m}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,fontWeight:900,color:C.text}}>{s} serie/w</span>
                <span style={{fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:5,
                  background:st?st.color+"22":"transparent",color:st?st.color:C.text4}}>
                  {st?st.zone:"N/D"}
                </span>
              </div>
            </div>
            <div style={{position:"relative",height:8,borderRadius:4,background:C.bg4,overflow:"visible"}}>
              <div style={{height:"100%",width:barW+"%",background:st?st.color:"#374151",borderRadius:4,transition:"width 0.7s"}}/>
              {[lm.mev,lm.mav,lm.mrv].map((v,i)=>{
                const x = Math.min(v/lm.mrv*100, 100);
                const labels=["MEV","MAV","MRV"];
                const cols=["#ef4444","#f59e0b","#8b5cf6"];
                return(
                  <div key={i} style={{position:"absolute",top:-2,left:x+"%",
                    width:2,height:12,background:cols[i],borderRadius:1,transform:"translateX(-50%)"}}/>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
              {[["MEV",lm.mev,"#ef4444"],["MAV",lm.mav,"#f59e0b"],["MRV",lm.mrv,"#8b5cf6"]].map(([l,v,c])=>(
                <span key={l} style={{fontSize:7,color:s>=v?c:C.text4}}>
                  {l}: {v}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      {(()=>{
        const deficits = muscles.filter(m => (avg[m]||0) < VOLUME_LANDMARKS[m].mev);
        if (!deficits.length) return(
          <div style={{background:"#10b98118",border:"1px solid #10b98130",borderRadius:8,padding:"8px 12px",marginTop:4}}>
            <p style={{margin:0,fontSize:9,color:"#10b981"}}>✅ Tutti i muscoli sopra MEV questa settimana!</p>
          </div>
        );
        return(
          <div style={{background:"#ef444418",border:"1px solid #ef444430",borderRadius:8,padding:"8px 12px",marginTop:4}}>
            <p style={{margin:"0 0 4px",fontSize:9,fontWeight:700,color:"#ef4444"}}>⚠ MUSCOLI SOTTO MEV</p>
            <p style={{margin:0,fontSize:9,color:C.text2,lineHeight:1.5}}>
              {deficits.join(", ")} — aumenta le serie settimanali per stimolo minimo efficace.
            </p>
          </div>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── PLATEAU DETECTOR + 1RM PROJECTION ──
// ══════════════════════════════════════════════
function PlateauProjectionPanel({sessions,C,S}){
  const records = getRecords(sessions);
  const mainLifts = Object.keys(records).slice(0, 8);
  const [selEx, setSelEx] = React.useState(mainLifts[0]||"");
  if (!mainLifts.length) return(
    <div style={{...S.card,textAlign:"center",padding:"20px 12px"}}>
      <p style={{fontSize:10,color:C.text3}}>Registra almeno 4 sessioni per vedere le proiezioni.</p>
    </div>
  );
  const plateau = selEx ? detectPlateau(selEx, sessions) : null;
  const proj    = selEx ? getORMProjection(selEx, sessions) : null;
  return(
    <div style={S.card}>
      <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>📈 PLATEAU DETECTOR + PROIEZIONE 1RM</p>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
        {mainLifts.map(n=>(
          <button key={n} onClick={()=>setSelEx(n)}
            style={{padding:"5px 10px",borderRadius:8,border:"none",fontSize:9,cursor:"pointer",fontFamily:"inherit",
              background:selEx===n?"#ef4444":C.bg3,color:selEx===n?"#fff":C.text3,fontWeight:selEx===n?700:400}}>
            {n}
          </button>
        ))}
      </div>
      {plateau&&(
        <div style={{background:plateau.isPlateau?"#ef444418":"#10b98118",
          border:"1px solid "+(plateau.isPlateau?"#ef444430":"#10b98130"),
          borderRadius:10,padding:"10px 12px",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p style={{margin:"0 0 2px",fontSize:10,fontWeight:700,
                color:plateau.isPlateau?"#ef4444":"#10b981"}}>
                {plateau.isPlateau?"🔴 PLATEAU RILEVATO":"🟢 PROGRESSIONE OK"}
              </p>
              <p style={{margin:0,fontSize:8,color:C.text4}}>
                Ultime {plateau.sessions} sessioni · variazione: {plateau.variance}kg
              </p>
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{margin:0,fontSize:18,fontWeight:900,color:C.text}}>{plateau.maxW}kg</p>
              <p style={{margin:0,fontSize:8,color:C.text4}}>1RM massimo recente</p>
            </div>
          </div>
          {plateau.isPlateau&&(
            <p style={{margin:"8px 0 0",fontSize:9,color:C.text2,lineHeight:1.5}}>
              💡 Strategie: deload 1 settimana, cambia rep range, aumenta volume prima di peso, prova variante esercizio.
            </p>
          )}
        </div>
      )}
      {proj?(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{margin:0,fontSize:9,color:C.text3}}>Progressione lineare (R²={proj.r2}%)</p>
            <span style={{fontSize:9,color:proj.weeklyGain>=0?"#10b981":"#ef4444",fontWeight:700}}>
              {proj.weeklyGain>=0?"+":""}{proj.weeklyGain} kg/settimana
            </span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {proj.projections.map(p=>(
              <div key={p.weeks} style={{background:C.bg3,borderRadius:10,padding:"10px 8px",textAlign:"center",
                border:"1px solid "+(p.orm>proj.currentOrm?"#10b98130":C.border)}}>
                <p style={{margin:"0 0 2px",fontSize:8,color:C.text4}}>+{p.weeks} settimane</p>
                <p style={{margin:"0 0 1px",fontSize:18,fontWeight:900,
                  color:p.orm>proj.currentOrm?"#10b981":"#ef4444"}}>{p.orm}kg</p>
                <p style={{margin:0,fontSize:8,color:C.text3}}>1RM stimato</p>
                {p.orm>proj.currentOrm&&(
                  <p style={{margin:"3px 0 0",fontSize:7,color:"#10b981"}}>
                    +{p.orm-proj.currentOrm}kg
                  </p>
                )}
              </div>
            ))}
          </div>
          {proj.r2<40&&(
            <p style={{margin:"8px 0 0",fontSize:8,color:"#f97316"}}>
              ⚠ R²={proj.r2}% — progressione irregolare, la proiezione è indicativa.
            </p>
          )}
        </div>
      ):(
        <p style={{fontSize:9,color:C.text4,textAlign:"center",padding:"8px 0"}}>
          Servono almeno 4 sessioni su questo esercizio per la proiezione.
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── FFMI + BODY AESTHETICS PANEL ──
// ══════════════════════════════════════════════
function FFMIPanel({bwEntries,C,S}){
  const [waist,  setWaist]   = React.useState(()=>db("il_waist")||0);
  const [hip,    setHip]     = React.useState(()=>db("il_hip")||0);
  const [shoulder,setShoulder]=React.useState(()=>db("il_shoulder")||0);
  const [height, setHeight]  = React.useState(()=>db("il_height")||175);
  const save = (k,v) => db(k,v);

  const lastBw = bwEntries&&bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const wKg    = lastBw?lastBw.w:null;
  const fatPct = lastBw?lastBw.fat:null;
  const ffmiData = calcFFMI(wKg, height, fatPct);
  const ratios   = getBodyRatios(wKg, height, waist||null, hip||null, shoulder||null);

  return(
    <div>
      {/* Measurements input */}
      <div style={{...S.card,marginBottom:10}}>
        <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>📏 MISURE CORPOREE</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[["Altezza cm","il_height",height,setHeight],
            ["Vita cm","il_waist",waist,setWaist],
            ["Fianchi cm","il_hip",hip,setHip],
            ["Spalle cm","il_shoulder",shoulder,setShoulder],
          ].map(([label,key,val,setter])=>(
            <div key={key}>
              <label style={{fontSize:7,color:C.text4,letterSpacing:1,display:"block",marginBottom:3}}>{label}</label>
              <input type="number" inputMode="decimal" value={val||""}
                onChange={e=>{const v=parseFloat(e.target.value)||0;setter(v);save(key,v);}}
                style={{width:"100%",background:C.bg3,border:"1px solid "+C.border2,borderRadius:8,
                  padding:"8px 6px",color:C.text,fontSize:14,fontFamily:"inherit",outline:"none",
                  textAlign:"center",fontWeight:700}}/>
            </div>
          ))}
        </div>
        {(!wKg||fatPct==null)&&(
          <p style={{margin:"8px 0 0",fontSize:8,color:"#f97316"}}>
            ⚠ Inserisci peso e % grasso nella tab Fisico per calcolare FFMI.
          </p>
        )}
      </div>

      {/* FFMI Card */}
      {ffmiData&&(
        <div style={{...S.card,marginBottom:10,borderLeft:"3px solid "+ffmiData.color}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <p style={{margin:"0 0 2px",fontSize:9,letterSpacing:2,color:C.text3}}>FFMI NORMALIZZATO</p>
              <p style={{margin:"0 0 4px",fontSize:7,color:C.text4}}>Fat-Free Mass Index (norm. per altezza)</p>
              <p style={{margin:0,fontSize:32,fontWeight:900,color:ffmiData.color,lineHeight:1}}>
                {ffmiData.normalized}
              </p>
            </div>
            <div style={{textAlign:"right"}}>
              <span style={{fontSize:11,fontWeight:700,color:ffmiData.color,
                background:ffmiData.color+"22",borderRadius:6,padding:"4px 10px"}}>
                {ffmiData.level}
              </span>
              <p style={{margin:"6px 0 0",fontSize:8,color:C.text4}}>
                Massa magra: {ffmiData.leanMass}kg
              </p>
            </div>
          </div>
          {/* Scale */}
          <div style={{marginBottom:6}}>
            <div style={{height:8,borderRadius:4,
              background:"linear-gradient(90deg,#6b7280,#3b82f6 30%,#10b981 50%,#f59e0b 70%,#ef4444 85%,#8b5cf6)",
              position:"relative"}}>
              <div style={{position:"absolute",top:-3,
                left:Math.min(ffmiData.normalized/30*100,97)+"%",
                width:14,height:14,borderRadius:"50%",background:"#fff",
                border:"3px solid "+ffmiData.color,transform:"translateX(-50%)",
                boxShadow:"0 2px 8px #0008",transition:"left 0.8s"}}/>
              <div style={{position:"absolute",top:-3,left:(25/30*100)+"%",
                width:2,height:14,background:"#ffffff60",borderRadius:1}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
              {[["16","Sotto"],["20","Media"],["22","Buono"],["25","Nat. limit"],["28","Elite"]].map(([v,l])=>(
                <div key={v} style={{textAlign:"center"}}>
                  <p style={{margin:0,fontSize:6,color:C.text4}}>{v}</p>
                  <p style={{margin:0,fontSize:6,color:C.text4}}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:6}}>
            {[["FFMI grezzo",ffmiData.ffmi],["Limite natural",ffmiData.naturalLimit],
              ["% al limite",Math.round(ffmiData.pctToNatLimit)+"%"],["Body fat",fatPct+"%"]
            ].map(([l,v])=>(
              <div key={l} style={{background:C.bg3,borderRadius:8,padding:"7px 10px"}}>
                <p style={{margin:"0 0 1px",fontSize:7,color:C.text4}}>{l}</p>
                <p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body ratios */}
      {ratios.length>0&&(
        <div style={S.card}>
          <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>📐 RAPPORTI ESTETICI</p>
          {ratios.map(r=>(
            <div key={r.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"9px 0",borderBottom:"1px solid "+C.border}}>
              <div>
                <p style={{margin:"0 0 2px",fontSize:10,fontWeight:700,color:C.text}}>{r.name}</p>
                <p style={{margin:0,fontSize:8,color:C.text4}}>Ideale: {r.ideal}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{margin:"0 0 2px",fontSize:18,fontWeight:900,color:r.color}}>{r.value}</p>
                <span style={{fontSize:8,fontWeight:700,color:r.color,
                  background:r.color+"22",borderRadius:4,padding:"2px 6px"}}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── NUTRITION ↔ PERFORMANCE PANEL ──
// ══════════════════════════════════════════════
function NutrPerfPanel({sessions,nutrEntries,tdeeEntries,bwEntries,C,S}){
  const corr = getNutrPerfCorrelation(sessions, nutrEntries);
  const lastBw = bwEntries&&bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const bwKg = lastBw?lastBw.w:null;
  const diet = getDietQualityScore(nutrEntries, tdeeEntries, sessions, bwKg);

  return(
    <div>
      {/* Diet Quality Score */}
      {diet?(
        <div style={{...S.card,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>🏆 DIET QUALITY SCORE</p>
            <div style={{textAlign:"center"}}>
              <span style={{fontSize:32,fontWeight:900,color:diet.gradeColor,lineHeight:1}}>{diet.grade}</span>
              <p style={{margin:0,fontSize:10,fontWeight:700,color:diet.gradeColor}}>{diet.score}/100</p>
            </div>
          </div>
          <div style={{height:10,borderRadius:5,background:C.bg4,overflow:"hidden",marginBottom:12}}>
            <div style={{height:"100%",width:diet.score+"%",
              background:"linear-gradient(90deg,#ef4444,#f59e0b 50%,#10b981)",
              borderRadius:5,transition:"width 0.8s"}}/>
          </div>
          {diet.breakdown.map(b=>(
            <div key={b.label} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:9,color:C.text2}}>{b.label}</span>
                <span style={{fontSize:9,fontWeight:700,
                  color:b.score/b.max>=0.8?"#10b981":b.score/b.max>=0.5?"#f59e0b":"#ef4444"}}>
                  {b.score}/{b.max}
                </span>
              </div>
              <div style={{height:5,borderRadius:3,background:C.bg4}}>
                <div style={{height:"100%",width:(b.score/b.max*100)+"%",borderRadius:3,
                  background:b.score/b.max>=0.8?"#10b981":b.score/b.max>=0.5?"#f59e0b":"#ef4444",
                  transition:"width 0.6s"}}/>
              </div>
              <p style={{margin:"2px 0 0",fontSize:7,color:C.text4}}>{b.note}</p>
            </div>
          ))}
        </div>
      ):(
        <div style={{...S.card,marginBottom:10,textAlign:"center",padding:"16px"}}>
          <p style={{fontSize:10,color:C.text3}}>Registra almeno 5 giorni di nutrizione per il Diet Score.</p>
        </div>
      )}

      {/* Correlation panel */}
      {corr?(
        <div style={S.card}>
          <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>
            🔗 CORRELAZIONE KCAL → VOLUME ({corr.n} sessioni analizzate)
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[
              ["📉 Giorni BASSE kcal",corr.avgKcalLow+"kcal",corr.avgVolLow,"#3b82f6"],
              ["📈 Giorni ALTE kcal",corr.avgKcalHigh+"kcal",corr.avgVolHigh,"#10b981"],
            ].map(([l,kcal,vol,col])=>(
              <div key={l} style={{background:C.bg3,borderRadius:12,padding:"12px 10px",textAlign:"center",
                border:"1px solid "+col+"33"}}>
                <p style={{margin:"0 0 4px",fontSize:8,color:col,fontWeight:700}}>{l}</p>
                <p style={{margin:"0 0 2px",fontSize:11,color:C.text3}}>{kcal} media</p>
                <p style={{margin:"0 0 1px",fontSize:20,fontWeight:900,color:col}}>
                  {vol>=1000?(vol/1000).toFixed(1)+"t":vol+"kg"}
                </p>
                <p style={{margin:0,fontSize:8,color:C.text4}}>volume allenamento</p>
              </div>
            ))}
          </div>
          <div style={{background:corr.volDeltaPct>5?"#10b98118":corr.volDeltaPct<-5?"#ef444418":"#3b82f618",
            border:"1px solid "+(corr.volDeltaPct>5?"#10b98130":corr.volDeltaPct<-5?"#ef444430":"#3b82f630"),
            borderRadius:10,padding:"10px 12px"}}>
            <p style={{margin:"0 0 4px",fontSize:10,fontWeight:700,
              color:corr.volDeltaPct>5?"#10b981":corr.volDeltaPct<-5?"#ef4444":"#3b82f6"}}>
              {corr.volDeltaPct>5
                ? "✅ Mangi di più → alleni di più (correlazione positiva)"
                : corr.volDeltaPct<-5
                ? "⚠️ Le calorie alte non migliorano le performance"
                : "➡️ Le calorie non influenzano significativamente il volume"}
            </p>
            <p style={{margin:0,fontSize:9,color:C.text2}}>
              Differenza volume: <strong style={{color:corr.volDeltaPct>=0?"#10b981":"#ef4444"}}>
                {corr.volDeltaPct>=0?"+":""}{corr.volDeltaPct}%
              </strong> nei giorni ad alto apporto calorico
              {corr.regKcal&&<span style={{color:C.text4}}> · R²={Math.round(corr.regKcal.r2*100)}%</span>}
            </p>
          </div>
        </div>
      ):(
        <div style={{...S.card,textAlign:"center",padding:"16px"}}>
          <p style={{fontSize:10,color:C.text3}}>Servono almeno 5 giorni con dati sia di nutrizione che allenamento.</p>
        </div>
      )}
    </div>
  );
}


// ── THEME PANEL ──
function ThemePanel({themePrefs, setThemePrefs, C, S}){
  const set = (key, val) => {
    const next = {...themePrefs, [key]: val};
    setThemePrefs(next);
    saveThemePrefs(next);
  };
  const isDark = !themePrefs.mode.startsWith("light");
  const darkModes  = Object.entries(THEME_MODES).filter(([k])=>!k.startsWith("light"));
  const lightModes = Object.entries(THEME_MODES).filter(([k])=>k.startsWith("light"));
  return(
    <div>
      {/* Dark variants */}
      <div style={{...S.card, marginBottom:10}}>
        <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>🌙 MODALITÀ DARK</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {darkModes.map(([k,m])=>{
            const active = themePrefs.mode===k;
            return(
              <button key={k} onClick={()=>set("mode",k)}
                style={{padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                  border:"2px solid "+(active?"#ef4444":C.border2),
                  background:active?"#ef444418":C.bg3,
                  transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  {/* Color preview */}
                  <div style={{display:"flex",gap:2}}>
                    {[m.bg,m.bg2,m.bg3].map((col,i)=>(
                      <div key={i} style={{width:10,height:10,borderRadius:2,background:col,border:"1px solid "+m.border}}/>
                    ))}
                  </div>
                  {active&&<span style={{fontSize:7,color:"#ef4444",fontWeight:700}}>✓</span>}
                </div>
                <p style={{margin:0,fontSize:10,fontWeight:active?700:400,color:active?"#ef4444":C.text}}>{m.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Light variants */}
      <div style={{...S.card, marginBottom:10}}>
        <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>☀️ MODALITÀ LIGHT</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {lightModes.map(([k,m])=>{
            const active = themePrefs.mode===k;
            return(
              <button key={k} onClick={()=>set("mode",k)}
                style={{padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                  border:"2px solid "+(active?"#ef4444":C.border2),
                  background:active?"#ef444418":C.bg3,
                  transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{display:"flex",gap:2}}>
                    {[m.bg,m.bg2,m.bg3].map((col,i)=>(
                      <div key={i} style={{width:10,height:10,borderRadius:2,background:col,border:"1px solid "+m.border}}/>
                    ))}
                  </div>
                  {active&&<span style={{fontSize:7,color:"#ef4444",fontWeight:700}}>✓</span>}
                </div>
                <p style={{margin:0,fontSize:10,fontWeight:active?700:400,color:active?"#ef4444":C.text}}>{m.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Density */}
      <div style={S.card}>
        <p style={{margin:"0 0 10px",fontSize:9,letterSpacing:2,color:C.text3}}>📱 DENSITÀ UI</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {Object.entries(DENSITY_MODES).map(([k,d])=>{
            const active = themePrefs.density===k;
            return(
              <button key={k} onClick={()=>set("density",k)}
                style={{padding:"12px 6px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",textAlign:"center",
                  border:"2px solid "+(active?"#ef4444":C.border2),
                  background:active?"#ef444418":C.bg3,
                  transition:"all 0.2s"}}>
                <p style={{margin:"0 0 3px",fontSize:14}}>{d.label.split(" ")[0]}</p>
                <p style={{margin:0,fontSize:9,fontWeight:active?700:400,color:active?"#ef4444":C.text}}>
                  {d.label.split(" ").slice(1).join(" ")}
                </p>
                {/* Density preview bars */}
                <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:k==="compact"?1:k==="normal"?2:4,alignItems:"center"}}>
                  {[1,2,3].map(i=>(
                    <div key={i} style={{width:"80%",height:k==="compact"?3:k==="normal"?4:5,
                      borderRadius:2,background:active?"#ef444460":C.bg4}}/>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
        <p style={{margin:"10px 0 0",fontSize:8,color:C.text4,textAlign:"center"}}>
          Le modifiche si applicano immediatamente a tutta l'app.
        </p>
      </div>
    </div>
  );
}
