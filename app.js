const VERSION='1.9';
const H=[['あ','a'],['い','i'],['う','u'],['え','e'],['お','o'],['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko'],['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so'],['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to'],['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no'],['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho'],['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo'],['や','ya'],['ゆ','yu'],['よ','yo'],['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro'],['わ','wa'],['を','wo'],['ん','n']];
const K=[['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o'],['カ','ka'],['キ','ki'],['ク','ku'],['ケ','ke'],['コ','ko'],['サ','sa'],['シ','shi'],['ス','su'],['セ','se'],['ソ','so'],['タ','ta'],['チ','chi'],['ツ','tsu'],['テ','te'],['ト','to'],['ナ','na'],['ニ','ni'],['ヌ','nu'],['ネ','ne'],['ノ','no'],['ハ','ha'],['ヒ','hi'],['フ','fu'],['ヘ','he'],['ホ','ho'],['マ','ma'],['ミ','mi'],['ム','mu'],['メ','me'],['モ','mo'],['ヤ','ya'],['ユ','yu'],['ヨ','yo'],['ラ','ra'],['リ','ri'],['ル','ru'],['レ','re'],['ロ','ro'],['ワ','wa'],['ヲ','wo'],['ン','n']];
const CONF=[['あ','お','右側曲線'],['き','さ','下半部'],['ぬ','め','收尾方向'],['れ','わ','右側形狀'],['シ','ツ','點的方向'],['ソ','ン','起筆角度']];
const KEY='gojuon-v19';
const old18=JSON.parse(localStorage.getItem('gojuon-v18')||'null');
const old17=JSON.parse(localStorage.getItem('gojuon-v17')||'null');
const old16=JSON.parse(localStorage.getItem('gojuon-v16')||'null');
const old15=JSON.parse(localStorage.getItem('gojuon-v15')||'null');
const old14=JSON.parse(localStorage.getItem('gojuon-v14')||'null');
const old13=JSON.parse(localStorage.getItem('gojuon-v13')||'null');
const old=JSON.parse(localStorage.getItem('gojuon-v12')||'null');
let S=JSON.parse(localStorage.getItem(KEY)||'null')||old18||old17||old16||old15||old14||old13||old||{mode:'hira',learned:[],wrong:{},correct:{},streak:0,lastDay:'',daily:[],guide:1,voice:'',rate:.78};
if(S.rate==null)S.rate=.78;if(S.voice==null)S.voice='';if(S.teacherMode==null)S.teacherMode='follow';if(S.followGap==null)S.followGap=1500;if(S.quizMode==null)S.quizMode='hira';if(!S.learned)S.learned=[];if(!S.wrong)S.wrong={};if(!S.correct)S.correct={};if(!S.daily)S.daily=[];
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)], data=()=>S.mode==='hira'?H:K;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const today=()=>new Date().toLocaleDateString('sv-SE');
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function touchDay(){const t=today();if(S.lastDay!==t){let d=new Date();d.setDate(d.getDate()-1);S.streak=S.lastDay===d.toLocaleDateString('sv-SE')?(S.streak||0)+1:1;S.lastDay=t;S.daily=[];save()}}touchDay();

const EN_CUE={
'a':'ah','i':'ee','u':'oo（短音）','e':'eh','o':'oh',
'ka':'kah','ki':'kee','ku':'koo','ke':'keh','ko':'koh',
'sa':'sah','shi':'shee','su':'soo','se':'seh','so':'soh',
'ta':'tah','chi':'chee','tsu':'tsoo','te':'teh','to':'toh',
'na':'nah','ni':'nee','nu':'noo','ne':'neh','no':'noh',
'ha':'hah','hi':'hee','fu':'foo（輕柔 f）','he':'heh','ho':'hoh',
'ma':'mah','mi':'mee','mu':'moo','me':'meh','mo':'moh',
'ya':'yah','yu':'yoo','yo':'yoh',
'ra':'rah（輕彈舌，介於 r/l）','ri':'ree（輕彈舌）','ru':'roo（輕彈舌）','re':'reh（輕彈舌）','ro':'roh（輕彈舌）',
'wa':'wah','wo':'oh / wo','n':'n / ng（依後音變化）'
};
const AUDIO_BASE='https://webjapanese.com/sound/50/';
const AUDIO_SOURCE='WEB JAPANESE BOOKS / Minimum Japanese';
let activeAudio=null;
function audioUrl(roman){return `${AUDIO_BASE}${roman}.mp3`}
function stopAudio(){if(activeAudio){try{activeAudio.pause();activeAudio.currentTime=0}catch(e){} activeAudio=null}}
function speakTTS(text,rate=S.rate){if(!('speechSynthesis' in window))return; speechSynthesis.cancel(); const u=makeUtterance(text,rate); speechSynthesis.speak(u)}
function playKanaAudio(k,roman,onend){linePlayToken++;speechSynthesis.cancel();stopAudio();const a=new Audio(audioUrl(roman));activeAudio=a;a.preload='auto';a.onended=()=>{activeAudio=null;onend&&onend()};a.onerror=()=>{activeAudio=null;const u=makeUtterance(k,S.rate);u.onend=()=>onend&&onend();speechSynthesis.speak(u)};a.play().catch(()=>{activeAudio=null;const u=makeUtterance(k,S.rate);u.onend=()=>onend&&onend();speechSynthesis.speak(u)})}

let JPVOICES=[];
function qualityLabel(v){const n=(v.name||'').toLowerCase();if(/enhanced|premium|natural|增強|高品質/.test(n))return '高品質 / 增強語音';if(v.localService)return 'iPhone 本機語音';return '系統日文語音'}
function voiceScore(v){let s=0,n=(v.name||'').toLowerCase();if(/^ja[-_]/i.test(v.lang))s+=100;if(v.localService)s+=8;if(/kyoko|nanami|otoya|siri|premium|enhanced|natural/.test(n))s+=25;if(/compact/.test(n))s-=4;return s}
function refreshVoices(){JPVOICES=speechSynthesis.getVoices().filter(v=>/^ja[-_]/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a));if(JPVOICES.length&&!JPVOICES.some(v=>v.name===S.voice)){S.voice=JPVOICES[0].name;save()}fillVoiceSelect()}
function fillVoiceSelect(){const el=$('#voiceSelect');if(!el)return;el.innerHTML=JPVOICES.length?JPVOICES.map((v,i)=>`<option value="${esc(v.name)}" ${v.name===S.voice?'selected':''}>${i===0?'★ ':''}${esc(v.name)} · ${esc(v.lang)}</option>`).join(''):'<option>系統尚未載入日文語音</option>';const stat=$('#voiceStatus');const v=JPVOICES.find(x=>x.name===S.voice)||JPVOICES[0];if(stat)stat.innerHTML=v?`<div class="voiceDiag"><b>🎙️ 目前實際使用</b><strong>${esc(v.name)}</strong><span>${esc(v.lang)} · ${qualityLabel(v)}</span><span>來源：${v.localService?'iPhone 本機':'系統 / 網頁可用語音'}</span></div>`:`<span class="statusWarn">Safari 尚未提供日文語音給這個網頁</span>`}
refreshVoices();speechSynthesis.onvoiceschanged=refreshVoices;
let linePlayToken=0;
function makeUtterance(text,rate=S.rate){const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=rate;u.pitch=1;u.volume=1;const v=JPVOICES.find(x=>x.name===S.voice)||JPVOICES[0];if(v)u.voice=v;return u}
function speak(text,rate=S.rate){const pair=[...H,...K].find(x=>x[0]===text);if(pair){$$('.soundRing').forEach(x=>x.classList.add('speaking'));playKanaAudio(pair[0],pair[1],()=>$$('.soundRing').forEach(x=>x.classList.remove('speaking')));return}if(!('speechSynthesis' in window))return;linePlayToken++;stopAudio();speechSynthesis.cancel();const u=makeUtterance(text,rate);u.onstart=()=>$$('.soundRing').forEach(x=>x.classList.add('speaking'));u.onend=()=>$$('.soundRing').forEach(x=>x.classList.remove('speaking'));speechSynthesis.speak(u)}
function clearLineHighlight(){$$('.kana.lineSpeaking').forEach(x=>x.classList.remove('lineSpeaking'));$$('.linePlayBtn.playing').forEach(x=>x.classList.remove('playing'))}
function stopLine(){linePlayToken++;stopAudio();speechSynthesis.cancel();clearLineHighlight()}
function playLine(label,items){
  const token=++linePlayToken;
  stopAudio(); speechSynthesis.cancel(); clearLineHighlight();
  const btn=document.querySelector(`[data-line="${label}"]`); if(btn)btn.classList.add('playing');
  let i=0;
  // Reuse one HTMLAudioElement for the whole row. This is more reliable on iPhone/Safari
  // because every next kana stays inside the same user-started media session.
  const a=new Audio(); activeAudio=a; a.preload='auto';
  const finish=()=>{
    if(token===linePlayToken){try{a.pause()}catch(e){} activeAudio=null;clearLineHighlight()}
  };
  const next=()=>{
    if(token!==linePlayToken)return finish();
    if(i>=items.length)return finish();
    const [k,r]=items[i++];
    $$('.kana.lineSpeaking').forEach(x=>x.classList.remove('lineSpeaking'));
    const el=document.getElementById(`k-${k}`); if(el)el.classList.add('lineSpeaking');
    a.onended=null; a.onerror=null;
    a.src=audioUrl(r);
    a.onended=()=>{ if(token===linePlayToken)setTimeout(next,320) };
    a.onerror=()=>{
      if(token!==linePlayToken)return;
      const u=makeUtterance(k,.66);
      u.onend=()=>{ if(token===linePlayToken)setTimeout(next,320) };
      speechSynthesis.speak(u);
    };
    a.play().catch(()=>a.onerror&&a.onerror());
  };
  next();
}

function shell(content,active='home'){ $('#app').innerHTML=`<main class="app">${content}<div class="footer">五十音學習 App V${VERSION} · 學習紀錄保存在這台裝置</div></main>${nav(active)}`; }
function topbar(){return `<div class="topbar"><div class="brand"><div class="mark">あ</div><div><div class="brandTitle">五十音學習</div><div class="version">V${VERSION} · 聽力辨字、弱點強化</div></div></div><div class="chip">🔥 ${S.streak||0} 天</div></div>`}
function nav(active){return `<nav class="bottomNav"><button class="navBtn ${active==='home'?'active':''}" onclick="home()"><span>⌂</span>首頁</button><button class="navBtn ${active==='learn'?'active':''}" onclick="learn()"><span>あ</span>學習</button><button class="navBtn ${active==='write'?'active':''}" onclick="writeMode()"><span>✍︎</span>手寫</button><button class="navBtn ${active==='review'?'active':''}" onclick="review()"><span>↻</span>複習</button></nav>`}
function modeSegment(){return `<div class="segment"><button class="${S.mode==='hira'?'active':''}" onclick="setMode('hira')">平假名</button><button class="${S.mode==='kata'?'active':''}" onclick="setMode('kata')">片假名</button></div>`}
function stats(){const total=92,pct=Math.round(S.learned.length/total*100),wrong=Object.values(S.wrong).reduce((a,b)=>a+b,0);const qs=S.daily.filter(x=>x&&typeof x==='object'&&['listen','read','weak'].includes(x.type));const accuracy=qs.length?Math.round(qs.filter(x=>x.ok).length/qs.length*100):0;return {pct,wrong,total,accuracy,questions:qs.length}}
function home(){teacherToken++;stopAudio();speechSynthesis.cancel();const st=stats();shell(`${topbar()}<section class="card hero"><div class="eyebrow">TODAY'S JAPANESE</div><div class="heroTitle">每天 5 個音，真正記住五十音。</div><div class="heroText">V1.9 加入聽音辨字、弱點題庫與今日正確率；答錯的音會更常出現。</div><div class="metricRow"><div class="metric"><strong>${st.pct}%</strong><span>總進度</span></div><div class="metric"><strong>${st.accuracy}%</strong><span>今日正確率</span></div><div class="metric"><strong>${st.wrong}</strong><span>弱點分數</span></div></div><div class="progress"><i style="width:${st.pct}%"></i></div></section>
<section class="card"><div class="sectionHead"><div><div class="sectionTitle">開始學習</div><div class="sectionSub">建議順序：看字聽音 → 手寫 → 聽力測驗</div></div></div><div class="menuGrid"><button class="action primary" onclick="learn()"><div class="ico">🔊</div><b>點字學發音</b><small>按一下假名就立即唸</small></button><button class="action teacherAction" onclick="teacherMode()"><div class="ico">👩‍🏫</div><b>老師帶讀</b><small>聽一個 → 留時間跟讀</small></button><button class="action" onclick="writeMode()"><div class="ico">✍️</div><b>手寫練習</b><small>描字、默寫、反覆練</small></button><button class="action quizAction" onclick="quizHub()"><div class="ico">🎧</div><b>V1.9 聽力訓練</b><small>聽音辨字・弱點強化・10 題挑戰</small></button><button class="action" onclick="selfCheck()"><div class="ico">🗣️</div><b>先自己唸</b><small>看字先唸，再播放比對</small></button></div></section>
<section class="card"><div class="sectionHead"><div><div class="sectionTitle">學習文字</div><div class="sectionSub">先平假名，再片假名</div></div></div>${modeSegment()}</section>
<section class="card"><div class="sectionHead"><div><div class="sectionTitle">日文發音</div><div class="sectionSub">V1.9：外部 MP3 為主要發音；聽力測驗會依錯題自動加權。MP3 失敗時才使用 iPhone 日文語音</div></div></div><div class="voiceGrid"><select id="voiceSelect" class="voiceSelect" onchange="changeVoice(this.value)"></select><button class="btn soft" onclick='playLine("試聽",H.slice(0,5))'>🔊 試聽 あいうえお</button></div><div class="row" style="margin-top:10px"><button class="btn small ${S.rate===.78?'primary':''}" onclick="setRate(.78)">標準練習</button><button class="btn small ${S.rate===.62?'primary':''}" onclick="setRate(.62)">慢速</button><button class="btn small ${S.rate===.9?'primary':''}" onclick="setRate(.9)">自然速度</button></div><div id="voiceStatus" class="note" style="margin-top:10px"></div></section>`,`home`);setTimeout(refreshVoices,0)}
function changeVoice(v){S.voice=v;save();playLine('試聽',H.slice(0,5))}
function setRate(r){S.rate=r;save();home();setTimeout(()=>playLine('試聽',H.slice(0,5)),80)}
function setMode(m){S.mode=m;save();home()}

function rowData(){let D=data();return [['母音',D.slice(0,5)],['K',D.slice(5,10)],['S',D.slice(10,15)],['T',D.slice(15,20)],['N',D.slice(20,25)],['H',D.slice(25,30)],['M',D.slice(30,35)],['Y',[D[35],D[36],D[37]]],['R',D.slice(38,43)],['W',[D[43],D[44],D[45]]]]}
function learn(){teacherToken++;stopAudio();speechSynthesis.cancel();shell(`<div class="lessonTop"><div class="row spread"><button class="btn small" onclick="home()">← 首頁</button><div style="min-width:190px">${modeSegment()}</div></div></div><section class="card"><div class="sectionTitle">點一下就發音；▶ 可整行連續聽</div><div class="sectionSub">綠點＝已學過。整行播放會等上一個 MP3 播完再播下一個；播放時螢幕不會移動。</div><div class="kanaRows">${rowData().map(([label,items])=>`<div class="kanaRow"><div class="rowLabel">${label}</div>${items.map(([k,r])=>`<button id="k-${k}" class="kana ${S.learned.includes(k)?'learned':''}" onclick="showKana('${k}','${r}')">${k}</button>`).join('')}${'<span class="kanaSpacer"></span>'.repeat(5-items.length)}<button class="linePlayBtn" data-line="${label}" onclick='playLine(${JSON.stringify(label)},${JSON.stringify(items)})' aria-label="連續播放 ${label} 行">▶</button></div>`).join('')}</div><div class="lineHelp"><span>▶ 一鍵播放整行</span><button class="btn small" onclick="stopLine()">■ 停止</button></div></section><div id="detail"></div>`,'learn')}
function showKana(k,r){speak(k);$$('.kana').forEach(x=>x.classList.remove('active'));const b=document.getElementById(`k-${k}`);if(b)b.classList.add('active');$('#detail').innerHTML=`<section class="card detail center"><div class="soundRing">🔊</div><button class="bigKana" onclick="speak('${k}')">${k}</button><div class="roman">${r}</div><div class="listenHint">再點大字可重聽</div><div class="row" style="justify-content:center;margin-top:16px"><button class="btn soft" onclick="speak('${k}',.56)">🐢 慢速</button><button class="btn" onclick="writeSpecific('${k}','${r}')">✍️ 寫這個字</button><button class="btn primary" onclick="markLearned('${k}')">✓ 學會了</button></div></section>`}
function markLearned(k){if(!S.learned.includes(k))S.learned.push(k);save();const b=document.getElementById(`k-${k}`);if(b)b.classList.add('learned')}

const rand=a=>a[Math.floor(Math.random()*a.length)];
function weightedPool(){let pool=[];data().forEach(x=>{let n=1+Math.min(6,(S.wrong[x[0]]||0)*2);for(let i=0;i<n;i++)pool.push(x)});return pool}
let teacherToken=0;
function setTeacherMode(m){S.teacherMode=m;save();teacherMode()}
function setTeacherKanaMode(m){S.mode=m;save();teacherMode()}
function stopTeacher(){teacherToken++;stopAudio();speechSynthesis.cancel();clearLineHighlight();const st=$('#teacherStatus');if(st)st.textContent='已停止';const cur=$('#teacherCurrent');if(cur)cur.classList.remove('speaking')}
function teacherMode(){
  teacherToken++; stopLine(); stopAudio(); speechSynthesis.cancel();
  const rows=rowData();
  shell(`<div class="lessonTop"><div class="row spread"><button class="btn small" onclick="home()">← 首頁</button><div style="min-width:190px"><div class="segment"><button class="${S.mode==='hira'?'active':''}" onclick="setTeacherKanaMode('hira')">平假名</button><button class="${S.mode==='kata'?'active':''}" onclick="setTeacherKanaMode('kata')">片假名</button></div></div></div></div>
  <section class="card teacherHero"><div class="eyebrow">V1.9 TEACHER MODE</div><div class="sectionTitle">老師帶讀／跟讀練習</div><div class="sectionSub">先聽 MP3，再留時間讓你跟著唸。整個過程畫面不會自動捲動。</div>
  <div class="teacherModes">
    <button class="modeCard ${S.teacherMode==='normal'?'active':''}" onclick="setTeacherMode('normal')"><b>▶ 連續播放</b><small>每音間隔約 0.35 秒</small></button>
    <button class="modeCard ${S.teacherMode==='follow'?'active':''}" onclick="setTeacherMode('follow')"><b>🗣️ 跟讀模式</b><small>每音留 1.5 秒跟讀</small></button>
    <button class="modeCard ${S.teacherMode==='repeat3'?'active':''}" onclick="setTeacherMode('repeat3')"><b>×3 重複</b><small>每個音播放 3 次</small></button>
  </div></section>
  <section class="card center teacherStage"><div id="teacherStatus" class="teacherStatus">選一排開始練習</div><div id="teacherCurrent" class="teacherCurrent">あ</div><div id="teacherRoman" class="teacherRoman">a</div><div id="teacherCue" class="teacherCue">聽老師 → 跟著唸</div><div class="teacherProgress"><i id="teacherProgressBar" style="width:0%"></i></div><button class="btn small" onclick="stopTeacher()">■ 停止</button></section>
  <section class="card"><div class="sectionTitle">選擇練習行</div><div class="teacherRows">${rows.map(([label,items])=>`<button class="teacherRowBtn" onclick='startTeacher(${JSON.stringify(label)},${JSON.stringify(items)})'><span><b>${label}</b><small>${items.map(x=>x[0]).join(' ・ ')}</small></span><strong>開始 ▶</strong></button>`).join('')}</div></section>`,'learn');
}
function startTeacher(label,items){
  const token=++teacherToken; linePlayToken++; stopAudio(); speechSynthesis.cancel(); clearLineHighlight();
  let idx=0, rep=0; const mode=S.teacherMode||'follow'; const reps=mode==='repeat3'?3:1;
  const a=new Audio(); activeAudio=a; a.preload='auto';
  const status=$('#teacherStatus'), cur=$('#teacherCurrent'), roman=$('#teacherRoman'), cue=$('#teacherCue'), bar=$('#teacherProgressBar');
  if(status)status.textContent=`${label} 行 · ${mode==='follow'?'跟讀模式':mode==='repeat3'?'每音 3 次':'連續播放'}`;
  const finish=()=>{if(token!==teacherToken)return;try{a.pause()}catch(e){}activeAudio=null;if(status)status.textContent='✓ 這一排完成';if(cue)cue.textContent='很好！可以再練一次或換下一排';if(bar)bar.style.width='100%';items.forEach(([k])=>{if(!S.daily.includes(k))S.daily.push(k)});save()};
  const next=()=>{
    if(token!==teacherToken)return;
    if(idx>=items.length)return finish();
    const [k,r]=items[idx];
    if(cur){cur.textContent=k;cur.classList.add('speaking')} if(roman)roman.textContent=r;
    if(cue)cue.textContent=mode==='follow'?'先聽老師，接著換你唸':'仔細聽每一個音';
    if(bar)bar.style.width=`${Math.round(((idx+(rep/reps))/items.length)*100)}%`;
    a.onended=null;a.onerror=null;a.src=audioUrl(r);
    const afterSound=()=>{
      if(token!==teacherToken)return;
      rep++;
      if(rep<reps){if(cue)cue.textContent=`再聽一次（${rep+1}/3）`;setTimeout(next,520);return}
      rep=0; idx++;
      const gap=mode==='follow'?(S.followGap||1500):mode==='repeat3'?900:350;
      if(mode==='follow'&&cue)cue.textContent='換你唸 👄';
      setTimeout(next,gap);
    };
    a.onended=afterSound;
    a.onerror=()=>{if(token!==teacherToken)return;const u=makeUtterance(k,.72);u.onend=afterSound;speechSynthesis.cancel();speechSynthesis.speak(u)};
    a.play().catch(()=>a.onerror&&a.onerror());
  };
  next();
}

let QSESSION=null;
const WEAK_ROMAJI=['shi','chi','tsu','su','fu','ho','ra','ri','ru','re','ro','ya','yu','yo'];
function setQuizMode(m){S.quizMode=m;save();quizHub()}
function quizModeSegment(){return `<div class="segment quizSegment"><button class="${S.quizMode==='hira'?'active':''}" onclick="setQuizMode('hira')">平假名</button><button class="${S.quizMode==='kata'?'active':''}" onclick="setQuizMode('kata')">片假名</button><button class="${S.quizMode==='mix'?'active':''}" onclick="setQuizMode('mix')">混合</button></div>`}
function quizHub(){
  teacherToken++;stopLine();stopAudio();speechSynthesis.cancel();const st=stats();const weak=weakest(5);
  shell(`<div class="row spread"><button class="btn small" onclick="home()">← 首頁</button><div class="chip">🎧 V1.9 聽力中心</div></div>
  <section class="card quizHero"><div class="eyebrow">EAR TRAINING</div><div class="sectionTitle">聽音辨字＋弱點強化</div><div class="sectionSub">每回合 10 題。答錯的假名之後會更常出現。</div><div style="margin-top:12px">${quizModeSegment()}</div><div class="metricRow"><div class="metric"><strong>${st.accuracy}%</strong><span>今日正確率</span></div><div class="metric"><strong>${st.questions}</strong><span>今日測驗題</span></div><div class="metric"><strong>${weak.length?weak[0][0]:'—'}</strong><span>目前最弱</span></div></div></section>
  <section class="card"><div class="menuGrid"><button class="action primary" onclick="startQuiz('listen')"><div class="ico">🎧</div><b>聽音選字</b><small>播放 MP3，從 4 個假名選答案</small></button><button class="action" onclick="startQuiz('read')"><div class="ico">🧠</div><b>看字選音</b><small>看到假名，選正確羅馬字</small></button><button class="action weakAction" onclick="startQuiz('weak')"><div class="ico">⚡</div><b>易錯音特訓</b><small>し・ち・つ・す、ふ、ら行等</small></button><button class="action" onclick="selfCheck()"><div class="ico">🗣️</div><b>自己先唸</b><small>先開口，再播放標準音比對</small></button></div></section>
  ${weak.length?`<section class="card"><div class="sectionTitle">目前最常錯的 5 個</div><div class="weakList">${weak.map(([k,r,w,c])=>`<button onclick="speak('${k}')"><b>${k}</b><span>${r}</span><small>弱點 ${w} · 答對 ${c}</small></button>`).join('')}</div></section>`:''}`,'review')
}
function weakest(n=5){return [...H,...K].map(([k,r])=>[k,r,S.wrong[k]||0,S.correct[k]||0]).filter(x=>x[2]>0).sort((a,b)=>b[2]-a[2]||a[3]-b[3]).slice(0,n)}
function questionSet(type){let base;if(S.quizMode==='kata')base=K;else if(S.quizMode==='mix')base=Math.random()<.5?H:K;else base=H;if(type==='weak'){const w=base.filter(x=>WEAK_ROMAJI.includes(x[1])||(S.wrong[x[0]]||0)>0);return w.length>=4?w:base}return base}
function weightedFrom(base){let pool=[];base.forEach(x=>{let n=1+Math.min(8,(S.wrong[x[0]]||0)*2);for(let i=0;i<n;i++)pool.push(x)});return pool}
function startQuiz(type){QSESSION={type,n:0,score:0,run:0,best:0};quiz(type)}
function quiz(type){
  if(!QSESSION||QSESSION.type!==type)QSESSION={type,n:0,score:0,run:0,best:0};
  if(QSESSION.n>=10)return quizResult();
  const base=questionSet(type),q=rand(weightedFrom(base)),opts=[q];while(opts.length<4){let x=rand(base);if(!opts.some(o=>o[0]===x[0]))opts.push(x)}opts.sort(()=>Math.random()-.5);
  const isListen=type!=='read';const title=type==='weak'?'⚡ 易錯音特訓':isListen?'🎧 聽音選字':'🧠 看字選音';
  shell(`<div class="row spread"><button class="btn small" onclick="quizHub()">← 聽力中心</button><div class="chip">${title}</div></div><section class="card center"><div class="quizTop"><span>第 ${QSESSION.n+1} / 10 題</span><b>✓ ${QSESSION.score}</b><span>連對 ${QSESSION.run}</span></div><div class="progress"><i style="width:${QSESSION.n*10}%"></i></div><div class="quizPrompt">${isListen?`<button class="btn soft listenPad" onclick="speak('${q[0]}')"><div class="soundRing">🔊</div><b>點這裡再聽一次</b><small>仔細聽，再選假名</small></button>`:`<button class="bigKana" onclick="speak('${q[0]}')">${q[0]}</button>`}</div><div id="choices">${opts.map(o=>`<button class="choice" data-value="${isListen?o[0]:o[1]}" onclick="answer(this,'${q[0]}','${isListen?o[0]:o[1]}','${type}','${q[1]}')">${isListen?o[0]:o[1]}</button>`).join('')}</div><div id="fb" class="quizFeedback"></div></section>`,'review');if(isListen)setTimeout(()=>speak(q[0]),120)
}
function answer(btn,k,val,type,roman){
  const isListen=type!=='read',ok=isListen?val===k:val===roman;$$('.choice').forEach(b=>{b.disabled=true;if(b.dataset.value===(isListen?k:roman))b.classList.add('ok')});if(!ok)btn.classList.add('bad');
  QSESSION.n++;if(ok){QSESSION.score++;QSESSION.run++;QSESSION.best=Math.max(QSESSION.best,QSESSION.run);S.correct[k]=(S.correct[k]||0)+1;if((S.wrong[k]||0)>0)S.wrong[k]--}else{QSESSION.run=0;S.wrong[k]=(S.wrong[k]||0)+1}
  S.daily.push({k,ok,t:Date.now(),type:type==='weak'?'weak':type});save();
  const fb=$('#fb');if(fb)fb.innerHTML=`<div class="${ok?'feedbackGood':'feedbackBad'}"><b>${ok?'✓ 答對了！':'✕ 再記一次'}</b><span>正確：${k}　${roman}</span><button class="btn small soft" onclick="speak('${k}')">🔊 再聽一次</button></div>`;speak(k);setTimeout(()=>quiz(type),1350)
}
function quizResult(){const q=QSESSION;const pct=Math.round(q.score/10*100);shell(`<div class="row spread"><button class="btn small" onclick="quizHub()">← 聽力中心</button><div class="chip">完成</div></div><section class="card center resultCard"><div class="eyebrow">10 QUESTION CHALLENGE</div><div class="resultScore">${q.score}<small>/10</small></div><div class="sectionTitle">${pct>=90?'非常穩！':pct>=70?'進步得很好':'弱點已記錄，下次會加強'}</div><div class="sectionSub">正確率 ${pct}% · 最長連續答對 ${q.best} 題</div><div class="row" style="justify-content:center;margin-top:18px"><button class="btn primary" onclick="startQuiz('${q.type}')">再來 10 題</button><button class="btn" onclick="review()">看弱點</button></div></section>`,'review')}
function selfCheck(){const base=S.mode==='kata'?K:H,[k,r]=rand(base);shell(`<div class="row spread"><button class="btn small" onclick="quizHub()">← 聽力中心</button><div class="chip">🗣️ 自己先唸</div></div><section class="card center selfCheck"><div class="writePrompt">先不要按播放。看到字後，自己大聲唸一次。</div><div class="selfKana">${k}</div><div id="selfReveal"><button class="btn primary" onclick="revealSelf('${k}','${r}')">我唸好了 → 播放標準音</button></div></section>`,'review')}
function revealSelf(k,r){speak(k);const el=$('#selfReveal');if(el)el.innerHTML=`<div class="pronAid"><span>ROMAJI</span><strong>${r}</strong><small>聽完後，判斷自己剛才是否接近</small></div><div class="row" style="justify-content:center"><button class="btn primary" onclick="selfRate('${k}',true)">✓ 我會唸</button><button class="btn" onclick="selfRate('${k}',false)">↻ 再練一次</button><button class="btn soft" onclick="speak('${k}')">🔊 再聽</button></div>`}
function selfRate(k,ok){if(ok){S.correct[k]=(S.correct[k]||0)+1;if((S.wrong[k]||0)>0)S.wrong[k]--}else S.wrong[k]=(S.wrong[k]||0)+1;S.daily.push({k,ok,t:Date.now(),type:'self'});save();selfCheck()}

function review(){let D=data().slice().sort((a,b)=>(S.wrong[b[0]]||0)-(S.wrong[a[0]]||0));let top=D.filter(x=>(S.wrong[x[0]]||0)>0).slice(0,10);if(!top.length)top=D.filter(x=>!S.learned.includes(x[0])).slice(0,10);const st=stats(),weak=weakest(5);shell(`<div class="row spread"><button class="btn small" onclick="home()">← 首頁</button><div class="chip">智慧複習</div></div><section class="card"><div class="sectionTitle">今日學習狀態</div><div class="metricRow"><div class="metric"><strong>${st.accuracy}%</strong><span>測驗正確率</span></div><div class="metric"><strong>${st.questions}</strong><span>測驗題數</span></div><div class="metric"><strong>${S.streak||0}</strong><span>連續學習天</span></div></div></section><section class="card"><div class="sectionTitle">今天最該複習</div><div class="sectionSub">常答錯的字會排前面；沒有錯題時，就練尚未學會的字。</div><div class="menuGrid">${top.map(([k,r])=>`<button class="action" style="min-height:88px;text-align:center" onclick="speak('${k}')"><b style="font:700 31px/1.1 'Hiragino Mincho ProN','Yu Mincho',serif">${k}</b><small>${r} · 弱點 ${(S.wrong[k]||0)}</small></button>`).join('')}</div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" onclick="quizHub()">🎧 V1.9 聽力中心</button><button class="btn" onclick="confuse()">易混淆字</button></div></section>${weak.length?`<section class="card"><div class="sectionTitle">最常錯的 5 個假名</div><div class="weakList">${weak.map(([k,r,w,c])=>`<button onclick="speak('${k}')"><b>${k}</b><span>${r}</span><small>弱點 ${w} · 答對 ${c}</small></button>`).join('')}</div></section>`:''}`,'review')}

function confuse(){shell(`<div class="row spread"><button class="btn small" onclick="review()">← 複習</button><div class="chip">👀 易混淆</div></div><section class="card"><div class="sectionTitle">相似字對照</div><div class="sectionSub">點卡片會先唸左邊的字；觀察差異位置。</div><div class="confuseGrid">${CONF.map(([a,b,h])=>`<button class="pair" onclick="speak('${a}')"><div class="pairChars">${a} ／ ${b}</div><small>${h}</small></button>`).join('')}</div></section>`,'review')}

function writeMode(){let [k,r]=rand(data());writeSpecific(k,r)}
function writeSpecific(k,r){shell(`<div class="row spread"><button class="btn small" onclick="learn()">← 學習</button><div class="chip">✍️ ${k} / ${r}</div></div><section class="card center"><div class="writePrompt">先聽，再寫。可開啟描字輔助。</div><button class="bigKana" style="font-size:60px" onclick="speak('${k}')">${k}</button><div class="pronAid"><span>ROMAJI</span><strong>${r}</strong><small>英文發音輔助：${EN_CUE[r]||r}</small><em>英文只是記音提示，請以真人日語錄音為準。</em></div><div class="row" style="justify-content:center"><button class="btn small soft" onclick="speak('${k}')">🔊 真人發音</button><button class="btn small" onclick="toggleGuide()">👁 描字 ${S.guide?'開':'關'}</button><button class="btn small" onclick="writeMode()">換一個</button></div><div class="canvasWrap"><div id="guide" class="guideKana" style="display:${S.guide?'grid':'none'}">${k}</div><canvas id="pad"></canvas></div><div class="row" style="justify-content:center"><button class="btn" onclick="clearPad()">清除</button><button class="btn primary" onclick="finishWrite('${k}')">完成，下一個</button></div></section>`,'write');setTimeout(initPad,0);setTimeout(()=>speak(k),120)}
function finishWrite(k){if(!S.learned.includes(k))S.learned.push(k);S.daily.push({k,ok:true,t:Date.now(),type:'write'});save();writeMode()}
function toggleGuide(){S.guide=S.guide?0:1;save();const g=$('#guide');if(g)g.style.display=S.guide?'grid':'none'}
let ctx,canvas,drawing=false;
function initPad(){canvas=$('#pad');if(!canvas)return;let r=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=8;ctx.strokeStyle='#1e1d1b';const pos=e=>{let rr=canvas.getBoundingClientRect();return[e.clientX-rr.left,e.clientY-rr.top]};canvas.onpointerdown=e=>{drawing=true;let [x,y]=pos(e);ctx.beginPath();ctx.moveTo(x,y);canvas.setPointerCapture?.(e.pointerId);e.preventDefault()};canvas.onpointermove=e=>{if(!drawing)return;let[x,y]=pos(e);ctx.lineTo(x,y);ctx.stroke();e.preventDefault()};const end=e=>{drawing=false;e.preventDefault()};canvas.onpointerup=end;canvas.onpointercancel=end}
function clearPad(){if(ctx&&canvas){let r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height)}}
home();