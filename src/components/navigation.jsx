// ══════════════════════════════════════════════
// ── TAB BAR ──
// ══════════════════════════════════════════════
function TabBar({view,setView,C}){
  const tabs=[
    {id:"workout",icon:"🏋",label:"WORKOUT"},
    {id:"log_active",icon:"📝",label:"LOG",hidden:true},
    {id:"finish",icon:"🏁",label:"FINE",hidden:true},
    {id:"history",icon:"📊",label:"STORICO"},
    {id:"fisico",icon:"🫀",label:"FISICO"},
    {id:"setup",icon:"⚙",label:"SETUP",hidden:true},
  ];
  const visible=tabs.filter(t=>!t.hidden);
  const active=view==="log"||view==="log_active"?"log_active":view==="finish"?"workout":view==="setup"||view==="setup-edit"?"workout":view;
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.hdr,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:300,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {visible.map(t=>(
        <button key={t.id} onClick={()=>setView(t.id)} style={{flex:1,padding:"10px 4px 6px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:18,lineHeight:1}}>{t.icon}</span>
          <span style={{fontSize:8,letterSpacing:1,color:active===t.id?"#ef4444":C.text3,fontWeight:active===t.id?700:400}}>{t.label}</span>
          {active===t.id&&<div style={{width:20,height:2,background:"#ef4444",borderRadius:1}}/>}
        </button>
      ))}
    </div>
  );
}
