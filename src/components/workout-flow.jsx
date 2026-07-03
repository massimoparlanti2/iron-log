// ══════════════════════════════════════════════
// ── CHECKIN SCREEN ──
// ══════════════════════════════════════════════
function CheckinScreen({C,S,dayName,onConfirm,onSkip}){
  const [sonno,setSonno]=useState(null);
  const [energia,setEnergia]=useState(null);
  const [stress,setStress]=useState(null);
  const allDone=sonno&&energia&&stress;
  const items=[
    {key:"sonno",label:"😴 Sonno",sub:"Com'hai dormito?",val:sonno,set:setSonno,lo:"Pessimo",hi:"Ottimo"},
    {key:"energia",label:"⚡ Energia",sub:"Come ti senti fisicamente?",val:energia,set:setEnergia,lo:"Esausto",hi:"Carico"},
    {key:"stress",label:"🧠 Stress",sub:"Livello di stress mentale?",val:stress,set:setStress,lo:"Molto stress",hi:"Rilassato"},
  ];
  const avgWellbeing=allDone?Math.round((sonno+energia+stress)/3*10)/10:null;
  const wellColor=avgWellbeing?avgWellbeing>=4?"#10b981":avgWellbeing>=3?"#f59e0b":"#ef4444":"#6b7280";
  const wellMsg=avgWellbeing?avgWellbeing>=4?"Ottima forma! Punta al massimo oggi.":avgWellbeing>=3?"Forma discreta. Allena con attenzione.":"Stai sotto. Considera di alleggerire i pesi.":" ";
  return(
    <div style={S.app}>
      <div style={{...S.wrap,paddingTop:20}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <p style={{fontSize:26,margin:"0 0 6px",lineHeight:1}}>👋</p>
          <h2 style={{...S.h2,border:"none",padding:0,textAlign:"center",marginBottom:4}}>Come stai oggi?</h2>
          <p style={{fontSize:11,color:C.text3,margin:0}}>{dayName} · {todayISO()}</p>
        </div>
        {items.map(({key,label,sub,val,set,lo,hi})=>(
          <div key={key} style={{...S.card,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
              <p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{label}</p>
              <p style={{margin:0,fontSize:9,color:C.text3}}>{sub}</p>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:8,color:C.text4,flexShrink:0}}>{lo}</span>
              <div style={{display:"flex",gap:6,flex:1,justifyContent:"center"}}>
                {[1,2,3,4,5].map(v=>(
                  <button key={v} onClick={()=>set(v)} style={{
                    width:40,height:40,borderRadius:10,border:`2px solid ${val===v?scoreColor(v*20):C.border2}`,
                    background:val===v?scoreColor(v*20)+"22":C.bg3,
                    color:val===v?scoreColor(v*20):C.text3,
                    fontSize:14,fontWeight:val===v?900:400,cursor:"pointer",
                    fontFamily:"inherit",transition:"all 0.15s",flexShrink:0
                  }}>{v}</button>
                ))}
              </div>
              <span style={{fontSize:8,color:C.text4,flexShrink:0}}>{hi}</span>
            </div>
            {val&&<div style={{height:4,borderRadius:2,background:C.bg4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${val*20}%`,background:scoreColor(val*20),transition:"width 0.4s",borderRadius:2}}/>
            </div>}
          </div>
        ))}
        {allDone&&(
          <div style={{...S.card,marginBottom:14,borderLeft:`3px solid ${wellColor}`,background:wellColor+"12"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:28,lineHeight:1}}>{avgWellbeing>=4?"💪":avgWellbeing>=3?"🙂":"😓"}</span>
              <div>
                <p style={{margin:"0 0 2px",fontSize:10,fontWeight:700,color:wellColor}}>BENESSERE: {avgWellbeing}/5</p>
                <p style={{margin:0,fontSize:11,color:C.text2}}>{wellMsg}</p>
              </div>
            </div>
          </div>
        )}
        <button
          style={{...S.btn("red"),width:"100%",padding:16,fontSize:14,letterSpacing:2,marginBottom:8,
            background:allDone?"linear-gradient(135deg,#ef4444,#dc2626)":"transparent",
            border:allDone?"none":"1px solid #ef4444",
            color:allDone?"#fff":"#ef4444",
            boxShadow:allDone?"0 4px 20px #ef444450":"none"}}
          onClick={()=>onConfirm({sonno,energia,stress,avg:avgWellbeing})}>
          {allDone?"▶ INIZIA ALLENAMENTO":"▶ INIZIA SENZA VALUTAZIONE"}
        </button>
        <button style={{...S.btn("ghost"),width:"100%",padding:10,fontSize:11}} onClick={onSkip}>
          Salta check-in
        </button>
      </div>
    </div>
  );
}

function Confetti(){
  const pieces=Array.from({length:28},(_,i)=>({
    id:i,
    color:["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ec4899","#f97316"][i%7],
    left:Math.random()*100,
    delay:Math.random()*1.2,
    duration:1.8+Math.random()*1.2,
    size:6+Math.random()*8,
    shape:i%3===0?"circle":i%3===1?"square":"triangle",
  }));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute",top:-20,left:`${p.left}%`,
          width:p.size,height:p.size,
          background:p.shape==="triangle"?"transparent":p.color,
          borderRadius:p.shape==="circle"?"50%":p.shape==="square"?"3px":"0",
          borderLeft:p.shape==="triangle"?`${p.size/2}px solid transparent`:"none",
          borderRight:p.shape==="triangle"?`${p.size/2}px solid transparent`:"none",
          borderBottom:p.shape==="triangle"?`${p.size}px solid ${p.color}`:"none",
          animation:`confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  );
}

function FinishPage({C,S,workoutStart,program,activeDay,logData,sessionsRef,checkinData,onDone}){
  const [dur,setDur]=useState(()=>String(workoutStart?Math.round((Date.now()-workoutStart)/60000):0));
  const [kcal,setKcal]=useState("");
  const [note,setNote]=useState("");
  const [saved,setSaved]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);
  const confettiShown=useRef(false);
  useEffect(()=>{
    if(!confettiShown.current){confettiShown.current=true;setShowConfetti(true);setTimeout(()=>setShowConfetti(false),3200);}
  },[]);
  const day=program.days[activeDay];
  const totalExercises=day.exercises.length;
  const loggedCount=day.exercises.filter(ex=>logData[ex.name]?.weight>0).length;
  const completionPct=totalExercises>0?Math.round((loggedCount/totalExercises)*100):100;
  // stima automatica: MET 5.0 (forza) × peso corporeo × ore
  const bwKg=(()=>{try{const bw=db(BW_KEY);return Array.isArray(bw)&&bw.length?bw[bw.length-1].w:75;}catch(_){return 75;}})();
  const kcalEstimate=parseInt(dur)>0?Math.round(5.0*bwKg*(parseInt(dur)/60)):null;
  const save=()=>{
    const exercises=day.exercises.map(ex=>{
      const d=logData[ex.name]||{};
      return{name:ex.name,muscle:ex.muscle,sets:d.sets||ex.sets,weight:parseFloat(d.weight)||0,reps:parseInt(d.reps)||ex.minReps,score:d.score||3,note:d.note||""};
    });    const sess={id:Date.now(),date:todayISO(),programId:program.id,programName:program.name,dayName:day.name,dayColor:day.color||null,exercises,duration:parseInt(dur)||0,kcal:parseInt(kcal)||0,note,checkin:checkinData||null};
    const updated=[...sessionsRef.current,sess];
    sessionsRef.current=updated;db(SESS_KEY,updated);setSaved(true);setTimeout(()=>onDone(updated,exercises),400);
  };
  const iD=parseInt(dur)||0,iK=parseInt(kcal)||0;
  const emoji=completionPct===100?"🏆":completionPct>=80?"💪":completionPct>=50?"⚡":"🔥";
  const msg=completionPct===100?"ALLENAMENTO COMPLETO!":completionPct>=80?"QUASI PERFETTO!":"OTTIMO LAVORO!";
  // Calcola score preview (sessione non ancora salvata)
  const previewSess={programId:program.id,programName:program.name,dayName:day.name,exercises:day.exercises.map(ex=>{const d=logData[ex.name]||{};return{...ex,weight:parseFloat(d.weight)||0,reps:parseInt(d.reps)||ex.minReps,score:d.score||3};}),duration:iD,kcal:iK};
  const wScore=calcWorkoutScore(previewSess,sessionsRef.current);
  const wScoreCol=scoreColor(wScore);
  const wScoreLabel=scoreLabel(wScore);
  return(
    <div style={S.app}>
      {showConfetti&&<Confetti/>}
      <div style={{...S.wrap,paddingTop:24}}>
        <div style={{textAlign:"center",marginBottom:20,animation:"fadeUp 0.5s ease forwards"}}>
          <div style={{fontSize:52,margin:"0 0 8px",lineHeight:1,filter:"drop-shadow(0 0 20px #ef444480)"}}>{emoji}</div>
          <p style={{fontSize:22,letterSpacing:3,fontWeight:900,margin:"0 0 6px",color:C.text}}>{msg}</p>
          <p style={{fontSize:11,color:C.text3,margin:"0 0 16px"}}>
            {completionPct===100?`Tutti e ${totalExercises} esercizi completati`:`${loggedCount}/${totalExercises} esercizi completati`}
          </p>
          {/* Completion ring */}
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",width:88,height:88,marginBottom:8}}>
            <svg width={88} height={88} style={{transform:"rotate(-90deg)",position:"absolute"}}>
              <circle cx={44} cy={44} r={36} fill="none" stroke={C.bg4} strokeWidth={7}/>
              <circle cx={44} cy={44} r={36} fill="none" stroke={completionPct===100?"#f59e0b":"#ef4444"} strokeWidth={7}
                strokeDasharray={2*Math.PI*36} strokeDashoffset={2*Math.PI*36*(1-completionPct/100)}
                strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease"}}/>
            </svg>
            <span style={{fontSize:18,fontWeight:900,color:completionPct===100?"#f59e0b":"#ef4444",position:"relative"}}>{completionPct}%</span>
          </div>
          {/* Score allenamento */}
          {wScore!==null&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:4}}>
              <div style={{textAlign:"center"}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:wScoreCol+"20",borderRadius:10,padding:"6px 16px",border:`1px solid ${wScoreCol}44`}}>
                  <span style={{fontSize:22,fontWeight:900,color:wScoreCol,lineHeight:1}}>{wScore}</span>
                  <div style={{textAlign:"left"}}>
                    <p style={{margin:0,fontSize:8,color:wScoreCol,letterSpacing:1}}>SCORE</p>
                    <p style={{margin:0,fontSize:10,fontWeight:700,color:wScoreCol}}>{wScoreLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{...S.card,borderLeft:`3px solid ${completionPct===100?"#f59e0b":"#ef4444"}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <label style={S.lbl}>⏱ Durata (minuti)</label>
              <input type="number" inputMode="numeric" style={{...S.inp,fontSize:28,fontWeight:900,textAlign:"center",padding:"14px 8px"}} value={dur} onChange={e=>setDur(e.target.value)} placeholder="65"/>
              {iD>0&&<p style={{margin:"4px 0 0",fontSize:9,color:C.text3,textAlign:"center"}}>{fmtDur(iD)}</p>}
            </div>
            <div>
              <label style={S.lbl}>🔥 Calorie (kcal)</label>
              <input type="number" inputMode="numeric" style={{...S.inp,fontSize:28,fontWeight:900,textAlign:"center",padding:"14px 8px"}} value={kcal} onChange={e=>setKcal(e.target.value)} placeholder={kcalEstimate||"400"}/>
              {kcalEstimate&&!kcal&&(
                <p style={{margin:"4px 0 0",fontSize:9,color:"#3b82f6",textAlign:"center",cursor:"pointer"}} onClick={()=>setKcal(String(kcalEstimate))}>
                  🤖 stima ~{kcalEstimate} kcal · tap per usare
                </p>
              )}
              {iK>0&&iD>0&&<p style={{margin:"4px 0 0",fontSize:9,color:"#f97316",textAlign:"center"}}>{(iK/iD).toFixed(0)} kcal/min</p>}
            </div>
          </div>
          {(iD>0||iK>0)&&(
            <div style={{background:C.bg3,borderRadius:10,padding:"10px",marginBottom:12,display:"flex",gap:16,justifyContent:"center"}}>
              {iD>0&&<div style={{textAlign:"center"}}><p style={{margin:0,fontSize:8,color:C.text3}}>DURATA</p><p style={{margin:0,fontSize:16,fontWeight:900,color:C.text}}>{fmtDur(iD)}</p></div>}
              {iK>0&&<div style={{textAlign:"center"}}><p style={{margin:0,fontSize:8,color:C.text3}}>CALORIE</p><p style={{margin:0,fontSize:16,fontWeight:900,color:"#f97316"}}>{iK} kcal</p></div>}
              {iD>0&&iK>0&&<div style={{textAlign:"center"}}><p style={{margin:0,fontSize:8,color:C.text3}}>RITMO</p><p style={{margin:0,fontSize:16,fontWeight:900,color:"#8b5cf6"}}>{(iK/iD).toFixed(0)} kcal/min</p></div>}
            </div>
          )}
          <label style={S.lbl}>📝 Come è andata?</label>
          <input style={{...S.inp,fontSize:14}} placeholder="Sonno, energia, sensazioni..." value={note} onChange={e=>setNote(e.target.value)}/>
        </div>

        <button
          style={{...S.btn("red"),width:"100%",padding:16,fontSize:15,letterSpacing:3,marginBottom:8,
            background:saved?"#10b981":"linear-gradient(135deg,#ef4444,#dc2626)",
            backgroundSize:"200% auto",transition:"all 0.3s",
            boxShadow:saved?"0 4px 20px #10b98150":"0 4px 20px #ef444450",
          }}
          onClick={save} disabled={saved}>
          {saved?"✓ SALVATO!":"💾 SALVA ALLENAMENTO"}
        </button>
        <button style={{...S.btn("ghost"),width:"100%",padding:12,fontSize:11}} onClick={save}>Salta statistiche</button>
      </div>
    </div>
  );
}
