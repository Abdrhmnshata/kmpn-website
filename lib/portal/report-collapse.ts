/**
 * Added to report pages as the portal serves them (/api/report-page/<id>):
 * the containers that hold a lot of text start closed, each with a + that
 * opens it smoothly. The stored page itself stays as the team made it.
 *
 * It knows the KMPN report template's containers and skips what a page
 * doesn't have:
 *   .meet                       a meeting: its date line stays, the notes fold
 *   .f-row                      a finding: its title stays, the detail and fix fold
 *   .card with an h3            a titled card whose content is tall (tables, lists)
 * Summaries, tiles and charts stay open.
 */

const STYLE = `
<style id="kmpn-collapse">
.kc-head{display:flex;align-items:flex-start;gap:12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.kc-title{flex:1;min-width:0}
.kc-title>.sub{margin-bottom:0}
.kc-title>h3{margin-bottom:.15rem}
.kc-btn{position:relative;flex:none;width:32px;height:32px;margin-top:-2px;border-radius:50%;border:1px solid var(--line,#ddd);background:var(--surface,#fff);color:var(--ink,#222);cursor:pointer;transition:background .25s ease,border-color .25s ease}
.kc-btn::before,.kc-btn::after{content:"";position:absolute;top:50%;left:50%;width:12px;height:2px;margin:-1px 0 0 -6px;border-radius:2px;background:currentColor;transition:transform .35s cubic-bezier(.22,1,.36,1)}
.kc-btn::after{transform:rotate(90deg)}
.kc.kc-open .kc-btn::after{transform:rotate(0deg)}
.kc-head:hover .kc-btn{background:var(--sand,#f3f3f3)}
.kc-btn:focus-visible{outline:2px solid var(--honey,#b07a12);outline-offset:2px}
.kc-body{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .4s cubic-bezier(.22,1,.36,1),opacity .3s ease}
.kc.kc-open .kc-body{grid-template-rows:1fr;opacity:1}
.kc-inner{min-height:0;overflow:hidden}
.kc-inner>:first-child{margin-top:12px}
.meet.kc{display:block}
.meet.kc .when{flex-direction:row;flex-wrap:wrap;align-items:center;gap:4px 12px}
.meet.kc .when .rec{margin-top:0}
.finds .f-head{display:none}
.f-row.kc{display:block}
.f-row.kc .kc-title>h3{margin-bottom:0}
.f-row.kc .kc-inner{display:grid;gap:10px}
.f-row.kc .arrow{display:none}
.f-row.kc .fix::before{content:"اللي اتعمل";display:block;margin-bottom:2px;font-size:.78rem;font-weight:600;color:var(--muted,#777)}
@media (prefers-reduced-motion:reduce){.kc-body,.kc-btn::before,.kc-btn::after{transition:none}}
</style>`;

const SCRIPT = `
<script>(()=>{
let n=0;
const fold=(box,head,body,label)=>{
  if(!head.length||!body.length)return;
  const id='kc-'+(++n);
  box.classList.add('kc');
  const h=document.createElement('div');h.className='kc-head';
  const t=document.createElement('div');t.className='kc-title';
  const b=document.createElement('button');b.type='button';b.className='kc-btn';
  b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',id);b.setAttribute('aria-label',label||'عرض التفاصيل');
  const w=document.createElement('div');w.className='kc-body';w.id=id;
  const i=document.createElement('div');i.className='kc-inner';
  box.insertBefore(h,box.firstChild);
  head.forEach(x=>t.appendChild(x));
  body.forEach(x=>i.appendChild(x));
  h.append(t,b);w.appendChild(i);h.after(w);
  w.inert=true;
  const toggle=()=>{const open=box.classList.toggle('kc-open');b.setAttribute('aria-expanded',String(open));w.inert=!open;};
  h.addEventListener('click',e=>{if(e.target.closest('a'))return;toggle();});
};
const tall=nodes=>nodes.reduce((s,x)=>s+(x.getBoundingClientRect?x.getBoundingClientRect().height:0),0)>=120;
document.querySelectorAll('.meet').forEach(m=>{
  const when=m.querySelector(':scope>.when');
  fold(m,when?[when]:[],[...m.children].filter(x=>x!==when),'ملاحظات الاجتماع');
});
document.querySelectorAll('.f-row:not(.f-head)').forEach(r=>{
  const h3=r.querySelector(':scope>div>h3');
  if(!h3)return;
  h3.remove();
  fold(r,[h3],[...r.children],'التفاصيل واللي اتعمل');
});
document.querySelectorAll('.card').forEach(c=>{
  if(c.closest('.kc'))return;
  const h3=c.querySelector(':scope>h3');
  if(!h3)return;
  const head=[h3];
  const sub=h3.nextElementSibling;
  if(sub&&sub.classList.contains('sub'))head.push(sub);
  const body=[...c.children].filter(x=>!head.includes(x));
  if(!tall(body))return;
  fold(c,head,body);
});
})()</script>`;

export const REPORT_COLLAPSE = STYLE + SCRIPT;
