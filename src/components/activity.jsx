const ACT_COLORS={"Palestra":"#ef4444","Corsa":"#10b981","Tennis":"#f59e0b","Calcetto":"#22c55e","Padel":"#06b6d4","Nuoto":"#3b82f6","Ciclismo":"#f97316","Camminata":"#84cc16","HIIT":"#ec4899","Yoga":"#8b5cf6","Altro":"#6b7280"};
const ACT_ICONS={"Palestra":"🏋","Corsa":"🏃","Tennis":"🎾","Calcetto":"⚽","Padel":"🏸","Nuoto":"🏊","Ciclismo":"🚴","Camminata":"🚶","HIIT":"⚡","Yoga":"🧘","Altro":"🏅"};

function WeekCalendar({sessions,program,actEntries,C,offset,setOffset}){
  const days=getWeekDays(offset);
  const today=todayISO();
  const sessMap={};
  sessions.forEach(s=>{if(!sessMap[s.date])sessMap[s.date]=[];sessMap[s.date].push(s);});
  // mappa dayName → colore
  const dayColorMap={};
  (program?.days||[]).forEach((d,i)=>{dayColorMap[d.name]=d.color||DAY_COLORS[i%DAY_COLORS.length];});
  const dl=["L","M","M","G","V","S","D"];
  const d0=localISO(days[0]);
  const d6=localISO(days[6]);
  const wkSess=sessions.filter(s=>s.date>=d0&&s.date<=d6);
  const wkVol=Math.round(wkSess.reduce((t,s)=>t+sessionVol(s),0));
  const wkKcalGym=wkSess.reduce((t,s)=>t+(s.kcal||0),0);
  // attività extra della settimana
  const wkActEntries=Object.entries(actEntries||{}).filter(([d])=>d>=d0&&d<=d6);
  const wkActKcal=wkActEntries.reduce((t,[,acts])=>t+acts.reduce((s,a)=>s+(a.kcal||0),0),0);
  const wkActMin=wkActEntries.reduce((t,[,acts])=>t+acts.reduce((s,a)=>s+(a.min||0),0),0);
  const wkKcal=wkKcalGym+wkActKcal;
  const wkActivities=wkActEntries.reduce((t,[,acts])=>t+acts.length,0);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <button onClick={()=>setOffset(o=>o-1)} style={{background:"none",border:"none",color:C.text2,fontSize:22,cursor:"pointer",padding:"0 8px",lineHeight:1}}>‹</button>
        <span style={{fontSize:11,letterSpacing:1,color:C.text,fontWeight:700}}>{offset===0?"Questa settimana":offset===-1?"Settimana scorsa":`${days[0].getDate()}/${days[0].getMonth()+1} – ${days[6].getDate()}/${days[6].getMonth()+1}`}</span>
        <button onClick={()=>setOffset(o=>Math.min(o+1,0))} style={{background:"none",border:"none",color:offset===0?C.text4:C.text2,fontSize:22,cursor:"pointer",padding:"0 8px",lineHeight:1}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {days.map((d,i)=>{
          const ds=localISO(d);
          const daySess=sessMap[ds]||[];
          const dayActs=actEntries?.[ds]||[];
          const trained=daySess.length>0;
          const hasActs=dayActs.length>0;
          const isToday=ds===today;
          const dotColor=trained?(daySess[0].dayColor||dayColorMap[daySess[0].dayName]||"#ef4444"):null;
          return(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:8,color:C.text3,letterSpacing:1}}>{dl[i]}</span>
              <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:dotColor||(isToday?C.bg4:"transparent"),border:isToday&&!trained?`2px solid #ef4444`:"2px solid transparent",fontSize:12,fontWeight:trained||isToday?700:400,color:trained?"#fff":isToday?"#ef4444":C.text2}}>
                {d.getDate()}
              </div>
              {/* pallini palestra */}
              {trained&&<div style={{display:"flex",gap:2,justifyContent:"center"}}>{daySess.slice(0,2).map((s,j)=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:s.dayColor||dayColorMap[s.dayName]||"#ef4444"}}/>)}</div>}
              {/* icone attività extra */}
              {hasActs&&<div style={{display:"flex",flexWrap:"wrap",gap:1,justifyContent:"center",maxWidth:36}}>
                {dayActs.slice(0,3).map((a,j)=>(
                  <span key={j} style={{fontSize:9,lineHeight:1}} title={`${a.type}${a.min?" · "+a.min+"min":""}`}>{ACT_ICONS[a.type]||"🏅"}</span>
                ))}
              </div>}
              {!trained&&!hasActs&&<div style={{height:8}}/>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:10,marginTop:10,borderTop:`1px solid ${C.border}`,paddingTop:8,flexWrap:"wrap"}}>
        <div><p style={{margin:0,fontSize:8,color:C.text3}}>SESSIONI</p><p style={{margin:0,fontSize:16,fontWeight:900,color:"#ef4444"}}>{wkSess.length}</p></div>
        {wkActivities>0&&<div><p style={{margin:0,fontSize:8,color:C.text3}}>ATTIVITÀ</p><p style={{margin:0,fontSize:16,fontWeight:900,color:"#10b981"}}>{wkActivities}</p></div>}
        {wkVol>0&&<div><p style={{margin:0,fontSize:8,color:C.text3}}>VOLUME</p><p style={{margin:0,fontSize:16,fontWeight:900,color:C.text}}>{wkVol>=1000?`${(wkVol/1000).toFixed(1)}t`:`${wkVol}kg`}</p></div>}
        {wkActMin>0&&<div><p style={{margin:0,fontSize:8,color:C.text3}}>MIN ATT.</p><p style={{margin:0,fontSize:16,fontWeight:900,color:"#06b6d4"}}>{wkActMin}</p></div>}
        {wkKcal>0&&<div><p style={{margin:0,fontSize:8,color:C.text3}}>KCAL TOT.</p><p style={{margin:0,fontSize:16,fontWeight:900,color:"#f97316"}}>{wkKcal}</p></div>}
      </div>
      {/* legenda */}
      {wkActivities>0&&(
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
          {[...new Set(wkActEntries.flatMap(([,acts])=>acts.map(a=>a.type)))].map(t=>(
            <span key={t} style={{fontSize:8,color:C.text3}}>{ACT_ICONS[t]||"🏅"} {t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
