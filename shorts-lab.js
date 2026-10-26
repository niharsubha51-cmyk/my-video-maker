/* NovaReel Shorts Lab — free local enhancements */
(function(){
"use strict";
var api=window.NovaReelAPI,root=document.getElementById("shortsLabRoot");
if(!api||!root)return;
var images=new Map(),audioFile=null,audioRun=null;
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
 if(s.shorts.lastIdea!==s.idea){s.shorts.captions=[];s.shorts.hook="";s.shorts.lastIdea=s.idea}
 return s.shorts
}
function total(){return shots().reduce(function(n,sc){return n+Math.max(.5,Number(sc.durationSec)||3)},0)}
function cap(i){var o=config(),sc=shots()[i]||{};if(o.captions[i]!==undefined)return o.captions[i];return i===0?(o.hook||"Wait for the surprise! 😲"):(sc.heading||"Next scene")+"! "+String(sc.action||"").split(".")[0].slice(0,50)}
function duration(t){var s=state(),arr=shots(),o=config(),goal=Math.min(180,Math.max(3,Number(t)||30)),each=Math.round(goal/arr.length*100)/100;if(!arr.length)return;arr.forEach(function(sc,i){sc.durationSec=i===arr.length-1?+(goal-each*(arr.length-1)).toFixed(2):each});o.target=goal;s.format="short";$id("format").value="short";api.refresh()}
function hook(){var s=state(),o=config(),bank=s.genre==="drama"?["Nobody expected THIS to happen… 😱","One clue changes everything!","The secret was right in front of them!"]:s.genre==="animals"?["What did this puppy just do?! 😂","The funniest chase starts NOW!","You won't expect that ending!"]:s.genre==="satisfying"?["Wait for the perfect reveal… 🌈","Watch until the last color!","One tiny detail changes everything!"]:["Bunny discovered something MAGICAL! ✨","Can our little friends solve this? 🐰","Wait for this incredible surprise!"];o.hook=bank[Math.floor(Math.random()*bank.length)]}
function improve(){
 var s=state(),o=config(),arr=shots();if(!arr.length){api.toast("Generate a story first");return}
 hook();o.captions=arr.map(function(sc,i){return i===0?o.hook:sc.heading+"! "+String(sc.action||"").split(".")[0].slice(0,46)});
 duration(o.target);
 var title=s.metadata.title||s.idea;
 if(!title.startsWith(o.series+" | "))s.metadata.title=(o.series+" | "+title).slice(0,98);
 if(s.genre==="drama"&&o.episode)s.metadata.title=(s.metadata.title+" | EP "+o.episode).slice(0,98);
 s.metadata.hashtags=Array.from(new Set(((s.metadata.hashtags||"")+" #Shorts #Animation #YouTubeShorts").split(/\s+/).filter(Boolean))).slice(0,12).join(" ");
 o.madeForKids=s.genre==="kids";
 api.renderAll();api.toast("Local agent suggestions added — review before upload")
}
function score(){
 var s=state(),o=config(),a=[],b=[],t=total();
 if(s.format==="short"&&t<=180)a.push("Shorts format and duration are within 180 seconds");else b.push("Use 9:16 Shorts format and a duration of 180 seconds or less");
 if(o.hook.trim().length>=8)a.push("Opening hook ready");else b.push("Add a first-second hook");
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
 h.push('<div class="sl-header"><div><div class="eyebrow">Free Shorts creation tools</div><h1>📱 Shorts Lab</h1><p class="sl-help">Scene timing, text overlays, captions, stickers, color looks, optional audio and upload preparation.</p></div><span class="sl-badge">Up to 3 min</span></div>');
 h.push('<div class="sl-layout"><div><section class="sl-pane"><h2>⚡ Local Creator Agents</h2><p class="sl-help">Rule-based editing helpers — not a paid generative AI or competitor-video scraper.</p><div class="sl-btns"><button class="sl-btn sl-primary" data-action="optimize">✦ Optimize Short</button><button class="sl-btn" data-action="hook">↻ Suggest new hook</button><button class="sl-btn" data-action="script">Open voiceover script</button></div>');
 h.push('<h3>Story templates</h3><div class="sl-btns"><button class="sl-btn" data-template="magic">🐰 Magical rescue</button><button class="sl-btn" data-template="chase">🐶 Funny chase</button><button class="sl-btn" data-template="drama">🎭 Micro drama</button><button class="sl-btn" data-template="satisfy">🌈 Satisfying reveal</button></div><hr class="sl-divider">');
 h.push('<h3>⏱ Clip timeline</h3><div class="sl-btns">');
 [15,30,60,180].forEach(function(n){h.push('<button class="sl-btn" data-duration="'+n+'" aria-pressed="'+(Math.abs(t-n)<.2)+'">'+n+' sec</button>')});
 h.push('</div><div class="sl-timeline">');arr.forEach(function(sc,i){h.push('<div class="sl-segment" style="flex:'+Math.max(.5,Number(sc.durationSec)||3)+'" title="Scene '+(i+1)+'">'+(i+1)+'</div>')});h.push('</div><span class="sl-badge">'+t.toFixed(1)+' sec</span>');
 arr.forEach(function(sc,i){
 h.push('<article class="sl-card"><div class="sl-card-top"><span class="sl-id">SCENE '+(i+1)+'</span><strong>'+esc(sc.heading)+'</strong></div><div class="sl-grid"><div class="sl-field"><label>Duration (sec)</label><input data-seconds="'+i+'" type="number" min=".5" max="60" step=".5" value="'+Math.max(.5,Number(sc.durationSec)||3).toFixed(2)+'"></div><div class="sl-field"><label>Use own picture</label><input data-picture="'+i+'" type="file" accept="image/jpeg,image/png,image/webp"><small class="sl-audio-info">'+(images.has(i)?"Photo loaded":"Optional, local-only; not saved")+'</small></div></div><div class="sl-field"><label>Timed caption</label><textarea data-caption="'+i+'">'+esc(cap(i))+'</textarea></div></article>');
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
 if(a==="optimize"){improve();draw();return}
 if(a==="hook"){hook();draw();api.refresh();return}
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
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>8*1024*1024){api.toast("Choose JPG, PNG or WebP under 8 MB");return}
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){var old=images.get(i);if(old)URL.revokeObjectURL(old.url);images.set(i,{url:url,img:img});draw();api.refresh();api.toast("Photo added to scene")};
  img.onerror=function(){URL.revokeObjectURL(url);api.toast("Could not read image")};img.src=url;return
 }
 if(el.id==="slAudio"){var file=el.files&&el.files[0];if(file&&file.type.startsWith("audio/")&&file.size<40*1024*1024){audioFile=file;config().audioRights=false;draw();api.toast("Confirm audio rights to include this track")}else api.toast("Select audio under 40 MB");return}
 if(el.dataset.opt||el.dataset.check||el.dataset.seconds!==undefined)draw()
});
function lines(ctx,t,w,limit){var words=String(t).split(/\s+/),a=[],l="";words.forEach(function(v){var q=l?l+" "+v:v;if(ctx.measureText(q).width>w&&l){a.push(l);l=v}else l=q});if(l)a.push(l);return a.slice(0,limit)}
function overlay(ctx,i,phase,w,h){
 var o=config(),photo=images.get(i);ctx.save();
 if(photo&&photo.img.complete&&photo.img.naturalWidth){
  var p=photo.img,scale=Math.max(w/p.naturalWidth,h/p.naturalHeight),sw=w/scale,sh=h/scale;
  ctx.save();ctx.filter=o.filter==="vivid"?"saturate(1.45) contrast(1.06)":o.filter==="warm"?"sepia(.22) saturate(1.2)":o.filter==="cool"?"hue-rotate(17deg) saturate(1.2)":"none";
  ctx.drawImage(p,(p.naturalWidth-sw)/2,(p.naturalHeight-sh)/2,sw,sh,0,0,w,h);ctx.restore();
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
window.NovaReelLabSync=function(){if(!root.contains(document.activeElement))draw()};
draw();
})();