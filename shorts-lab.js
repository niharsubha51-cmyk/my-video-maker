/* NovaReel Shorts Lab — free local enhancements */
(function(){
"use strict";
var api=window.NovaReelAPI,root=document.getElementById("shortsLabRoot");
if(!api||!root)return;
var images=new Map(),audioFile=null,audioRun=null,isExporting=false,activeVideoIndex=-1;
function $id(id){return document.getElementById(id)}
function esc(v){return String(v===undefined||v===null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function sel(v,k){return v===k?" selected":""}
function ck(v){return v?" checked":""}
function state(){return api.getState()}
function shots(){return state().scenes||[]}
function config(){
 var s=state(),def={target:30,hook:"",captions:[],font:"bold",position:"lower",sticker:"✨",transition:"fade",filter:"vivid",cta:"The adventure continues! 🌟",series:"HappyNova Kids",episode:"1",showCaptions:true,showHook:true,showCTA:true,madeForKids:true,audioVolume:.25,audioRights:false,lastIdea:""};
 if(!s.shorts||typeof s.shorts!=="object")s.shorts={};
 Object.keys(def).forEach(function(k){if(s.shorts[k]===undefined)s.shorts[k]=def[k]});
 if(s.shorts.lastIdea!==s.idea){images.forEach(function(v){URL.revokeObjectURL(v.url);if(v.video)v.video.pause()});images.clear();s.shorts.captions=[];s.shorts.hook="";s.shorts.lastIdea=s.idea}
 return s.shorts
}
function total(){return shots().reduce(function(n,sc){return n+Math.max(.5,Number(sc.durationSec)||3)},0)}
function actAt(i){var sc=shots()[i]||{};return sc.act|| (i===0?"hook":i===shots().length-1?"payoff":"story")}
function shortCaption(text,limit){var s=String(text||"").replace(/\s+/g," ").trim();if(s.length<=limit)return s;var part=s.slice(0,limit),end=part.lastIndexOf(" ");return part.slice(0,end>limit*.6?end:limit).replace(/[ ,;:-]+$/,"")+"."}
function payoffFor(){
 var s=state(),t=String(s.idea||"").toLowerCase(),end=shots()[shots().length-1]||{};
 if(/\bfish\b|\bturtle\b|\bocean\b|\bunderwater\b/.test(t))return "The sea creature rejoins its family, and rainbow bubbles light up the reef.";
 if(/\bcake\b|\bcupcake\b|\bcandy\b|\bcookie\b/.test(t))return "The missing treat is found, and everyone shares a joyful celebration.";
 if(/\bballoon\b/.test(t))return "The lost balloon is returned, and the friends cheer together.";
 if(/\blocket\b|\bnecklace\b|\bpendant\b/.test(t))return "The keepsake's true owner is revealed, and the misunderstanding is resolved.";
 if(/\brainbow\b|\bpaint\b|\bcolor\b/.test(t))return "Every missing color clicks into place, revealing a perfect rainbow.";
 if(s.genre==="drama")return "The hidden truth is finally revealed, and the misunderstanding is resolved.";
 if(s.genre==="satisfying")return "The final piece fits perfectly, completing the beautiful design.";
 if(s.genre==="animals")return "The lost prize is recovered, and the chase ends with a funny celebration.";
 return end.action&&/REWARD AND PAYOFF/i.test(end.action)?shortCaption(end.action.replace(/^REWARD AND PAYOFF:\s*/,""),130):"The mystery is solved and the friends celebrate a happy ending.";
}
function cap(i){var o=config(),sc=shots()[i]||{};if(o.captions[i]!==undefined)return o.captions[i];if(actAt(i)==="hook")return o.hook||sc.narration||"A mysterious clue appears. What could it mean?";if(actAt(i)==="payoff")return shortCaption(payoffFor(),115);return shortCaption(sc.narration||sc.heading||"The story continues.",110)}

function actLengths(){var t=total(),ss=shots(),hook=ss[0]?Math.max(.5,Number(ss[0].durationSec)||3):0,pay=ss.length?Math.max(.5,Number(ss[ss.length-1].durationSec)||3):0;return {hook:hook,story:Math.max(0,t-hook-pay),payoff:pay,total:t}}
function duration(t){
 var s=state(),arr=shots(),o=config(),goal=Math.min(180,Math.max(15,Number(t)||30));
 if(arr.length<3){api.toast("Generate a story with at least three scenes");return}
 var hookLen=Math.min(5,Math.max(2,Math.round(goal*.1))),payLen=Math.max(4,Math.round(goal*.27));
 var middleTotal=goal-hookLen-payLen,middleCount=arr.length-2;
 var each=+(middleTotal/middleCount).toFixed(2);
 arr.forEach(function(sc,i){
  sc.durationSec=i===0?hookLen:i===arr.length-1?payLen:i===arr.length-2?+(middleTotal-each*(middleCount-1)).toFixed(2):each;
 });
 o.target=goal;s.format="short";$id("format").value="short";api.refresh()
}
function hook(){
 var s=state(),o=config(),first=shots()[0]||{},name=String(s.characters||"our hero").split(",")[0].trim();
 var t=String(s.idea||"").toLowerCase(),bank;
 if(/\bfish\b|\bturtle\b|\bocean\b/.test(t))bank=["A glowing sea creature called "+name+". But why?","A mysterious voice came from the ocean. Who was calling?","The ocean lit up with a secret. What was hidden below?"];
 else if(/\bcake\b|\bcupcake\b|\bcandy\b/.test(t))bank=["The special treat disappeared. Who took it?","Someone stole the surprise cake! Could the friends find it?","The last cupcake vanished. Where could it be?"];
 else if(/\bballoon\b/.test(t))bank=["The magical balloon suddenly vanished. Where did it go?","A glowing balloon floated away. Could anyone catch it?"];
 else if(s.genre==="drama")bank=["One tiny clue exposed a shocking secret. Whose was it?","Everyone heard an accusation. But was it true?"];
 else if(s.genre==="animals")bank=["A strange noise started the chase. What was hiding?","The animals spotted something impossible. What was it?"];
 else if(s.genre==="satisfying")bank=["A tiny piece was missing. What would complete the design?","Something unexpected happened to the colors. What comes next?"];
 else bank=[first.narration||"A mysterious clue appeared. What did it mean?","A magical surprise appeared. Could the friends solve its mystery?"];
 var next=bank[Math.floor(Math.random()*bank.length)];
 o.hook=next;o.captions[0]=next;
 if(first.act==="hook"||shots().length>0){first.act="hook";first.heading="1 • Suspense Hook";first.narration=next}
 syncThreeActScript();
}
function syncThreeActScript(){
 var s=state();s.script=shots().map(function(sc){return sc.heading+"\n"+sc.narration}).join("\n\n")
}
function improve(){
 var s=state(),o=config(),arr=shots();if(arr.length<3){api.toast("Generate a story first");return}
 for(var i=0;i<arr.length;i++){
  var sc=arr[i];sc.act=i===0?"hook":i===arr.length-1?"payoff":"story";
  sc.heading=i===0?"1 • Suspense Hook":i===arr.length-1?"3 • Reward & Payoff":"2 • Story — "+(String(sc.heading||"").replace(/^2 • Story — /,"")||"Build-up");
 }
 hook();
 var last=arr[arr.length-1],reward=payoffFor();
 last.narration="The mystery is solved! "+reward;
 last.action="REWARD AND PAYOFF: "+reward+" Show the reveal clearly and give viewers a complete satisfying ending. Do not withhold the answer.";
 o.captions=arr.map(function(sc,i){return i===0?o.hook:i===arr.length-1?shortCaption(reward,110):shortCaption(sc.narration,105)});
 o.cta=shortCaption(reward,55);
 duration(o.target);
 syncThreeActScript();
 var title=s.metadata.title||s.idea;
 if(o.series&& !title.startsWith(o.series+" | "))s.metadata.title=(o.series+" | "+title).slice(0,98);
 if(s.genre==="drama"&&o.episode&& !s.metadata.title.includes(" | EP "))s.metadata.title=(s.metadata.title+" | EP "+o.episode).slice(0,98);
 s.metadata.hashtags=Array.from(new Set(((s.metadata.hashtags||"")+" #Shorts #Animation #YouTubeShorts").split(/\s+/).filter(Boolean))).slice(0,12).join(" ");
 o.madeForKids=s.genre==="kids";
 api.renderAll();api.toast("3-part Shorts agent applied: suspense → story → reward and payoff!")
}
function score(){
 var s=state(),o=config(),a=[],b=[],t=total();
 if(s.format==="short"&&t<=180)a.push("Shorts format and duration are within 180 seconds");else b.push("Use 9:16 Shorts format and a duration of 180 seconds or less");
 if(o.hook.trim().length>=8&&/[?.!]$/.test(o.hook.trim()))a.push("Complete suspense hook ready");else b.push("Add a complete suspenseful hook with a clear question or mystery");
 if(shots().length>=3&&shots()[0].act==="hook"&&shots().slice(1,-1).every(function(sc){return sc.act==="story"})&&shots()[shots().length-1].act==="payoff")a.push("Three-act order: hook, story, payoff");else b.push("Apply the three-part agent to structure your scenes");
 if(shots().length&&shots()[shots().length-1].narration&&shots()[shots().length-1].narration.length>35)a.push("Ending provides a real resolution");else b.push("Show the answer clearly at the end");
 if(o.showCaptions&&shots().every(function(_,i){return cap(i).trim().length>3}))a.push("Scene captions planned");else b.push("Add captions to each beat");
 if(s.metadata.title&&s.metadata.title.length<=100)a.push("Title is within 100 characters");else b.push("Review title length (maximum 100)");
 if(s.genre==="kids"&&!o.madeForKids)b.push("Review Made for Kids setting");else a.push("Audience setting reviewed");
 if(o.showCTA)a.push("Ending text planned");else b.push("Consider a gentle, story-related ending");
 if(audioFile&&!o.audioRights)b.push("Imported audio will be excluded until rights are confirmed");
 return {passed:a,issues:b,pct:Math.round(100*a.length/(a.length+b.length||1))}
}
function textField(key,label,val,extra){return '<div class="sl-field"><label>'+esc(label)+'</label><input data-opt="'+key+'" '+(extra||"")+' value="'+esc(val)+'"></div>'}
function options(key,label,list,value){return '<div class="sl-field"><label>'+esc(label)+'</label><select data-opt="'+key+'">'+list.map(function(a){return '<option value="'+esc(a[0])+'"'+sel(value,a[0])+'>'+esc(a[1])+'</option>'}).join("")+'</select></div>'}
function choice(key,label,val){return '<label class="sl-check"><input type="checkbox" data-check="'+key+'"'+ck(val)+'>'+esc(label)+'</label>'}
function draw(){
 var s=state(),o=config(),arr=shots(),t=total(),q=score(),h=[];
 h.push('<div class="sl-header"><div><div class="eyebrow">Free Shorts creation tools</div><h1>📱 Shorts Lab</h1><p class="sl-help">Auto storytelling: 1. Suspense Hook → 2. Story → 3. Reward & Payoff. Plus captions, stickers, timing and export.</p></div><span class="sl-badge">Up to 3 min</span></div>');
 h.push('<div class="sl-layout"><div><section class="sl-pane"><h2>⚡ Local Creator Agents</h2><p class="sl-help">Rule-based editing helpers — not a paid generative AI or competitor-video scraper.</p><div class="sl-btns"><button class="sl-btn sl-primary" data-action="threepart">✦ Build 3-Part Short</button><button class="sl-btn" data-action="optimize">Optimize Short</button><button class="sl-btn" data-action="hook">↻ Suggest new hook</button><button class="sl-btn" data-action="script">Open voiceover script</button></div>');
 h.push('<h3>Story templates</h3><div class="sl-btns"><button class="sl-btn" data-template="magic">🐰 Magical rescue</button><button class="sl-btn" data-template="chase">🐶 Funny chase</button><button class="sl-btn" data-template="drama">🎭 Micro drama</button><button class="sl-btn" data-template="satisfy">🌈 Satisfying reveal</button></div><hr class="sl-divider">');
 var timing=actLengths(),startStory=timing.hook,endStory=timing.hook+timing.story;
 h.push('<h3>🎬 Three-act storytelling structure</h3><div class="sl-grid sl-three-act"><div class="sl-card"><span class="sl-id">1. SUSPENSE HOOK</span><strong>0–'+startStory.toFixed(1)+' sec</strong><small>Show a mystery, ask a complete question. Do not reveal the answer.</small></div><div class="sl-card"><span class="sl-id">2. THE STORY</span><strong>'+startStory.toFixed(1)+'–'+endStory.toFixed(1)+' sec</strong><small>Build interest with a clue, obstacles and a clever attempt.</small></div><div class="sl-card"><span class="sl-id">3. REWARD &amp; PAYOFF</span><strong>'+endStory.toFixed(1)+'–'+timing.total.toFixed(1)+' sec</strong><small>Show the solution and finish with a satisfying reaction.</small></div></div>');
 h.push('<h3>⏱ Clip timeline</h3><div class="sl-btns">');
 [15,30,60,180].forEach(function(n){h.push('<button class="sl-btn" data-duration="'+n+'" aria-pressed="'+(Math.abs(t-n)<.2)+'">'+n+' sec</button>')});
 h.push('</div><div class="sl-timeline">');arr.forEach(function(sc,i){h.push('<div class="sl-segment sl-'+actAt(i)+'" style="flex:'+Math.max(.5,Number(sc.durationSec)||3)+'" title="'+actAt(i)+' — scene '+(i+1)+'">'+(i+1)+'</div>')});h.push('</div><span class="sl-badge">'+t.toFixed(1)+' sec</span>');
 arr.forEach(function(sc,i){
 h.push('<article class="sl-card"><div class="sl-card-top"><span class="sl-id">SCENE '+(i+1)+'</span><strong>'+esc(sc.heading)+'</strong></div><div class="sl-grid"><div class="sl-field"><label>Duration (sec)</label><input data-seconds="'+i+'" type="number" min=".5" max="60" step=".5" value="'+Math.max(.5,Number(sc.durationSec)||3).toFixed(2)+'"></div><div class="sl-field"><label>Own photo / video clip</label><input data-picture="'+i+'" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"><small class="sl-audio-info">'+(images.has(i)?"Media loaded":"Optional media; not saved")+'</small></div></div><div class="sl-field"><label>Timed caption</label><textarea data-caption="'+i+'">'+esc(cap(i))+'</textarea></div></article>');
 });
 h.push('</section><section class="sl-pane" style="margin-top:18px"><h2>💬 Captions, stickers & effects</h2><p class="sl-help">Scene captions are editable text suggestions; they are not automatic speech transcription.</p>');
 h.push(textField("hook","Opening hook",o.hook,'maxlength="130" placeholder="Bunny discovers WHAT?!"'));
 h.push(textField("cta","Ending / continuation",o.cta,'maxlength="120"'));
 h.push('<div class="sl-grid">');
 h.push(options("font","Caption style",[["bold","Bold pop"],["clean","Clean subtitle"],["highlight","Yellow highlight"]],o.font));
 h.push(options("position","Caption position",[["lower","Safe lower center"],["top","Upper center"]],o.position));
 h.push(options("sticker","Sticker",[["✨","✨ Sparkles"],["😂","😂 Funny"],["🐰","🐰 Bunny"],["❤️","❤️ Hearts"],["🌈","🌈 Rainbow"],["none","None"]],o.sticker));
 h.push(options("filter","Color filter",[["vivid","Vibrant"],["warm","Warm"],["cool","Cool"],["none","Original"]],o.filter));
 h.push('</div>');
 h.push(options("transition","Scene transition",[["fade","Soft fade"],["slide","Swipe stripe"],["none","None"]],o.transition));
 h.push(choice("showCaptions","Burn captions into storyboard export",o.showCaptions));
 h.push(choice("showHook","Show opening hook text",o.showHook));
 h.push(choice("showCTA","Show ending text",o.showCTA));
 h.push('<div class="sl-btns"><button class="sl-btn" data-action="srt">↓ Export .SRT subtitles</button><button class="sl-btn" data-action="png">↓ Export cover PNG</button></div></section></div>');
 h.push('<div><section class="sl-pane"><h2>🎵 Sound & video export</h2><p class="sl-help">Upload music/narration you have the rights to use. WebM export attempts to include the track. Built-in text-to-speech preview remains separate.</p>');
 h.push('<div class="sl-field"><label>Licensed audio</label><input id="slAudio" type="file" accept="audio/*"><span class="sl-audio-info">'+(audioFile?esc(audioFile.name):"No audio selected (silent export)")+'</span></div>');
 h.push('<div class="sl-field"><label id="slVolLabel">Audio volume: '+Math.round(o.audioVolume*100)+'%</label><input id="slVolume" type="range" min="0" max="100" value="'+Math.round(o.audioVolume*100)+'"></div>');
 h.push(choice("audioRights","I own or have permission to use the audio",o.audioRights));
 h.push('<div class="sl-btns"><button class="sl-btn" data-action="clearAudio">Remove audio</button><button class="sl-btn sl-primary" data-action="export">↓ Export Short WebM</button></div><p class="sl-help">Export uses Canvas + MediaRecorder. Not cinematic AI video, not MP4. Mobile browser support varies.</p></section>');
 h.push('<section class="sl-pane" style="margin-top:18px"><h2>🧠 Agent Quality Check</h2><p class="sl-help">Helpful planning checks, not guarantees of views or YouTube acceptance.</p><div class="sl-grade-row"><span class="sl-grade">'+q.pct+'%</span><div class="sl-score-msg">'+q.passed.length+' passed · '+q.issues.length+' to review</div></div><ul class="sl-list">');
 q.passed.forEach(function(v){h.push('<li class="pass">✓ '+esc(v)+'</li>')});
 q.issues.forEach(function(v){h.push('<li class="issue">! '+esc(v)+'</li>')});
 h.push('</ul><button class="sl-btn" data-action="check">Recheck video</button></section>');
 h.push('<section class="sl-pane" style="margin-top:18px"><h2>📣 YouTube preparation</h2><div class="sl-grid">');
 h.push(textField("series","Series name",o.series));h.push(textField("episode","Episode number",o.episode));
 h.push('</div>'+choice("madeForKids","This content is Made for Kids (review when uploading)",o.madeForKids));
 h.push('<p class="sl-help">Use your own content, choose the correct audience setting, and verify music permissions. This app does not publish or connect to YouTube.</p>');
 h.push('<div class="sl-btns"><button class="sl-btn" data-action="seo">Edit title / description</button><button class="sl-btn sl-primary" data-action="studio">Open YouTube Studio ↗</button></div>');
 h.push('<p class="sl-footer">YouTube music-library tracks cannot be transferred into this offline editor automatically. You may add your own licensed audio. Scene pictures and audio stay in memory only and are not saved with project drafts.</p></section></div></div>');
 root.innerHTML=h.join("")
}
var templates={
 magic:["Luna Bunny finds a magical fish trapped in a beach puddle. Leo Lion and Piko Panda bring it back to a glowing underwater rainbow kingdom, where an adorable surprise awaits.","kids","Luna Bunny, Leo Lion, Piko Panda"],
 chase:["Milo Dog and Coco Cat chase a runaway rainbow cake through a whimsical village. Bruno Bear joins by mistake, causing an unexpected funny ending.","animals","Milo Dog, Coco Cat, Bruno Bear"],
 drama:["During a family party, a mysterious silver locket falls to the floor, revealing a hidden secret that changes everyone's lives.","drama","Aanya, Meera, Kabir"],
 satisfy:["An exquisite rainbow cake is assembled layer-by-layer with satisfying pastel frosting, shiny berries and a magical final reveal.","satisfying","Luna Bunny, Piko Panda"]
};
root.addEventListener("click",function(e){
 var button=e.target.closest("button");if(!button||!root.contains(button))return;
 var o=config(),s=state(),a=button.dataset.action;
 if(button.dataset.template){var v=templates[button.dataset.template];$id("idea").value=v[0];$id("genre").value=v[1];$id("characters").value=v[2];$id("format").value="short";$id("generate").click();draw();api.toast("Original story template loaded");return}
 if(button.dataset.duration){duration(button.dataset.duration);draw();return}
 if(a==="optimize"||a==="threepart"){improve();draw();return}
 if(a==="hook"){hook();api.renderAll();draw();return}
 if(a==="script"||a==="seo"){document.querySelector('[data-view="studio"]').click();document.querySelector('[data-tab="'+(a==="script"?"script":"youtube")+'"]').click();return}
 if(a==="studio"){window.open("https://studio.youtube.com/","_blank","noopener,noreferrer");return}
 if(a==="check"){draw();api.toast("Checked locally");return}
 if(a==="clearAudio"){audioFile=null;o.audioRights=false;draw();return}
 if(a==="export"){if(s.format!=="short"){api.toast("Switch to Shorts format first");return}if(total()>180){api.toast("Short is longer than 3 minutes");return}$id("exportVideo").click();return}
 if(a==="png"){api.drawPreview();var canvas=api.getCanvas();canvas.toBlob(function(blob){if(blob){api.download("novareel-short-cover.png",blob,"image/png")}else api.toast("PNG export unavailable")}, "image/png");return}
 if(a==="srt"){
  function stamp(n){var m=Math.floor(n/60),sec=Math.floor(n%60),ms=Math.round((n%1)*1000);return "00:"+String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0")+","+String(ms).padStart(3,"0")}
  var elapsed=0,res=shots().map(function(sc,i){var start=elapsed;elapsed+=Math.max(.5,Number(sc.durationSec)||3);return (i+1)+"\n"+stamp(start)+" --> "+stamp(elapsed)+"\n"+cap(i)+"\n"}).join("\n");
  api.download("novareel-captions.srt",res,"text/plain;charset=utf-8");return
 }
});
root.addEventListener("input",function(e){
 var el=e.target,o=config(),s=state();
 if(el.dataset.caption!==undefined){o.captions[Number(el.dataset.caption)]=el.value;api.refresh();return}
 if(el.dataset.seconds!==undefined){var i=Number(el.dataset.seconds),v=Number(el.value);if(Number.isFinite(v)&&v>=.5&&v<=60){s.scenes[i].durationSec=v;api.refresh()}return}
 if(el.dataset.opt){o[el.dataset.opt]=el.value;api.refresh();return}
 if(el.dataset.check){o[el.dataset.check]=el.checked;api.refresh();return}
 if(el.id==="slVolume"){o.audioVolume=Number(el.value)/100;$id("slVolLabel").textContent="Audio volume: "+el.value+"%"}
});
root.addEventListener("change",function(e){
 var el=e.target;
 if(el.dataset.picture!==undefined){
  var i=Number(el.dataset.picture),file=el.files&&el.files[0];if(!file)return;
  if(!["image/png","image/jpeg","image/webp","video/mp4","video/webm"].includes(file.type)||file.size>100*1024*1024){api.toast("Choose JPG, PNG, WebP, MP4 or WebM under 100 MB");return}
  var url=URL.createObjectURL(file);
  function finish(obj){var old=images.get(i);if(old){if(old.video)old.video.pause();URL.revokeObjectURL(old.url)}images.set(i,obj);draw();api.refresh();api.toast("Local scene media imported")}
  if(file.type.startsWith("video/")){
   var vid=document.createElement("video");vid.muted=true;vid.loop=true;vid.playsInline=true;vid.preload="auto";
   vid.onloadeddata=function(){finish({url:url,video:vid})};
   vid.onerror=function(){URL.revokeObjectURL(url);api.toast("Unsupported video codec")};vid.src=url;vid.load();return
  }
  var img=new Image();img.onload=function(){finish({url:url,img:img})};
  img.onerror=function(){URL.revokeObjectURL(url);api.toast("Could not read image")};img.src=url;return
 }
 if(el.id==="slAudio"){var file=el.files&&el.files[0];if(file&&file.type.startsWith("audio/")&&file.size<40*1024*1024){audioFile=file;config().audioRights=false;draw();api.toast("Confirm audio rights to include this track")}else api.toast("Select audio under 40 MB");return}
 if(el.dataset.opt||el.dataset.check||el.dataset.seconds!==undefined)draw()
});
function lines(ctx,t,w,limit){var words=String(t).split(/\s+/),a=[],l="";words.forEach(function(v){var q=l?l+" "+v:v;if(ctx.measureText(q).width>w&&l){a.push(l);l=v}else l=q});if(l)a.push(l);return a.slice(0,limit)}
function overlay(ctx,i,phase,w,h){
 var o=config(),photo=images.get(i);ctx.save();
 if(isExporting&&activeVideoIndex!==i){
  if(activeVideoIndex>=0){var previous=images.get(activeVideoIndex);if(previous&&previous.video){previous.video.pause();previous.video.currentTime=0}}
  activeVideoIndex=i;
  if(photo&&photo.video){photo.video.currentTime=0;photo.video.play().catch(function(){})}
 }
 var p=photo?(photo.video||photo.img):null;
 if(p&&(photo.img?(p.complete&&p.naturalWidth):(p.readyState>=2))){
  var mediaWidth=photo.img?p.naturalWidth:p.videoWidth,mediaHeight=photo.img?p.naturalHeight:p.videoHeight;
  var scale=Math.max(w/mediaWidth,h/mediaHeight),sw=w/scale,sh=h/scale;
  ctx.save();ctx.filter=o.filter==="vivid"?"saturate(1.45) contrast(1.06)":o.filter==="warm"?"sepia(.22) saturate(1.2)":o.filter==="cool"?"hue-rotate(17deg) saturate(1.2)":"none";
  ctx.drawImage(p,(mediaWidth-sw)/2,(mediaHeight-sh)/2,sw,sh,0,0,w,h);ctx.restore();
  var g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,"#050a2277");g.addColorStop(.5,"#050a2207");g.addColorStop(1,"#050a22b9");ctx.fillStyle=g;ctx.fillRect(0,0,w,h)
 }
 if(o.sticker!=="none"){ctx.textAlign="center";ctx.font=Math.floor(w*.09)+"px system-ui";ctx.fillText(o.sticker,w*.79,h*.31+Math.sin(phase*5)*9)}
 if(o.showHook&&i===0&&o.hook.trim()){
  ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="900 "+Math.floor(w*.044)+"px system-ui";ctx.lineWidth=w*.012;ctx.strokeStyle="#091027";ctx.fillStyle="white";
  lines(ctx,o.hook,w*.82,3).forEach(function(t,j){ctx.strokeText(t,w*.5,h*.17+j*w*.059);ctx.fillText(t,w*.5,h*.17+j*w*.059)})
 }
 if(o.showCaptions&&cap(i).trim()){
  var size=Math.floor(w*(o.font==="clean"?.034:.043)),y=o.position==="top"?h*.36:h*.75;ctx.font=(o.font==="clean"?"700 ":"900 ")+size+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";
  var parts=lines(ctx,cap(i),w*.76,4),lineHeight=size*1.4;
  ctx.fillStyle="rgba(5,10,27,.78)";ctx.beginPath();ctx.roundRect(w*.07,y-size*.55,w*.86,parts.length*lineHeight+size*.78,w*.025);ctx.fill();
  parts.forEach(function(t,j){ctx.fillStyle=o.font==="highlight"?"#ffec68":"white";ctx.fillText(t,w*.5,y+j*lineHeight)})
 }
 if(o.showCTA&&i===shots().length-1&&o.cta.trim()){ctx.textAlign="center";ctx.font="800 "+Math.floor(w*.03)+"px system-ui";ctx.fillStyle="#fff4b2";ctx.fillText(o.cta.slice(0,42),w*.5,h*.88)}
 if(o.transition==="fade"&&phase<.1){ctx.fillStyle="rgba(0,0,0,"+((.1-phase)*4)+")";ctx.fillRect(0,0,w,h)}
 if(o.transition==="slide"&&phase<.1){ctx.fillStyle="rgba(255,255,255,.25)";ctx.fillRect(w*phase*10,0,w*.055,h)}
 ctx.restore()
}
async function attachAudio(stream){
 if(!audioFile||!config().audioRights)return null;
 var Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error("WebAudio is not supported");
 var context=new Context();
 try{var buffer=await context.decodeAudioData(await audioFile.arrayBuffer()),src=context.createBufferSource();src.buffer=buffer;src.loop=true;
 var gain=context.createGain();gain.gain.value=config().audioVolume;var destination=context.createMediaStreamDestination();
 src.connect(gain);gain.connect(destination);var track=destination.stream.getAudioTracks()[0];stream.addTrack(track);
 audioRun={src:src,context:context,started:false};
 return function(){try{if(audioRun&&audioRun.started)src.stop()}catch(e){}audioRun=null;context.close().catch(function(){})}
 }catch(e){context.close().catch(function(){});throw e}
}
window.NovaReelShortsOverlay=overlay;
window.NovaReelAudioAttach=attachAudio;
window.NovaReelAudioBegin=function(){if(audioRun&&!audioRun.started){audioRun.started=true;audioRun.src.start(0)}};
window.NovaReelRenderStart=function(){isExporting=true;activeVideoIndex=-1};
window.NovaReelRenderStop=function(){isExporting=false;activeVideoIndex=-1;images.forEach(function(v){if(v.video){v.video.pause();v.video.currentTime=0}})};
window.NovaReelLabSync=function(){if(!root.contains(document.activeElement))draw()};
draw();
})();