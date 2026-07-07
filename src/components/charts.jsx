// ══════════════════════════════════════════════
// ── XP LEVEL CARD ──
// ══════════════════════════════════════════════
function XPLevelCard({sessions,actEntries,C,S}){
  const xp=calcXP(sessions,actEntries);
  const lv=getLevel(xp);
  const pct=getLevelProgress(xp);
  const nextLv=LEVELS[lv.idx+1];
  const xpToNext=nextLv?nextLv.min-xp:0;
  const sessXP=sessions.length?calcXP([sessions[sessions.length-1]]):0;
  return(
    <div style={{...S.card,background:`linear-gradient(135deg,${C.bg2},${C.bg3})`,border:`1px solid ${lv.color}33`,position:"relative",overflow:"hidden",marginBottom:10}}>
      <div style={{position:"absolute",right:-16,top:-16,fontSize:80,opacity:0.05,lineHeight:1,userSelect:"none"}}>{lv.icon}</div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <div style={{width:48,height:48,borderRadius:14,background:`${lv.color}22`,border:`2px solid ${lv.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{lv.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <span style={{fontSize:16,fontWeight:900,color:lv.color,letterSpacing:2}}>{lv.name.toUpperCase()}</span>
            <span style={{fontSize:10,color:C.text3,fontWeight:700}}>{xp.toLocaleString()} XP</span>
          </div>
          <div style={{fontSize:8,color:C.text4,letterSpacing:1,marginBottom:5}}>LIVELLO {lv.idx+1} / {LEVELS.length}</div>
          <div style={{height:7,borderRadius:4,background:C.bg4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct*100}%`,background:`linear-gradient(90deg,${lv.color},${lv.color}cc)`,borderRadius:4,transition:"width 1s ease",boxShadow:`0 0 8px ${lv.color}80`}}/>
          </div>
          {nextLv&&<div style={{fontSize:7,color:C.text4,marginTop:3}}>{xpToNext} XP al prossimo livello ({nextLv.icon} {nextLv.name})</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        {[["Ultima sess.",`+${sessXP} XP`,"#10b981"],["Sessioni totali",sessions.length,C.text],["XP Totali",xp.toLocaleString(),lv.color]].map(([l,v,col])=>(
          <div key={l} style={{flex:1,background:C.bg4,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
            <p style={{margin:"0 0 1px",fontSize:7,color:C.text4,letterSpacing:1}}>{l}</p>
            <p style={{margin:0,fontSize:12,fontWeight:900,color:col}}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── BADGE WALL ──
// ══════════════════════════════════════════════
function BadgeWall({sessions,records,actEntries,C,S}){
  const unlocked=getUnlockedBadges(sessions,records,actEntries);
  const [showAll,setShowAll]=useState(false);
  const list=showAll?BADGES:BADGES.slice(0,8);
  return(
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>🏅 ACHIEVEMENT ({unlocked.length}/{BADGES.length})</p>
        <button onClick={()=>setShowAll(v=>!v)} style={{background:"none",border:"none",color:C.text4,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{showAll?"meno ▲":"tutti ▼"}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
        {list.map(b=>{
          const on=unlocked.includes(b.id);
          return(
            <div key={b.id} title={b.desc} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 4px",borderRadius:10,background:on?`${C.bg3}`:"transparent",border:`1px solid ${on?C.border2:C.border}`,opacity:on?1:0.3,transition:"all 0.2s",cursor:"default"}}>
              <span style={{fontSize:22,filter:on?"none":"grayscale(1)",lineHeight:1}}>{b.icon}</span>
              <span style={{fontSize:7,color:on?C.text:C.text4,textAlign:"center",lineHeight:1.2,fontWeight:on?700:400}}>{b.name}</span>
              {on&&<span style={{width:6,height:6,borderRadius:"50%",background:"#10b981",display:"block"}}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── 1RM TREND CHART ──
// ══════════════════════════════════════════════
function ORMChart({exName,sessions,goal,C}){
  const raw=get1RMHistory(exName,sessions).slice(-12);
  if(raw.length<2)return null;
  const W=300,H=72,PX=38,PY=10;
  const vals=raw.map(d=>d.orm);
  const maxV=Math.max(...vals,...(goal?[goal]:[]))||1;
  const minV=Math.min(...vals);
  const span=maxV-minV||1;
  const pts=raw.map((d,i)=>({x:PX+(i/(raw.length-1))*(W-PX*2),y:H-PY-((d.orm-minV)/span)*(H-PY*2),...d}));
  const lD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const aD=`M${pts[0].x},${H-PY} ${lD.slice(1)} L${pts[pts.length-1].x},${H-PY} Z`;
  const gid=`orm_${exName.replace(/\W/g,"_")}`;
  const gY=goal&&goal>=minV?H-PY-((Math.min(goal,maxV)-minV)/span)*(H-PY*2):null;
  const pred=goal?predictPR(exName,goal,sessions):null;
  return(
    <div style={{marginTop:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
        <p style={{margin:0,fontSize:8,letterSpacing:2,color:"#8b5cf6"}}>1RM STIMATO NEL TEMPO</p>
        <span style={{fontSize:10,fontWeight:900,color:"#8b5cf6"}}>{pts[pts.length-1].orm}kg</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+18}`} style={{overflow:"visible",display:"block",margin:"4px 0"}}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={aD} fill={`url(#${gid})`}/>
        <path d={lD} fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
        {gY!=null&&<>
          <line x1={PX} y1={gY} x2={W-PX} y2={gY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4"/>
          <text x={W-PX+4} y={gY+4} fill="#f59e0b" fontSize={7}>🎯{goal}</text>
        </>}
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={4} fill="#8b5cf6" stroke={C.bg2} strokeWidth={2}/>)}
        <text x={pts[0].x} y={H+17} fill={C.text3} fontSize={8} textAnchor="middle">{raw[0].date.slice(5)}</text>
        <text x={pts[pts.length-1].x} y={H+17} fill={C.text3} fontSize={8} textAnchor="middle">{raw[raw.length-1].date.slice(5)}</text>
        <text x={2} y={PY+4} fill={C.text3} fontSize={8}>{maxV}kg</text>
        <text x={2} y={H-PY+4} fill={C.text3} fontSize={8}>{minV}kg</text>
      </svg>
      {pred&&goal&&<p style={{margin:"4px 0 0",fontSize:9,color:"#10b981"}}>📈 Al ritmo attuale raggiungerai {goal}kg in ~{pred} {pred===1?"settimana":"settimane"}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════
// ── MUSCLE VOLUME HEATMAP WEEKLY ──
// ══════════════════════════════════════════════
function MuscleVolumeMatrix({sessions,C}){
  const weekData=getVolumeByMuscleByWeek(sessions);
  if(weekData.length<2)return null;
  const muscles=MUSCLE_GROUPS.filter(m=>weekData.some(([,v])=>v[m]>0));
  if(!muscles.length)return null;
  const allVals=weekData.flatMap(([,v])=>muscles.map(m=>v[m]||0));
  const maxVal=Math.max(...allVals)||1;
  return(
    <div>
      <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 10px"}}>VOLUME PER MUSCOLO × SETTIMANA</p>
      <div style={{overflowX:"auto"}}>
        <div style={{minWidth:280}}>
          {muscles.map(m=>(
            <div key={m} style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
              <span style={{fontSize:8,color:MUSCLE_COLORS[m],minWidth:58,letterSpacing:0.5,flexShrink:0}}>{m}</span>
              <div style={{display:"flex",gap:2,flex:1}}>
                {weekData.map(([wk,v])=>{
                  const vol=v[m]||0;
                  const intensity=vol/maxVal;
                  return(
                    <div key={wk} title={`${wk}: ${vol>=1000?(vol/1000).toFixed(1)+"t":vol+"kg"}`}
                      style={{flex:1,height:16,borderRadius:3,
                        background:vol>0?`${MUSCLE_COLORS[m]}`:C.bg4,
                        opacity:vol>0?Math.max(intensity,0.15):0.12,
                        transition:"opacity 0.3s"}}/>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:6}}>
            <span style={{minWidth:58,flexShrink:0}}/>
            <div style={{display:"flex",gap:2,flex:1}}>
              {weekData.map(([wk])=>(
                <span key={wk} style={{flex:1,fontSize:6,color:C.text4,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap"}}>{wk.slice(5)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── SPARKLINE ──
// ══════════════════════════════════════════════
function Sparkline({exName,sessions,goal,C}){
  const raw=sessions.flatMap(s=>s.exercises.filter(e=>e.name===exName&&e.weight>0).map(e=>({weight:e.weight,reps:e.reps,score:e.score,date:s.date}))).slice(-16);
  if(raw.length<2)return<p style={{fontSize:9,color:C.text3,margin:"10px 0 0",textAlign:"center"}}>Almeno 2 sessioni per il grafico</p>;
  const W=300,H=70,PX=34,PY=10;
  const allW=[...raw.map(d=>d.weight),goal].filter(Boolean);
  const maxW=Math.max(...allW),minW=Math.min(...raw.map(d=>d.weight)),span=maxW-minW||1;
  const pts=raw.map((d,i)=>({x:PX+(i/(raw.length-1))*(W-PX*2),y:H-PY-((d.weight-minW)/span)*(H-PY*2),...d}));
  const aD=`M${pts[0].x},${H-PY} `+pts.map(p=>`L${p.x},${p.y}`).join(" ")+` L${pts[pts.length-1].x},${H-PY} Z`;
  const lD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const gid=`grd_${exName.replace(/\W/g,"_")}`;
  const gY=goal&&goal>=minW?H-PY-((Math.min(goal,maxW)-minW)/span)*(H-PY*2):null;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H+18}`} style={{overflow:"visible",display:"block",margin:"8px 0 4px"}}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></linearGradient></defs>
      <path d={aD} fill={`url(#${gid})`}/>
      <path d={lD} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
      {gY!=null&&<><line x1={PX} y1={gY} x2={W-PX} y2={gY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4"/><text x={W-PX+4} y={gY+4} fill="#f59e0b" fontSize={7}>🎯{goal}</text></>}
      {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={4.5} fill={SCORE_COLORS[p.score]||"#ef4444"} stroke={C.bg2} strokeWidth={2}/>)}
      <text x={pts[0].x} y={H+17} fill={C.text3} fontSize={8} textAnchor="middle">{raw[0].date.slice(5)}</text>
      <text x={pts[pts.length-1].x} y={H+17} fill={C.text3} fontSize={8} textAnchor="middle">{raw[raw.length-1].date.slice(5)}</text>
      <text x={2} y={PY+4} fill={C.text3} fontSize={8}>{maxW}kg</text>
      <text x={2} y={H-PY+4} fill={C.text3} fontSize={8}>{minW}kg</text>
    </svg>
  );
}

// ── MINI LINE CHART (peso corporeo) ──
function MiniLine({entries,color,C}){
  if(entries.length<2)return null;
  const W=260,H=46,PX=10,PY=6;
  const ws=entries.map(e=>e.v),maxW=Math.max(...ws),minW=Math.min(...ws),span=maxW-minW||0.5;
  const pts=entries.map((e,i)=>({x:PX+(i/(entries.length-1))*(W-PX*2),y:H-PY-((e.v-minW)/span)*(H-PY*2)}));
  const lD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  return<svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}><path d={lD} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3} fill={color} stroke={C.bg2} strokeWidth={1.5}/>)}</svg>;
}

// ── VOLUME BARS ──
function VolumeChart({sessions,C}){
  const recent=[...sessions].slice(-8);
  if(recent.length<2)return null;
  const vols=recent.map(s=>({vol:Math.round(sessionVol(s)),date:s.date.slice(5)}));
  const maxV=Math.max(...vols.map(v=>v.vol))||1;
  return(
    <div>
      <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 10px"}}>VOLUME ULTIME SESSIONI</p>
      <div style={{display:"flex",gap:3,alignItems:"flex-end",height:72}}>
        {vols.map((v,i)=>{const last=i===vols.length-1;return(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:last?9:7,color:last?"#ef4444":C.text3,fontWeight:last?700:400,lineHeight:1,whiteSpace:"nowrap"}}>{v.vol>=1000?`${(v.vol/1000).toFixed(1)}t`:`${v.vol}kg`}</span>
            <div style={{width:"100%",background:last?"#ef4444":"#ef444455",borderRadius:"3px 3px 0 0",height:`${Math.max((v.vol/maxV)*50,3)}px`}}/>
            <span style={{fontSize:7,color:C.text3,lineHeight:1,whiteSpace:"nowrap"}}>{v.date}</span>
          </div>
        );})}
      </div>
    </div>
  );
}

// ── MUSCLE BARS ──
function MuscleChart({sessions,C}){
  const counts={};MUSCLE_GROUPS.forEach(m=>counts[m]=0);
  sessions.slice(-16).forEach(s=>s.exercises.forEach(e=>{if(counts[e.muscle]!==undefined)counts[e.muscle]++;}));
  const sorted=MUSCLE_GROUPS.filter(m=>counts[m]>0).sort((a,b)=>counts[b]-counts[a]);
  const max=Math.max(...sorted.map(m=>counts[m]))||1;
  if(!sorted.length)return null;
  return(
    <div>
      <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 10px"}}>FREQUENZA MUSCOLARE</p>
      {sorted.map(m=>(
        <div key={m} style={{marginBottom:7}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:MUSCLE_COLORS[m]}}>{m}</span><span style={{fontSize:9,color:C.text3}}>{counts[m]}</span></div>
          <div style={{height:5,borderRadius:3,background:C.bg4}}><div style={{height:"100%",width:`${(counts[m]/max)*100}%`,background:MUSCLE_COLORS[m],borderRadius:3,transition:"width 0.5s"}}/></div>
        </div>
      ))}
    </div>
  );
}

// ── ANNUAL HEATMAP ──
function HeatmapChart({sessions,actEntries,C}){
  const today=new Date();
  const cells=[];
  for(let i=363;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    cells.push({iso:localISO(d),day:d.getDay(),week:Math.floor(i/7)});
  }
  const countMap={};
  sessions.forEach(s=>{countMap[s.date]=(countMap[s.date]||0)+1;});
  // include activities
  const actMap={};
  Object.entries(actEntries||{}).forEach(([d,acts])=>{if(acts.length)actMap[d]=acts.length;});
  const maxCount=Math.max(...Object.values(countMap),1);
  // group by week column
  const weeks=[];
  cells.forEach(c=>{if(!weeks[c.week])weeks[c.week]=[];weeks[c.week].push(c);});
  const months=[];
  let lastM=-1;
  weeks.forEach((wk,wi)=>{
    const m=parseInt(wk[0]?.iso.slice(5,7))-1;
    if(m!==lastM){months.push({wi,label:["G","F","M","A","M","G","L","A","S","O","N","D"][m]});lastM=m;}
  });
  const sz=11,gap=2;
  return(
    <div>
      <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 8px"}}>HEATMAP ANNO</p>
      <div style={{overflowX:"auto",paddingBottom:4}}>
        <div style={{position:"relative",display:"inline-block"}}>
          {/* month labels */}
          <div style={{display:"flex",marginBottom:3,position:"relative",height:10}}>
            {months.map((m,i)=>(
              <span key={i} style={{position:"absolute",left:(weeks.length-1-m.wi)*(sz+gap),fontSize:7,color:C.text3,lineHeight:1}}>{m.label}</span>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"row-reverse",gap:gap}}>
            {weeks.map((wk,wi)=>(
              <div key={wi} style={{display:"flex",flexDirection:"column",gap:gap}}>
                {Array.from({length:7}).map((_,di)=>{
                  const cell=wk.find(c=>(c.day===0?6:c.day-1)===di);
                  const cnt=cell?countMap[cell.iso]||0:0;
                  const haActs=cell?actMap[cell.iso]||0:0;
                  const alpha=cnt===0?0.06:0.15+(cnt/maxCount)*0.85;
                  const isToday=cell?.iso===localISO(today);
                  // colore: rosso per palestra, verde per solo attività
                  const bg=cnt>0?`rgba(239,68,68,${alpha})`:haActs>0?`rgba(16,185,129,0.4)`:C.bg4;
                  return(
                    <div key={di} title={cell?`${cell.iso}: ${cnt} sessioni${haActs?" + "+haActs+" attività":""}`:""} style={{width:sz,height:sz,borderRadius:2,background:bg,border:isToday?`1px solid #ef4444`:"1px solid transparent"}}/>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginTop:6,flexWrap:"wrap"}}>
        <span style={{fontSize:7,color:C.text3}}>0</span>
        {[0.1,0.35,0.6,0.85].map((a,i)=><div key={i} style={{width:8,height:8,borderRadius:2,background:`rgba(239,68,68,${a})`}}/>)}
        <span style={{fontSize:7,color:C.text3}}>gym</span>
        <div style={{width:8,height:8,borderRadius:2,background:"rgba(16,185,129,0.4)"}}/>
        <span style={{fontSize:7,color:C.text3}}>attività</span>
        <span style={{fontSize:7,color:C.text3,marginLeft:"auto"}}>{sessions.length} sessioni · {Object.keys(actMap).length} gg att.</span>
      </div>
    </div>
  );
}

// ── RADAR MUSCOLARE ──
function RadarChart({sessions,C}){
  const groups=["Petto","Schiena","Spalle","Bicipiti","Tricipiti","Gambe","Addominali"];
  const counts={};groups.forEach(g=>counts[g]=0);
  const recent=sessions.filter(s=>{const d=new Date(s.date);const now=new Date();return(now-d)/(1000*60*60*24)<=28;});
  if(recent.length<2)return null;
  recent.forEach(s=>s.exercises.forEach(e=>{if(counts[e.muscle]!==undefined)counts[e.muscle]++;}));
  const maxV=Math.max(...Object.values(counts),1);
  const n=groups.length,cx=120,cy=115,r=80;
  const angle=(i)=>(-Math.PI/2)+(2*Math.PI/n)*i;
  const pt=(i,val)=>{const a=angle(i),rad=(val/maxV)*r;return[cx+rad*Math.cos(a),cy+rad*Math.sin(a)];};
  const outline=groups.map((_,i)=>pt(i,1));
  const datapts=groups.map((g,i)=>pt(i,counts[g]/maxV));
  const polyOutline=outline.map(p=>p.join(",")).join(" ");
  const polyData=datapts.map(p=>p.join(",")).join(" ");
  return(
    <div>
      <p style={{fontSize:9,letterSpacing:2,color:C.text3,margin:"0 0 4px"}}>BILANCIAMENTO MUSCOLARE — 4 SETTIMANE</p>
      <svg width="100%" viewBox="0 0 240 230" style={{display:"block"}}>
        {/* grid rings */}
        {[0.25,0.5,0.75,1].map(f=>(
          <polygon key={f} points={groups.map((_,i)=>pt(i,f)).map(p=>p.join(",")).join(" ")} fill="none" stroke={C.border} strokeWidth={0.8} opacity={0.5}/>
        ))}
        {/* axes */}
        {groups.map((_,i)=>{
          const [x2,y2]=pt(i,1);
          return<line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={C.border2} strokeWidth={0.8}/>;
        })}
        {/* data area */}
        <polygon points={polyData} fill="#ef444430" stroke="#ef4444" strokeWidth={2} strokeLinejoin="round"/>
        {/* dots */}
        {datapts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={3.5} fill="#ef4444" stroke={C.bg2} strokeWidth={1.5}/>)}
        {/* labels */}
        {groups.map((g,i)=>{
          const a=angle(i);const [x,y]=pt(i,1.22);
          return(
            <g key={g}>
              <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={counts[g]>0?MUSCLE_COLORS[g]:C.text4} fontSize={9} fontWeight={counts[g]>0?700:400}>{g}</text>
              {counts[g]>0&&<text x={x} y={y+11} textAnchor="middle" fill={C.text3} fontSize={7}>{counts[g]}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── PR HALL OF FAME ──
function PRHallOfFame({sessions,program,C,S}){
  const [open,setOpen]=useState(false);
  const records=getRecords(sessions);
  const allEntries=Object.entries(records);
  if(!allEntries.length)return null;
  // group by muscle
  const byMuscle={};
  allEntries.forEach(([name,rec])=>{
    const m=rec.muscle||"Altro";
    if(!byMuscle[m])byMuscle[m]=[];
    byMuscle[m].push({name,rec});
  });
  return(
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>🏆 HALL OF FAME — {allEntries.length} RECORD</p>
        <span style={{fontSize:16,color:C.text3,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"none"}}>⌄</span>
      </div>
      {open&&(
        <div className="fade-up" style={{marginTop:12}}>
          {MUSCLE_GROUPS.filter(m=>byMuscle[m]).map(m=>(
            <div key={m} style={{marginBottom:12}}>
              <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:2,color:MUSCLE_COLORS[m]||C.text3}}>{m.toUpperCase()}</p>
              {byMuscle[m].sort((a,b)=>b.rec.weight-a.rec.weight).map(({name,rec})=>{
                const rm=oneRM(rec.weight,rec.reps);
                return(
                  <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",marginBottom:4,background:C.bg3,borderRadius:8,borderLeft:`2px solid ${MUSCLE_COLORS[m]||"#ef4444"}`}}>
                    <div>
                      <p style={{margin:0,fontSize:11,fontWeight:700,color:C.text}}>{name}</p>
                      <p style={{margin:0,fontSize:8,color:C.text3}}>{rec.date}</p>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{margin:0,fontSize:14,fontWeight:900,color:"#f59e0b"}}>{rec.weight}kg <span style={{fontSize:10,fontWeight:400}}>×{rec.reps}</span></p>
                      <p style={{margin:0,fontSize:8,color:C.text3}}>1RM stimato: <span style={{color:"#ef4444",fontWeight:700}}>{rm}kg</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TODAY SNAPSHOT (Home) ──
// ── DAY SCORE CARD ──
function DayScoreCard({date,sessions,nutrEntries,tdeeEntries,bwEntries,actEntries,C,S}){
  const bwKg=getBodyWeightForDate(bwEntries,date)?.w||null;
  const daySess=sessions.filter(s=>s.date===date);
  const lastSess=daySess.length?daySess[daySess.length-1]:null;
  const wScore=lastSess?calcWorkoutScore(lastSess,sessions):null;
  const nScore=calcNutrScore(date,nutrEntries,tdeeEntries,bwKg,actEntries,sessions);
  const dScore=calcDayScore(date,nutrEntries,tdeeEntries,bwKg,actEntries,sessions);
  if(dScore===null) return null;
  const items=[
    {label:"GIORNATA",score:dScore,show:true},
    {label:"ALLENAMENTO",score:wScore,show:wScore!==null},
    {label:"NUTRIZIONE",score:nScore,show:nScore!==null},
  ].filter(x=>x.show);
  return(
    <div style={{...S.card,marginBottom:10}}>
      <p style={{margin:"0 0 10px",fontSize:8,letterSpacing:2,color:C.text3}}>📊 SCORE GIORNATA — {date}</p>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${items.length},1fr)`,gap:8}}>
        {items.map(({label,score})=>{
          const col=scoreColor(score);
          const r=26,circ=2*Math.PI*r;
          return(
            <div key={label} style={{textAlign:"center"}}>
              <div style={{position:"relative",width:64,height:64,margin:"0 auto 6px"}}>
                <svg width={64} height={64} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={32} cy={32} r={r} fill="none" stroke={C.bg4} strokeWidth={5}/>
                  <circle cx={32} cy={32} r={r} fill="none" stroke={col} strokeWidth={5}
                    strokeDasharray={circ} strokeDashoffset={circ*(1-(score||0)/100)}
                    strokeLinecap="round" style={{transition:"stroke-dashoffset 0.8s ease"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:15,fontWeight:900,color:col}}>{score}</span>
                </div>
              </div>
              <p style={{margin:"0 0 1px",fontSize:7,letterSpacing:1,color:C.text3}}>{label}</p>
              <p style={{margin:0,fontSize:9,fontWeight:700,color:col}}>{scoreLabel(score)}</p>
            </div>
          );
        })}
      </div>
      {/* Check-in benessere se presente */}
      {lastSess?.checkin&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
          <p style={{margin:"0 0 6px",fontSize:8,letterSpacing:1,color:C.text3}}>BENESSERE PRE-ALLENAMENTO</p>
          <div style={{display:"flex",gap:10}}>
            {[["😴",lastSess.checkin.sonno,"Sonno"],["⚡",lastSess.checkin.energia,"Energia"],["🧠",lastSess.checkin.stress,"Stress"]].map(([icon,val,lbl])=>(
              <div key={lbl} style={{flex:1,textAlign:"center",background:C.bg3,borderRadius:8,padding:"6px 4px"}}>
                <p style={{margin:"0 0 2px",fontSize:12,lineHeight:1}}>{icon}</p>
                <p style={{margin:"0 0 1px",fontSize:14,fontWeight:900,color:scoreColor(val*20)}}>{val}</p>
                <p style={{margin:0,fontSize:7,color:C.text4}}>{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DailyShareCard({date,sessions,nutrEntries,tdeeEntries,bwEntries,actEntries,C,S}){
  const [status,setStatus]=useState("");
  const stats=buildDailyShareStats(date,sessions,nutrEntries,tdeeEntries,actEntries,bwEntries);
  if(!stats.hasAny)return null;
  const shareText=formatDailyShareText(stats);
  const canNativeShare=typeof navigator!=="undefined"&&!!navigator.share;
  const copyFallback=async()=>{
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(shareText);
      return true;
    }
    const el=document.createElement("textarea");
    el.value=shareText;
    el.setAttribute("readonly","");
    el.style.position="fixed";
    el.style.left="-9999px";
    el.style.opacity="0";
    document.body.appendChild(el);
    el.select();
    const ok=document.execCommand("copy");
    document.body.removeChild(el);
    if(!ok)throw new Error("copy-failed");
    return true;
  };
  const handleShare=async()=>{
    setStatus("");
    try{
      if(canNativeShare){
        await navigator.share({title:`Iron Log ${stats.date}`,text:shareText});
        setStatus("Condiviso ✓");
      }else{
        await copyFallback();
        setStatus("Copiato ✓");
      }
      setTimeout(()=>setStatus(""),2200);
    }catch(err){
      if(err?.name==="AbortError")return;
      try{
        await copyFallback();
        setStatus("Copiato ✓");
        setTimeout(()=>setStatus(""),2200);
      }catch(_){
        setStatus("Non riuscito");
      }
    }
  };
  const macro=stats.macroSplit;
  const workoutValue=stats.volume?`${Math.round(stats.volume).toLocaleString("it-IT")} kg`:stats.sessions.length?`${stats.sessions.length} sessione${stats.sessions.length>1?"i":""}`:"Riposo";
  const workoutSub=stats.duration?fmtDur(stats.duration):(stats.sessions[0]?.dayName||"");
  const outValue=stats.kcalOut?`${stats.kcalOut} kcal`:"—";
  const outSub=stats.kcalOutMode||"spesa";
  const carbValue=macro?`${macro.carb}%`:"—";
  const carbSub=stats.nutrition?`${stats.nutrition.carb||0}g carbo`:"split";
  return(
    <div style={{...S.card,marginBottom:10,borderLeft:"3px solid #10b981",background:`linear-gradient(135deg,${C.bg2},${C.bg3})`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10}}>
        <p style={{margin:0,fontSize:8,letterSpacing:2,color:C.text3}}>📤 CONDIVIDI GIORNATA — {stats.date}</p>
        {status&&<span style={{fontSize:9,fontWeight:800,color:status==="Non riuscito"?"#ef4444":"#10b981",whiteSpace:"nowrap"}}>{status}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:10}}>
        {[["🏋",workoutValue,workoutSub,"#ef4444"],["🔥",outValue,outSub,"#f97316"],["🍞",carbValue,carbSub,"#f59e0b"]].map(([icon,value,sub,col])=>(
          <div key={icon} style={{background:col+"14",border:`1px solid ${col}33`,borderRadius:8,padding:"8px 6px",minWidth:0}}>
            <p style={{margin:"0 0 4px",fontSize:13,lineHeight:1}}>{icon}</p>
            <p style={{margin:"0 0 2px",fontSize:12,fontWeight:900,color:col,lineHeight:1.15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value}</p>
            <p style={{margin:0,fontSize:7,color:C.text4,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</p>
          </div>
        ))}
      </div>
      <button onClick={handleShare} style={{...S.btn("red"),width:"100%",padding:"11px 12px",fontSize:11}}>📤 CONDIVIDI</button>
    </div>
  );
}

function TodaySnapshot({sessions,nutrEntries,tdeeEntries,actEntries,program,C,S}){
  const today=todayISO();
  const kcalIn=nutrEntries[today]?.kcal||null;
  const kcalOut=tdeeEntries[today]||(actEntries[today]||[]).reduce((t,a)=>t+(a.kcal||0),0)||null;
  const balance=kcalIn&&kcalOut?kcalIn-kcalOut:null;
  const todaySess=sessions.filter(s=>s.date===today);
  const alreadyTrained=todaySess.length>0;
  const dow=new Date().getDay();// 0=dom
  const isoToDay={1:"Lun",2:"Mar",3:"Mer",4:"Gio",5:"Ven",6:"Sab",0:"Dom"};
  const todayLabel=isoToDay[dow];
  const suggDay=program?.days?.find(d=>d.daysOfWeek?.includes?.(todayLabel));
  if(!kcalIn&&!kcalOut&&!alreadyTrained&&!suggDay)return null;
  return(
    <div style={{...S.card,padding:"10px 14px",background:`linear-gradient(135deg,${C.bg2},${C.bg3})`,borderLeft:"3px solid #ef4444",marginBottom:10}}>
      <p style={{margin:"0 0 8px",fontSize:8,letterSpacing:2,color:C.text3}}>OGGI — {today}</p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        {alreadyTrained&&(
          <div style={{display:"flex",alignItems:"center",gap:5,background:"#10b98120",borderRadius:7,padding:"5px 10px"}}>
            <span style={{fontSize:14}}>✅</span>
            <span style={{fontSize:10,fontWeight:700,color:"#10b981"}}>Allenato! {todaySess[0].dayName}</span>
          </div>
        )}
        {balance!==null&&(
          <div style={{display:"flex",alignItems:"center",gap:5,background:balance>0?"#f59e0b18":"#10b98120",borderRadius:7,padding:"5px 10px"}}>
            <span style={{fontSize:13}}>{balance>0?"📈":"📉"}</span>
            <div>
              <p style={{margin:0,fontSize:8,color:C.text3}}>{balance>0?"SURPLUS":"DEFICIT"}</p>
              <p style={{margin:0,fontSize:12,fontWeight:900,color:balance>0?"#f59e0b":"#10b981"}}>{balance>0?"+":""}{balance} kcal</p>
            </div>
          </div>
        )}
        {kcalIn&&(
          <div style={{display:"flex",alignItems:"center",gap:5,background:"#f9731620",borderRadius:7,padding:"5px 10px"}}>
            <span style={{fontSize:13}}>🍽</span>
            <div>
              <p style={{margin:0,fontSize:8,color:C.text3}}>MANGIATO</p>
              <p style={{margin:0,fontSize:12,fontWeight:900,color:"#f97316"}}>{kcalIn} kcal</p>
            </div>
          </div>
        )}
        {!alreadyTrained&&suggDay&&(
          <div style={{display:"flex",alignItems:"center",gap:5,background:"#3b82f620",borderRadius:7,padding:"5px 10px"}}>
            <span style={{fontSize:13}}>💪</span>
            <div>
              <p style={{margin:0,fontSize:8,color:C.text3}}>OGGI È PREVISTO</p>
              <p style={{margin:0,fontSize:11,fontWeight:700,color:"#3b82f6"}}>{suggDay.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONSISTENCY TRACKER ──
function ConsistencyBar({sessions,C}){
  const weeks=[];
  for(let w=7;w>=0;w--){
    const start=new Date();start.setDate(start.getDate()-start.getDay()+1-(w*7));
    const end=new Date(start);end.setDate(start.getDate()+6);
    const s0=localISO(start),e0=localISO(end);
    const cnt=sessions.filter(s=>s.date>=s0&&s.date<=e0).length;
    weeks.push({cnt,label:w===0?"Questa":w===1?"Scorsa":`-${w}s`});
  }
  const goal=3;
  const onTarget=weeks.filter(w=>w.cnt>=goal).length;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <p style={{margin:0,fontSize:9,letterSpacing:2,color:C.text3}}>CONSISTENZA (8 SETTIMANE)</p>
        <span style={{fontSize:9,color:onTarget>=6?"#10b981":onTarget>=4?"#f59e0b":"#ef4444",fontWeight:700}}>{onTarget}/8 ≥{goal}×</span>
      </div>
      <div style={{display:"flex",gap:3,alignItems:"flex-end"}}>
        {weeks.map((w,i)=>{
          const h=Math.max(w.cnt*14,4);
          const col=w.cnt>=goal?"#10b981":w.cnt>=1?"#f59e0b":"#ef444433";
          const isThis=i===weeks.length-1;
          return(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:8,color:isThis?"#ef4444":C.text3,fontWeight:isThis?700:400}}>{w.cnt||""}</span>
              <div style={{width:"100%",height:h,background:col,borderRadius:3,transition:"height 0.4s"}}/>
              <span style={{fontSize:6,color:C.text4,whiteSpace:"nowrap"}}>{w.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:8,height:4,borderRadius:2,background:C.bg4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(onTarget/8)*100}%`,background:onTarget>=6?"#10b981":onTarget>=4?"#f59e0b":"#ef4444",borderRadius:2,transition:"width 0.6s"}}/>
      </div>
      <p style={{margin:"5px 0 0",fontSize:8,color:C.text3}}>{Math.round(onTarget/8*100)}% delle settimane con obiettivo raggiunto ({goal}+ sessioni)</p>
    </div>
  );
}
