// ══════════════════════════════════════════════
// ── MAIN APP ──
// ══════════════════════════════════════════════
function GymTracker(){
  const [view,setView]=useState("loading");
  const [program,setProgram]=useState(null);
  const [programs,setPrograms]=useState([]);
  const [activeProgramId,setActiveProgramId]=useState(null);
  const [editingProgramId,setEditingProgramId]=useState(null);
  const [sessions,setSessions]=useState([]);
  const [activeDay,setActiveDay]=useState(null);
  const [logData,setLogData]=useState({});
  const [toast,setToast]=useState(null);
  const [newPR,setNewPR]=useState(null);
  const [themePrefs,setThemePrefs]=useState(()=>loadThemePrefs());
  const [workoutStart,setWorkoutStart]=useState(null);
  const [goals,setGoals]=useState({});
  const [nutrEntries,setNutrEntries]=useState({});
  const [actEntries,setActEntries]=useState({});
  const [tdeeEntries,setTdeeEntries]=useState({});
  const [bwEntries,setBwEntries]=useState([]);
  const [calOffset,setCalOffset]=useState(0);
  const [editingSession,setEditingSession]=useState(null);
  const [checkinData,setCheckinData]=useState(null);
  const [workoutTab,setWorkoutTab]=useState("oggi");
  const [historyTab,setHistoryTab]=useState("grafici");
  const [viewProgramId,setViewProgramId]=useState(null);
  const sessionsRef=useRef([]);

  const updateSessions=(val)=>{sessionsRef.current=val;setSessions(val);};
  const makeProgramId=()=>`scheda_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
  const normalizeProgram=(p, fallbackName="Scheda")=>{
    if(!p?.days?.length)return null;
    const now=todayISO();
    return{
      id:p.id||makeProgramId(),
      name:(p.name||fallbackName).trim(),
      createdAt:p.createdAt||now,
      updatedAt:p.updatedAt||now,
      startedAt:p.startedAt||p.createdAt||now,
      endedAt:p.endedAt||null,
      status:p.status||"active",
      days:p.days
    };
  };
  const normalizeProgramLibrary=(storedPrograms, legacyProgram, storedActiveId)=>{
    const map=new Map();
    if(Array.isArray(storedPrograms)){
      storedPrograms.forEach((p,i)=>{
        const normalized=normalizeProgram(p,p?.name||`Scheda ${i+1}`);
        if(normalized)map.set(normalized.id,normalized);
      });
    }
    const legacy=normalizeProgram(legacyProgram,"Scheda iniziale");
    if(legacy&&!map.has(legacy.id))map.set(legacy.id,legacy);
    const list=[...map.values()].sort((a,b)=>(b.startedAt||b.createdAt||"").localeCompare(a.startedAt||a.createdAt||""));
    const activeId=(storedActiveId&&map.has(storedActiveId))?storedActiveId:(list.find(p=>p.status==="active")?.id||list[0]?.id||null);
    return{list,activeId,active:list.find(p=>p.id===activeId)||null};
  };
  const persistProgramLibrary=(nextPrograms,nextActiveId)=>{
    const active=nextPrograms.find(p=>p.id===nextActiveId)||nextPrograms[0]||null;
    setPrograms(nextPrograms);
    setActiveProgramId(active?.id||null);
    setProgram(active);
    db(PROGRAMS_KEY,nextPrograms);
    db(ACTIVE_PROGRAM_KEY,active?.id||null);
    if(active)db(PROG_KEY,active);
  };
  const hydrateFromStorage=()=>{
    const p=db(PROG_KEY),storedPrograms=db(PROGRAMS_KEY),storedActive=db(ACTIVE_PROGRAM_KEY);
    const s=db(SESS_KEY),g=db(GOALS_KEY),n=db(NUTR_KEY),a=db(ACT_KEY),td=db(TDEE_KEY),bw=db(BW_KEY);
    const lib=normalizeProgramLibrary(storedPrograms,p,storedActive);
    let loadedSessions=Array.isArray(s)?s:[];
    if(lib.active&&loadedSessions.some(x=>!x.programId)){
      loadedSessions=loadedSessions.map(x=>{
        if(x.programId)return x;
        const d=lib.active.days.find(day=>day.name===x.dayName);
        return{...x,programId:lib.active.id,programName:lib.active.name,dayColor:d?.color||x.dayColor||null};
      });
      db(SESS_KEY,loadedSessions);
    }
    updateSessions(loadedSessions);
    setPrograms(lib.list);
    setActiveProgramId(lib.activeId);
    setProgram(lib.active);
    if(g)setGoals(g); else setGoals({});
    if(n)setNutrEntries(n); else setNutrEntries({});
    if(a)setActEntries(a); else setActEntries({});
    if(td)setTdeeEntries(td); else setTdeeEntries({});
    if(Array.isArray(bw))setBwEntries(bw); else setBwEntries([]);
    const tp=db(THEME_STORAGE_KEY); if(tp){try{setThemePrefs(tp);}catch(_){}}
    return lib.active;
  };

  useEffect(()=>{
    const active=hydrateFromStorage();
    if(active?.days?.length)setView("workout");
    else setView("setup");
  },[]);

  useEffect(()=>{
    const sync=()=>{hydrateFromStorage();};
    window.addEventListener("storage",sync);
    window.addEventListener("ironlog:datachange",sync);
    return()=>{
      window.removeEventListener("storage",sync);
      window.removeEventListener("ironlog:datachange",sync);
    };
  },[]);

  useEffect(()=>{
    if(activeProgramId&&!viewProgramId)setViewProgramId(activeProgramId);
    else if(viewProgramId&&programs.length&&!programs.some(p=>p.id===viewProgramId))setViewProgramId(activeProgramId);
  },[activeProgramId,programs.length,viewProgramId]);

  const toggleTheme=()=>{
    const modes=Object.keys(THEME_MODES);
    const cur=themePrefs.mode||"dark_pure";
    const next=modes[(modes.indexOf(cur)+1)%modes.length];
    const np={...themePrefs,mode:next};
    setThemePrefs(np);saveThemePrefs(np);
  };
  const notify=(msg,col="#10b981")=>{setToast({msg,col});setTimeout(()=>setToast(null),2500);};
  const saveProgram=(p)=>{
    const now=todayISO();
    const targetId=editingProgramId||p.id||makeProgramId();
    const existing=programs.find(x=>x.id===targetId);
    const nextProgram={
      ...existing,
      ...p,
      id:targetId,
      name:(p.name||existing?.name||`Scheda ${programs.length+1}`).trim(),
      createdAt:existing?.createdAt||now,
      startedAt:p.startedAt||existing?.startedAt||now,
      updatedAt:now,
      endedAt:null,
      status:"active"
    };
    const hasExisting=programs.some(x=>x.id===targetId);
    const nextPrograms=hasExisting
      ? programs.map(x=>x.id===targetId?nextProgram:{...x,status:x.id===activeProgramId?"archived":x.status,endedAt:x.id===activeProgramId&&x.id!==targetId?(x.endedAt||now):x.endedAt})
      : [nextProgram,...programs.map(x=>x.id===activeProgramId?{...x,status:"archived",endedAt:x.endedAt||now}:x)];
    persistProgramLibrary(nextPrograms,targetId);
    setEditingProgramId(null);
    setViewProgramId(targetId);
    setWorkoutTab("programma");
    notify(existing?"Scheda aggiornata ✓":"Nuova scheda attiva ✓");
    setView("workout");
  };
  const activateProgram=(id)=>{
    const target=programs.find(p=>p.id===id);
    if(!target)return;
    const now=todayISO();
    const nextPrograms=programs.map(p=>p.id===id?{...p,status:"active",endedAt:null,updatedAt:now}:{...p,status:"archived",endedAt:p.endedAt||now});
    persistProgramLibrary(nextPrograms,id);
    setViewProgramId(id);
    setWorkoutTab("programma");
    notify(`Scheda attiva: ${target.name}`);
  };
  const startNewProgram=()=>{
    setEditingProgramId(null);
    setWorkoutTab("programma");
    setView("setup");
  };
  const editProgram=(id)=>{
    setEditingProgramId(id||activeProgramId);
    setView("setup-edit");
  };
  const startWorkout=(di)=>{
    if(!program?.days?.[di])return;
    setActiveDay(di);
    const day=program.days[di];
    const prefilled={};
    day.exercises.forEach(ex=>{
      const sg=getSuggestion(ex.name,ex.minReps,ex.maxReps,ex.step,sessions);
      if(sg){prefilled[ex.name]={weight:sg.nw,reps:sg.nr};}
    });
    setLogData(prefilled);
    setView("checkin"); // va al check-in prima del log
  };
  const confirmCheckin=(data)=>{
    setCheckinData(data);
    // salva check-in
    const existing=db(CHECKIN_KEY)||{};
    existing[todayISO()]={...data,dayName:program.days[activeDay].name,programId:program.id,programName:program.name};
    db(CHECKIN_KEY,existing);
    setWorkoutStart(Date.now());setView("log");
  };
  const setGoal=(name,kg)=>{const g={...goals,[name]:kg};setGoals(g);db(GOALS_KEY,g);};
  const dl=(content,filename,type="text/plain")=>{const b=new Blob([content],{type});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=filename;a.click();URL.revokeObjectURL(a.href);};
  const csvRow=(...cols)=>cols.map(c=>{const s=String(c??'');return s.includes(',')||s.includes('"')||s.includes('\n')?`"${s.replace(/"/g,'""')}"`:`${s}`;}).join(',')+'\n';
  const readIronLogStorage=()=>{
    const out={};
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key||!key.startsWith("il_"))continue;
      const raw=localStorage.getItem(key);
      try{out[key]=JSON.parse(raw);}
      catch(_){out[key]=raw;}
    }
    return out;
  };
  const applyIronLogStorage=(localData)=>{
    if(!localData||typeof localData!=="object")return;
    Object.entries(localData).forEach(([key,val])=>{
      if(key.startsWith("il_"))db(key,val);
    });
  };

  const exportAllJSON=()=>{
    const payload={
      exportDate:todayISO(),
      version:3,
      app:"Iron Log",
      program,
      programs,
      activeProgramId,
      sessions,
      bwEntries,
      nutrEntries,
      actEntries,
      tdeeEntries,
      goals,
      kcalGoal:db(KCAL_GOAL_KEY)||null,
      checkins:db(CHECKIN_KEY)||{},
      themePrefs,
      localData:readIronLogStorage()
    };
    dl(JSON.stringify(payload,null,2),`ironlog_backup_${todayISO()}.json`,"application/json");
    notify("Backup completo esportato ✓");
  };
  const exportSessionsCSV=()=>{
    let csv=csvRow("data","scheda","giorno","durata_min","kcal_allenamento","note","esercizio","gruppo_muscolare","kg","reps","score","sets");
    sessions.forEach(s=>s.exercises.forEach(e=>{csv+=csvRow(s.date,s.programName||"",s.dayName,s.duration||0,s.kcal||0,s.note||"",e.name,e.muscle,e.weight,e.reps,e.score,e.sets||1);}));
    dl(csv,`ironlog_allenamenti_${todayISO()}.csv`,"text/csv;charset=utf-8");
    notify("CSV allenamenti esportato ✓");
  };
  const exportBodyCSV=()=>{
    let csv=csvRow("data","peso_kg","grasso_%","massa_magra_kg","bmi");
    bwEntries.forEach(e=>{csv+=csvRow(e.date,e.w,e.fat??'',e.lean??'',e.bmi??'');});
    dl(csv,`ironlog_corpo_${todayISO()}.csv`,"text/csv;charset=utf-8");
    notify("CSV corporeo esportato ✓");
  };
  const exportNutrCSV=()=>{
    let csv=csvRow("data","kcal","proteine_g","carboidrati_g","grassi_g");
    Object.entries(nutrEntries).sort().forEach(([date,n])=>{csv+=csvRow(date,n.kcal,n.prot,n.carb,n.fat);});
    dl(csv,`ironlog_nutrizione_${todayISO()}.csv`,"text/csv;charset=utf-8");
    notify("CSV nutrizione esportato ✓");
  };
  const exportCalCSV=()=>{
    const allDates=[...new Set([...Object.keys(nutrEntries),...Object.keys(tdeeEntries)])].sort();
    let csv=csvRow("data","kcal_assunte","kcal_bruciate","bilancio","surplus_deficit");
    allDates.forEach(date=>{
      const kcalIn=nutrEntries[date]?.kcal||0;
      const kcalOut=tdeeEntries[date]||0;
      const bal=kcalIn&&kcalOut?kcalIn-kcalOut:'';
      const label=bal===''?'':(bal>0?'surplus':'deficit');
      csv+=csvRow(date,kcalIn||'',kcalOut||'',bal,label);
    });
    dl(csv,`ironlog_bilancio_${todayISO()}.csv`,"text/csv;charset=utf-8");
    notify("CSV bilancio esportato ✓");
  };
  const exportActivitiesCSV=()=>{
    let csv=csvRow("data","tipo","kcal","minuti");
    Object.entries(actEntries).sort().forEach(([date,acts])=>acts.forEach(a=>{csv+=csvRow(date,a.type,a.kcal||0,a.min||0);}));
    dl(csv,`ironlog_attivita_${todayISO()}.csv`,"text/csv;charset=utf-8");
    notify("CSV attività esportato ✓");
  };
  const importJSON=(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const data=JSON.parse(ev.target.result);
        const ok=window.confirm("Importare questo backup? I dati presenti nel file sostituiranno quelli locali compatibili.");
        if(!ok)return;
        applyIronLogStorage(data.localData);
        if(data.sessions&&Array.isArray(data.sessions)){updateSessions(data.sessions);db(SESS_KEY,data.sessions);}
        if(data.programs&&Array.isArray(data.programs)){
          const lib=normalizeProgramLibrary(data.programs,data.program,data.activeProgramId);
          persistProgramLibrary(lib.list,lib.activeId);
        }
        if(!data.programs&&data.program?.days?.length){setProgram(data.program);db(PROG_KEY,data.program);}
        if(data.bwEntries&&Array.isArray(data.bwEntries)){setBwEntries(data.bwEntries);db(BW_KEY,data.bwEntries);}
        if(data.nutrEntries&&typeof data.nutrEntries==='object'){setNutrEntries(data.nutrEntries);db(NUTR_KEY,data.nutrEntries);}
        if(data.actEntries&&typeof data.actEntries==='object'){setActEntries(data.actEntries);db(ACT_KEY,data.actEntries);}
        if(data.tdeeEntries&&typeof data.tdeeEntries==='object'){setTdeeEntries(data.tdeeEntries);db(TDEE_KEY,data.tdeeEntries);}
        if(data.goals&&typeof data.goals==='object'){setGoals(data.goals);db(GOALS_KEY,data.goals);}
        if(data.kcalGoal&&typeof data.kcalGoal==='object'){db(KCAL_GOAL_KEY,data.kcalGoal);}
        if(data.checkins&&typeof data.checkins==='object'){db(CHECKIN_KEY,data.checkins);}
        if(data.themePrefs&&typeof data.themePrefs==='object'){setThemePrefs(data.themePrefs);saveThemePrefs(data.themePrefs);}
        notify("Dati importati con successo ✓","#10b981");
      }catch(_){notify("Errore: file non valido","#ef4444");}
    };
    reader.readAsText(file);
    e.target.value='';
  };

  const handleFinish=(updated,exercises)=>{
    const prevRec=getRecords(sessionsRef.current.slice(0,-1));
    exercises.forEach(e=>{if(!prevRec[e.name]||e.weight>prevRec[e.name].weight){setNewPR({name:e.name,weight:e.weight});setTimeout(()=>setNewPR(null),3500);}});
    updateSessions(updated);
    setActiveDay(null);setLogData({});setWorkoutStart(null);
    notify("Allenamento salvato! 🔥");setView("workout");
  };

  const saveEditedSession=(updated)=>{
    const newSessions=sessions.map(s=>s.id===updated.id?updated:s);
    updateSessions(newSessions);db(SESS_KEY,newSessions);
    // controlla nuovi PR dopo modifica
    const prevRec=getRecords(newSessions.filter(s=>s.id!==updated.id));
    updated.exercises.forEach(e=>{if(e.weight>0&&(!prevRec[e.name]||e.weight>prevRec[e.name].weight)){setNewPR({name:e.name,weight:e.weight});setTimeout(()=>setNewPR(null),3500);}});
    setEditingSession(null);notify("Allenamento modificato ✓");
  };

  const deleteSession=(id)=>{
    const newSessions=sessions.filter(s=>s.id!==id);
    updateSessions(newSessions);db(SESS_KEY,newSessions);
    notify("Allenamento eliminato","#ef4444");
  };

  const C=makeC(null,themePrefs.mode);const density=DENSITY_MODES[themePrefs.density]||DENSITY_MODES.normal;const S=makeS(C,density);
  const dayColorMap={};
  programs.forEach(p=>(p.days||[]).forEach((d,i)=>{dayColorMap[`${p.id}:${d.name}`]=d.color||DAY_COLORS[i%DAY_COLORS.length];dayColorMap[d.name]=dayColorMap[d.name]||d.color||DAY_COLORS[i%DAY_COLORS.length];}));

  const Toast=()=>toast?<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:toast.col,color:"#fff",padding:"10px 20px",borderRadius:10,zIndex:9999,fontSize:12,letterSpacing:1,boxShadow:"0 4px 20px #0008",whiteSpace:"nowrap"}}>{toast.msg}</div>:null;
  const PRBanner=()=>newPR?<div className="pr-pop" style={{position:"fixed",top:"max(60px,env(safe-area-inset-top))",left:"50%",background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"#fff",padding:"10px 20px",borderRadius:12,zIndex:9998,textAlign:"center",boxShadow:"0 4px 24px #000a",minWidth:190}}><p style={{margin:0,fontSize:10,letterSpacing:2,opacity:0.85}}>🏆 NUOVO RECORD</p><p style={{margin:0,fontSize:17,fontWeight:900}}>{newPR.name}</p><p style={{margin:0,fontSize:13}}>{newPR.weight} kg</p></div>:null;

  const Header=({title,right})=>(
    <header style={S.hdr}>
      <h1 style={S.logo}>⚡ {title||"IRON LOG"}</h1>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {right}
        <button onClick={toggleTheme} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",padding:2}}>{(()=>{const m=themePrefs.mode||"dark_pure";return m.startsWith("light")?"🌙":"☀";})()}</button>
      </div>
    </header>
  );

  if(view==="loading")return(
    <div style={{...S.app,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <div style={{fontSize:42,marginBottom:12,animation:"pulse 1.5s infinite"}}>⚡</div>
      <p style={{color:"#ef4444",letterSpacing:8,fontSize:18,fontWeight:900,margin:"0 0 6px"}}>IRON LOG</p>
      <p style={{color:C.text3,letterSpacing:3,fontSize:9,margin:0}}>CARICAMENTO...</p>
    </div>
  );

  if(view==="checkin"&&activeDay!==null&&program){
    return(
      <div style={S.app}><Toast/>
        <CheckinScreen C={C} S={S} dayName={program.days[activeDay].name}
          onConfirm={confirmCheckin}
          onSkip={()=>{setCheckinData(null);setWorkoutStart(Date.now());setView("log");}}
        />
      </div>
    );
  }

  if(view==="finish"){
    return(<><PRBanner/><FinishPage C={C} S={S} workoutStart={workoutStart} program={program} activeDay={activeDay} logData={logData} sessionsRef={sessionsRef} checkinData={checkinData} onDone={handleFinish}/><TabBar view="finish" setView={setView} C={C}/></>);
  }

  if(view==="setup"||view==="setup-edit"){
    const isEdit=view==="setup-edit";
    const editInitial=isEdit?(programs.find(p=>p.id===editingProgramId)||program):null;
    return(
      <div style={S.app}><Toast/>
        <Header right={isEdit&&<button style={S.btn("ghost")} onClick={()=>setView("workout")}>← TORNA</button>}/>
        <div style={S.wrap}><SetupWizard S={S} C={C} initial={editInitial} onSave={saveProgram} onCancel={isEdit?()=>{setEditingProgramId(null);setView("workout");}:null}/></div>
        <TabBar view="setup" setView={setView} C={C}/>
      </div>
    );
  }

  if(view==="log"&&activeDay!==null&&program){
    const day=program.days[activeDay];
    const dayCol=dayColorMap[day.name]||"#ef4444";
    const allScored=day.exercises.every(ex=>logData[ex.name]?.score);
    const prevRec=getRecords(sessionsRef.current);
    return(
      <div style={S.app}><Toast/><PRBanner/>
        <header style={{...S.hdr,borderBottomColor:dayCol}}>
          <div><h1 style={{...S.logo,color:dayCol}}>⚡ IRON LOG</h1><p style={{margin:0,fontSize:8,color:C.text3,letterSpacing:2}}>{day.name.toUpperCase()}</p></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {workoutStart&&<WorkoutClock startTime={workoutStart} C={C}/>}
            <button onClick={toggleTheme} style={{background:"none",border:"none",fontSize:14,cursor:"pointer",padding:2}}>{(()=>{const m=themePrefs.mode||"dark_pure";return m.startsWith("light")?"🌙":"☀";})()}</button>
            <button style={S.btn("ghost")} onClick={()=>{setActiveDay(null);setWorkoutStart(null);setView("workout");}}>✕</button>
          </div>
        </header>
      <div style={S.wrap}>
          {/* Progress bar allenamento */}
          {(()=>{
            const total=day.exercises.length;
            const scored=day.exercises.filter(ex=>logData[ex.name]?.score).length;
            const filled=day.exercises.filter(ex=>logData[ex.name]?.weight>0).length;
            const pct=total>0?Math.round((filled/total)*100):0;
            return(
              <div style={{...S.card,padding:"10px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:8,letterSpacing:2,color:C.text3}}>PROGRESSIONE ALLENAMENTO</span>
                  <span style={{fontSize:11,fontWeight:900,color:pct===100?"#10b981":"#ef4444"}}>{pct===100?"✓ COMPLETO":`${filled}/${total} esercizi`}</span>
                </div>
                <div style={{height:6,borderRadius:4,background:C.bg4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:pct===100?"linear-gradient(90deg,#10b981,#22c55e)":"linear-gradient(90deg,#ef4444,#f97316)",borderRadius:4,transition:"width 0.5s ease"}}/>
                </div>
                {pct>0&&pct<100&&<p style={{margin:"4px 0 0",fontSize:8,color:C.text4}}>{scored} con difficoltà segnata</p>}
              </div>
            );
          })()}
          <RestTimer C={C} S={S} sticky={true}/>
          <div style={{...S.card,padding:"10px 14px"}}><HydrationTracker C={C}/></div>
          {/* Avviso pre-compilazione automatica */}
          {day.exercises.some(ex=>getSuggestion(ex.name,ex.minReps,ex.maxReps,ex.step,sessions))&&(
            <div style={{background:"#3b82f618",border:"1px solid #3b82f630",borderRadius:8,padding:"7px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12}}>🤖</span>
              <p style={{margin:0,fontSize:9,color:"#3b82f6"}}>Pesi e reps pre-compilati con la progressione suggerita. Modifica se necessario, poi segna la difficoltà.</p>
            </div>
          )}
          {day.exercises.map((ex,i)=>{
            const sg=getSuggestion(ex.name,ex.minReps,ex.maxReps,ex.step,sessions);
            const cur=logData[ex.name]||{};
            const pr=prevRec[ex.name];
            const isNewPR=parseFloat(cur.weight||0)>0&&pr&&parseFloat(cur.weight)>pr.weight;
            const goal=goals[ex.name];
            const goalPct=pr&&goal?Math.min(pr.weight/goal,1):null;
            // trova l'ultima sessione in cui compare questo esercizio
            const lastEx=(()=>{
              for(let j=sessions.length-1;j>=0;j--){
                const e=sessions[j].exercises.find(e=>e.name===ex.name);
                if(e)return{...e,date:sessions[j].date};
              }return null;
            })();
            const curW=parseFloat(cur.weight)||0;
            const weightDelta=lastEx&&curW>0?Math.round((curW-lastEx.weight)*10)/10:null;
            // warm-up: solo al primo esercizio del gruppo muscolare nell'allenamento
            const isFirstOfMuscle=i===day.exercises.findIndex(e=>e.muscle===ex.muscle);
            const workWeight=parseFloat(cur.weight)||sg?.nw||lastEx?.weight||0;
            const warmupWeight=workWeight>0?Math.round(workWeight*0.6/2.5)*2.5:null;
            return(
              <div key={i} style={{...S.card,borderLeft:`3px solid ${MUSCLE_COLORS[ex.muscle]||dayCol}`}}>
                {/* Warm-up: solo al primo esercizio del gruppo muscolare */}
                {isFirstOfMuscle&&warmupWeight>0&&(
                  <div style={{background:"#f59e0b18",border:"1px solid #f59e0b30",borderRadius:7,padding:"6px 10px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,flexShrink:0}}>🔥</span>
                    <div>
                      <p style={{margin:"0 0 1px",fontSize:8,fontWeight:700,color:"#f59e0b",letterSpacing:1}}>RISCALDAMENTO {ex.muscle.toUpperCase()}</p>
                      <p style={{margin:0,fontSize:10,color:C.text2}}>{warmupWeight}kg × 10–12 rip · 1 serie leggera</p>
                    </div>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:10,alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <p style={{margin:0,fontSize:16,fontWeight:700,color:C.text}}>{ex.name}</p>
                      {isNewPR&&<span style={{fontSize:9,background:"#f59e0b",color:"#000",borderRadius:4,padding:"1px 5px",fontWeight:700}}>🏆 PR!</span>}
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={S.tag(ex.muscle)}>{ex.muscle}</span>
                      <span style={{fontSize:9,color:C.text4}}>{ex.minReps}–{ex.maxReps} rip</span>
                      {pr&&<span style={{fontSize:9,color:C.text3}}>🏆 {pr.weight}kg</span>}
                      {/* Serie modificabili on-the-fly */}
                      <div style={{display:"flex",alignItems:"center",gap:4,background:C.bg3,borderRadius:6,padding:"1px 4px",border:`1px solid ${C.border2}`}}>
                        <button onClick={()=>setLogData(d=>({...d,[ex.name]:{...d[ex.name],sets:Math.max(1,(d[ex.name]?.sets||ex.sets)-1)}}))} style={{background:"none",border:"none",color:"#ef4444",fontSize:14,cursor:"pointer",lineHeight:1,padding:"0 2px",fontFamily:"inherit"}}>−</button>
                        <span style={{fontSize:10,fontWeight:700,color:C.text,minWidth:18,textAlign:"center"}}>{cur.sets||ex.sets}×</span>
                        <button onClick={()=>setLogData(d=>({...d,[ex.name]:{...d[ex.name],sets:(d[ex.name]?.sets||ex.sets)+1}}))} style={{background:"none",border:"none",color:"#10b981",fontSize:14,cursor:"pointer",lineHeight:1,padding:"0 2px",fontFamily:"inherit"}}>+</button>
                      </div>
                    </div>
                    {goalPct!==null&&<div style={{marginTop:5,height:3,borderRadius:2,background:C.bg4}}><div style={{height:"100%",width:`${goalPct*100}%`,background:goalPct>=1?"#f59e0b":"#ef4444",borderRadius:2}}/></div>}
                    {/* Ultima volta */}
                    {lastEx&&(
                      <div style={{marginTop:5,display:"flex",alignItems:"center",gap:5,padding:"3px 7px",background:C.bg3,borderRadius:6,width:"fit-content"}}>
                        <span style={{fontSize:8,color:C.text4}}>ultima:</span>
                        <span style={{fontSize:9,fontWeight:700,color:C.text2}}>{lastEx.weight}kg×{lastEx.reps}</span>
                        {weightDelta!==null&&weightDelta!==0&&(
                          <span style={{fontSize:8,fontWeight:700,color:weightDelta>0?"#10b981":"#f59e0b"}}>{weightDelta>0?"+":""}{weightDelta}kg</span>
                        )}
                        <span style={{fontSize:7,color:C.text4}}>{lastEx.date}</span>
                      </div>
                    )}
                  </div>
                  <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",textAlign:"right",flexShrink:0,minWidth:105}}>
                    {sg?(<>
                      <div style={{display:"flex",justifyContent:"flex-end",alignItems:"baseline",gap:3}}>
                        <span style={{fontSize:18,color:"#ef4444",fontWeight:900,lineHeight:1}}>{sg.nw}kg</span>
                        <span style={{fontSize:11,color:C.text3}}>×{sg.nr}</span>
                      </div>
                      <div style={{display:"inline-block",background:sg.badge+"22",borderRadius:4,padding:"2px 5px",margin:"2px 0"}}>
                        <span style={{fontSize:8,color:sg.badge,fontWeight:700}}>{sg.action}</span>
                      </div>
                      <p style={{margin:0,fontSize:8,color:C.text4,lineHeight:1.3}}>{sg.detail}</p>
                    </>):(
                      <><p style={{margin:"0 0 2px",fontSize:10,color:C.text3}}>Prima volta</p><p style={{margin:0,fontSize:9,color:"#ef4444"}}>da {ex.minReps} rip</p></>
                    )}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div>
                    <label style={S.lbl}>Peso (kg){sg&&cur.weight==sg.nw&&!cur._touched?" 🤖":""}</label>
                    <input type="number" inputMode="decimal" min="0" step="0.5"
                      style={{...S.inp,fontSize:22,fontWeight:900,textAlign:"center",borderColor:isNewPR?"#f59e0b":cur.weight==sg?.nw&&!cur._touched?C.border:C.border2}}
                      placeholder={sg?sg.nw:"0"} value={cur.weight??""}
                      onChange={e=>setLogData(d=>({...d,[ex.name]:{...d[ex.name],weight:e.target.value,_touched:true}}))}/>
                  </div>
                  <div>
                    <label style={S.lbl}>Ripetizioni{sg&&cur.reps==sg.nr&&!cur._touched?" 🤖":""}</label>
                    <input type="number" inputMode="numeric" min="1" max="100"
                      style={{...S.inp,fontSize:22,fontWeight:900,textAlign:"center"}}
                      placeholder={sg?sg.nr:ex.minReps} value={cur.reps??""}
                      onChange={e=>setLogData(d=>({...d,[ex.name]:{...d[ex.name],reps:e.target.value,_touched:true}}))}/>
                  </div>
                </div>
                <div style={{marginBottom:8}}>
                  <label style={S.lbl}>Com'è andata?</label>
                  <ScorePicker value={cur.score} onChange={v=>setLogData(d=>({...d,[ex.name]:{...d[ex.name],score:v}}))} C={C}/>
                </div>
                <input style={{...S.inp,fontSize:12,padding:"8px 10px"}} placeholder="Note esercizio..."
                  value={cur.note||""} onChange={e=>setLogData(d=>({...d,[ex.name]:{...d[ex.name],note:e.target.value}}))}/>
              </div>
            );
          })}
          <button style={{...S.btn(allScored?"red":"ghost"),width:"100%",padding:16,fontSize:13,letterSpacing:2,marginTop:4,
            background:allScored?"linear-gradient(135deg,#ef4444,#dc2626)":"transparent",
            boxShadow:allScored?"0 4px 20px #ef444450":"none",
            ...(allScored?{animation:"glow 2s infinite"}:{})
          }} onClick={allScored?()=>setView("finish"):undefined}>
            {allScored?"🏁 TERMINA ALLENAMENTO":"⚠ Inserisci difficoltà per ogni esercizio"}
          </button>
        </div>
        <TabBar view="log" setView={(v)=>{
          if(v!=="log"&&v!=="finish"){
            if(window.confirm("⚠️ Allenamento in corso!\n\nSe esci perdi tutti i dati inseriti.\nSei sicuro?"))setView(v);
          }else setView(v);
        }} C={C}/>
      </div>
    );
  }

  if(view==="history"){
    const allExNames=[...new Set([
      ...programs.flatMap(p=>(p.days||[]).flatMap(d=>d.exercises.map(e=>e.name))),
      ...sessions.flatMap(s=>(s.exercises||[]).map(e=>e.name))
    ])];
    const records=getRecords(sessions);
    const streak=getStreak(sessions,actEntries);
    const totMins=sessions.reduce((s,x)=>s+(x.duration||0),0);
    const totKcal=sessions.reduce((s,x)=>s+(x.kcal||0),0);
    const withDur=sessions.filter(s=>s.duration>0);
    const avgDur=withDur.length?Math.round(totMins/withDur.length):0;
    const weekGroups=groupByWeek(sessions);
    const thisWVol=(weekGroups[0]||[null,[]])[1].reduce((t,s)=>t+sessionVol(s),0);
    const lastWVol=(weekGroups[1]||[null,[]])[1].reduce((t,s)=>t+sessionVol(s),0);
    const wkDelta=lastWVol>0?Math.round((thisWVol-lastWVol)/lastWVol*100):null;

    const HistoryInner=()=>{
      const htab=historyTab;
      const setHtab=setHistoryTab;
      const htabs=[["profilo","👤"],["analisi","🧬"],["grafici","📈"],["esercizi","🏋"],["log","📋"]];
      return(
        <div>
          {/* Stat pillole sempre visibili */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
            {[["🔥 STREAK",`${streak}w`,"#ef4444"],["📊 SESSIONI",""+sessions.length,C.text],["🏆 PR",""+Object.keys(records).length,"#f59e0b"]].map(([l,v,col])=>(
              <div key={l} style={{...S.card,textAlign:"center",padding:"9px 4px",marginBottom:0}}><p style={{margin:"0 0 1px",fontSize:7,color:C.text3,letterSpacing:1}}>{l}</p><p style={{margin:0,fontSize:17,fontWeight:900,color:col}}>{v}</p></div>
            ))}
          </div>

          {/* Tab bar storico */}
          <div style={{display:"flex",gap:3,marginBottom:12,background:C.bg3,borderRadius:10,padding:4}}>
            {htabs.map(([k,icon])=>(
              <button key={k} onClick={()=>setHtab(k)} style={{flex:1,padding:"7px 2px",borderRadius:8,border:"none",background:htab===k?C.bg2:"transparent",color:htab===k?C.text:C.text3,fontSize:9,fontWeight:htab===k?700:400,cursor:"pointer",fontFamily:"inherit",letterSpacing:0.3,transition:"all 0.15s"}}>
                {icon} {k.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ── PROFILO ── */}
          {htab==="profilo"&&(
            <div className="fade-up">
              <XPLevelCard sessions={sessions} actEntries={actEntries} C={C} S={S}/>
              <BadgeWall sessions={sessions} records={records} actEntries={actEntries} C={C} S={S}/>
            </div>
          )}


          {/* ── ANALISI AVANZATA ── */}
          {htab==="analisi"&&(
            <AnalisiPanel sessions={sessions} bwEntries={bwEntries} actEntries={actEntries}
              nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} records={records} themePrefs={themePrefs} setThemePrefs={setThemePrefs} C={C} S={S}/>
          )}

          {/* ── GRAFICI ── */}
          {htab==="grafici"&&(
            <div className="fade-up">
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
                {[["⏱ TEMPO",fmtDur(totMins)],["🔥 KCAL",totKcal?totKcal.toLocaleString():"—"],["⌀ DURATA",fmtDur(avgDur)]].map(([l,v])=>(
                  <div key={l} style={{...S.card,textAlign:"center",padding:"9px 4px",marginBottom:0}}><p style={{margin:"0 0 1px",fontSize:7,color:C.text3,letterSpacing:1}}>{l}</p><p style={{margin:0,fontSize:12,fontWeight:900,color:C.text}}>{v}</p></div>
                ))}
              </div>
              {wkDelta!==null&&<div style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <p style={{margin:0,fontSize:10,color:C.text2}}>Volume sett. corrente vs scorsa</p>
                <span style={{fontSize:20,fontWeight:900,color:wkDelta>=0?"#10b981":"#ef4444"}}>{wkDelta>=0?"+":""}{wkDelta}%</span>
              </div>}
              <div style={S.card}><WeekCalendar sessions={sessions} program={program} actEntries={actEntries} C={C} offset={calOffset} setOffset={setCalOffset}/></div>
              {sessions.length>=2&&<div style={S.card}><VolumeChart sessions={sessions} C={C}/></div>}
              {sessions.length>=4&&<div style={S.card}><MuscleVolumeMatrix sessions={sessions} C={C}/></div>}
              {sessions.length>=4&&<div style={S.card}><ConsistencyBar sessions={sessions} C={C}/></div>}
              {sessions.length>=3&&<div style={S.card}><MuscleChart sessions={sessions} C={C}/></div>}
              {sessions.length>=4&&<div style={S.card}><RadarChart sessions={sessions} C={C}/></div>}
              {sessions.length>=7&&<div style={S.card}><HeatmapChart sessions={sessions} actEntries={actEntries} C={C}/></div>}
              {sessions.length>=4&&<MonthlyCalendar sessions={sessions} actEntries={actEntries} dayColorMap={dayColorMap} C={C} S={S}/>}
            </div>
          )}

          {/* ── ESERCIZI ── */}
          {htab==="esercizi"&&(
            <div className="fade-up">
              <PRHallOfFame sessions={sessions} program={program} C={C} S={S}/>
              <h2 style={{...S.h2,marginTop:12}}>PROGRESSIONE</h2>
              {allExNames.length===0&&<p style={{color:C.text4,textAlign:"center",fontSize:12,padding:"20px 0"}}>Nessuna sessione ancora</p>}
              {allExNames.map(name=><ExerciseRow key={name} name={name} sessions={sessions} goal={goals[name]} onGoalChange={setGoal} records={records} C={C} S={S}/>)}
            </div>
          )}

          {/* ── LOG ── */}
          {htab==="log"&&(
            <div className="fade-up">
              {/* Export */}
              <div style={{...S.card,marginBottom:10}}>
                <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 12px"}}>📦 ESPORTA & IMPORTA</p>
                <p style={{fontSize:8,letterSpacing:2,color:C.text3,margin:"0 0 6px"}}>BACKUP COMPLETO</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <button style={{...S.btn("red"),padding:"11px 8px",fontSize:10}} onClick={exportAllJSON}>⬇ JSON Backup</button>
                  <label style={{padding:"11px 8px",fontSize:10,textAlign:"center",cursor:"pointer",display:"block",borderRadius:8,border:`1px solid ${C.border2}`,color:C.text3,fontFamily:"inherit"}}>
                    ⬆ Importa JSON<input type="file" accept=".json" onChange={importJSON} style={{display:"none"}}/>
                  </label>
                </div>
                <p style={{fontSize:8,letterSpacing:2,color:C.text3,margin:"0 0 6px"}}>ESPORTA CSV</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[["🏋 Allenamenti",exportSessionsCSV,sessions.length>0],["⚖ Corpo",exportBodyCSV,bwEntries.length>0],["🍎 Nutrizione",exportNutrCSV,Object.keys(nutrEntries).length>0],["🔥 Bilancio",exportCalCSV,Object.keys(tdeeEntries).length>0||Object.keys(nutrEntries).length>0],["🏃 Attività",exportActivitiesCSV,Object.keys(actEntries).length>0]].map(([label,fn,hasData])=>(
                    <button key={label} onClick={fn} disabled={!hasData} style={{padding:"9px 6px",fontSize:10,borderRadius:8,border:`1px solid ${C.border2}`,background:"transparent",color:hasData?C.text2:C.text4,cursor:hasData?"pointer":"default",opacity:hasData?1:0.35,fontFamily:"inherit",textAlign:"left"}}>{label}</button>
                  ))}
                </div>
              </div>
              {/* Sessioni */}
              <h2 style={S.h2}>SESSIONI PER SETTIMANA</h2>
              {!sessions.length&&(
                <div style={{...S.card,textAlign:"center",padding:"32px 20px",borderStyle:"dashed",borderColor:C.border2}}>
                  <div style={{fontSize:42,marginBottom:12,opacity:0.5}}>🏋</div>
                  <p style={{margin:"0 0 6px",fontSize:15,fontWeight:700,color:C.text}}>Nessun allenamento ancora</p>
                  <p style={{margin:"0 0 18px",fontSize:11,color:C.text3,lineHeight:1.5}}>Vai su WORKOUT e premi ▶ INIZIA per registrare la tua prima sessione.</p>
                  <button style={{...S.btn("red"),padding:"10px 24px",fontSize:11}} onClick={()=>setView("workout")}>→ VAI A WORKOUT</button>
                </div>
              )}
              {sessions.length>0&&<HistoryLogFilter sessions={sessions} weekGroups={weekGroups} program={program} actEntries={actEntries} deleteSession={deleteSession} setEditingSession={setEditingSession} C={C} S={S}/>}
            </div>
          )}
        </div>
      );
    };

    return(
      <div style={S.app}><Toast/>
        {editingSession&&<SessionEditModal session={editingSession} onSave={saveEditedSession} onClose={()=>setEditingSession(null)} C={C} S={S}/>}
        <Header/>
        <div style={S.wrap}><HistoryInner/></div>
        <TabBar view="history" setView={setView} C={C}/>
      </div>
    );
  }

  if(view==="fisico"){
    return(
      <div style={S.app}><Toast/>
        <Header title="FISICO"/>
        <FisicoScreen C={C} S={S}
          bwEntries={bwEntries} setBwEntries={(v)=>{setBwEntries(v);db(BW_KEY,v);}}
          nutrEntries={nutrEntries} setNutrEntries={(v)=>{setNutrEntries(v);db(NUTR_KEY,v);}}
          actEntries={actEntries} setActEntries={(v)=>{setActEntries(v);db(ACT_KEY,v);}}
          tdeeEntries={tdeeEntries} setTdeeEntries={(v)=>{setTdeeEntries(v);db(TDEE_KEY,v);}}
          sessions={sessions}
        />
        <TabBar view="fisico" setView={setView} C={C}/>
      </div>
    );
  }

  // ── WORKOUT DASHBOARD ──
  const streak=getStreak(sessions,actEntries);
  const records=getRecords(sessions);
  const lastSess=sessions.length?sessions[sessions.length-1]:null;

  const WorkoutInner=()=>{
    const wtab=workoutTab;
    const setWtab=setWorkoutTab;
    const viewedProgram=programs.find(p=>p.id===viewProgramId)||program;
    const isViewingActive=viewedProgram?.id===activeProgramId;
    const programSessionCount=(pid)=>sessions.filter(s=>s.programId===pid||(!s.programId&&pid===activeProgramId)).length;
    const viewedProgramSessions=viewedProgram?sessions.filter(s=>s.programId===viewedProgram.id||(!s.programId&&viewedProgram.id===activeProgramId)):[];
    return(
      <div>
        <div style={{display:"flex",gap:4,marginBottom:12,background:C.bg3,borderRadius:10,padding:4}}>
          {[["oggi","📅 OGGI"],["programma","🏋 PROGRAMMA"]].map(([k,label])=>(
            <button key={k} onClick={()=>setWtab(k)} style={{flex:1,padding:"9px 4px",borderRadius:8,border:"none",background:wtab===k?C.bg2:"transparent",color:wtab===k?C.text:C.text3,fontSize:11,fontWeight:wtab===k?700:400,cursor:"pointer",fontFamily:"inherit",letterSpacing:1,transition:"all 0.15s"}}>
              {label}
            </button>
          ))}
        </div>

        {wtab==="oggi"&&(
          <div className="fade-up">
            {/* Quote card con gradient */}
            <div style={{...S.card,borderLeft:"3px solid #ef4444",marginBottom:10,background:`linear-gradient(135deg,${C.bg2},${C.bg3})`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",right:-10,top:-10,fontSize:60,opacity:0.06,lineHeight:1,userSelect:"none"}}>💬</div>
              <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:"#ef4444"}}>MOTIVAZIONE DEL GIORNO</p>
              <p style={{margin:0,fontSize:13,color:C.text,fontStyle:"italic",lineHeight:1.6,fontWeight:500}}>"{QUOTES[new Date().getDay()%QUOTES.length]}"</p>
            </div>

            {/* Streak prominente se > 1 */}
            {streak>=2&&(
              <div style={{...S.card,marginBottom:10,background:"linear-gradient(135deg,#ef444415,#f59e0b08)",borderLeft:"3px solid #ef4444",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:32,lineHeight:1,filter:"drop-shadow(0 2px 8px #ef444480)"}}>🔥</div>
                <div style={{flex:1}}>
                  <p style={{margin:"0 0 1px",fontSize:8,letterSpacing:2,color:"#ef4444"}}>STREAK SETTIMANALE</p>
                  <p style={{margin:0,fontSize:22,fontWeight:900,color:C.text,lineHeight:1}}>{streak} <span style={{fontSize:12,fontWeight:400,color:C.text3}}>settimane di fila</span></p>
                </div>
                <div style={{fontSize:24}}>{streak>=8?"🏆":streak>=4?"⚡":"💪"}</div>
              </div>
            )}

            <TodaySnapshot sessions={sessions} nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} actEntries={actEntries} program={program} C={C} S={S}/>
            <DayScoreCard date={todayISO()} sessions={sessions} nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} bwEntries={bwEntries} actEntries={actEntries} C={C} S={S}/>
            <DailyShareCard date={todayISO()} sessions={sessions} nutrEntries={nutrEntries} tdeeEntries={tdeeEntries} bwEntries={bwEntries} actEntries={actEntries} C={C} S={S}/>
            <WeekSummary sessions={sessions} setSessions={(v)=>{updateSessions(v);db(SESS_KEY,v);}} nutrEntries={nutrEntries} setNutrEntries={(v)=>{setNutrEntries(v);db(NUTR_KEY,v);}} actEntries={actEntries} setActEntries={(v)=>{setActEntries(v);db(ACT_KEY,v);}} tdeeEntries={tdeeEntries} setTdeeEntries={(v)=>{setTdeeEntries(v);db(TDEE_KEY,v);}} program={program} C={C} S={S}/>
            {(()=>{const xp=calcXP(sessions,actEntries);const lv=getLevel(xp);const pct=getLevelProgress(xp);const unlockedCount=getUnlockedBadges(sessions,records,actEntries).length;return(
              <div style={{...S.card,marginTop:10,display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderLeft:`3px solid ${lv.color}`,background:`linear-gradient(135deg,${C.bg2},${C.bg3})`}}>
                <span style={{fontSize:26}}>{lv.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:900,color:lv.color,letterSpacing:1}}>{lv.name}</span>
                    <span style={{fontSize:9,color:C.text4}}>{xp.toLocaleString()} XP</span>
                  </div>
                  <div style={{height:5,borderRadius:3,background:C.bg4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct*100}%`,background:lv.color,borderRadius:3,transition:"width 1s",boxShadow:`0 0 6px ${lv.color}80`}}/>
                  </div>
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <p style={{margin:"0 0 1px",fontSize:8,color:C.text4}}>BADGE</p>
                  <p style={{margin:0,fontSize:14,fontWeight:900,color:"#f59e0b"}}>{unlockedCount}/{BADGES.length}</p>
                </div>
              </div>
            );})()} 
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}>
              {[["🔥 STREAK",`${streak}w`,"#ef4444"],["📊 SESSIONI",""+sessions.length,C.text],["🏆 PR",""+Object.keys(records).length,"#f59e0b"]].map(([l,v,col])=>(
                <div key={l} style={{...S.card,textAlign:"center",padding:"10px 6px",marginBottom:0}}><p style={{margin:"0 0 2px",fontSize:8,color:C.text3,letterSpacing:1}}>{l}</p><p style={{margin:0,fontSize:16,fontWeight:900,color:col}}>{v}</p></div>
              ))}
            </div>
            <div style={{...S.card,padding:"10px 14px",marginTop:10}}><HydrationTracker C={C}/></div>
            {lastSess&&(
              <div style={{...S.card,padding:"10px 14px",marginTop:10,borderLeft:`3px solid ${lastSess.dayColor||dayColorMap[`${lastSess.programId}:${lastSess.dayName}`]||dayColorMap[lastSess.dayName]||"#ef4444"}`}}>
                <p style={{margin:"0 0 4px",fontSize:8,color:C.text3,letterSpacing:2}}>ULTIMO ALLENAMENTO</p>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{lastSess.dayName}</p><p style={{margin:0,fontSize:9,color:C.text3}}>{lastSess.programName?`${lastSess.programName} · `:""}{lastSess.date}</p></div>
                  <div style={{textAlign:"right"}}>
                    {lastSess.duration>0&&<p style={{margin:0,fontSize:10,color:C.text2}}>⏱ {fmtDur(lastSess.duration)}</p>}
                    {lastSess.kcal>0&&<p style={{margin:0,fontSize:10,color:"#f97316"}}>🔥 {lastSess.kcal} kcal</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {wtab==="programma"&&(
          <div className="fade-up">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:12}}>
              <h2 style={{...S.h2,marginBottom:0}}>SCHEDE ALLENAMENTO</h2>
              <button style={{...S.btn("red"),padding:"8px 12px",fontSize:9,whiteSpace:"nowrap"}} onClick={startNewProgram}>+ NUOVA</button>
            </div>
            {programs.length>0&&(
              <div style={{...S.card,padding:"10px 12px",marginBottom:10}}>
                <p style={{margin:"0 0 8px",fontSize:8,letterSpacing:2,color:C.text3}}>ARCHIVIO SCHEDE</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6}}>
                  {programs.map(p=>{
                    const active=p.id===activeProgramId;
                    const selected=p.id===viewedProgram?.id;
                    const cnt=programSessionCount(p.id);
                    return(
                      <button key={p.id} onClick={()=>setViewProgramId(p.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,textAlign:"left",borderRadius:8,border:`1px solid ${selected?"#ef4444":C.border2}`,background:selected?"#ef444418":C.bg3,padding:"9px 10px",cursor:"pointer",fontFamily:"inherit"}}>
                        <div style={{minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <span style={{fontSize:11,fontWeight:900,color:active?"#10b981":C.text}}>{p.name}</span>
                            {active&&<span style={{fontSize:7,color:"#10b981",border:"1px solid #10b98155",borderRadius:4,padding:"1px 5px"}}>ATTIVA</span>}
                          </div>
                          <p style={{margin:0,fontSize:8,color:C.text4}}>{p.startedAt||p.createdAt||"—"}{p.endedAt?` → ${p.endedAt}`:""} · {cnt} allenamenti · {(p.days||[]).length} giorni</p>
                        </div>
                        <span style={{fontSize:16,color:selected?"#ef4444":C.text4}}>›</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {viewedProgram&&(
              <div style={{...S.card,borderLeft:`3px solid ${isViewingActive?"#10b981":"#f59e0b"}`,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <div>
                    <p style={{margin:"0 0 3px",fontSize:8,letterSpacing:2,color:isViewingActive?"#10b981":"#f59e0b"}}>{isViewingActive?"SCHEDA ATTIVA":"SCHEDA ARCHIVIATA"}</p>
                    <p style={{margin:"0 0 4px",fontSize:18,fontWeight:900,color:C.text}}>{viewedProgram.name}</p>
                    <p style={{margin:0,fontSize:9,color:C.text3}}>{viewedProgramSessions.length} allenamenti salvati · {(viewedProgram.days||[]).length} giorni</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                    {isViewingActive
                      ? <button style={{...S.btn("ghost"),padding:"7px 12px",fontSize:9}} onClick={()=>editProgram(viewedProgram.id)}>✏ MODIFICA</button>
                      : <button style={{...S.btn("red"),padding:"7px 12px",fontSize:9,background:"#f59e0b"}} onClick={()=>activateProgram(viewedProgram.id)}>RENDI ATTIVA</button>}
                  </div>
                </div>
              </div>
            )}
            {viewedProgram?.days.map((day,di)=>{
              const muscles=[...new Set(day.exercises.map(e=>e.muscle))];
              const dayCol=day.color||dayColorMap[`${viewedProgram.id}:${day.name}`]||dayColorMap[day.name]||"#ef4444";
              const daySessions=viewedProgramSessions.filter(s=>s.dayName===day.name);
              const lastDS=daySessions.length?daySessions[daySessions.length-1]:null;
              return(
                <div key={di} style={{...S.card,borderTop:`3px solid ${dayCol}`,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:dayCol,boxShadow:`0 0 8px ${dayCol}80`}}/>
                        <p style={{margin:0,fontSize:16,letterSpacing:1,fontWeight:700,color:C.text}}>{day.name}</p>
                        {daySessions.length>0&&<span style={{fontSize:8,color:C.text4,letterSpacing:1}}>{daySessions.length}×</span>}
                      </div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{muscles.map(m=><span key={m} style={S.tag(m)}>{m}</span>)}</div>
                      {lastDS&&<p style={{margin:"4px 0 0",fontSize:8,color:C.text4}}>Ultima volta: {lastDS.date}</p>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                      {isViewingActive&&<button style={{...S.btn("red"),padding:"12px 16px",fontSize:12,background:dayCol,boxShadow:`0 4px 16px ${dayCol}60`,letterSpacing:2}} onClick={()=>startWorkout(di)}>▶ INIZIA</button>}
                      {isViewingActive&&lastDS&&(
                        <button style={{...S.btn("ghost"),padding:"6px 10px",fontSize:9,letterSpacing:1}} onClick={()=>{
                          // pre-compila con i pesi dell'ultima sessione di questo giorno
                          const prefilled={};
                          lastDS.exercises.forEach(e=>{prefilled[e.name]={weight:e.weight,reps:e.reps,sets:e.sets};});
                          // poi sovrascrivi con suggerimenti progressione dove disponibili
                          viewedProgram.days[di].exercises.forEach(ex=>{
                            const sg=getSuggestion(ex.name,ex.minReps,ex.maxReps,ex.step,sessions);
                            if(sg)prefilled[ex.name]={...prefilled[ex.name],weight:sg.nw,reps:sg.nr};
                          });
                          setLogData(prefilled);setActiveDay(di);setWorkoutStart(Date.now());setView("log");
                        }}>🔁 RIPETI</button>
                      )}
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {day.exercises.map((ex,ei)=>{
                      const sg=getSuggestion(ex.name,ex.minReps,ex.maxReps,ex.step,sessions);
                      return(
                        <div key={ei} style={{background:C.bg3,borderRadius:7,padding:"7px 9px",minWidth:92,borderLeft:`2px solid ${MUSCLE_COLORS[ex.muscle]||dayCol}44`}}>
                          <p style={{margin:"0 0 1px",fontSize:10,color:C.text2}}>{ex.name}</p>
                          <p style={{margin:"0 0 1px",fontSize:8,color:C.text4}}>{ex.sets}×{ex.minReps}–{ex.maxReps}</p>
                          {isViewingActive&&sg?<p style={{margin:0,fontSize:12,color:dayCol,fontWeight:900}}>{sg.nw}kg×{sg.nr}</p>:<p style={{margin:0,fontSize:9,color:C.text4}}>{lastDS?"In archivio":"Prima volta"}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return(
    <div style={S.app}><Toast/><PRBanner/>
      <Header/>
      <div style={S.wrap}><WorkoutInner/></div>
      <TabBar view="workout" setView={setView} C={C}/>
    </div>
  );
}

// ── SETUP WIZARD ──
function SetupWizard({S,C,initial,onSave,onCancel}){
  const [programName,setProgramName]=useState(initial?.name||"");
  const [days,setDays]=useState(initial?.days??[]);
  const [editingDay,setEditingDay]=useState(null);
  const [newName,setNewName]=useState("");
  const [tempEx,setTempEx]=useState([]);
  const [muscle,setMuscle]=useState(MUSCLE_GROUPS[0]);
  const [search,setSearch]=useState("");
  const [sets,setSets]=useState(4);
  const [minR,setMinR]=useState(8);
  const [maxR,setMaxR]=useState(12);
  const [step,setStep]=useState(2.5);

  const [dayColor,setDayColor]=useState(DAY_COLORS[0]);
  const startEdit=(i)=>{setTempEx([...days[i].exercises]);setDayColor(days[i].color||DAY_COLORS[i%DAY_COLORS.length]);setEditingDay({name:days[i].name,isNew:false,idx:i,color:days[i].color||DAY_COLORS[i%DAY_COLORS.length]});};
  const [newColor,setNewColor]=useState(()=>DAY_COLORS[0]);
  const startNew=()=>{if(!newName.trim())return;const col=DAY_COLORS[days.length%DAY_COLORS.length];setDayColor(col);setTempEx([]);setEditingDay({name:newName.trim(),isNew:true,idx:days.length,color:col});setNewName("");};
  const addEx=(n)=>{if(tempEx.find(e=>e.name===n))return;setTempEx(t=>[...t,{muscle,name:n,sets,minReps:minR,maxReps:maxR,step}]);};
  const saveDay=()=>{const d={name:editingDay.name,color:dayColor,exercises:tempEx};setDays(ds=>editingDay.isNew?[...ds,d]:ds.map((x,i)=>i===editingDay.idx?d:x));setEditingDay(null);};
  const suggs=(DEFAULT_EX[muscle]||[]).filter(e=>e.toLowerCase().includes(search.toLowerCase())&&!tempEx.find(t=>t.name===e));

  if(editingDay)return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h2 style={{...S.h2,marginBottom:0,borderLeftColor:dayColor}}>{editingDay.name}</h2>
        <button style={S.btn("ghost")} onClick={()=>setEditingDay(null)}>← TORNA</button>
      </div>
      <div style={{...S.card,padding:"10px 14px",marginBottom:10}}>
        <label style={S.lbl}>🎨 Colore del giorno</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
          {DAY_COLORS.map(col=>(
            <button key={col} onClick={()=>setDayColor(col)} style={{width:32,height:32,borderRadius:"50%",background:col,border:dayColor===col?"3px solid #fff":"3px solid transparent",cursor:"pointer",boxShadow:dayColor===col?"0 0 0 2px "+col:"none",transition:"all 0.15s"}}/>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <label style={S.lbl}>Gruppo muscolare</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
          {MUSCLE_GROUPS.map(m=><button key={m} onClick={()=>setMuscle(m)} style={{padding:"7px 11px",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"inherit",border:`2px solid ${muscle===m?MUSCLE_COLORS[m]:C.border2}`,background:muscle===m?MUSCLE_COLORS[m]+"18":"transparent",color:muscle===m?MUSCLE_COLORS[m]:C.text3}}>{m}</button>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:8}}>
          <div><label style={S.lbl}>Serie</label><input type="number" inputMode="numeric" min="1" max="10" style={S.inp} value={sets} onChange={e=>setSets(+e.target.value)}/></div>
          <div><label style={S.lbl}>Min rip.</label><input type="number" inputMode="numeric" min="1" max="30" style={S.inp} value={minR} onChange={e=>setMinR(+e.target.value)}/></div>
          <div><label style={S.lbl}>Max rip.</label><input type="number" inputMode="numeric" min="1" max="50" style={S.inp} value={maxR} onChange={e=>setMaxR(+e.target.value)}/></div>
          <div><label style={S.lbl}>Scalino</label>
            <select style={{...S.inp,padding:"11px 8px"}} value={step} onChange={e=>setStep(+e.target.value)}>
              {[0.5,1,1.25,2,2.5,5,10,15,20].map(v=><option key={v} value={v}>{v}kg</option>)}
            </select>
          </div>
        </div>
        <label style={S.lbl}>Cerca / Aggiungi</label>
        <input style={{...S.inp,marginBottom:8}} placeholder="Nome esercizio..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&search.trim()){addEx(search.trim());setSearch("");}}}/>
        {suggs.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>{suggs.slice(0,9).map(s=><button key={s} onClick={()=>{addEx(s);setSearch("");}} style={{padding:"7px 9px",borderRadius:6,border:`1px solid ${C.border}`,background:C.bg3,color:C.text2,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ {s}</button>)}</div>}
        {search.trim()&&!(DEFAULT_EX[muscle]||[]).includes(search.trim())&&<button onClick={()=>{addEx(search.trim());setSearch("");}} style={{...S.btn("red"),fontSize:11,marginBottom:8}}>+ "{search.trim()}"</button>}
      </div>
      <p style={{fontSize:8,letterSpacing:2,color:C.text4,margin:"0 0 8px"}}>ESERCIZI ({tempEx.length})</p>
      {tempEx.map((ex,i)=>(
        <div key={i} style={{...S.card,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={S.tag(ex.muscle)}>{ex.muscle}</span><span style={{fontSize:13,fontWeight:600,color:C.text}}>{ex.name}</span></div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <span style={{fontSize:9,color:C.text4}}>{ex.sets}×{ex.minReps}–{ex.maxReps}·+{ex.step||2.5}kg</span>
            <div style={{display:"flex",flexDirection:"column",gap:1}}>
              <button onClick={()=>setTempEx(t=>{if(i===0)return t;const n=[...t];[n[i-1],n[i]]=[n[i],n[i-1]];return n;})} disabled={i===0} style={{background:"none",border:"none",color:i===0?C.text4:C.text2,cursor:i===0?"default":"pointer",fontSize:12,lineHeight:1,padding:"0 3px",fontFamily:"inherit"}}>▲</button>
              <button onClick={()=>setTempEx(t=>{if(i===t.length-1)return t;const n=[...t];[n[i],n[i+1]]=[n[i+1],n[i]];return n;})} disabled={i===tempEx.length-1} style={{background:"none",border:"none",color:i===tempEx.length-1?C.text4:C.text2,cursor:i===tempEx.length-1?"default":"pointer",fontSize:12,lineHeight:1,padding:"0 3px",fontFamily:"inherit"}}>▼</button>
            </div>
            <button onClick={()=>setTempEx(t=>t.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,padding:"0 4px"}}>✕</button>
          </div>
        </div>
      ))}
      <button style={{...S.btn(tempEx.length?"red":"ghost"),width:"100%",padding:14,fontSize:13,letterSpacing:2,marginTop:4}} onClick={tempEx.length?saveDay:undefined} disabled={!tempEx.length}>✓ SALVA GIORNO</button>
    </div>
  );
  return(
    <div>
      <h2 style={S.h2}>{initial?"MODIFICA SCHEDA":"CREA UNA SCHEDA"}</h2>
      <p style={{fontSize:9,color:C.text3,margin:"0 0 12px"}}>Dai un nome alla scheda e aggiungi i giorni di allenamento.</p>
      <div style={{...S.card,border:`1px dashed ${C.border}`}}>
        <label style={S.lbl}>Nome scheda</label>
        <input style={S.inp} placeholder="Es. Massa primavera, Forza autunno..." value={programName} onChange={e=>setProgramName(e.target.value)}/>
      </div>
      {days.map((d,i)=>(
        <div key={i} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${d.color||DAY_COLORS[i%DAY_COLORS.length]}`}}>
          <div><p style={{margin:"0 0 4px",fontSize:14,fontWeight:700,color:C.text}}>{d.name}</p><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{[...new Set(d.exercises.map(e=>e.muscle))].map(m=><span key={m} style={S.tag(m)}>{m}</span>)}</div></div>
          <div style={{display:"flex",gap:6}}>
            <button style={{...S.btn("ghost"),padding:"7px 10px",fontSize:9}} onClick={()=>startEdit(i)}>✏</button>
            <button style={{background:"none",border:"none",color:C.text3,cursor:"pointer",fontSize:18,padding:"0 4px"}} onClick={()=>setDays(ds=>ds.filter((_,j)=>j!==i))}>✕</button>
          </div>
        </div>
      ))}
      <div style={{...S.card,border:`1px dashed ${C.border}`}}>
        <label style={S.lbl}>Nome nuovo giorno</label>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:DAY_COLORS[days.length%DAY_COLORS.length],flexShrink:0}}/>
          <input style={{...S.inp,flex:1}} placeholder="Es. Push Day, Lunedì..." value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&startNew()}/>
          <button style={{...S.btn("red"),whiteSpace:"nowrap"}} onClick={startNew}>+</button>
        </div>
      </div>
      <button style={{...S.btn(days.length?"red":"ghost"),width:"100%",padding:14,fontSize:13,letterSpacing:2,marginTop:4}} onClick={days.length?()=>onSave({...initial,name:programName.trim()||initial?.name||`Scheda ${todayISO()}`,days}):undefined} disabled={!days.length}>{initial?"💾 AGGIORNA SCHEDA":"🚀 CREA SCHEDA"}</button>
      {onCancel&&<button style={{...S.btn("ghost"),width:"100%",padding:12,marginTop:8}} onClick={onCancel}>Annulla</button>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<GymTracker/>);
