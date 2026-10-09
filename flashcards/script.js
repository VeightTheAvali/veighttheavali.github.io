const S=[["konnichiwa","dobrý den"],["arigatou","děkuji"],["sumimasen","promiňte"],["ohayou","dobré ráno"],["sayounara","na shledanou"],["hai","ano"],["iie","ne"]];
const W=[["mizu","voda"],["taberu","jíst"],["nomu","pít"],["nihon","Japonsko"],["gakkou","škola"],["tomodachi","kamarád"],["sensei","učitel"],["ookii","velký"],["chiisai","malý"],["kyou","dnes"],["ashita","zítra"],["iku","jít"],["miru","vidět"]];
const mk=a=>a.map(([ro,cs])=>({ro,cs}));
const $=id=>document.getElementById(id);

/* romaji -> hiragana */
const R={k:"かきくけこ",s:"さしすせそ",t:"たちつてと",n:"なにぬねの",h:"はひふへほ",m:"まみむめも",r:"らりるれろ",g:"がぎぐげご",z:"ざじずぜぞ",d:"だぢづでど",b:"ばびぶべぼ",p:"ぱぴぷぺぽ"};
const T={a:"あ",i:"い",u:"う",e:"え",o:"お",ya:"や",yu:"ゆ",yo:"よ",wa:"わ",wo:"を",shi:"し",chi:"ち",tsu:"つ",fu:"ふ",ji:"じ"};
for(const c in R)[..."aiueo"].forEach((v,j)=>T[c+v]=R[c][j]);
[["ky","き"],["gy","ぎ"],["ny","に"],["hy","ひ"],["by","び"],["py","ぴ"],["my","み"],["ry","り"],["sh","し"],["sy","し"],["ch","ち"],["ty","ち"],["j","じ"],["jy","じ"],["zy","じ"],["dy","ぢ"]]
 .forEach(([p,k])=>[["a","ゃ"],["u","ゅ"],["o","ょ"]].forEach(([v,sm])=>{if(!T[p+v])T[p+v]=k+sm}));
const K={fa:"ファ",fi:"フィ",fe:"フェ",fo:"フォ",wi:"ウィ",we:"ウェ",she:"シェ",che:"チェ",je:"ジェ",ti:"ティ",di:"ディ",tu:"トゥ",du:"ドゥ",va:"ヴァ",vi:"ヴィ",vu:"ヴ",ve:"ヴェ",vo:"ヴォ"};
const toKata=h=>h.replace(/[\u3041-\u3096]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
// a word followed by * is written in katakana (amerika* -> アメリカ); everything else is hiragana
const toKana=s=>(s||"").split(/(\s+)/).map(w=>w.length>1&&w.endsWith("*")?kana(w.slice(0,-1),true):kana(w,false)).join("");
const roDisp=s=>(s||"").replace(/\*(?=\s|$)/g,"");
function kana(s,kata){
  s=s.toLowerCase();
  s=kata?s.replace(/ā/g,"a-").replace(/ī/g,"i-").replace(/ū/g,"u-").replace(/ē/g,"e-").replace(/ō/g,"o-")
         :s.replace(/ā/g,"aa").replace(/ī/g,"ii").replace(/ū/g,"uu").replace(/ē/g,"ee").replace(/ō/g,"ou");
  let out="",i=0;
  while(i<s.length){
    const ch=s[i];
    if(i+1<s.length&&ch===s[i+1]&&/[bcdfghjkmpqrstvwxyz]/.test(ch)){out+="っ";i++;continue}
    if(ch==="t"&&s.slice(i+1,i+3)==="ch"){out+="っ";i++;continue}
    let m=null;
    for(const L of [3,2,1]){const t=s.substr(i,L);if((kata&&K[t])||T[t]){m=t;break}}
    if(m){out+=(kata&&K[m])||T[m];i+=m.length;continue}
    if(ch==="n"){out+="ん";i+=s[i+1]==="'"?2:1;continue}
    if(ch==="-"){out+="ー";i++;continue}
    out+=ch;i++;
  }
  return kata?toKata(out):out}

/* state */
function load(){
  try{const s=localStorage.getItem("jp-packs-v3");if(s)return JSON.parse(s)}catch(e){}
  try{const o=localStorage.getItem("jp-packs-v2");if(o){const p=JSON.parse(o);
    return{sel:p.sel||0,packs:p.packs.map(k=>({name:k.name,cards:k.cards.map(c=>({ro:c.ro||"",cs:c.cs||""}))}))}}}catch(e){}
  return{sel:0,packs:[{name:"Greetings",cards:mk(S)},{name:"Everyday words",cards:mk(W)}]}}
function save(){try{localStorage.setItem("jp-packs-v3",JSON.stringify(st))}catch(e){}}
let st=load(),cur=null,shown=false,view="study";
st.mode=st.mode||"ro";st.dir=st.dir||"jp2cs";
const pack=()=>st.packs[st.sel];
const sk=()=>st.dir==="cs2jp"?"s2":"s";
const valid=c=>c.ro&&(st.dir!=="cs2jp"||c.cs);

/* difficulty: each rating 1 (Easy) .. 4 (Don't know); d is a smoothed average, so weight follows recent answers */
const LV={1:["Easy","easy"],2:["Medium","medium"],3:["Hard","hard"],4:["Don't know","dk"]};
function info(c){
  const s=c[sk()];if(!s||!s.n)return["New","new",-1];
  const l=LV[Math.min(4,Math.max(1,Math.round(s.d)))];return[l[0],l[1],s.d]}
const weight=c=>{const s=c[sk()];return Math.pow(2,(s&&s.n?s.d:3)-1)};   // Easy 1, Medium 2, Hard 4, Don't know 8, New 4
function pick(){
  const v=pack().cards.filter(valid);if(!v.length)return null;
  const pool=v.length>1?v.filter(c=>c!==cur):v,w=pool.map(weight);
  let r=Math.random()*w.reduce((a,b)=>a+b,0);
  for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i]}
  return pool[pool.length-1]}
function next(){cur=pick();shown=false;render()}
function grade(r){
  if(!cur||!shown)return;
  const s=cur[sk()]||(cur[sk()]={d:r,n:0,k:[0,0,0,0]});
  s.d=s.n?0.7*r+0.3*s.d:r;s.n++;s.k[r-1]++;
  save();next()}

function fillSel(el){el.innerHTML="";st.packs.forEach((p,i)=>{const o=document.createElement("option");o.value=i;o.textContent=p.name+" ("+p.cards.length+")";el.appendChild(o)});el.value=st.sel}
const dirText=()=>st.dir==="cs2jp"?"Česky → Japanese":"Japanese → Česky";

/* study view */
function render(){
  fillSel($("packSel"));
  ["jp","both","ro"].forEach(m=>$("m-"+m).setAttribute("aria-pressed",st.mode===m));
  $("dir").textContent=dirText();
  const v=pack().cards.filter(valid),seen=v.filter(c=>info(c)[2]>=0).length,easy=v.filter(c=>info(c)[1]==="easy").length;
  $("cnt").textContent=seen+" of "+v.length+" seen · "+easy+" easy";
  $("pct").textContent=v.length?Math.round(easy/v.length*100)+"% easy":"";
  $("bar").style.width=(v.length?easy/v.length*100:0)+"%";
  const c=$("card"),rb=document.querySelectorAll("#rate button");
  if(!cur){
    c.innerHTML='<div class="hint"></div>';
    c.firstChild.textContent="No cards for this direction yet. Add some under Edit packs.";
    rb.forEach(b=>b.disabled=true);return}
  const rev=st.dir==="cs2jp";
  c.innerHTML='<div class="small"></div><div class="front"></div><div class="ans"><div class="small"></div><div class="main"></div></div><div class="hint"></div>';
  const top=st.mode==="both"?roDisp(cur.ro):"",main=st.mode==="ro"?roDisp(cur.ro):toKana(cur.ro),an=c.children[2];
  an.className="ans"+(rev?" jpans":"");
  if(rev){
    c.children[1].textContent=cur.cs;
    c.children[1].classList.remove("jp");
  }else{
    c.children[0].textContent=top;
    c.children[1].textContent=main;
    c.children[1].classList.add("jp");
  }
  if(shown){an.children[0].textContent=rev?top:"";an.children[1].textContent=rev?main:(cur.cs||"(empty)")}
  else c.children[3].textContent="Tap to show the answer";
  rb.forEach(b=>b.disabled=!shown)}
$("card").onclick=()=>{if(!cur){next();return}shown=!shown;render()};
[1,2,3,4].forEach(n=>$("r"+n).onclick=()=>grade(n));
[["jp","m-jp"],["both","m-both"],["ro","m-ro"]].forEach(([m,id])=>$(id).onclick=()=>{st.mode=m;save();render()});
function flipDir(){st.dir=st.dir==="cs2jp"?"jp2cs":"cs2jp";save();if(view==="stats")renderStats();else next()}
$("dir").onclick=flipDir;$("statDir").onclick=flipDir;
$("packSel").onchange=e=>{st.sel=+e.target.value;save();next()};
document.addEventListener("keydown",e=>{
  if(view!=="study"||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key===" "){e.preventDefault();$("card").click()}
  else if("1234".includes(e.key)&&e.key)grade(5-+e.key)});   // 1 Don't know, 2 Hard, 3 Medium, 4 Easy

/* statistics view */
function renderStats(){
  fillSel($("statSel"));$("statDir").textContent=dirText();
  const v=pack().cards.filter(valid),cnt={};
  v.forEach(c=>{const n=info(c)[0];cnt[n]=(cnt[n]||0)+1});
  $("statNote").textContent=v.length+" cards · hardest first";
  const d=$("dist"),lg=$("legend");d.innerHTML="";lg.innerHTML="";
  [["Don't know","dk"],["Hard","hard"],["Medium","medium"],["Easy","easy"],["New","new"]].forEach(([n,k])=>{
    const x=cnt[n]||0,sp=document.createElement("span");
    sp.className=k;sp.style.width=(v.length?x/v.length*100:0)+"%";sp.title=n+": "+x;d.appendChild(sp);
    const l=document.createElement("span"),dot=document.createElement("i"),t=document.createElement("span");
    l.className=k;t.style.color="var(--ink)";t.textContent=n+" "+x;l.append(dot,t);lg.appendChild(l)});
  const box=$("statRows");box.innerHTML="";
  if(!v.length){box.textContent="No cards in this pack for this direction yet.";return}
  v.map(c=>[c,info(c)]).sort((a,b)=>b[1][2]-a[1][2]).forEach(([c,[n,k]])=>{
    const r=document.createElement("div");r.className="st";
    const a=document.createElement("div"),j=document.createElement("b"),ro=document.createElement("span");
    j.textContent=toKana(c.ro);ro.className="mu";ro.textContent=" "+roDisp(c.ro);a.append(j,ro);
    const bd=document.createElement("span");bd.className="bd "+k;bd.textContent=n;
    const z=document.createElement("div");z.className="mu";z.textContent=c.cs||"(no Czech yet)";
    const sn=c[sk()],se=document.createElement("div");se.className="mu";se.textContent=sn&&sn.n?"seen "+sn.n+"×":"not seen yet";
    r.append(a,bd,z,se);box.appendChild(r)})}
$("statSel").onchange=e=>{st.sel=+e.target.value;save();renderStats()};

/* edit view */
let nameMode=null,delArmed=false,delT;
function field(ph,val,key,i){
  const inp=document.createElement("input");inp.placeholder=ph;inp.value=val||"";inp.setAttribute("aria-label",ph);
  inp.oninput=()=>{pack().cards[i][key]=inp.value;save();if(key==="ro")inp.closest(".ec").querySelector(".kp").textContent=toKana(inp.value)};return inp}
function renderEdit(){
  disarm();fillSel($("editSel"));
  const box=$("rows");box.innerHTML="";
  pack().cards.forEach((c,i)=>{
    const r=document.createElement("div");r.className="er";
    const x=document.createElement("button");x.className="btn danger";x.textContent="✕";x.setAttribute("aria-label","Remove card");
    x.onclick=()=>{pack().cards.splice(i,1);save();renderEdit()};
    r.append(field("Romaji",c.ro,"ro",i),field("Česky",c.cs,"cs",i),x);
    const w=document.createElement("div");w.className="ec";
    const kp=document.createElement("div");kp.className="kp";kp.title="Japanese preview";kp.textContent=toKana(c.ro);
    w.append(r,kp);box.appendChild(w)})}
$("editSel").onchange=e=>{st.sel=+e.target.value;save();renderEdit()};
$("addCard").onclick=()=>{pack().cards.push({ro:"",cs:""});save();renderEdit();
  const ins=$("rows").querySelectorAll(".er");ins[ins.length-1].querySelector("input").focus()};
function openName(mode,val){nameMode=mode;$("nameForm").classList.remove("hidden");$("nameInput").value=val;$("nameInput").focus();$("nameInput").select()}
function closeName(){$("nameForm").classList.add("hidden");nameMode=null}
$("nameCancel").onclick=closeName;
$("nameForm").onsubmit=e=>{e.preventDefault();const n=$("nameInput").value.trim();if(!n)return;
  if(nameMode==="new"){st.packs.push({name:n,cards:[]});st.sel=st.packs.length-1}else pack().name=n;
  save();closeName();renderEdit()};
$("newPack").onclick=()=>openName("new","");
$("renPack").onclick=()=>openName("ren",pack().name);
function disarm(){clearTimeout(delT);delArmed=false;$("delPack").textContent="Delete";$("msg").textContent=""}
$("delPack").onclick=()=>{
  if(st.packs.length<2){$("msg").textContent="Keep at least one pack.";return}
  if(!delArmed){delArmed=true;$("delPack").textContent="Tap again to delete";
    $("msg").textContent='Deleting "'+pack().name+'" removes its '+pack().cards.length+' cards.';delT=setTimeout(disarm,4000);return}
  st.packs.splice(st.sel,1);st.sel=0;save();renderEdit()};

/* import / export */
const note=t=>{$("msg").textContent=t};
const clean=c=>({ro:c.ro,cs:c.cs,s:c.s,s2:c.s2});
function dl(name,text){try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"application/json"}));a.download=name;document.body.appendChild(a);a.click();a.remove()}catch(e){}}
function doExport(all){
  const ps=all?st.packs:[pack()];
  const text=JSON.stringify({format:"flashcards",version:1,packs:ps.map(p=>({name:p.name,cards:p.cards.map(clean)}))},null,1);
  $("io").value=text;
  dl(all?"flashcards-all.json":(pack().name.replace(/[^\w-]+/g,"_")||"pack")+".json",text);
  note("Exported "+ps.length+" pack(s). If no file was saved, copy the text below.")}
function importText(t,fname){
  t=t.trim();let packs=[];
  if(!t){renderEdit();note("Paste some text or choose a file first.");return}
  try{const j=JSON.parse(t),arr=Array.isArray(j)?j:j.packs||[j];
    packs=arr.filter(p=>p&&Array.isArray(p.cards)).map(p=>({name:String(p.name||fname),
      cards:p.cards.filter(c=>c&&c.ro).map(c=>({ro:String(c.ro),cs:String(c.cs||""),s:c.s,s2:c.s2}))}))}
  catch(e){
    const cards=t.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{const m=l.match(/^([^\t;,]*)[\t;,](.*)$/);return m?{ro:m[1].trim(),cs:m[2].trim()}:{ro:l,cs:""}}).filter(c=>c.ro);
    if(cards.length)packs=[{name:fname,cards}]}
  if(!packs.length){renderEdit();note("Couldn't read that. Use exported JSON, or lines like: konnichiwa,dobrý den");return}
  const names=new Set(st.packs.map(p=>p.name));
  packs.forEach(p=>{let n=p.name,i=2;while(names.has(n))n=p.name+" ("+(i++)+")";names.add(n);p.name=n});
  st.sel=st.packs.length;st.packs.push(...packs);save();
  renderEdit();note("Imported "+packs.length+" pack(s), "+packs.reduce((a,p)=>a+p.cards.length,0)+" cards.")}
$("exPack").onclick=()=>doExport(false);
$("exAll").onclick=()=>doExport(true);
$("imp").onclick=()=>importText($("io").value,"Imported pack");
$("pick").onclick=()=>$("file").click();
$("file").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{$("io").value=r.result;importText(r.result,f.name.replace(/\.[^.]*$/,""))};r.readAsText(f);e.target.value=""};

/* navigation */
function show(v){
  view=v;["study","edit","stats"].forEach(x=>$(x).classList.toggle("hidden",x!==v));
  $("bStats").textContent=v==="stats"?"Back to study":"Statistics";
  $("bEdit").textContent=v==="edit"?"Back to study":"Edit packs";
  if(v==="edit")renderEdit();else if(v==="stats")renderStats();else next()}
$("bStats").onclick=()=>show(view==="stats"?"study":"stats");
$("bEdit").onclick=()=>show(view==="edit"?"study":"edit");
next();
