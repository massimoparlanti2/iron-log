// ── EXERCISE ACCORDION ──
function ExerciseRow({name,sessions,goal,onGoalChange,records,C,S}){
  const [open,setOpen]=useState(false);
  const hist=sessions.flatMap(s=>s.exercises.filter(e=>e.name===name&&e.weight>0).map(e=>({...e,date:s.date})));
  if(!hist.length)return null;
  const last=hist[hist.length-1],first=hist[0];
  const delta=last.weight-first.weight;
  const maxW=Math.max(...hist.map(e=>e.weight));
  const isRec=records[name]?.weight===maxW;
  const orm=oneRM(maxW,records[name]?.reps||1);
  const goalPct=goal?Math.min(maxW/goal,1):null;
  return(
    <div style={{...S.card,padding:0,overflow:"hidden",borderLeft:isRec?"3px solid #f59e0b":`3px solid ${C.border2}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer",userSelect:"none"}} onClick={()=>setOpen(o=>!o)}>
        <div style={{flex:1,minWidth:0,marginRight:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{fontSize:14,fontWeight:700,color:C.text}}>{name}</span>
            {isRec&&<span style={{fontSize:9,color:"#f59e0b"}}>🏆</span>}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <span style={S.tag(last.muscle)}>{last.muscle}</span>
            <span style={{fontSize:9,color:C.text3}}>{hist.length} sess · {last.date}</span>
          </div>
          {goalPct!==null&&(
            <div style={{marginTop:5,display:"flex",alignItems:"center",gap:6}}>
              <div style={{flex:1,height:3,borderRadius:2,background:C.bg4}}><div style={{height:"100%",width:`${goalPct*100}%`,background:goalPct>=1?"#f59e0b":"#ef4444",borderRadius:2}}/></div>
              <span style={{fontSize:8,color:goalPct>=1?"#f59e0b":C.text3,whiteSpace:"nowrap"}}>{goalPct>=1?"✅ goal!`":`${Math.round(goalPct*100)}%`}</span>
            </div>
          )}
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <p style={{margin:0,fontSize:20,color:"#ef4444",fontWeight:900,lineHeight:1}}>{last.weight}kg</p>
          <p style={{margin:"2px 0 0",fontSize:10,color:delta>=0?"#10b981":"#ef4444",fontWeight:700}}>{delta>=0?"+":""}{delta.toFixed(1)}kg</p>
          <span style={{fontSize:12,color:C.text3}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 14px",background:C.bg}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
            {[["MAX",maxW+"kg"],["1RM ~",orm+"kg"],["SESS.",hist.length],["DELTA",(delta>=0?"+":"")+delta.toFixed(1)+"kg"]].map(([l,v])=>(
              <div key={l} style={{background:C.bg3,borderRadius:8,padding:"7px 8px",textAlign:"center"}}>
                <p style={{margin:0,fontSize:7,color:C.text3,letterSpacing:1}}>{l}</p>
                <p style={{margin:0,fontSize:13,fontWeight:900,color:l==="DELTA"?(delta>=0?"#10b981":"#ef4444"):"#ef4444"}}>{v}</p>
              </div>
            ))}
          </div>
          <Sparkline exName={name} sessions={sessions} goal={goal} C={C}/>
          <ORMChart exName={name} sessions={sessions} goal={goal} C={C}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"6px 0 10px"}}>
            {[1,2,3,4,5].map(s=><div key={s} style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:SCORE_COLORS[s],display:"inline-block"}}/><span style={{fontSize:8,color:C.text3}}>{SCORE_LABELS[s]}</span></div>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:9,color:C.text3}}>🎯 Obiettivo:</span>
            <input type="number" inputMode="decimal" style={{width:72,background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:6,padding:"4px 8px",color:C.text,fontSize:13,fontFamily:"inherit",outline:"none"}}
              placeholder="kg" value={goal||""} onChange={e=>onGoalChange(name,parseFloat(e.target.value)||null)}/>
            {goal&&<span style={{fontSize:9,color:goalPct>=1?"#f59e0b":C.text3}}>{goal}kg · {Math.round((goalPct||0)*100)}%</span>}
          </div>
          <p style={{fontSize:8,letterSpacing:2,color:C.text3,margin:"0 0 6px"}}>ULTIMI RISULTATI</p>
          {hist.slice(-5).reverse().map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:C.bg3,borderRadius:6,marginBottom:3}}>
              <span style={{fontSize:9,color:C.text3}}>{e.date}</span>
              <span style={{fontSize:13,fontWeight:700,color:"#ef4444"}}>{e.weight}kg×{e.reps}</span>
              <span style={{fontSize:8,color:SCORE_COLORS[e.score]}}>{SCORE_LABELS[e.score]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SESSION EDIT MODAL ──
function SessionEditModal({session,onSave,onClose,C,S}){
  const [exercises,setExercises]=useState(()=>session.exercises.map(e=>({...e})));
  const [dur,setDur]=useState(session.duration||0);
  const [kcal,setKcal]=useState(session.kcal||0);
  const [note,setNote]=useState(session.note||"");
  const update=(i,field,val)=>{
    setExercises(exs=>exs.map((e,j)=>j===i?{...e,[field]:val}:e));
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,display:"flex",flexDirection:"column",background:C.bg}}>
      <div style={{...S.hdr,position:"relative"}}>
        <h1 style={S.logo}>✏ MODIFICA</h1>
        <div style={{display:"flex",gap:8}}>
          <button style={S.btn("ghost")} onClick={onClose}>Annulla</button>
          <button style={S.btn("red")} onClick={()=>onSave({...session,exercises,duration:+dur||0,kcal:+kcal||0,note})}>💾 Salva</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
        <p style={{fontSize:12,fontWeight:700,color:C.text,margin:"0 0 4px"}}>{session.dayName} — {session.date}</p>
        {/* Durata e kcal */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div><label style={S.lbl}>⏱ Durata (min)</label><input type="number" inputMode="numeric" style={S.inp} value={dur} onChange={e=>setDur(e.target.value)}/></div>
          <div><label style={S.lbl}>🔥 Kcal</label><input type="number" inputMode="numeric" style={S.inp} value={kcal} onChange={e=>setKcal(e.target.value)}/></div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={S.lbl}>📝 Note</label>
          <input style={S.inp} value={note} onChange={e=>setNote(e.target.value)} placeholder="Note allenamento..."/>
        </div>
        <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 8px"}}>ESERCIZI ({exercises.length})</p>
        {exercises.map((ex,i)=>(
          <div key={i} style={{...S.card,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <span style={S.tag(ex.muscle)}>{ex.muscle}</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{ex.name}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div>
                <label style={S.lbl}>Peso (kg)</label>
                <input type="number" inputMode="decimal" step="0.5" style={{...S.inp,textAlign:"center",fontSize:18,fontWeight:900}} value={ex.weight??""} onChange={e=>update(i,"weight",parseFloat(e.target.value)||0)}/>
              </div>
              <div>
                <label style={S.lbl}>Rip.</label>
                <input type="number" inputMode="numeric" style={{...S.inp,textAlign:"center",fontSize:18,fontWeight:900}} value={ex.reps??""} onChange={e=>update(i,"reps",parseInt(e.target.value)||0)}/>
              </div>
              <div>
                <label style={S.lbl}>Serie</label>
                <input type="number" inputMode="numeric" style={{...S.inp,textAlign:"center",fontSize:18,fontWeight:900}} value={ex.sets??1} onChange={e=>update(i,"sets",parseInt(e.target.value)||1)}/>
              </div>
            </div>
            <div style={{marginTop:8}}>
              <label style={S.lbl}>Difficoltà</label>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,4,5].map(v=>(
                  <button key={v} onClick={()=>update(i,"score",v)} style={{flex:1,padding:"6px 2px",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",border:`2px solid ${ex.score===v?SCORE_COLORS[v]:C.border2}`,background:ex.score===v?SCORE_COLORS[v]+"22":C.bg3,color:ex.score===v?SCORE_COLORS[v]:C.text3}}>
                    {v}<br/><span style={{fontWeight:400,fontSize:7}}>{SCORE_LABELS[v]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WEEK GROUP SESSIONS ──
function WeekGroup({weekKey,weekSessions,program,actEntries,onDeleteSession,onEditSession,C,S}){
  const [open,setOpen]=useState(false);
  const dayColorMap={};(program?.days||[]).forEach((d,i)=>{dayColorMap[d.name]=d.color||DAY_COLORS[i%DAY_COLORS.length];});
  const vol=Math.round(weekSessions.reduce((t,s)=>t+sessionVol(s),0));
  const kcal=weekSessions.reduce((t,s)=>t+(s.kcal||0),0);
  const dur=weekSessions.reduce((t,s)=>t+(s.duration||0),0);
  // attività extra di questa settimana
  const [wkStart,wkEnd]=[weekKey, (()=>{const d=dateFromISO(weekKey);d.setDate(d.getDate()+6);return localISO(d);})()];
  const wkActs=Object.entries(actEntries||{}).filter(([d])=>d>=wkStart&&d<=wkEnd);
  const actKcal=wkActs.reduce((t,[,acts])=>t+acts.reduce((s,a)=>s+(a.kcal||0),0),0);
  const actMin=wkActs.reduce((t,[,acts])=>t+acts.reduce((s,a)=>s+(a.min||0),0),0);
  const actCount=wkActs.reduce((t,[,acts])=>t+acts.length,0);
  useEffect(()=>{
    const today=new Date(),dow=today.getDay()||7;
    const mon=new Date(today);mon.setDate(today.getDate()-dow+1);
    if(weekKey===localISO(mon))setOpen(true);
  },[]);
  return(
    <div style={{...S.card,padding:0,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer",userSelect:"none"}} onClick={()=>setOpen(o=>!o)}>
        <div>
          <p style={{margin:"0 0 3px",fontSize:13,fontWeight:700,color:C.text}}>{weekLabel(weekKey)}</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:9,color:"#ef4444"}}>{weekSessions.length} allenamenti</span>
            {actCount>0&&<span style={{fontSize:9,color:"#10b981"}}>{actCount} attività</span>}
            {vol>0&&<span style={{fontSize:9,color:C.text3}}>{vol>=1000?`${(vol/1000).toFixed(1)}t`:`${vol}kg`} vol</span>}
            {dur>0&&<span style={{fontSize:9,color:C.text3}}>⏱{fmtDur(dur)}</span>}
            {actMin>0&&<span style={{fontSize:9,color:"#06b6d4"}}>🏃{actMin}min</span>}
            {(kcal+actKcal)>0&&<span style={{fontSize:9,color:"#f97316"}}>🔥{kcal+actKcal}kcal</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center",marginLeft:8}}>
          {weekSessions.slice(0,4).map((s,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:s.dayColor||dayColorMap[s.dayName]||"#ef4444"}}/>)}
          <span style={{fontSize:14,color:C.text3,marginLeft:4}}>{open?"▲":"▼"}</span>
        </div>
      </div>
      {open&&weekSessions.map((s,i)=>{
        const sv=Math.round(sessionVol(s));
        const col=s.dayColor||dayColorMap[s.dayName]||"#ef4444";
        return(
          <div key={s.id} style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,borderLeft:`3px solid ${col}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{s.dayName}</p>
                <p style={{margin:0,fontSize:9,color:C.text3}}>{s.programName?`${s.programName} · `:""}{s.date}{s.duration>0?` · ⏱${fmtDur(s.duration)}`:""}{s.kcal>0?` · 🔥${s.kcal}kcal`:""}</p>
                {s.note&&<p style={{margin:"2px 0 0",fontSize:9,color:C.text2,fontStyle:"italic"}}>"{s.note}"</p>}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"flex-start",flexShrink:0}}>
                <span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>{sv>=1000?`${(sv/1000).toFixed(1)}t`:`${sv}kg`}</span>
                {(()=>{const sc=calcWorkoutScore(s,weekSessions);if(!sc)return null;const col=scoreColor(sc);return<span style={{fontSize:10,fontWeight:700,color:col,background:col+"20",borderRadius:4,padding:"1px 5px"}}>{sc}</span>;})()}
                {onEditSession&&<button onClick={()=>onEditSession(s)} style={{background:"none",border:"none",color:C.text3,cursor:"pointer",fontSize:15,padding:"0 2px",lineHeight:1}} title="Modifica">✏</button>}
                {onDeleteSession&&<button onClick={()=>{if(window.confirm("Eliminare questo allenamento?"))onDeleteSession(s.id);}} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16,padding:"0 2px",lineHeight:1}}>🗑</button>}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {s.exercises.map((e,j)=>(
                <div key={j} style={{background:C.bg3,borderRadius:7,padding:"6px 9px",border:`1px solid ${(MUSCLE_COLORS[e.muscle]||C.border)}22`}}>
                  <p style={{margin:"0 0 1px",fontSize:9,color:C.text2}}>{e.name}</p>
                  <p style={{margin:"0 0 2px",fontSize:13,color:"#ef4444",fontWeight:900,lineHeight:1}}>{e.weight}kg<span style={{fontSize:9,color:C.text3}}>×{e.reps}</span></p>
                  <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(v=><span key={v} style={{width:4,height:4,borderRadius:"50%",background:v<=e.score?SCORE_COLORS[e.score]:C.bg4,display:"inline-block"}}/>)}</div>
                  {e.note&&<p style={{margin:"2px 0 0",fontSize:7,color:C.text3,fontStyle:"italic"}}>{e.note}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {/* Attività extra della settimana */}
      {open&&wkActs.length>0&&wkActs.flatMap(([date,acts])=>acts.map((a,j)=>(
        <div key={date+j} style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,borderLeft:"3px solid #10b981",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16,flexShrink:0}}>{ACT_ICONS[a.type]||"🏅"}</span>
          <div style={{flex:1}}>
            <p style={{margin:0,fontSize:12,fontWeight:600,color:C.text2}}>{a.type}</p>
            <p style={{margin:0,fontSize:9,color:C.text3}}>{date}{a.min>0?` · ⏱${a.min}min`:""}{a.kcal>0?` · 🔥${a.kcal}kcal`:""}</p>
          </div>
        </div>
      )))}
    </div>
  );
}

// ── REST TIMER (sticky banner when running) ──
function RestTimer({C,S,sticky}){
  const PRESETS=[60,90,120,180];
  const [secs,setSecs]=useState(null);const [running,setRunning]=useState(false);const [total,setTotal]=useState(90);
  const ref=useRef(null);
  const beep=()=>{try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[0,150,300].forEach(d=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,ctx.currentTime+d/1000);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+d/1000+0.2);o.start(ctx.currentTime+d/1000);o.stop(ctx.currentTime+d/1000+0.25);});}catch(_){}};
  const start=(t)=>{clearInterval(ref.current);setTotal(t);setSecs(t);setRunning(true);ref.current=setInterval(()=>setSecs(s=>{if(s<=1){clearInterval(ref.current);setRunning(false);beep();return 0;}return s-1;}),1000);};
  const stop=()=>{clearInterval(ref.current);setRunning(false);setSecs(null);};
  useEffect(()=>()=>clearInterval(ref.current),[]);
  const pct=secs!=null?secs/total:0,r=20,circ=2*Math.PI*r;
  // Sticky banner when running
  if(sticky&&running&&secs!=null){
    const mins=Math.floor(secs/60),secsLeft=secs%60;
    const urgColor=secs<=10?"#ef4444":secs<=30?"#f59e0b":"#10b981";
    return(
      <div style={{position:"sticky",top:0,zIndex:150,background:C.hdr,borderBottom:`2px solid ${urgColor}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 2px 12px ${urgColor}30`}}>
        <svg width={36} height={36} style={{transform:"rotate(-90deg)",flexShrink:0}}>
          <circle cx={18} cy={18} r={14} fill="none" stroke={C.bg4} strokeWidth={3}/>
          <circle cx={18} cy={18} r={14} fill="none" stroke={urgColor} strokeWidth={3} strokeDasharray={2*Math.PI*14} strokeDashoffset={2*Math.PI*14*(1-pct)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.9s linear"}}/>
        </svg>
        <div style={{flex:1}}>
          <p style={{margin:0,fontSize:8,letterSpacing:2,color:urgColor}}>RECUPERO IN CORSO</p>
          <p style={{margin:0,fontSize:18,fontWeight:900,color:urgColor,lineHeight:1}}>{mins}:{String(secsLeft).padStart(2,"0")}</p>
        </div>
        <button onClick={stop} style={{background:C.bg3,border:`1px solid ${C.border2}`,color:C.text3,borderRadius:8,padding:"6px 12px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕ Stop</button>
      </div>
    );
  }
  // Compact inline version
  return(
    <div style={{...S.card,display:"flex",alignItems:"center",gap:12}}>
      <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
        <svg width={48} height={48} style={{transform:"rotate(-90deg)"}}>
          <circle cx={24} cy={24} r={r} fill="none" stroke={C.bg4} strokeWidth={4}/>
          <circle cx={24} cy={24} r={r} fill="none" stroke={running?"#ef4444":"#444"} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.9s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:secs!=null?11:9,fontWeight:900,color:running?"#ef4444":C.text3,lineHeight:1}}>
            {secs!=null?`${Math.floor(secs/60)}:${String(secs%60).padStart(2,"0")}`:secs===0?"✓":"–"}
          </span>
        </div>
      </div>
      <div style={{flex:1}}>
        <p style={{fontSize:8,letterSpacing:2,color:C.text3,margin:"0 0 6px"}}>⏱ RECUPERO</p>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {PRESETS.map(t=>(
            <button key={t} onClick={()=>start(t)} style={{padding:"6px 10px",borderRadius:6,border:`1px solid ${running&&total===t?"#ef4444":C.border2}`,background:running&&total===t?"#ef444418":C.bg3,color:running&&total===t?"#ef4444":C.text3,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {t===60?"1'":`${t/60}'`}
            </button>
          ))}
          {running&&<button onClick={stop} style={{padding:"6px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.text3,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button>}
        </div>
      </div>
    </div>
  );
}

// ── IDRATAZIONE ──
function HydrationTracker({C}){
  const key="hyd_"+todayISO();
  const [g,setG]=useState(()=>db(key)||0);
  const bump=(n)=>{const v=Math.max(0,g+n);setG(v);db(key,v);};
  const pct=Math.min(g/8,1);
  return(
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{flex:1}}>
        <p style={{fontSize:8,letterSpacing:2,color:"#3b82f6",margin:"0 0 5px"}}>💧 IDRATAZIONE</p>
        <div style={{height:5,borderRadius:3,background:"#3b82f622",marginBottom:3}}><div style={{height:"100%",width:`${pct*100}%`,background:"linear-gradient(to right,#3b82f6,#06b6d4)",borderRadius:3,transition:"width 0.3s"}}/></div>
        <p style={{margin:0,fontSize:9,color:pct>=1?"#06b6d4":"#3b82f6"}}>{g}/8 bicchieri {pct>=1?"🎉":""}</p>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <button onClick={()=>bump(-1)} style={{width:28,height:28,borderRadius:8,border:"none",background:"#3b82f622",color:"#3b82f6",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <span style={{fontSize:20,fontWeight:900,color:"#3b82f6",minWidth:22,textAlign:"center"}}>{g}</span>
        <button onClick={()=>bump(1)} style={{width:28,height:28,borderRadius:8,border:"none",background:"#3b82f650",color:"#3b82f6",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      </div>
    </div>
  );
}

// ── SCORE PICKER ──
function ScorePicker({value,onChange,C}){
  return(
    <div style={{display:"flex",gap:4}}>
      {[1,2,3,4,5].map(s=>(
        <button key={s} onClick={()=>onChange(s)} style={{flex:"1 1 auto",padding:"10px 2px",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",border:`2px solid ${value===s?SCORE_COLORS[s]:C.border2}`,background:value===s?SCORE_COLORS[s]+"22":C.bg3,color:value===s?SCORE_COLORS[s]:C.text3}}>
          {s}<br/><span style={{fontWeight:400,fontSize:7}}>{SCORE_LABELS[s]}</span>
        </button>
      ))}
    </div>
  );
}

// ── CLOCK ──
function WorkoutClock({startTime,C}){
  const [e,setE]=useState(0);
  useEffect(()=>{const i=setInterval(()=>setE(Math.floor((Date.now()-startTime)/1000)),1000);return()=>clearInterval(i);},[startTime]);
  const m=Math.floor(e/60),s=e%60;
  return<span style={{fontSize:11,color:C.text3,fontVariantNumeric:"tabular-nums"}}>{m}:{String(s).padStart(2,"0")}</span>;
}
