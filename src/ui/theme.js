// ── THEME ──
// ── THEME SYSTEM ──
const THEME_MODES={
  dark_gray:   {label:"🌑 Dark Grigio",  bg:"#111111",bg2:"#1a1a1a",bg3:"#212121",bg4:"#2a2a2a",border:"#252525",border2:"#303030",text:"#f0f0f0",text2:"#aaaaaa",text3:"#555555",text4:"#2e2e2e",hdr:"#111111"},
  dark_pure:   {label:"⚫ Dark Puro",    bg:"#0a0a0a",bg2:"#111111",bg3:"#191919",bg4:"#222222",border:"#1e1e1e",border2:"#2a2a2a",text:"#f0f0f0",text2:"#aaaaaa",text3:"#555555",text4:"#2e2e2e",hdr:"#0d0d0d"},
  dark_blue:   {label:"🌌 Blu Notte",   bg:"#080c14",bg2:"#0d1117",bg3:"#161b26",bg4:"#1e2535",border:"#1c2333",border2:"#263148",text:"#e6edf3",text2:"#8b949e",text3:"#484f58",text4:"#21262d",hdr:"#0d1117"},
  amoled:      {label:"🖤 AMOLED",       bg:"#000000",bg2:"#0a0a0a",bg3:"#111111",bg4:"#181818",border:"#141414",border2:"#1e1e1e",text:"#ffffff",text2:"#aaaaaa",text3:"#444444",text4:"#1e1e1e",hdr:"#000000"},
  light:       {label:"☀️ Light",         bg:"#f5f5f5",bg2:"#ffffff",bg3:"#f8f8f8",bg4:"#ebebeb",border:"#e2e2e2",border2:"#d0d0d0",text:"#111111",text2:"#444444",text3:"#888888",text4:"#cccccc",hdr:"#ffffff"},
  light_warm:  {label:"🌤 Light Caldo",  bg:"#faf8f5",bg2:"#ffffff",bg3:"#f9f7f4",bg4:"#f0ede8",border:"#e8e4df",border2:"#d9d4cd",text:"#1a1714",text2:"#5c5550",text3:"#9e9690",text4:"#d4cfc9",hdr:"#ffffff"},
};
const DENSITY_MODES={
  compact: {label:"📱 Compatta", cardPad:10, wrapPad:"10px 10px", cardMb:7,  fontSize:0.92},
  normal:  {label:"⚖️ Normale",  cardPad:14, wrapPad:"14px 12px", cardMb:10, fontSize:1},
  spacious:{label:"🖥 Spaziosa", cardPad:20, wrapPad:"18px 16px", cardMb:14, fontSize:1.08},
};
const THEME_STORAGE_KEY="il_theme_v2";
function loadThemePrefs(){
  try{const t=localStorage.getItem(THEME_STORAGE_KEY);return t?JSON.parse(t):{mode:"dark_pure",density:"normal"};}
  catch(_){return{mode:"dark_pure",density:"normal"};}
}
function saveThemePrefs(prefs){try{localStorage.setItem(THEME_STORAGE_KEY,JSON.stringify(prefs));}catch(_){}}

function makeC(dark, themeMode){
  // legacy compat: if themeMode provided use it, else fall back to old dark bool
  const modeKey = themeMode || (dark===false?"light":"dark_pure");
  const base = THEME_MODES[modeKey] || THEME_MODES.dark_pure;
  return {...base, acc:"#ef4444", isDark: !modeKey.startsWith("light")};
}
function makeS(C, density){
  const dp=density||DENSITY_MODES.normal;
  return{
    app:{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Arial Narrow',Arial,sans-serif",paddingBottom:80,fontSize:density?density.fontSize+"rem":"1rem"},
    hdr:{background:C.hdr,borderBottom:`2px solid ${C.acc}`,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,height:"max(52px, calc(44px + env(safe-area-inset-top)))",paddingTop:"env(safe-area-inset-top)"},
    logo:{fontSize:20,letterSpacing:5,color:C.acc,margin:0,fontWeight:900},
    wrap:{maxWidth:600,margin:"0 auto",padding:dp.wrapPad},
    card:{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:dp.cardPad,marginBottom:dp.cardMb},
    lbl:{fontSize:9,letterSpacing:2,color:C.text3,textTransform:"uppercase",marginBottom:4,display:"block"},
    inp:{width:"100%",background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:8,padding:"11px 12px",color:C.text,fontSize:16,boxSizing:"border-box",outline:"none",fontFamily:"inherit"},
    h2:{fontSize:14,letterSpacing:4,color:C.text,margin:"0 0 14px",borderLeft:`3px solid ${C.acc}`,paddingLeft:10},
    btn:(v="red")=>({padding:"12px 18px",borderRadius:8,cursor:"pointer",fontSize:11,letterSpacing:2,fontWeight:700,fontFamily:"inherit",border:"none",
      background:v==="red"?C.acc:v==="ghost"?"transparent":C.bg3,
      color:v==="ghost"?C.text3:"#fff",
      outline:v==="ghost"?`1px solid ${C.border2}`:"none"
    }),
    tag:(m)=>({display:"inline-block",padding:"2px 7px",borderRadius:4,background:(MUSCLE_COLORS[m]||"#555")+"18",color:MUSCLE_COLORS[m]||"#888",fontSize:9,letterSpacing:1}),
  };
}
