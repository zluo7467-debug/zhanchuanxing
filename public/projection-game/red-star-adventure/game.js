'use strict';
(() => {
 const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
 const A=window.Art, scene=$('#scene'), ctx=scene.getContext('2d');
 const GRID={cols:9,rows:5,x:80,y:214,dx:105,dy:75};
 const xy=p=>({x:GRID.x+p.c*GRID.dx,y:GRID.y+p.r*GRID.dy});
 const pt=(c,r)=>({c,r}), equal=(a,b)=>a.c===b.c&&a.r===b.r, key=p=>`${p.c},${p.r}`;
 const BRIDGE=[[0,4],[1,4],[1,3],[2,3],[3,3],[3,2],[4,2],[5,2],[5,1],[6,1],[7,1],[8,1]].map(([c,r])=>pt(c,r));
 const GRASS=[[0,4],[1,4],[2,4],[2,3],[2,2],[3,2],[4,2],[4,1],[5,1],[6,1],[6,2],[7,2],[8,2],[8,1],[8,0]].map(([c,r])=>pt(c,r));
 const chapters=[
  {title:'整装集合',subtitle:'认识行军装备',scene:'集合营地',tag:'装备辨认',stamp:'细心星章',date:'红军形象认知',factTitle:'小小装备，装着大大的坚持。',fact:'草鞋、布鞋曾陪伴红军战士行军；干粮袋用于携带粮食等物品；军号可以传递集合、出发等信号。长征时期条件艰苦，不同部队、时期的衣着与装备并不完全相同。',note:'图中背包、帽子属于今天参与研学的小朋友。红领巾不是长征时期红军统一配发的军装部件。'},
  {title:'点亮时间线',subtitle:'沿着历史的先后',scene:'历史节点 · 非地理地图',tag:'时间顺序',stamp:'求知星章',date:'1934 年 10 月 → 1935 年 10 月',factTitle:'先记住，中央红军的三个节点。',fact:'1934 年 10 月，中央红军主力在江西于都集结出发。1935 年 1 月，遵义会议召开，成为党的历史上生死攸关的转折点。同年 10 月，中央红军到达陕北吴起镇。',note:'这是中央红军的部分时间节点，不是所有红军队伍共用的完整路线。下一关将专题回顾长征途中的泸定桥。'},
  {title:'桥上的勇气',subtitle:'沿着脚印一步一步',scene:'泸定桥主题 · 互动示意',tag:'桥面寻路',stamp:'勇气星章',date:'1935 年 5 月 29 日 · 四川泸定',factTitle:'大渡河上，有一座泸定桥。',fact:'泸定桥是一座横跨大渡河的铁索桥。1935 年 5 月 29 日，红军夺取泸定桥，为队伍继续前进打开通路。这段历史让我们认识勇气，也认识战友之间的配合。',note:'这里的木板数量、脚印和行走顺序专为游戏设计，不是战斗现场复原。现场只需慢走，不需要跳跃或模拟战斗。'},
  {title:'草地里的坚持',subtitle:'认准踏点，慢慢绕行',scene:'松潘草地主题 · 互动示意',tag:'草地绕行',stamp:'坚持星章',date:'1935 年 · 长征途中的草地',factTitle:'一步一步，走出困难。',fact:'长征途中，红军穿越了川西北的草地，其中包括通常所说的松潘草地。高原气候多变，草地里有泥潭、沼泽，加上粮食短缺，行军十分艰难。战士们互相帮助，克服困难。',note:'发光踏点是游戏提示，不是现实沼泽通行指南。不同部队过草地的时间和次数有所不同。'},
  {title:'终于相聚',subtitle:'把伙伴带到会师地点',scene:'会师地点 · 两次接力',tag:'会师协作',stamp:'团结星章',date:'1936 年 10 月 · 会宁与将台堡',factTitle:'三大主力，先后胜利会师。',fact:'1936 年 10 月 9 日，红一、红四方面军在甘肃会宁会师。10 月 22 日，红二方面军在将台堡同红一方面军会师。三大主力胜利会师，标志着长征胜利结束。',note:'将台堡今属宁夏西吉。关卡用两个小伙伴接力表示两次会师，不代表三大主力在同一天、同一地点集合。'}
 ];
 const equipment=[
  {q:'哪双鞋曾陪伴红军行军？',text:'走到你认为正确的装备圆环里，停一停。',options:[{label:'滑轮鞋',icon:'skate'},{label:'草鞋',icon:'shoe'},{label:'手机',icon:'phone'}],correct:1,tip:'草鞋轻便，战士们也穿布鞋行军。你找到了一双有故事的鞋。'},
  {q:'把行军的粮食装在哪里？',text:'选择适合装干粮的物品。',options:[{label:'干粮袋',icon:'bag'},{label:'军号',icon:'horn'},{label:'八角帽',icon:'cap'}],correct:0,tip:'干粮袋用来携带粮食。补给和节约，同样重要。'},
  {q:'哪件装备能传递号声？',text:'听觉也是部队传递信号的一种方式。',options:[{label:'草鞋',icon:'shoe'},{label:'干粮袋',icon:'bag'},{label:'军号',icon:'horn'}],correct:2,tip:'军号能传递集合、出发等信号。三件装备都认识啦。'}
 ];
 let state={screen:'home',level:0,sub:0,phase:'idle',pos:pt(4,4),visual:xy(pt(4,4)),move:null,queue:[],hold:0,target:null,completed:0,sound:false,projection:false,lastTime:0,trail:[],visited:new Set(),noticeUntil:0,feedback:'',flash:0,partner:null};
 let keys=new Set(), lastStep=0, pointerDir=null, timer=null, audioCtx=null, pausedPhase=null;
 const dirs={up:pt(0,-1),down:pt(0,1),left:pt(-1,0),right:pt(1,0)};
 const names=['整装集合','点亮时间线','桥上的勇气','草地里的坚持','终于相聚'];
 const isPath=()=>state.level===2||state.level===3;
 const route=()=>state.level===2?BRIDGE:GRASS;
 function safe(p){return p.c>=0&&p.c<9&&p.r>=0&&p.r<5&&(!isPath()||route().some(a=>equal(a,p)))}
 function allTargets(){
  if(state.level===0)return equipment[Math.min(state.sub,2)].options.map((o,i)=>({...o,c:[1,4,7][i],r:1,index:i,done:state.sub>=3}));
  if(state.level===1)return [{c:7,r:1,label:'于都',detail:'1934 年 10 月',icon:'yudu',index:0},{c:1,r:1,label:'遵义',detail:'1935 年 1 月',icon:'zunyi',index:1},{c:4,r:1,label:'吴起镇',detail:'1935 年 10 月',icon:'wuqi',index:2}].map(t=>({...t,done:t.index<state.sub}));
  if(isPath())return (state.level===2?[pt(3,3),pt(5,2),pt(8,1)]:[pt(2,2),pt(6,2),pt(8,0)]).map((t,i)=>({...t,index:i,label:i===2?'到达终点':`踏点 ${i+1}`,done:i<state.sub,icon:i===2?'flag':null}));
  return [{c:2,r:1,label:'会宁',detail:'甘肃',icon:'town',index:0,done:state.sub>0},{c:6,r:1,label:'将台堡',detail:'今宁夏',icon:'town',index:1,done:false}];
 }
 function setFeedback(message){state.feedback=message;$('#feedback').textContent=message}
 function clearInput(){keys.clear();pointerDir=null;state.queue=[];state.hold=0;state.target=null;lastStep=0}
 function cancelTimed(){if(timer!==null){clearTimeout(timer);timer=null}}
 function newPosition(p){state.pos={...p};state.visual=xy(p);state.move=null;state.trail=[{...p}];state.visited=new Set([key(p)])}
 function sceneStart(){return isPath()?pt(0,4):pt(4,4)}
 function task(){
  if(state.level===0)return {title:equipment[Math.min(state.sub,2)].q,text:equipment[Math.min(state.sub,2)].text,tip:'走到对应圆环，站稳 0.8 秒。'};
  if(state.level===1)return {title:['第一站：集结出发','第二站：重要转折','第三站：到达陕北'][state.sub],text:['1934 年 10 月，中央红军主力在哪里集结出发？','1935 年 1 月，哪座城市召开了重要会议？','1935 年 10 月，中央红军到达陕北哪个地点？'][state.sub],tip:'读一读日期，按时间顺序点亮三个地点。'};
  if(isPath())return {title:state.level===2?'沿着桥面，到达对岸':'避开泥潭，找到踏点',text:state.level===2?'依次经过三个圆环。每次走到相邻桥板，站稳后继续。':'沿浅色踏点绕行。泥潭区域无法进入，遇到拐弯慢慢走。',tip:state.level===2?'桥板之间只能相邻走动。水面没有路，请从脚印处前进。':'浅色块是游戏里的行走区域；在圆环里停一停。'};
  return {title:state.sub===0?'先到会宁迎接伙伴':'再到将台堡迎接伙伴',text:state.sub===0?'1936 年 10 月 9 日，红一、红四方面军在哪里会师？':'1936 年 10 月 22 日，红二方面军在哪里同红一方面军会师？',tip:state.sub===0?'这一棒到会宁；下一棒，小伙伴会接着走。':'第一位伙伴留在会宁。现在控制第二位伙伴前往将台堡。'};
 }
 function renderUI(){const ch=chapters[state.level],total=state.level===4?2:3,t=state.sub>=total?{title:'本关完成',text:'阅读小讲解，再继续下一段旅程。'}:task();
  $('#levelEyebrow').textContent=`CHAPTER ${String(state.level+1).padStart(2,'0')} / 05`;
  $('#levelTitle').textContent=ch.title;$('#sceneLabel').textContent=ch.scene;$('#modeTag').textContent=`0${state.level+1} / ${ch.tag}`;$('#taskTitle').textContent=t.title;$('#taskText').textContent=t.text;$('#stampCount').textContent=`${state.completed} / 5 枚星章`;
  $('#subProgress').replaceChildren();for(let i=0;i<total;i++){const d=document.createElement('i');d.className='sub-dot'+(i<state.sub?' done':'');$('#subProgress').append(d)}const summary=document.createElement('span');summary.textContent=`${state.sub} / ${total} 已完成`;$('#subProgress').append(summary);
  $('#controlHint').textContent=isPath()?'只走相邻格 · 方向键 / 方向盘':'方向键走动，或点击圆环前往';
  $('#chapterNav').replaceChildren();chapters.forEach((c,i)=>{const li=document.createElement('li');li.className=i<state.completed?'done':i===state.level?'current':'';li.innerHTML=`<span class="chapter-no">${i<state.completed?'✓':`0${i+1}`}</span><span>${names[i]}<small>${c.tag}</small></span>`;$('#chapterNav').append(li)});
  updateCellLabels();$('#mobileTargets').replaceChildren();if(!isPath())allTargets().forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t.label;b.disabled=t.done;if(t.detail){const detail=document.createElement('small');detail.textContent=t.detail;b.append(detail)}b.addEventListener('click',()=>clickCell(t));$('#mobileTargets').append(b)});if(state.projection)$('#sceneLabel').textContent='固定投影 · 模拟位置识别';
 }
 function updateCellLabels(){const targets=allTargets();$$('#cellControls button').forEach(b=>{const p=pt(Number(b.dataset.c),Number(b.dataset.r)),q=xy(p),t=targets.find(a=>equal(a,p)),large=t&&!isPath();b.setAttribute('aria-label',t?`前往${t.label}${t.detail?'，'+t.detail:''}`:safe(p)?`走到第${p.r+1}行第${p.c+1}列`:`障碍，第${p.r+1}行第${p.c+1}列`);b.dataset.safe=String(safe(p));b.style.left=(q.x-(large?69:44))/10+'%';b.style.top=(q.y-(large?71:32))/6.4+'%';b.style.width=large?'13.8%':'8.8%';b.style.height=large?'26.5%':'10%';b.style.zIndex=large?'3':'1'})}
 function startLevel(level){cancelTimed();speechStop();clearInput();state.level=level;state.sub=0;state.phase='playing';state.screen='play';state.partner=null;state.flash=0;newPosition(sceneStart());$('#home').hidden=true;$('#finish').hidden=true;$('#play').hidden=false;renderUI();setFeedback(task().tip);$('#positionLabel').textContent='起点 · 准备出发';$('#holdLabel').textContent='到达目标后站稳 0.8 秒';draw();parent.postMessage({type:'zhanchuanxing:game-state',stage:'playing'},location.origin)}
 function start(){state.completed=0;startLevel(0)}
 function home(){cancelTimed();speechStop();clearInput();closeDialogs();state.screen='home';state.phase='idle';$('#home').hidden=false;$('#play').hidden=true;$('#finish').hidden=true;draw();parent.postMessage({type:'zhanchuanxing:game-state',stage:'paused'},location.origin)}
 function closeDialogs(){$$('dialog[open]').forEach(d=>d.close())}
 function sound(kind='good'){if(!state.sound)return;try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=audioCtx.currentTime;osc.connect(gain);gain.connect(audioCtx.destination);osc.type='sine';osc.frequency.setValueAtTime(kind==='good'?660:300,t);osc.frequency.exponentialRampToValueAtTime(kind==='good'?990:240,t+.13);gain.gain.setValueAtTime(.07,t);gain.gain.exponentialRampToValueAtTime(.001,t+.22);osc.start(t);osc.stop(t+.23)}catch(_){}}
 function speechStop(){if('speechSynthesis'in window)window.speechSynthesis.cancel()}
 function speak(text){if(!('speechSynthesis'in window)){setFeedback('当前浏览器没有朗读能力，可以阅读文字讲解。');return}speechStop();const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.86;const voice=window.speechSynthesis.getVoices().find(v=>/zh[-_]CN/i.test(v.lang));if(voice)u.voice=voice;window.speechSynthesis.speak(u)}
 function blocked(message){sound('bad');state.flash=.45;state.queue=[];setFeedback(message)}
 function step(delta,manual=true){if(state.phase!=='playing'||state.move)return false;if(manual)state.queue=[];const dest=pt(state.pos.c+delta.c,state.pos.r+delta.r);if(!safe(dest)){blocked(isPath()?'这里没有可走的踏点。看看脚印，换一个方向慢慢走。':'已经到投影边缘了，向场地中间走。');return false}state.hold=0;state.target=null;state.move={from:xy(state.pos),to:xy(dest),dest,elapsed:0};return true}
 function pathTo(dest){const queue=[{p:state.pos,steps:[]}],seen=new Set([key(state.pos)]);while(queue.length){const {p,steps}=queue.shift();if(equal(p,dest))return steps;for(const d of Object.values(dirs)){const n=pt(p.c+d.c,p.r+d.r);if(!safe(n)||seen.has(key(n)))continue;seen.add(key(n));queue.push({p:n,steps:[...steps,d]})}}return []}
 function clickCell(p){if(state.phase!=='playing'||state.move)return;if(isPath()){const dx=p.c-state.pos.c,dy=p.r-state.pos.r;if(Math.abs(dx)+Math.abs(dy)!==1){setFeedback('请点击身边相邻的踏点；走到圆环后站稳，就会自动识别。');return}step(pt(dx,dy));return}if(!safe(p))return;state.queue=pathTo(p);state.hold=0;state.target=null}
 function succeed(t){state.phase='feedback';clearInput();sound();state.sub++;state.visited.add(key(state.pos));const total=state.level===4?2:3;
  if(state.sub>=total){state.completed=Math.max(state.completed,state.level+1);renderUI();setFeedback('本关完成，获得'+chapters[state.level].stamp+'。阅读科普后再出发。');showLearning();return}
  const message=state.level===0?equipment[state.sub-1].tip:state.level===1?`已点亮${t.label}。接着寻找下一段时间的地点。`:state.level===4?'会宁这一棒完成。换第二位伙伴，到将台堡相聚。':`第 ${state.sub} 个踏点识别成功，继续向前。`;
  renderUI();setFeedback(message);if(state.level===4)state.partner={pos:{...state.pos},accent:A.P.red};
  timer=setTimeout(()=>{timer=null;if(state.level===0||state.level===4)newPosition(sceneStart());state.phase='playing';renderUI();setFeedback(task().tip)},1700);
 }
 function evaluateTarget(t){if(t.done)return;const correct=state.level===0?t.index===equipment[state.sub].correct:t.index===state.sub;
  if(correct){succeed(t);return}state.phase='feedback';clearInput();sound('bad');setFeedback(state.level===0?'这件物品不符合题目。读一读问题，再换一个圆环试试。':isPath()?'先完成前一个踏点，再继续前进。':'这个地点不是当前要寻找的节点，看看日期和提示再试试。');
  timer=setTimeout(()=>{timer=null;state.phase='playing';newPosition(sceneStart());renderUI()},1800)
 }
 function showLearning(){state.phase='learning';clearInput();const ch=chapters[state.level];A.vignette($('#learnArt'),state.level);$('#learnStamp').textContent=ch.stamp;$('#factDate').textContent=ch.date;$('#factTitle').textContent=ch.factTitle;$('#factBody').textContent=ch.fact;$('#factNote').textContent=ch.note;$('#continueBtn').innerHTML=state.level===4?'领取纪念卡 <svg class="icon"><use href="#i-arrow"/></svg>':'记住了，下一关 <svg class="icon"><use href="#i-arrow"/></svg>';$('#learnDialog').showModal();if(state.sound)speak(ch.fact)}
 function renderCertificate(){const c=document.createElement('canvas');A.certificate(c,Array.from($('#nickname').value.trim()).slice(0,10).join(''));$('#certificate').src=c.toDataURL('image/png')}
 function finish(){state.screen='finish';state.phase='done';clearInput();speechStop();$('#play').hidden=true;$('#finish').hidden=false;renderCertificate();parent.postMessage({type:'zhanchuanxing:game-state',stage:'ended'},location.origin)}
 function pause(){if(state.screen!=='play'||!['playing','feedback'].includes(state.phase))return;pausedPhase=state.phase;cancelTimed();state.phase='paused';clearInput();speechStop();$('#pauseDialog').showModal();parent.postMessage({type:'zhanchuanxing:game-state',stage:'paused'},location.origin)}
 function resume(){if(state.phase!=='paused')return;$('#pauseDialog').close();if(pausedPhase==='feedback'){if(state.level===0||state.level===4)newPosition(sceneStart());renderUI()}state.phase='playing';clearInput();setFeedback(task().tip);parent.postMessage({type:'zhanchuanxing:game-state',stage:'playing'},location.origin)}
 function update(dt,time){if(state.phase!=='playing')return;if(state.move){const m=state.move;m.elapsed+=dt;const t=Math.min(1,m.elapsed/.25),u=t*t*(3-2*t);state.visual={x:m.from.x+(m.to.x-m.from.x)*u,y:m.from.y+(m.to.y-m.from.y)*u};if(t===1){state.pos=m.dest;state.move=null;state.trail.push({...state.pos});state.visited.add(key(state.pos));$('#positionLabel').textContent=`小朋友 · 第 ${state.pos.r+1} 行，第 ${state.pos.c+1} 列`}else return}
  if(!state.move&&time-lastStep>.14){let d=pointerDir||Array.from(keys).at(-1);if(d){lastStep=time;step(dirs[d]);return}if(state.queue.length){step(state.queue.shift(),false);return}}
  const t=allTargets().find(t=>!t.done&&equal(t,state.pos));if(t&&!state.move){const id=`${state.level}-${state.sub}-${t.index}`;if(state.target!==id){state.target=id;state.hold=0}state.hold+=dt;$('#holdLabel').textContent=`站稳识别中 · ${Math.min(100,Math.floor(state.hold/.8*100))}%`;if(state.hold>=.8){$('#holdLabel').textContent='已识别';evaluateTarget(t)}}else {state.hold=0;state.target=null;$('#holdLabel').textContent='到达目标后站稳 0.8 秒'}
 }
 function tile(c,p,type){const {x,y}=xy(p);if(type==='water'){A.ellipse(c,x,y,41,27,'#729f92');A.line(c,[[x-21,y+1],[x-4,y-3],[x+16,y+1]],'#b9d6bd',2);return}if(type==='mud'){A.ellipse(c,x,y,41,27,'#85a58a');A.ellipse(c,x-4,y+2,28,16,'#688b72');A.line(c,[[x-10,y+3],[x+7,y]],'#9bbe94',2);return}
  A.rr(c,x-42,y-29,84,58,13,type==='bridge'?'#d5b881':'#ebdbae','#c6b07e');if(type==='bridge'){for(let i=0;i<3;i++)A.line(c,[[x-30,y-18+i*15],[x+30,y-18+i*15]],'#eddaa9',2)}else A.ellipse(c,x-10,y-12,10,3,'#f9edc4')}
 function footprints(c,p,alpha=1){const {x,y}=xy(p);c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(-.15);A.ellipse(c,-9,-2,5,11,'#ab914f');A.ellipse(c,9,3,5,11,'#ab914f');c.restore()}
 function renderTarget(c,t){const {x,y}=xy(t),current=isPath()?t.index===state.sub:true;const selected=state.hold>0&&equal(t,state.pos);if(isPath()){c.beginPath();c.arc(x,y,26,0,Math.PI*2);c.fillStyle=t.done?'#477e6c':'#fff5d9';c.fill();c.strokeStyle=current?A.P.red:'#9a9873';c.lineWidth=3;c.stroke();A.text(c,t.done?'✓':String(t.index+1),x,y-1,22,t.done?'#fff6da':A.P.red);if(t.index===2){A.icon(c,'flag',x+26,y-35,.35)}return}
  c.save();c.shadowColor='#53613b16';c.shadowOffsetY=5;c.shadowBlur=0;A.rr(c,x-69,y-71,138,122,32,t.done?'#d7e8ca':'#fff8e3',t.done?'#7e9b72':'#c9b995');c.restore();c.beginPath();c.setLineDash([4,5]);c.arc(x,y-11,46,0,Math.PI*2);c.strokeStyle=t.done?'#74986e':'#d1bc89';c.lineWidth=1.5;c.stroke();c.setLineDash([]);A.icon(c,t.icon,x,y-14,.63);A.text(c,t.label,x,y+72,state.level===0?21:23,A.P.ink,'center','700');if(t.detail)A.text(c,t.detail,x,y+98,13,'#69735c');if(t.done){A.ellipse(c,x+53,y-56,15,15,A.P.teal);A.text(c,'✓',x+53,y-56,18,'#fff8e3')}if(selected){c.beginPath();c.arc(x,y-11,53,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,state.hold/.8));c.strokeStyle=A.P.red;c.lineWidth=6;c.stroke()}}
 function draw(){if(state.screen!=='play')return;const c=ctx;A.ground(c,state.level,1000,640);
  if(isPath()){for(let r=0;r<5;r++)for(let col=0;col<9;col++){const p=pt(col,r);tile(c,p,safe(p)?state.level===2?'bridge':'grass':state.level===2?'water':'mud')}
   if(state.level===2){const pts=BRIDGE.map(p=>{const q=xy(p);return [q.x,q.y-32]});A.line(c,pts,'#526e5c',3)}const next=route().find((p,i)=>i>route().findIndex(z=>equal(z,state.pos)));if(next)footprints(c,next,.9);
   state.trail.slice(-40).forEach(p=>{if(!allTargets().some(t=>equal(p,t)))footprints(c,p,.2)})
  }else {c.save();c.setLineDash([3,10]);for(let r=0;r<5;r++)A.line(c,[[45,GRID.y+r*GRID.dy],[955,GRID.y+r*GRID.dy]],'#b7b59344',1);c.restore();if(state.level===1){c.save();c.setLineDash([6,6]);A.line(c,[[815,350],[815,407],[185,407],[185,442],[500,442],[500,350]],'#b8885066',3);c.restore()}
   for(let i=1;i<5;i++)footprints(c,pt(4,4-i*.33),.18);
  }
  allTargets().forEach(t=>renderTarget(c,t));
  if(state.partner){const q=xy(state.partner.pos);A.child(c,q.x+25,q.y+10,.43,A.P.red);A.text(c,'伙伴已到位',q.x,q.y+121,13,A.P.teal)}
  const {x,y}=state.visual;A.ellipse(c,x,y+7,32,12,'#fff5dbaa');A.child(c,x,y+10,.55,state.level===4&&state.sub===1?A.P.teal:A.P.red,state.move?state.move.elapsed*26:0);
  if(state.hold>0){c.beginPath();c.arc(x,y+1,34,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(state.hold/.8,1));c.strokeStyle=A.P.red;c.lineWidth=4;c.stroke()}
  if(state.flash>0){c.strokeStyle='#bb534b';c.lineWidth=4;c.strokeRect(3,3,994,634)}
  A.robot(c,902,572,.55);A.text(c,'小星 · 固定识别',823,602,12,A.P.dark);A.text(c,isPath()?'沿脚印走 · 水面与泥潭不可进入':'走到圆环 · 站稳后自动识别',34,601,13,'#7b8168','left');
 }
 for(let r=0;r<5;r++)for(let c=0;c<9;c++){const p=pt(c,r),q=xy(p),b=document.createElement('button');b.type='button';b.dataset.c=c;b.dataset.r=r;b.style.left=(q.x-44)/10+'%';b.style.top=(q.y-32)/6.4+'%';b.style.width='8.8%';b.style.height='10%';b.addEventListener('click',()=>clickCell(p));$('#cellControls').append(b)}
 const keyMap={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
 window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||$$('dialog[open]').length)return;const d=keyMap[e.key];if(d&&state.screen==='play'){e.preventDefault();keys.add(d);state.queue=[]}if(e.key==='Escape'&&state.screen==='play')pause()});window.addEventListener('keyup',e=>{if(keyMap[e.key])keys.delete(keyMap[e.key])});window.addEventListener('blur',()=>{clearInput();if(state.screen==='play'&&state.phase==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(state.screen==='play'&&state.phase==='playing')pause()}});
 $$('[data-dir]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();pointerDir=b.dataset.dir;step(dirs[pointerDir]);lastStep=performance.now()/1000;b.setPointerCapture(e.pointerId)});b.addEventListener('pointerup',()=>pointerDir=null);b.addEventListener('pointercancel',()=>pointerDir=null);b.addEventListener('lostpointercapture',()=>pointerDir=null);b.addEventListener('click',e=>{if(e.detail===0)step(dirs[b.dataset.dir])})});
 // The host can hide this game without discarding the current session.
 window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='zhanchuanxing:hide-game')return;pause();speechStop();clearInput()});
 $('#startBtn').addEventListener('click',start);$('#replayBtn').addEventListener('click',start);$('#brandHome').addEventListener('click',e=>{e.preventDefault();home()});$('#retryBtn').addEventListener('click',()=>startLevel(state.level));$('#pauseBtn').addEventListener('click',pause);$('#resumeBtn').addEventListener('click',resume);$('#homeBtn').addEventListener('click',home);
 $('#pauseDialog').addEventListener('cancel',e=>{e.preventDefault();resume()});$('#learnDialog').addEventListener('cancel',e=>e.preventDefault());$('#continueBtn').addEventListener('click',()=>{speechStop();$('#learnDialog').close();if(state.level===4)finish();else startLevel(state.level+1)});$('#readBtn').addEventListener('click',()=>speak(chapters[state.level].fact));
 let aboutWasPlaying=false;$('#aboutBtn').addEventListener('click',()=>{aboutWasPlaying=state.screen==='play'&&['playing','feedback'].includes(state.phase);if(aboutWasPlaying){pausedPhase=state.phase;cancelTimed();state.phase='paused';clearInput()}$('#aboutDialog').showModal()});$('#closeAbout').addEventListener('click',()=>$('#aboutDialog').close());$('#aboutDialog').addEventListener('close',()=>{if(aboutWasPlaying){aboutWasPlaying=false;resume()}});
 $('#soundBtn').addEventListener('click',()=>{state.sound=!state.sound;$('#soundBtn').setAttribute('aria-pressed',String(state.sound));$('#soundBtn span').textContent=state.sound?'声音开':'声音关';if(!state.sound)speechStop();else sound()});$('#projectionBtn').addEventListener('click',()=>{state.projection=!state.projection;document.body.classList.toggle('projection',state.projection);$('#projectionBtn').setAttribute('aria-pressed',String(state.projection));$('#projectionBtn span').textContent=state.projection?'普通视图':'投影视图';if(state.screen==='play')renderUI()});
 $('#nickname').addEventListener('input',renderCertificate);$('#saveBtn').addEventListener('click',()=>{renderCertificate();const c=document.createElement('canvas');A.certificate(c,Array.from($('#nickname').value.trim()).slice(0,10).join(''));c.toBlob(blob=>{if(!blob){$('#saveStatus').textContent='请长按或右键纪念卡图片，选择保存图片。';return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='红星小队-我的纪念卡.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('#saveStatus').textContent='已发起 PNG 下载；如浏览器未下载，可长按或右键纪念卡图片保存。'},'image/png')});
 A.cover($('#cover'));function loop(ts){const t=ts/1000,dt=Math.min(.05,t-(state.lastTime||t));state.lastTime=t;state.flash=Math.max(0,state.flash-dt);update(dt,t);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();
