const {useState,useEffect,useRef,useCallback} = React;

// ── CONSTANTS ──
const MUSCLE_GROUPS=["Petto","Schiena","Spalle","Bicipiti","Tricipiti","Gambe","Addominali"];
const MUSCLE_COLORS={Petto:"#ef4444",Schiena:"#3b82f6",Spalle:"#f59e0b",Bicipiti:"#8b5cf6",Tricipiti:"#ec4899",Gambe:"#10b981",Addominali:"#f97316"};
const SCORE_LABELS=["","Molto Facile","Facile","Perfetto","Difficile","Troppo Pesante"];
const SCORE_COLORS=["","#10b981","#84cc16","#f59e0b","#ef4444","#dc2626"];
const DAY_COLORS=["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#f97316","#06b6d4","#84cc16","#a855f7"];
const ACTIVITIES=["Palestra","Corsa","Tennis","Calcetto","Padel","Nuoto","Ciclismo","Camminata","HIIT","Yoga","Altro"];
const DEFAULT_EX={
  Petto:["Panca Piana","Panca Inclinata","Panca Declinata","Croci ai Cavi","Push-up","Chest Press"],
  Schiena:["Stacchi","Lat Machine","Rematore Bilanciere","Rematore Manubrio","Pulley","Trazioni"],
  Spalle:["Lento Avanti","Alzate Laterali","Alzate Frontali","Arnold Press","Tirate al Mento"],
  Bicipiti:["Curl Bilanciere","Curl Manubri","Curl Concentrazione","Curl Martello","Curl ai Cavi"],
  Tricipiti:["French Press","Tricipiti ai Cavi","Dips","Skull Crusher","Kickback"],
  Gambe:["Squat","Leg Press","Affondi","Leg Curl","Leg Extension","Calf Raises","Romanian Deadlift"],
  Addominali:["Crunch","Plank","Russian Twist","Leg Raise","Mountain Climber"],
};
const QUOTES=["Il dolore di oggi è la forza di domani.","Non fermarti quando sei stanco. Fermati quando hai finito.","Ogni rep ti avvicina alla versione migliore di te.","La disciplina batte la motivazione ogni giorno.","Il corpo raggiunge ciò che la mente crede.","Progressi lenti sono sempre meglio di nessun progresso.","La fatica di oggi è il trofeo di domani.","Non si tratta di essere il migliore. Si tratta di essere migliore di ieri."];

const PROG_KEY="il_v10_prog", PROGRAMS_KEY="il_programs", ACTIVE_PROGRAM_KEY="il_active_program", SESS_KEY="il_v10_sess", THEME_KEY="il_theme";
const BW_KEY="il_bw", GOALS_KEY="il_goals", NUTR_KEY="il_nutr", ACT_KEY="il_act", TDEE_KEY="il_tdee", BW_GOAL_KEY="il_bw_goal", CHECKIN_KEY="il_checkin", KCAL_GOAL_KEY="il_kcal_goal";
