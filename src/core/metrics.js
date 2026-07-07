// ══════════════════════════════════════════════
// ── GAMIFICATION SYSTEM ──
// ══════════════════════════════════════════════
const LEVELS=[
  {name:"Rookie",    min:0,    max:199,  icon:"🥉", color:"#a16207"},
  {name:"Iron",      min:200,  max:599,  icon:"⚙",  color:"#6b7280"},
  {name:"Bronze",    min:600,  max:1299, icon:"🥈", color:"#b45309"},
  {name:"Silver",    min:1300, max:2499, icon:"🔩", color:"#9ca3af"},
  {name:"Gold",      min:2500, max:4499, icon:"🥇", color:"#d97706"},
  {name:"Platinum",  min:4500, max:7999, icon:"💎", color:"#06b6d4"},
  {name:"Diamond",   min:8000, max:14999,icon:"🔷", color:"#3b82f6"},
  {name:"Master",    min:15000,max:29999,icon:"👑", color:"#8b5cf6"},
  {name:"Legend",    min:30000,max:Infinity,icon:"🏆",color:"#ef4444"},
];
const BADGES=[
  {id:"first_blood",  name:"Primo Sangue",   icon:"🩸", desc:"Prima sessione completata",        check:(_,s)=>s.length>=1},
  {id:"week1",        name:"Una Settimana",  icon:"📅", desc:"7 giorni dall'inizio",              check:(_,s)=>{if(!s.length)return false;const first=new Date(s[0].date);return(Date.now()-first)/86400000>=7;}},
  {id:"sess10",       name:"Decathlete",     icon:"🔟", desc:"10 sessioni completate",            check:(_,s)=>s.length>=10},
  {id:"sess50",       name:"Iron Fifty",     icon:"50",desc:"50 sessioni completate",           check:(_,s)=>s.length>=50},
  {id:"sess100",      name:"Centurion",      icon:"💯", desc:"100 sessioni completate",           check:(_,s)=>s.length>=100},
  {id:"streak4",      name:"Macchina",       icon:"⚙",  desc:"4 settimane di streak",             check:(_,s,a)=>getStreak(s,a)>=4},
  {id:"streak8",      name:"Inarrestabile",  icon:"🚂", desc:"8 settimane di streak",             check:(_,s,a)=>getStreak(s,a)>=8},
  {id:"streak12",     name:"Leggenda Viva",  icon:"🌋", desc:"12 settimane di streak",            check:(_,s,a)=>getStreak(s,a)>=12},
  {id:"pr5",          name:"Record Breaker", icon:"🏆", desc:"5 personal record diversi",         check:(r)=>Object.keys(r).length>=5},
  {id:"pr20",         name:"PR Hunter",      icon:"🎯", desc:"20 personal record diversi",        check:(r)=>Object.keys(r).length>=20},
  {id:"volume100k",   name:"Tonnellata",     icon:"🏋", desc:"100.000 kg di volume totale",       check:(_,s)=>s.reduce((t,x)=>t+sessionVol(x),0)>=100000},
  {id:"long_sess",    name:"Maratoneta",     icon:"⏱", desc:"Sessione da 90+ minuti",            check:(_,s)=>s.some(x=>(x.duration||0)>=90)},
  {id:"big3_pr",      name:"Big Three",      icon:"💪", desc:"PR su Panca, Squat e Stacchi",      check:(r)=>["Panca Piana","Squat","Stacchi"].every(n=>r[n])},
  {id:"act_first",    name:"Primo Passo",    icon:"👟", desc:"Prima attività extra registrata",    check:(_,_s,a)=>Object.values(a||{}).flat().length>=1},
  {id:"act10",        name:"Atleta Totale",  icon:"🏅", desc:"10 attività extra completate",       check:(_,_s,a)=>Object.values(a||{}).flat().length>=10},
  {id:"act50",        name:"Iron Sport",     icon:"⚡", desc:"50 attività extra completate",       check:(_,_s,a)=>Object.values(a||{}).flat().length>=50},
  {id:"run_first",    name:"Runner",         icon:"🏃", desc:"Prima corsa registrata",             check:(_,_s,a)=>Object.values(a||{}).flat().some(x=>x.type==="Corsa")},
  {id:"multi_sport",  name:"Multisport",     icon:"🎯", desc:"3 sport diversi in una settimana",  check:(_,_s,a)=>{
    const today=new Date(),dow=today.getDay()||7;
    const mon=new Date(today);mon.setDate(today.getDate()-dow+1);
    const monISO=localISO(mon);
    const sunISO=(()=>{const d=new Date(mon);d.setDate(d.getDate()+6);return localISO(d);})();
    const thisWeekTypes=new Set(Object.entries(a||{}).filter(([d])=>d>=monISO&&d<=sunISO).flatMap(([,acts])=>acts.map(x=>x.type)));
    return thisWeekTypes.size>=3;
  }},
];
function calcXP(sessions, actEntries){
  let xp=0;
  sessions.forEach(s=>{
    xp+=50;
    xp+=Math.min(s.exercises.filter(e=>e.weight>0).length*8,60);
    if((s.duration||0)>=45)xp+=20;
    if((s.duration||0)>=60)xp+=15;
    if((s.duration||0)>=90)xp+=25;
    if((s.kcal||0)>=300)xp+=15;
  });
  // attività extra: 10 XP base + 1 XP ogni 10 minuti
  Object.values(actEntries||{}).forEach(acts=>{
    acts.forEach(a=>{xp+=10+Math.floor((a.min||0)/10);});
  });
  return xp;
}
function getLevel(xp){
  for(let i=LEVELS.length-1;i>=0;i--) if(xp>=LEVELS[i].min) return{...LEVELS[i],idx:i};
  return{...LEVELS[0],idx:0};
}
function getLevelProgress(xp){
  const lv=getLevel(xp);
  if(lv.max===Infinity) return 1;
  return(xp-lv.min)/(lv.max-lv.min);
}
function getUnlockedBadges(sessions,records,actEntries){
  return BADGES.filter(b=>b.check(records,sessions,actEntries)).map(b=>b.id);
}
// ── ANALYTICS helpers ──
function get1RMHistory(exName,sessions){
  const pts=[];
  sessions.forEach(s=>{
    const e=s.exercises.find(ex=>ex.name===exName&&ex.weight>0&&ex.reps>0);
    if(e) pts.push({date:s.date,orm:oneRM(e.weight,e.reps),weight:e.weight,reps:e.reps});
  });
  return pts;
}
function getVolumeByMuscleByWeek(sessions){
  const weeks={};
  sessions.forEach(s=>{
    const d=dateFromISO(s.date),day=d.getDay()||7;
    d.setDate(d.getDate()+1-day);
    const wk=localISO(d);
    if(!weeks[wk])weeks[wk]={};
    s.exercises.forEach(e=>{
      if(!weeks[wk][e.muscle])weeks[wk][e.muscle]=0;
      weeks[wk][e.muscle]+=(e.sets||1)*e.reps*e.weight;
    });
  });
  return Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).slice(-8);
}
function predictPR(exName,targetKg,sessions){
  const hist=sessions.flatMap(s=>s.exercises.filter(e=>e.name===exName&&e.weight>0).map(e=>({date:s.date,w:e.weight})));
  if(hist.length<3)return null;
  const recent=hist.slice(-6);
  const avgGain=recent.slice(1).reduce((t,e,i)=>t+(e.w-recent[i].w),0)/(recent.length-1);
  if(avgGain<=0)return null;
  const last=recent[recent.length-1];
  const weeksNeeded=Math.ceil((targetKg-last.w)/avgGain);
  if(weeksNeeded<=0||weeksNeeded>52)return null;
  return weeksNeeded;
}


// ── ADVANCED ANALYTICS HELPERS ──
function calcFaticaIndex(sessions,actEntries){
  // ATL (Acute Training Load) 7gg vs CTL (Chronic) 28gg → TSB (Training Stress Balance)
  const today=new Date();
  const vol7=[],vol28=[];
  for(let i=0;i<28;i++){
    const d=new Date(today);d.setDate(d.getDate()-i);
    const iso=localISO(d);
    const daySess=sessions.filter(s=>s.date===iso);
    let v=daySess.reduce((t,s)=>t+sessionVol(s),0);
    // aggiungi "stress equivalente" per attività extra (stima: 30min = ~1000 unità di volume)
    const dayActs=(actEntries||{})[iso]||[];
    v+=dayActs.reduce((t,a)=>t+(a.min||0)*33,0);
    if(i<7)vol7.push(v);
    vol28.push(v);
  }
  const atl=vol7.reduce((a,b)=>a+b,0)/7;
  const ctl=vol28.reduce((a,b)=>a+b,0)/28;
  const tsb=ctl>0?Math.round((atl/ctl-1)*100):0; // positivo=overreaching, negativo=fresco
  return{atl:Math.round(atl),ctl:Math.round(ctl),tsb,status:tsb>40?"OVERREACHING":tsb>15?"CARICO ALTO":tsb>-10?"OTTIMALE":tsb>-25?"FRESCO":"DETRAINING"};
}
function getMonthlyStats(sessions,nutrEntries,tdeeEntries,actEntries){
  const months={};
  sessions.forEach(s=>{
    const m=s.date.slice(0,7);
    if(!months[m])months[m]={sessions:0,volume:0,duration:0,kcalBurned:0,prs:0};
    months[m].sessions++;
    months[m].volume+=sessionVol(s);
    months[m].duration+=s.duration||0;
    months[m].kcalBurned+=s.kcal||0;
  });
  // aggiungi kcal attività extra per mese
  Object.entries(actEntries||{}).forEach(([date,acts])=>{
    const m=date.slice(0,7);
    if(!months[m])months[m]={sessions:0,volume:0,duration:0,kcalBurned:0,prs:0};
    if(!months[m].actKcal)months[m].actKcal=0;
    if(!months[m].actMin)months[m].actMin=0;
    months[m].actKcal+=acts.reduce((t,a)=>t+(a.kcal||0),0);
    months[m].actMin+=acts.reduce((t,a)=>t+(a.min||0),0);
    months[m].kcalBurned+=acts.reduce((t,a)=>t+(a.kcal||0),0);
  });
  // aggiungi kcal nutrizione per mese
  Object.entries(nutrEntries||{}).forEach(([date,n])=>{
    const m=date.slice(0,7);
    if(!months[m])months[m]={sessions:0,volume:0,duration:0,kcalBurned:0,prs:0};
    if(!months[m].kcalIn)months[m].kcalIn=0;
    if(!months[m].prot)months[m].prot=0;
    if(!months[m].nutrDays)months[m].nutrDays=0;
    months[m].kcalIn+=n.kcal||0;
    months[m].prot+=n.prot||0;
    months[m].nutrDays++;
  });
  return Object.entries(months).sort((a,b)=>a[0].localeCompare(b[0])).slice(-6);
}
function getNutrStats(nutrEntries,tdeeEntries,bwEntries,sessions){
  const entries=Object.entries(nutrEntries||{}).sort((a,b)=>a[0].localeCompare(b[0]));
  if(!entries.length)return null;
  const avgKcal=Math.round(entries.reduce((t,[,n])=>t+(n.kcal||0),0)/entries.length);
  const avgProt=Math.round(entries.reduce((t,[,n])=>t+(n.prot||0),0)/entries.length);
  const avgCarb=Math.round(entries.reduce((t,[,n])=>t+(n.carb||0),0)/entries.length);
  const avgFat=Math.round(entries.reduce((t,[,n])=>t+(n.fat||0),0)/entries.length);
  // macro % split
  const totalCal=avgProt*4+avgCarb*4+avgFat*9;
  const protPct=totalCal>0?Math.round(avgProt*4/totalCal*100):0;
  const carbPct=totalCal>0?Math.round(avgCarb*4/totalCal*100):0;
  const fatPct=totalCal>0?Math.round(avgFat*9/totalCal*100):0;
  // training days kcal vs rest days
  const trainDates=new Set(sessions.map(s=>s.date));
  const trainEntries=entries.filter(([d])=>trainDates.has(d));
  const restEntries=entries.filter(([d])=>!trainDates.has(d));
  const avgKcalTrain=trainEntries.length?Math.round(trainEntries.reduce((t,[,n])=>t+(n.kcal||0),0)/trainEntries.length):0;
  const avgKcalRest=restEntries.length?Math.round(restEntries.reduce((t,[,n])=>t+(n.kcal||0),0)/restEntries.length):0;
  // surplus/deficit
  const balDays=entries.filter(([d])=>tdeeEntries[d]).map(([d,n])=>({date:d,bal:n.kcal-(tdeeEntries[d]||0)}));
  const surplusDays=balDays.filter(x=>x.bal>0).length;
  const deficitDays=balDays.filter(x=>x.bal<0).length;
  const avgBal=balDays.length?Math.round(balDays.reduce((t,x)=>t+x.bal,0)/balDays.length):null;
  // prot/kg
  const lastBw=bwEntries&&bwEntries.length?bwEntries[bwEntries.length-1]:null;
  const protPerKg=lastBw&&lastBw.w&&avgProt?Math.round(avgProt/lastBw.w*10)/10:null;
  // trend kcal ultimi 30gg
  const last30=entries.slice(-30);
  const trend30=last30.length>=7?(()=>{
    const half=Math.floor(last30.length/2);
    const h1=last30.slice(0,half).reduce((t,[,n])=>t+(n.kcal||0),0)/half;
    const h2=last30.slice(half).reduce((t,[,n])=>t+(n.kcal||0),0)/(last30.length-half);
    return Math.round(h2-h1);
  })():null;
  return{avgKcal,avgProt,avgCarb,avgFat,protPct,carbPct,fatPct,totalCal,
    avgKcalTrain,avgKcalRest,surplusDays,deficitDays,avgBal,protPerKg,trend30,
    loggedDays:entries.length,balDays};
}
function getDeloadSuggestion(sessions){
  // controlla ultimi 21gg per segni di sovraccarico
  const recent=sessions.filter(s=>{const d=new Date(s.date);return(Date.now()-d)/86400000<=21;});
  if(recent.length<6)return null;
  const hardSets=recent.flatMap(s=>s.exercises.filter(e=>e.score>=4)).length;
  const totalSets=recent.flatMap(s=>s.exercises).length;
  const hardRatio=totalSets>0?hardSets/totalSets:0;
  const weekCount=recent.length;
  if(hardRatio>0.45&&weekCount>=5)return{type:"DELOAD",msg:`${Math.round(hardRatio*100)}% degli esercizi recenti segnati come difficili. Considera una settimana di scarico.`};
  if(weekCount>=8&&recent.every(s=>s.exercises.some(e=>e.score>=4)))return{type:"DELOAD",msg:"Hai trainato molto di fila con carichi alti. Una settimana leggera può migliorare le prestazioni."};
  return null;
}

// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// ── SCORE SYSTEM ──
// ══════════════════════════════════════════════
function calcWorkoutScore(session, sessions){
  if(!session||!session.exercises?.length) return null;
  let score=0;
  // 1. Completamento (30pt) — quanti esercizi hanno peso > 0
  const logged=session.exercises.filter(e=>e.weight>0).length;
  const completionScore=Math.round(logged/session.exercises.length*30);
  score+=completionScore;
  // 2. Difficoltà media (25pt) — score 3 = ottimale, 1-2 = troppo facile, 4-5 = troppo pesante
  const scored=session.exercises.filter(e=>e.score>0);
  if(scored.length){
    const avgScore=scored.reduce((t,e)=>t+e.score,0)/scored.length;
    // picco a score 3 (Perfetto)
    const diffScore=Math.round(Math.max(0, 25 - Math.abs(avgScore-3)*8));
    score+=diffScore;
  }
  // 3. Volume vs media storica (25pt)
  const vol=sessionVol(session);
  const prevSameDay=sessions.filter(s=>s.dayName===session.dayName&&s.id!==session.id);
  if(prevSameDay.length>=2){
    const avgVol=prevSameDay.reduce((t,s)=>t+sessionVol(s),0)/prevSameDay.length;
    const volRatio=avgVol>0?vol/avgVol:1;
    const volScore=Math.round(Math.min(25, volRatio*20));
    score+=volScore;
  } else score+=15; // bonus default se non ci sono abbastanza sessioni
  // 4. Durata ragionevole (20pt) — picco 45-75min
  const dur=session.duration||0;
  const durScore=dur===0?5:dur<30?10:dur<=75?20:dur<=90?15:10;
  score+=durScore;
  return Math.min(100,score);
}

function calcNutrScore(date, nutrEntries, tdeeEntries, bwKg, actEntries, sessions){
  const n=nutrEntries[date];
  if(!n||!n.kcal) return null;
  let score=0;
  // 1. Target proteico (35pt)
  const protTarget=bwKg?Math.round(bwKg*1.8):140;
  const protRatio=n.prot/protTarget;
  const protScore=Math.round(Math.min(35, protRatio*35));
  score+=protScore;
  // 2. Kcal nel range TDEE (30pt)
  const acts=actEntries?.[date]||[];
  const gymKcal=(sessions||[]).filter(s=>s.date===date).reduce((t,s)=>t+(s.kcal||0),0);
  const actKcal=acts.reduce((t,a)=>t+(a.kcal||0),0);
  const tdeeManual=tdeeEntries?.[date]||null;
  const tdee=tdeeManual||(gymKcal+actKcal)||null;
  if(tdee){
    const ratio=n.kcal/tdee;
    // range ottimale 0.85-1.15
    const kcalScore=ratio>=0.85&&ratio<=1.15?30:ratio>=0.7&&ratio<=1.3?20:ratio>=0.6&&ratio<=1.4?10:5;
    score+=kcalScore;
  } else score+=15;
  // 3. Qualità macro (20pt) — target P:30%, C:45%, F:25%
  const totalMacroCal=(n.prot||0)*4+(n.carb||0)*4+(n.fat||0)*9;
  if(totalMacroCal>0){
    const pPct=(n.prot*4)/totalMacroCal;
    const cPct=(n.carb*4)/totalMacroCal;
    const fPct=(n.fat*9)/totalMacroCal;
    const macroErr=Math.abs(pPct-0.30)+Math.abs(cPct-0.45)+Math.abs(fPct-0.25);
    const macroScore=Math.round(Math.max(0,20-macroErr*40));
    score+=macroScore;
  } else score+=10;
  // 4. Consistenza (15pt) — quanti giorni registrati nell'ultima settimana
  const last7=Array.from({length:7},(_,i)=>{const d=dateFromISO(date);d.setDate(d.getDate()-i);return localISO(d);});
  const loggedDays=last7.filter(d=>nutrEntries[d]?.kcal>0).length;
  score+=Math.round(loggedDays/7*15);
  return Math.min(100,score);
}

function calcDayScore(date, nutrEntries, tdeeEntries, bwKg, actEntries, sessions){
  const workoutSess=sessions.filter(s=>s.date===date);
  const wScore=workoutSess.length?calcWorkoutScore(workoutSess[workoutSess.length-1],sessions):null;
  const nScore=calcNutrScore(date,nutrEntries,tdeeEntries,bwKg,actEntries,sessions);
  const acts=actEntries?.[date]||[];
  const actBonus=acts.length>0?5:0;
  if(wScore===null&&nScore===null) return null;
  if(wScore===null) return Math.min(100,nScore+actBonus);
  if(nScore===null) return Math.min(100,wScore+actBonus);
  return Math.min(100,Math.round(wScore*0.55+nScore*0.45)+actBonus);
}

function scoreColor(s){
  if(s===null)return"#6b7280";
  if(s>=80)return"#10b981";
  if(s>=60)return"#f59e0b";
  if(s>=40)return"#f97316";
  return"#ef4444";
}
function scoreLabel(s){
  if(s===null)return"—";
  if(s>=85)return"Eccellente";
  if(s>=70)return"Ottimo";
  if(s>=55)return"Buono";
  if(s>=40)return"Discreto";
  return"Da migliorare";
}

// kcalGoal structure: {mode:"deficit"|"surplus"|"maintain", pct:number, kcalOverride:number|null}
// mode deficit = TDEE * (1 - pct/100), surplus = TDEE * (1 + pct/100)
function getKcalTarget(kcalGoal, tdee, bmr){
  if(!kcalGoal||!tdee) return null;
  if(kcalGoal.kcalOverride) return kcalGoal.kcalOverride;
  const pct=(kcalGoal.pct||20)/100;
  if(kcalGoal.mode==="deficit") return Math.max(Math.round(tdee*(1-pct)), bmr||1200);
  if(kcalGoal.mode==="surplus") return Math.round(tdee*(1+pct));
  return Math.round(tdee); // maintain
}

// kg di grasso perso/guadagnato atteso da un deficit/surplus calorico
// 1kg grasso ≈ 7700 kcal
function kcalToKg(kcalDelta){ return Math.round(kcalDelta/7700*100)/100; }

// ── STRENGTH SCIENCE ──
// ══════════════════════════════════════════════

// Wilks coefficient (2020 formula, unisex)
function wilksCoeff(bwKg){
  const a=-216.0475144,b=16.2606339,c=-0.002388645,d=-0.00113732,e=7.01863e-6,f=-1.291e-8;
  return 600/(a+b*bwKg+c*bwKg**2+d*bwKg**3+e*bwKg**4+f*bwKg**5);
}
function calcWilks(totalLifted,bwKg){
  if(!bwKg||!totalLifted)return null;
  return Math.round(totalLifted*wilksCoeff(bwKg)*10)/10;
}

// IPF GL Points (2020)
function ipfGL(totalKg,bwKg,isMale){
  const [a,b,c]=isMale?[1199.72839,1025.18162,0.009210]:[610.32796,1045.59282,0.03048];
  const denom=a-b*Math.exp(-c*bwKg);
  if(denom<=0)return null;
  return Math.round(totalKg/denom*100*10)/10;
}

// Strength Standards per esercizio e peso corporeo
const STRENGTH_STANDARDS={
  "Panca Piana":     {m:[0.5,0.75,1.0,1.25,1.5],  f:[0.25,0.5,0.75,1.0,1.2]},
  "Squat":           {m:[0.75,1.0,1.25,1.5,1.75], f:[0.5,0.75,1.0,1.25,1.5]},
  "Stacchi":         {m:[1.0,1.25,1.5,1.75,2.0],  f:[0.75,1.0,1.25,1.5,1.75]},
  "Lento Avanti":    {m:[0.35,0.5,0.65,0.8,1.0],  f:[0.2,0.3,0.45,0.6,0.75]},
  "Rematore Bilanciere":{m:[0.5,0.75,1.0,1.25,1.5],f:[0.35,0.5,0.75,1.0,1.2]},
  "Curl Bilanciere": {m:[0.25,0.35,0.5,0.65,0.75],f:[0.15,0.25,0.35,0.45,0.55]},
  "Trazioni":        {m:[1,3,6,10,15],f:[0,1,3,6,10]}, // reps BW
};
const STD_LABELS=["Principiante","Novice","Intermedio","Avanzato","Elite"];
const STD_COLORS=["#6b7280","#3b82f6","#10b981","#f59e0b","#ef4444"];

function getStrengthStd(exName,orm,bwKg,isMale=true){
  const std=STRENGTH_STANDARDS[exName];
  if(!std||!bwKg||!orm)return null;
  const ratios=isMale?std.m:std.f;
  // For pull-ups (reps-based), treat differently
  const ratio=orm/bwKg;
  let level=-1;
  for(let i=0;i<ratios.length;i++){if(ratio>=ratios[i])level=i;}
  return{level,label:level>=0?STD_LABELS[level]:"Sub-Principiante",color:level>=0?STD_COLORS[level]:"#555",ratio:Math.round(ratio*100)/100,next:ratios[level+1]||null};
}

// Push/Pull balance (last 4 weeks)
function getPushPullBalance(sessions){
  const PUSH=["Petto","Spalle","Tricipiti"];
  const PULL=["Schiena","Bicipiti"];
  const recent=sessions.filter(s=>{const d=new Date(s.date);return(Date.now()-d)/86400000<=28;});
  let pushVol=0,pullVol=0;
  recent.forEach(s=>s.exercises.forEach(e=>{
    const v=(e.sets||1)*e.reps*e.weight;
    if(PUSH.includes(e.muscle))pushVol+=v;
    else if(PULL.includes(e.muscle))pullVol+=v;
  }));
  const total=pushVol+pullVol;
  if(!total)return null;
  const ratio=pullVol>0?Math.round(pushVol/pullVol*100)/100:null;
  return{pushVol:Math.round(pushVol),pullVol:Math.round(pullVol),ratio,
    status:!ratio?"N/D":ratio<0.8?"PULL DOMINANTE":ratio>1.3?"PUSH DOMINANTE":"BILANCIATO",
    pushPct:Math.round(pushVol/total*100),pullPct:Math.round(pullVol/total*100)};
}

// ══════════════════════════════════════════════
// ── NUTRITION SCIENCE ──
// ══════════════════════════════════════════════

// Mifflin-St Jeor BMR
function calcBMR(weightKg,heightCm,age,isMale){
  if(!weightKg||!heightCm||!age)return null;
  const base=10*weightKg+6.25*heightCm-(5*age);
  return Math.round(isMale?base+5:base-161);
}
// TDEE from actual training data
function calcSmartTDEE(bmr,sessions,actEntries){
  if(!bmr)return null;
  // Count average workouts/week from last 4 weeks (palestra + attività extra)
  const recent=sessions.filter(s=>(Date.now()-new Date(s.date))/86400000<=28);
  const recentActDays=Object.entries(actEntries||{}).filter(([d])=>(Date.now()-new Date(d))/86400000<=28).length;
  const gymFreq=recent.length/4;
  const actFreq=recentActDays/4;
  const wkFreq=gymFreq+actFreq*0.5; // attività extra contano meno del gym
  // Activity multiplier
  let mult;
  if(wkFreq<1)mult=1.2;
  else if(wkFreq<2)mult=1.375;
  else if(wkFreq<4)mult=1.55;
  else if(wkFreq<6)mult=1.725;
  else mult=1.9;
  return{tdee:Math.round(bmr*mult),mult,wkFreq:Math.round(wkFreq*10)/10,
    bulk:Math.round(bmr*mult+300),cut:Math.round(bmr*mult-500),maintain:Math.round(bmr*mult)};
}

// Protein timing score (how well distributed across the day - simulated from meal count)
function getProteinTimingScore(nutrEntries,sessions){
  const entries=Object.entries(nutrEntries||{});
  if(entries.length<5)return null;
  const trainDates=new Set(sessions.map(s=>s.date));
  let score=0,count=0;
  entries.forEach(([d,n])=>{
    if(!n.prot)return;
    count++;
    // Optimal: ~0.4g/kg per meal, 3-5 meals. We estimate from daily total.
    // Score 0-100 based on proximity to 2g/kg (using 75kg as default)
    const opt=150; // ~2g/kg for 75kg
    const proximity=1-Math.min(Math.abs(n.prot-opt)/opt,1);
    score+=proximity*100;
    // Bonus for training days with higher protein
    if(trainDates.has(d)&&n.prot>120)score+=5;
  });
  return Math.round(score/count);
}

// Carb cycling recommendation
function getCarbCycling(nutrEntries,sessions,tdee){
  if(!tdee)return null;
  const trainDates=new Set(sessions.map(s=>s.date));
  const entries=Object.entries(nutrEntries||{}).slice(-14);
  if(entries.length<5)return null;
  const avgKcal=entries.reduce((t,[,n])=>t+(n.kcal||0),0)/entries.length;
  const highCarbKcal=Math.round(tdee*1.1);
  const lowCarbKcal=Math.round(tdee*0.85);
  const highCarb=Math.round((highCarbKcal-tdee*0.35)/4); // protein=35% of kcal
  const lowCarb=Math.round((lowCarbKcal-tdee*0.35)/4);
  const highProt=Math.round(tdee*0.35/4);
  const lowProt=Math.round(tdee*0.3/4);
  return{highCarbKcal,lowCarbKcal,highCarb,lowCarb,highProt,lowProt,
    avgKcal:Math.round(avgKcal),tdee,
    recommendation:avgKcal>tdee*1.05?"Sei in surplus cronico. Prova giorni low-carb nei giorni di riposo.":
      avgKcal<tdee*0.9?"Sei in deficit prolungato. Aggiungi re-feed ad alto carb post-allenamento.":
      "Sei vicino al mantenimento. Il carb cycling può ottimizzare la composizione."};
}

// ══════════════════════════════════════════════
// ── VOLUME LANDMARKS (Dr. Mike Israetel / RP) ──
// ══════════════════════════════════════════════
const VOLUME_LANDMARKS = {
  Petto:      {mev:6,  mav:12, mrv:20},
  Schiena:    {mev:8,  mav:14, mrv:25},
  Spalle:     {mev:6,  mav:16, mrv:26},
  Bicipiti:   {mev:6,  mav:14, mrv:20},
  Tricipiti:  {mev:4,  mav:12, mrv:18},
  Gambe:      {mev:8,  mav:18, mrv:30},
  Addominali: {mev:0,  mav:16, mrv:25},
};

function getWeeklySetsByMuscle(sessions, weeksBack=4) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeksBack*7);
  const recent = sessions.filter(s => new Date(s.date) >= cutoff);
  const sets = {};
  MUSCLE_GROUPS.forEach(m => sets[m] = 0);
  recent.forEach(s => s.exercises.forEach(e => {
    if (sets[e.muscle] !== undefined) sets[e.muscle] += (e.sets||1);
  }));
  // Average per week
  const avg = {};
  MUSCLE_GROUPS.forEach(m => avg[m] = Math.round(sets[m] / weeksBack * 10) / 10);
  return avg;
}

function getVolumeStatus(muscle, setsPerWeek) {
  const lm = VOLUME_LANDMARKS[muscle];
  if (!lm) return null;
  if (setsPerWeek === 0)    return {zone:"INATTIVO",  color:"#374151", pct:0};
  if (setsPerWeek < lm.mev) return {zone:"SUB-MEV",   color:"#ef4444", pct: setsPerWeek/lm.mev*33};
  if (setsPerWeek < lm.mav) return {zone:"MEV→MAV",   color:"#f59e0b", pct: 33 + (setsPerWeek-lm.mev)/(lm.mav-lm.mev)*34};
  if (setsPerWeek < lm.mrv) return {zone:"IPERTROFIA", color:"#10b981", pct: 67 + (setsPerWeek-lm.mav)/(lm.mrv-lm.mav)*28};
  return {zone:"OVER-MRV", color:"#8b5cf6", pct:100};
}

// ══════════════════════════════════════════════
// ── PLATEAU DETECTOR + LINEAR REGRESSION ──
// ══════════════════════════════════════════════
function linReg(points) {
  // points: [{x, y}]
  const n = points.length;
  if (n < 3) return null;
  const sumX  = points.reduce((t,p) => t+p.x, 0);
  const sumY  = points.reduce((t,p) => t+p.y, 0);
  const sumXY = points.reduce((t,p) => t+p.x*p.y, 0);
  const sumX2 = points.reduce((t,p) => t+p.x*p.x, 0);
  const denom = n*sumX2 - sumX*sumX;
  if (!denom) return null;
  const m = (n*sumXY - sumX*sumY) / denom;
  const b = (sumY - m*sumX) / n;
  const r2 = (()=>{
    const yMean = sumY/n;
    const ssTot = points.reduce((t,p) => t+(p.y-yMean)**2, 0);
    const ssRes = points.reduce((t,p) => t+(p.y-(m*p.x+b))**2, 0);
    return ssTot > 0 ? Math.max(0, 1-ssRes/ssTot) : 0;
  })();
  return {m, b, r2};
}

function detectPlateau(exName, sessions, thresholdSessions=4) {
  const hist = sessions
    .flatMap(s => s.exercises
      .filter(e => e.name===exName && e.weight>0 && e.reps>0)
      .map(e => ({date:s.date, orm:oneRM(e.weight,e.reps), weight:e.weight}))
    ).slice(-12);
  if (hist.length < thresholdSessions) return null;
  const recent = hist.slice(-thresholdSessions);
  const maxW = Math.max(...recent.map(e => e.orm));
  const minW = Math.min(...recent.map(e => e.orm));
  const variance = maxW - minW;
  const isPlateau = variance <= 2.5; // within 2.5kg = plateau
  return {isPlateau, variance: Math.round(variance*10)/10,
    sessions: thresholdSessions, maxW, minW};
}

function getORMProjection(exName, sessions, weeksAhead=[4,8,12]) {
  const hist = sessions
    .flatMap(s => s.exercises
      .filter(e => e.name===exName && e.weight>0 && e.reps>0)
      .map(e => ({date:s.date, orm:oneRM(e.weight,e.reps)}))
    );
  if (hist.length < 4) return null;
  // Convert dates to week numbers relative to first
  const t0 = new Date(hist[0].date).getTime();
  const pts = hist.map(h => ({
    x: (new Date(h.date).getTime()-t0) / (7*86400000),
    y: h.orm
  }));
  const reg = linReg(pts);
  if (!reg || reg.r2 < 0.1) return null;
  const currentWeek = pts[pts.length-1].x;
  const projections = weeksAhead.map(w => ({
    weeks: w,
    orm: Math.round(reg.m*(currentWeek+w)+reg.b)
  }));
  return {reg, projections, currentOrm: hist[hist.length-1].orm,
    weeklyGain: Math.round(reg.m*10)/10, r2: Math.round(reg.r2*100)};
}

// ══════════════════════════════════════════════
// ── FFMI + BODY AESTHETICS ──
// ══════════════════════════════════════════════
function calcFFMI(weightKg, heightCm, fatPct) {
  if (!weightKg || !heightCm || fatPct==null) return null;
  const leanMass = weightKg * (1 - fatPct/100);
  const heightM  = heightCm / 100;
  const ffmi     = leanMass / (heightM*heightM);
  const normalizedFFMI = ffmi + 6.1*(1.8 - heightM);
  let level, color;
  if (normalizedFFMI < 18)      {level="Sotto media";  color="#6b7280";}
  else if (normalizedFFMI < 20) {level="Media";        color="#3b82f6";}
  else if (normalizedFFMI < 22) {level="Buono";        color="#10b981";}
  else if (normalizedFFMI < 23) {level="Ottimo";       color="#f59e0b";}
  else if (normalizedFFMI < 26) {level="Eccellente";   color:"#ef4444";}
  else                          {level="Elite/PED";    color="#8b5cf6";}
  return {
    ffmi: Math.round(ffmi*10)/10,
    normalized: Math.round(normalizedFFMI*10)/10,
    leanMass: Math.round(leanMass*10)/10,
    level, color,
    naturalLimit: 25,
    pctToNatLimit: Math.min(normalizedFFMI/25*100, 100)
  };
}

function getBodyRatios(weightKg, heightCm, waistCm, hipCm, shoulderCm) {
  const ratios = [];
  if (waistCm && hipCm) {
    const whr = Math.round(waistCm/hipCm*100)/100;
    ratios.push({
      name:"Vita/Fianchi (WHR)",
      value: whr,
      ideal:"0.8–0.9 (uomo) / 0.7–0.8 (donna)",
      status: whr<=0.9?"OTTIMO":"DA MIGLIORARE",
      color: whr<=0.9?"#10b981":"#f97316"
    });
  }
  if (waistCm && heightCm) {
    const wth = Math.round(waistCm/heightCm*100)/100;
    ratios.push({
      name:"Vita/Altezza",
      value: wth,
      ideal:"< 0.5",
      status: wth<0.5?"OTTIMO":wth<0.55?"DISCRETO":"DA MIGLIORARE",
      color: wth<0.5?"#10b981":wth<0.55?"#f59e0b":"#ef4444"
    });
  }
  if (waistCm && shoulderCm) {
    const swr = Math.round(shoulderCm/waistCm*100)/100;
    ratios.push({
      name:"Spalle/Vita (V-taper)",
      value: swr,
      ideal:"≥ 1.618 (golden ratio)",
      status: swr>=1.618?"GOLDEN":"SUB-OTTIMALE",
      color: swr>=1.618?"#f59e0b":"#6b7280"
    });
  }
  return ratios;
}

// ══════════════════════════════════════════════
// ── NUTRITION ↔ PERFORMANCE CORRELATION ──
// ══════════════════════════════════════════════
function getNutrPerfCorrelation(sessions, nutrEntries) {
  // Match sessions with nutrition data from same/previous day
  const paired = sessions
    .filter(s => {
      const prev=dateFromISO(s.date);prev.setDate(prev.getDate()-1);
      return nutrEntries[s.date]||nutrEntries[localISO(prev)];
    })
    .map(s => {
      const prev=dateFromISO(s.date);prev.setDate(prev.getDate()-1);
      const n = nutrEntries[s.date] || nutrEntries[localISO(prev)];
      const vol = sessionVol(s);
      const avgScore = s.exercises.filter(e=>e.score>0).length
        ? s.exercises.filter(e=>e.score>0).reduce((t,e)=>t+e.score,0) /
          s.exercises.filter(e=>e.score>0).length
        : null;
      return {date:s.date, kcal:n.kcal||0, prot:n.prot||0, carb:n.carb||0,
              vol, avgScore, duration:s.duration||0};
    })
    .filter(p => p.kcal > 0 && p.vol > 0);

  if (paired.length < 5) return null;

  // Correlation kcal vs volume
  const kcalPts = paired.map((p,i) => ({x:p.kcal, y:p.vol}));
  const protPts = paired.map((p,i) => ({x:p.prot, y:p.vol}));
  const regKcal = linReg(kcalPts);
  const regProt = linReg(protPts);

  // Split into high/low kcal days and compare volume
  const sorted = [...paired].sort((a,b)=>a.kcal-b.kcal);
  const half = Math.floor(sorted.length/2);
  const lowKcal  = sorted.slice(0,half);
  const highKcal = sorted.slice(half);
  const avgVolLow  = Math.round(lowKcal.reduce((t,p)=>t+p.vol,0)/lowKcal.length);
  const avgVolHigh = Math.round(highKcal.reduce((t,p)=>t+p.vol,0)/highKcal.length);
  const avgKcalLow  = Math.round(lowKcal.reduce((t,p)=>t+p.kcal,0)/lowKcal.length);
  const avgKcalHigh = Math.round(highKcal.reduce((t,p)=>t+p.kcal,0)/highKcal.length);
  const volDeltaPct = avgVolLow>0?Math.round((avgVolHigh-avgVolLow)/avgVolLow*100):0;

  return {paired, regKcal, regProt, avgVolLow, avgVolHigh,
          avgKcalLow, avgKcalHigh, volDeltaPct, n:paired.length};
}

function getDietQualityScore(nutrEntries, tdeeEntries, sessions, bwKg) {
  const entries = Object.entries(nutrEntries||{});
  if (entries.length < 5) return null;
  let score = 0; const breakdown = [];

  // 1. Consistency (30pts) — how many days logged in last 30
  const last30 = entries.filter(([d]) => {
    return (Date.now()-new Date(d))/86400000 <= 30;
  });
  const consistencyScore = Math.round(last30.length/30*30);
  score += consistencyScore;
  breakdown.push({label:"Consistenza", score:consistencyScore, max:30,
    note:last30.length+"/30 giorni registrati"});

  // 2. Protein adequacy (25pts)
  const avgProt = entries.reduce((t,[,n])=>t+(n.prot||0),0)/entries.length;
  const optProt = bwKg?bwKg*1.8:150;
  const protScore = Math.min(Math.round(avgProt/optProt*25), 25);
  score += protScore;
  breakdown.push({label:"Proteine", score:protScore, max:25,
    note:Math.round(avgProt)+"g media (target "+Math.round(optProt)+"g)"});

  // 3. Calorie proximity to TDEE (25pts)
  const balEntries = entries.filter(([d])=>tdeeEntries[d]);
  if (balEntries.length >= 3) {
    const avgBal = balEntries.reduce((t,[d,n])=>t+Math.abs(n.kcal-(tdeeEntries[d]||0)),0)/balEntries.length;
    const calScore = Math.round(Math.max(0, 25 - avgBal/100));
    score += calScore;
    breakdown.push({label:"Bilancio calorico", score:calScore, max:25,
      note:"Deviazione media: "+Math.round(avgBal)+"kcal/giorno"});
  }

  // 4. Macro balance (20pts)
  const avgCarb = entries.reduce((t,[,n])=>t+(n.carb||0),0)/entries.length;
  const avgFat  = entries.reduce((t,[,n])=>t+(n.fat||0),0)/entries.length;
  const totalCal = avgProt*4+avgCarb*4+avgFat*9;
  const protPct = totalCal>0?avgProt*4/totalCal:0;
  const macroScore = protPct>=0.25&&protPct<=0.40 ? 20 : protPct>=0.2 ? 12 : 5;
  score += macroScore;
  breakdown.push({label:"Split macros", score:macroScore, max:20,
    note:"Proteine: "+Math.round(protPct*100)+"% (ottimale 25–40%)"});

  const grade = score>=85?"A":score>=70?"B":score>=55?"C":score>=40?"D":"F";
  const gradeColor = score>=85?"#10b981":score>=70?"#f59e0b":score>=55?"#f97316":"#ef4444";
  return {score:Math.min(score,100), grade, gradeColor, breakdown};
}

function getBodyWeightForDate(bwEntries,date){
  const entries=[...(bwEntries||[])]
    .filter(e=>e?.date&&e.w!=null&&e.date<=date)
    .sort((a,b)=>a.date.localeCompare(b.date));
  return entries.length?entries[entries.length-1]:null;
}

function getDailyMacroSplit(n){
  if(!n)return null;
  const prot=n.prot||0,carb=n.carb||0,fat=n.fat||0;
  const total=prot*4+carb*4+fat*9;
  if(!total)return null;
  return{
    prot:Math.round(prot*4/total*100),
    carb:Math.round(carb*4/total*100),
    fat:Math.round(fat*9/total*100)
  };
}

function buildDailyShareStats(date,sessions,nutrEntries,tdeeEntries,actEntries,bwEntries){
  const day=localISO(date);
  const allSessions=sessions||[];
  const daySessions=allSessions.filter(s=>s.date===day);
  const nutrition=(nutrEntries||{})[day]||null;
  const acts=(actEntries||{})[day]||[];
  const bodyWeight=getBodyWeightForDate(bwEntries,day);
  const bwKg=bodyWeight?.w||null;
  const gymKcal=daySessions.reduce((t,s)=>t+(s.kcal||0),0);
  const actKcal=acts.reduce((t,a)=>t+(a.kcal||0),0);
  const manualOut=(tdeeEntries||{})[day]||null;
  const heightCm=parseInt(db("il_height"))||175;
  const bmr=bwKg?calcBMR(bwKg,heightCm,30,true):null;
  const estimatedOut=!manualOut&&bmr?Math.round(bmr*1.3)+gymKcal+actKcal:null;
  const activeOut=(gymKcal+actKcal)||null;
  const kcalOut=manualOut||estimatedOut||activeOut;
  const kcalOutMode=manualOut?"tracker":estimatedOut?"stima":activeOut?"attività":"";
  const kcalIn=nutrition?.kcal||null;
  const balance=kcalIn&&kcalOut?kcalIn-kcalOut:null;
  const duration=daySessions.reduce((t,s)=>t+(s.duration||0),0);
  const volume=daySessions.reduce((t,s)=>t+sessionVol(s),0);
  const exercises=daySessions.flatMap(s=>(s.exercises||[]).map(e=>({...e,sessionName:s.dayName,programName:s.programName})));
  const score=calcDayScore(day,nutrEntries||{},tdeeEntries||{},bwKg,actEntries||{},allSessions);
  return{
    date:day,
    sessions:daySessions,
    nutrition,
    acts,
    bodyWeight,
    gymKcal,
    actKcal,
    kcalOut,
    kcalOutMode,
    kcalIn,
    balance,
    duration,
    volume,
    exercises,
    macroSplit:getDailyMacroSplit(nutrition),
    score,
    hasAny:!!(daySessions.length||nutrition||acts.length||manualOut||bodyWeight)
  };
}

function formatShareExercise(e){
  const sets=e.sets||1;
  const reps=e.reps||0;
  const load=e.weight>0?`${e.weight}kg`:"BW";
  const setText=sets>1?`${sets}x${reps}`:`${reps} rep`;
  return `${e.name}: ${setText} @ ${load}`;
}

function formatDailyShareText(stats){
  const lines=[`Iron Log - ${stats.date}`];
  if(stats.score!==null&&stats.score!==undefined)lines.push(`Score giornata: ${stats.score}/100 (${scoreLabel(stats.score)})`);
  if(stats.bodyWeight?.w)lines.push(`Peso: ${stats.bodyWeight.w} kg`);

  if(stats.sessions.length){
    const names=[...new Set(stats.sessions.map(s=>s.dayName).filter(Boolean))].join(", ");
    const head=[`${stats.sessions.length} sessione${stats.sessions.length>1?"i":""}`];
    if(names)head.push(names);
    if(stats.duration)head.push(fmtDur(stats.duration));
    if(stats.volume)head.push(`${Math.round(stats.volume).toLocaleString("it-IT")} kg volume`);
    if(stats.gymKcal)head.push(`${stats.gymKcal} kcal`);
    lines.push("");
    lines.push(`Allenamento: ${head.join(" · ")}`);
    const mainExercises=stats.exercises.filter(e=>e.name&&e.reps>0).slice(0,8);
    if(mainExercises.length){
      lines.push("Esercizi:");
      mainExercises.forEach(e=>lines.push(`- ${formatShareExercise(e)}`));
      if(stats.exercises.length>mainExercises.length)lines.push(`- +${stats.exercises.length-mainExercises.length} altri esercizi`);
    }
  }else{
    lines.push("");
    lines.push("Allenamento: riposo");
  }

  if(stats.nutrition){
    const n=stats.nutrition;
    const macro=stats.macroSplit;
    lines.push("");
    lines.push(`Nutrizione: ${n.kcal||0} kcal`);
    lines.push(`Macro: P ${n.prot||0}g${macro?` (${macro.prot}%)`:""} · C ${n.carb||0}g${macro?` (${macro.carb}%)`:""} · F ${n.fat||0}g${macro?` (${macro.fat}%)`:""}`);
  }

  if(stats.kcalOut){
    lines.push("");
    lines.push(`Spesa calorica: ${stats.kcalOut} kcal${stats.kcalOutMode?` (${stats.kcalOutMode})`:""}`);
    if(stats.balance!==null)lines.push(`Bilancio: ${stats.balance>0?"+":""}${stats.balance} kcal`);
  }

  if(stats.acts.length){
    lines.push(`Attività extra: ${stats.acts.map(a=>`${a.type}${a.min?` ${a.min}min`:""}${a.kcal?` ${a.kcal}kcal`:""}`).join(", ")}`);
  }

  lines.push("");
  lines.push("#IronLog");
  return lines.join("\n");
}

function db(k,v){
  if(v===undefined){try{const x=localStorage.getItem(k);return x?JSON.parse(x):null;}catch(_){return null;}}
  try{localStorage.setItem(k,JSON.stringify(v));}
  catch(e){if((e.name==='QuotaExceededError'||e.code===22)&&!window._qlWarn){window._qlWarn=true;setTimeout(()=>alert('⚠️ Iron Log: spazio quasi esaurito!\nEsporta un backup JSON e rimuovi dati vecchi per liberare spazio.'),200);}}
  try{window.dispatchEvent(new CustomEvent("ironlog:datachange",{detail:{key:k,value:v}}));}catch(_){}
}
function dateFromISO(iso){
  if(typeof iso==="string"&&/^\d{4}-\d{2}-\d{2}/.test(iso)){
    const [y,m,d]=iso.slice(0,10).split("-").map(Number);
    return new Date(y,m-1,d);
  }
  return new Date(iso);
}
function localISO(input=new Date()){
  const d=input instanceof Date?input:dateFromISO(input);
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const day=String(d.getDate()).padStart(2,"0");
  return`${y}-${m}-${day}`;
}
function todayISO(){return localISO(new Date());}
function fmtDur(m){if(!m)return"—";const h=Math.floor(m/60),r=m%60;return h?`${h}h ${r}m`:`${m}min`;}
function sessionVol(s){return s.exercises.reduce((t,e)=>t+(e.sets||1)*e.reps*e.weight,0);}
function oneRM(w,r){return r<=1?w:Math.round(w*(1+r/30));}
function bmi(kg,cm){return cm>0?Math.round(kg/(cm/100)**2*10)/10:0;}
function getRecords(sessions){
  const r={};
  sessions.forEach(s=>s.exercises.forEach(e=>{
    if(!r[e.name]||e.weight>r[e.name].weight||(e.weight===r[e.name].weight&&e.reps>r[e.name].reps))
      r[e.name]={weight:e.weight,reps:e.reps,date:s.date,orm:oneRM(e.weight,e.reps)};
  }));
  return r;
}
function getStreak(sessions,actEntries){
  const toWeek=d=>{const dt=dateFromISO(d),day=dt.getDay()||7;dt.setDate(dt.getDate()+1-day);return localISO(dt);};
  const activeDates=[...sessions.map(s=>s.date),...Object.keys(actEntries||{})];
  if(!activeDates.length)return 0;
  const weeks=[...new Set(activeDates.sort().reverse().map(toWeek))];
  let s=1;for(let i=0;i<weeks.length-1;i++){if((new Date(weeks[i])-new Date(weeks[i+1]))/604800000<=1)s++;else break;}return s;
}
function getWeekDays(offset=0){
  const today=new Date(),dow=today.getDay()||7;
  const mon=new Date(today);mon.setDate(today.getDate()-dow+1+offset*7);
  return Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return d;});
}
function groupByWeek(sessions){
  const weeks={};
  sessions.forEach(s=>{
    const d=dateFromISO(s.date),day=d.getDay()||7;
    d.setDate(d.getDate()+1-day);const wk=localISO(d);
    if(!weeks[wk])weeks[wk]=[];weeks[wk].push(s);
  });
  return Object.entries(weeks).sort((a,b)=>b[0].localeCompare(a[0]));
}
function weekLabel(isoMon){
  const d=dateFromISO(isoMon),sun=new Date(d);sun.setDate(d.getDate()+6);
  return`${d.getDate()}/${d.getMonth()+1} – ${sun.getDate()}/${sun.getMonth()+1}`;
}

// ── PROGRESSIONE ──
function getSuggestion(exName,minReps,maxReps,step,sessions){
  const st=step||2.5;
  const history=sessions.flatMap(s=>s.exercises.filter(e=>e.name===exName)).filter(e=>e.weight>=0&&e.reps>0&&e.score>0);
  if(!history.length)return null;
  const {weight:lw,reps:lr,score:ls}=history[history.length-1];
  let nw=lw,nr=lr,action,badge,detail;
  if(ls===1){nw=lw+st;nr=minReps;action="AUMENTA PESO 🔺";badge="#22c55e";detail=`${lw}→${nw}kg · da ${minReps} rip`;}
  else if(ls===2){if(lr<maxReps){nr=lr+1;action="AUMENTA REPS";badge="#10b981";detail=`${lr}→${nr} rip`;}else{nw=lw+st;nr=minReps;action="AUMENTA PESO 🔺";badge="#22c55e";detail=`${lw}→${nw}kg`;}}
  else if(ls===3){if(lr<maxReps){nr=lr+1;action="AUMENTA REPS";badge="#10b981";detail=`${lr}→${nr} rip`;}else{nw=lw+st;nr=minReps;action="AUMENTA PESO 🔺";badge="#22c55e";detail=`Max! ${lw}→${nw}kg`;}}
  else if(ls===4){action="MANTIENI";badge="#f97316";detail=`${lr}×${lw}kg`;}
  else{nw=Math.max(lw-st,st);nr=minReps;action="RIDUCI PESO ↓";badge="#ef4444";detail=`${lw}→${nw}kg`;}
  if(nw<=0)return null; // non pre-compilare se il peso risultante è 0 o negativo
  return{nw,nr,action,badge,detail,lw,lr,ls};
}
