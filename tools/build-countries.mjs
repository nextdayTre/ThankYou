import {feature} from 'topojson-client';
import fs from 'fs';
const w='/tmp/pk/world-atlas-2.0.2/package/';
const c=JSON.parse(fs.readFileSync(w+'countries-50m.json'));
const gj=feature(c,c.objects.countries);
function unwrap(ring){
  const out=[];let off=0,prev=null;
  for(const [lon,lat] of ring){
    if(prev!==null){ if(lon+off-prev>180) off-=360; else if(lon+off-prev<-180) off+=360; }
    const v=lon+off; out.push([v,lat]); prev=v;
  }
  if(Math.abs(out[out.length-1][0]-out[0][0])>180){ // pole-enclosing ring
    const a=out[out.length-1][0], b=out[0][0], pole=out[0][1]<0?-90:90;
    out.push([a,pole],[b,pole]);
  }
  return out;
}
function clip(poly,lo,hi){ // Sutherland-Hodgman against lon in [lo,hi]
  const edge=(pts,inside,inter)=>{const o=[];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];
    const pi=inside(p),qi=inside(q); if(pi&&qi)o.push(q); else if(pi&&!qi)o.push(inter(p,q)); else if(!pi&&qi){o.push(inter(p,q));o.push(q);}}return o;};
  const ix=x=>(p,q)=>[x,p[1]+(q[1]-p[1])*(x-p[0])/(q[0]-p[0])];
  let pts=poly.slice(0,-1);
  pts=edge(pts,p=>p[0]>=lo,ix(lo)); if(!pts.length) return null;
  pts=edge(pts,p=>p[0]<=hi,ix(hi)); if(pts.length<3) return null;
  pts.push(pts[0]); return pts;
}
const r2=p=>[+p[0].toFixed(3),+p[1].toFixed(3)];
let fixed=[];
const feats=gj.features.map(f=>{
  const g=f.geometry; const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;
  const out=[];
  for(const p of polys){
    const xs=p[0].map(c=>c[0]);
    const span=Math.max(...xs)-Math.min(...xs);
    const polar=p[0].some(c=>Math.abs(c[1])>=89.9);
    if(span<=180||polar){ out.push(p.map(r=>r.map(r2))); continue; }
    fixed.push(f.properties.name);
    const u=unwrap(p[0]);
    for(const o of [-360,0,360]){
      const pc=clip(u.map(([x,y])=>[x+o,y]),-180,180);
      if(pc) out.push([pc.map(r2)]);
    }
  }
  return {type:'Feature',id:f.id,properties:{name:f.properties.name},geometry:{type:'MultiPolygon',coordinates:out}};
});
console.log('fixed',fixed);
const out={type:'FeatureCollection',features:feats};
fs.writeFileSync('/workspace/citation-globe/data/countries.js','/* Natural Earth 1:50m countries via world-atlas 2.0.2 (ISC/Public Domain). Generated. */\nwindow.COUNTRIES_GEOJSON='+JSON.stringify(out)+';\n');
fs.writeFileSync('/workspace/citation-globe/data/countries.geojson',JSON.stringify(out));
