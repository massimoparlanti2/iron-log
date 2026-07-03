// ══════════════════════════════════════════════
// ── RESOCONTO SETTIMANALE (HOME) ──
// ══════════════════════════════════════════════
function WeekSummary({sessions,setSessions,nutrEntries,setNutrEntries,actEntries,setActEntries,tdeeEntries,setTdeeEntries,program,C,S}){
  const [offset,setOffset]=useState(0);
  const [selDay,setSelDay]=useState(null);
  const [editCal,setEditCal]=useState(false);
  const [editKcalIn,setEditKcalIn]=useState("");
  const [editKcalOut,setEditKcalOut]=useState("");
  const swipeRef=useRef(null);
  const touchStart=useRef(null);
  // swipe handlers
  const onTouchStart=(e)=>{touchStart.current=e.touches[0].clientX;};
  const onTouchEnd=(e)=>{
    if(touchStart.current===null)return;
    const dx=e.changedTouches[0].clientX-touchStart.current;
    touchStart.current=null;
    if(Math.abs(dx)<40)return;
    if(dx<0){setOffset(o=>o-1);setSelDay(null);}
    else{setOffset(o=>Math.min(o+1,0));setSelDay(null);}
  };
  const days=getWeekDays(offset);
  const today=todayISO();
  const dayColorMap={};(program?.days||[]).forEach((d,i)=>{dayColorMap[d.name]=d.color||DAY_COLORS[i%DAY_COLORS.length];});
  const dl=["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

  const wkData=days.map((d,i)=>{
    const ds=localISO(d);
    const daySess=sessions.filter(s=>s.date===ds);
    const nutr=nutrEntries[ds];
    const acts=actEntries[ds]||[];
    const kcalIn=nutr?.kcal||0;
    // usa tdee manuale se disponibile, altrimenti somma attività + sessioni
    const kcalOut=tdeeEntries[ds]||(daySess.reduce((t,s)=>t+(s.kcal||0),0)+acts.reduce((t,a)=>t+(a.kcal||0),0))||0;
    return{ds,d,i,daySess,nutr,acts,kcalIn,kcalOut,balance:kcalIn-kcalOut,hasData:kcalIn>0||kcalOut>0||daySess.length>0};
  });
  const totKcalIn=wkData.reduce((t,x)=>t+x.kcalIn,0);
  const totKcalOut=wkData.reduce((t,x)=>t+x.kcalOut,0);
  const totProt=wkData.reduce((t,x)=>t+(x.nutr?.prot||0),0);
  const totCarb=wkData.reduce((t,x)=>t+(x.nutr?.carb||0),0);
  const totFat=wkData.reduce((t,x)=>t+(x.nutr?.fat||0),0);

  const selData=selDay?wkData.find(x=>x.ds===selDay):null;

  const openEdit=(sd)=>{
    setEditKcalIn(nutrEntries[sd.ds]?.kcal||"");
    setEditKcalOut(tdeeEntries[sd.ds]||"");
    setEditCal(true);
  };
  const saveCalEdit=(ds)=>{
    if(editKcalIn!==""){
      const prev=nutrEntries[ds]||{prot:0,carb:0,fat:0};
      const updated={...nutrEntries,[ds]:{...prev,kcal:parseInt(editKcalIn)||0}};
      setNutrEntries(updated);
    }
    if(editKcalOut!==""){
      const updated={...tdeeEntries,[ds]:parseInt(editKcalOut)||0};
      setTdeeEntries(updated);
    }
    setEditCal(false);
  };
  const deleteSession=(sessId)=>{
    const updated=sessions.filter(s=>s.id!==sessId);
    setSessions(updated);
  };
  const deleteActivity=(ds,actId)=>{
    const updated={...actEntries,[ds]:(actEntries[ds]||[]).filter(a=>a.id!==actId)};
    if(!updated[ds].length)delete updated[ds];
    setActEntries(updated);
  };

  return(
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>RESOCONTO SETTIMANALE</p>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button onClick={()=>{setOffset(o=>o-1);setSelDay(null);}} style={{background:"none",border:"none",color:C.text2,fontSize:16,cursor:"pointer",padding:"0 4px",lineHeight:1}}>‹</button>
          <span style={{fontSize:9,color:C.text3}}>{offset===0?"Questa sett.":offset===-1?"Sett. scorsa":weekLabel(localISO(days[0]))}</span>
          <button onClick={()=>{setOffset(o=>Math.min(o+1,0));setSelDay(null);}} style={{background:"none",border:"none",color:offset===0?C.text4:C.text2,fontSize:16,cursor:"pointer",padding:"0 4px",lineHeight:1}}>›</button>
        </div>
      </div>

      {/* 7 colonne giornaliere */}
      <div style={{display:"flex",gap:3}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {wkData.map(({ds,d,i,daySess,kcalIn,kcalOut,balance,hasData})=>{
          const isToday=ds===today;
          const isSel=selDay===ds;
          return(
            <div key={i} onClick={()=>{setSelDay(isSel?null:ds);setEditCal(false);}}
              style={{flex:1,background:isSel?"#ef444415":isToday?C.bg3:C.bg2,borderRadius:10,padding:"7px 3px",textAlign:"center",border:`1px solid ${isSel?"#ef4444":isToday?"#ef444455":C.border}`,cursor:"pointer",transition:"all 0.15s"}}>
              <p style={{margin:"0 0 2px",fontSize:8,color:isSel?"#ef4444":isToday?"#ef4444":C.text3,fontWeight:isSel||isToday?700:400}}>{dl[i]}</p>
              <p style={{margin:"0 0 3px",fontSize:11,fontWeight:700,color:C.text}}>{d.getDate()}</p>
              {daySess.length>0&&<div style={{display:"flex",gap:2,justifyContent:"center",marginBottom:3}}>
                {daySess.slice(0,2).map((s,j)=><div key={j} style={{width:6,height:6,borderRadius:"50%",background:dayColorMap[s.dayName]||"#ef4444"}}/>)}
              </div>}
              {hasData&&<>
                {kcalIn>0&&<p style={{margin:"1px 0",fontSize:7,color:"#f97316",lineHeight:1}}>+{kcalIn>999?Math.round(kcalIn/100)/10+"k":kcalIn}</p>}
                {kcalOut>0&&<p style={{margin:"1px 0",fontSize:7,color:"#ef4444",lineHeight:1}}>-{kcalOut>999?Math.round(kcalOut/100)/10+"k":kcalOut}</p>}
                {kcalIn>0&&kcalOut>0&&<div style={{fontSize:9,fontWeight:700,color:balance>0?"#f59e0b":"#10b981",lineHeight:1,marginTop:2}}>{balance>0?"▲":"▼"}{Math.abs(balance)>999?Math.round(Math.abs(balance)/100)/10+"k":Math.abs(balance)}</div>}
              </>}
            </div>
          );
        })}
      </div>

      {/* DETTAGLIO GIORNO SELEZIONATO */}
      {selData&&(
        <div style={{marginTop:12,borderTop:`1px solid ${C.border}`,paddingTop:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"][selData.i]} {selData.d.getDate()}/{selData.d.getMonth()+1}</p>
            <button onClick={()=>openEdit(selData)} style={{...S.btn("ghost"),padding:"5px 10px",fontSize:9}}>✏ Modifica calorie</button>
          </div>

          {/* Form modifica calorie giorno */}
          {editCal&&(
            <div style={{...S.card,background:C.bg3,marginBottom:10,padding:"12px 14px"}}>
              <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 10px"}}>MODIFICA CALORIE — {selData.ds}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <div>
                  <label style={S.lbl}>🍽 Kcal assunte</label>
                  <input type="number" inputMode="numeric" style={S.inp} placeholder="es. 2200" value={editKcalIn} onChange={e=>setEditKcalIn(e.target.value)}/>
                </div>
                <div>
                  <label style={S.lbl}>🔥 Kcal bruciate</label>
                  <input type="number" inputMode="numeric" style={S.inp} placeholder="es. 2500" value={editKcalOut} onChange={e=>setEditKcalOut(e.target.value)}/>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button style={{...S.btn("red"),flex:1,padding:10,fontSize:11}} onClick={()=>saveCalEdit(selData.ds)}>💾 Salva</button>
                <button style={{...S.btn("ghost"),padding:10,fontSize:11}} onClick={()=>setEditCal(false)}>Annulla</button>
              </div>
            </div>
          )}

          {/* bilancio calorico */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
            <div style={{background:C.bg3,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
              <p style={{margin:0,fontSize:7,color:C.text3,letterSpacing:1}}>CALORIE IN</p>
              <p style={{margin:0,fontSize:15,fontWeight:900,color:"#f97316"}}>{selData.kcalIn||"—"}</p>
            </div>
            <div style={{background:C.bg3,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
              <p style={{margin:0,fontSize:7,color:C.text3,letterSpacing:1}}>CALORIE OUT</p>
              <p style={{margin:0,fontSize:15,fontWeight:900,color:"#ef4444"}}>{selData.kcalOut||"—"}</p>
            </div>
            <div style={{background:selData.balance>0?"#f59e0b18":"#10b98118",borderRadius:8,padding:"6px 8px",textAlign:"center",border:`1px solid ${selData.balance>0?"#f59e0b":"#10b981"}44`}}>
              <p style={{margin:0,fontSize:7,color:selData.balance>0?"#f59e0b":"#10b981",letterSpacing:1}}>{selData.balance>0?"SURPLUS":"DEFICIT"}</p>
              <p style={{margin:0,fontSize:15,fontWeight:900,color:selData.balance>0?"#f59e0b":"#10b981"}}>{selData.kcalIn>0&&selData.kcalOut>0?(selData.balance>0?"+":"")+selData.balance:"—"}</p>
            </div>
          </div>

          {/* MACRO */}
          {selData.nutr&&(selData.nutr.prot>0||selData.nutr.carb>0||selData.nutr.fat>0)&&(
            <>
              <p style={{margin:"0 0 5px",fontSize:8,letterSpacing:2,color:C.text3}}>MACRO</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5,marginBottom:7}}>
                {[["🥩 PROT",selData.nutr.prot+"g","#ef4444"],["🍞 CARB",selData.nutr.carb+"g","#f59e0b"],["🧈 GRASSI",selData.nutr.fat+"g","#3b82f6"]].map(([l,v,col])=>(
                  <div key={l} style={{background:col+"18",borderRadius:7,padding:"5px 6px",textAlign:"center",border:`1px solid ${col}28`}}>
                    <p style={{margin:0,fontSize:7,color:col,letterSpacing:0}}>{l}</p>
                    <p style={{margin:0,fontSize:14,fontWeight:900,color:col}}>{v}</p>
                  </div>
                ))}
              </div>
              {selData.nutr.kcal>0&&(
                <div style={{height:7,borderRadius:4,background:C.bg4,overflow:"hidden",display:"flex",marginBottom:8}}>
                  {[["prot",selData.nutr.prot*4,"#ef4444"],["carb",selData.nutr.carb*4,"#f59e0b"],["fat",selData.nutr.fat*9,"#3b82f6"]].map(([k,cal,col])=>(
                    <div key={k} style={{height:"100%",width:`${Math.round(cal/selData.nutr.kcal*100)||0}%`,background:col}}/>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Allenamenti con pulsante elimina */}
          {selData.daySess.length>0&&(
            <div style={{marginBottom:8}}>
              <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:C.text3}}>ALLENAMENTO</p>
              {selData.daySess.map((s,i)=>(
                <div key={s.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg3,borderRadius:8,padding:"8px 10px",marginBottom:4,borderLeft:`2px solid ${dayColorMap[s.dayName]||"#ef4444"}`}}>
                  <div>
                    <p style={{margin:0,fontSize:12,fontWeight:700,color:C.text}}>{s.dayName}</p>
                    <p style={{margin:0,fontSize:9,color:C.text3}}>{s.duration>0?fmtDur(s.duration):""}{s.kcal>0?` · 🔥${s.kcal}kcal`:""} · {s.exercises?.length||0} esercizi</p>
                  </div>
                  <button onClick={()=>{if(window.confirm("Eliminare questo allenamento?"))deleteSession(s.id);}} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,padding:"0 4px",flexShrink:0}}>🗑</button>
                </div>
              ))}
            </div>
          )}

          {/* Attività extra con pulsante elimina */}
          {selData.acts.length>0&&(
            <div style={{marginBottom:8}}>
              <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:C.text3}}>ATTIVITÀ</p>
              {selData.acts.map((a,i)=>(
                <div key={a.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg3,borderRadius:8,padding:"7px 10px",marginBottom:3}}>
                  <span style={{fontSize:11,color:C.text2}}>{a.type} {a.kcal>0?`· ${a.kcal}kcal`:""} {fmtDur(a.min)}</span>
                  <button onClick={()=>deleteActivity(selData.ds,a.id)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16,padding:"0 4px",flexShrink:0}}>🗑</button>
                </div>
              ))}
            </div>
          )}

          {!selData.daySess.length&&!selData.acts.length&&!selData.nutr&&(
            <p style={{fontSize:10,color:C.text3,textAlign:"center",padding:"10px 0"}}>Nessun dato per questo giorno</p>
          )}
        </div>
      )}

      {/* Riepilogo settimana */}
      {(totKcalIn>0||totKcalOut>0)&&!selDay&&(
        <div style={{marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:8,display:"flex",gap:8,flexWrap:"wrap",justifyContent:"space-between"}}>
          <div style={{display:"flex",gap:10}}>
            {totKcalIn>0&&<div><p style={{margin:0,fontSize:7,color:C.text3}}>IN SETTIMANA</p><p style={{margin:0,fontSize:13,fontWeight:900,color:"#f97316"}}>{totKcalIn.toLocaleString()}</p></div>}
            {totKcalOut>0&&<div><p style={{margin:0,fontSize:7,color:C.text3}}>OUT</p><p style={{margin:0,fontSize:13,fontWeight:900,color:"#ef4444"}}>{totKcalOut.toLocaleString()}</p></div>}
          </div>
          {totProt>0&&<div style={{display:"flex",gap:8}}>
            <span style={{fontSize:9,color:"#ef4444",fontWeight:700}}>{totProt}g P</span>
            <span style={{fontSize:9,color:"#f59e0b",fontWeight:700}}>{totCarb}g C</span>
            <span style={{fontSize:9,color:"#3b82f6",fontWeight:700}}>{totFat}g F</span>
          </div>}
        </div>
      )}
      <div style={{display:"flex",gap:10,marginTop:8,justifyContent:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:"50%",background:"#f59e0b"}}/><span style={{fontSize:8,color:C.text3}}>surplus</span></div>
        <div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:"50%",background:"#10b981"}}/><span style={{fontSize:8,color:C.text3}}>deficit</span></div>
        <span style={{fontSize:8,color:C.text3}}>· tocca un giorno per i dettagli</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── FINISH PAGE ──
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
