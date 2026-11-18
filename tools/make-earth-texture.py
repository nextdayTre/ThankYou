import json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
W,H=4096,2048
S=2  # supersample
mask=Image.new('L',(W*S//1,H*S//1),0)
d=ImageDraw.Draw(mask)
gj=json.load(open('land.geojson'))
def px(lon,lat): return ((lon+180)/360*mask.width,(90-lat)/180*mask.height)
geoms=[gj['geometry']] if gj['type']=='Feature' else (gj['features'] and [f['geometry'] for f in gj['features']]) or [gj]
def polys(g):
    if g['type']=='Polygon': yield g['coordinates']
    elif g['type']=='MultiPolygon':
        for p in g['coordinates']: yield p
    elif g['type']=='GeometryCollection':
        for gg in g['geometries']: yield from polys(gg)
def unwrap(ring):
    out=[];off=0;prev=None
    for lon,lat in ring:
        if prev is not None:
            if lon+off-prev>180: off-=360
            elif lon+off-prev<-180: off+=360
        v=lon+off; out.append((v,lat)); prev=v
    if abs(out[-1][0]-out[0][0])>180:
        out+= [(out[-1][0],-90),(out[0][0],-90)]
    return out
def draw(ring,fill):
    u=unwrap(ring)
    for o in (-360,0,360):
        d.polygon([px(x+o,y) for x,y in u],fill=fill)
for g in geoms:
    for p in polys(g):
        draw(p[0],255)
        for hole in p[1:]: draw(hole,0)
mask=mask.resize((W,H),Image.LANCZOS)
land=np.asarray(mask,dtype=np.float32)/255
bm=np.asarray(Image.open('three-globe-2.45.6/package/example/img/earth-blue-marble.jpg').convert('RGB'),dtype=np.float32)/255
lum=(bm*[0.3,0.59,0.11]).sum(2,keepdims=True)
# land colour: saturated greens/tans graded from blue marble
r,g,b=bm[...,0:1],bm[...,1:2],bm[...,2:3]
greenness=np.clip((g-r)*4+0.4,0,1)
green=np.concatenate([0.22+0.25*lum,0.55+0.35*lum,0.14+0.12*lum],2)
tan=np.concatenate([0.78+0.2*lum,0.68+0.2*lum,0.42+0.2*lum],2)
landc=tan*(1-greenness)+green*greenness
landc=np.clip(landc*(0.85+0.35*lum),0,1)
# ice caps / very bright -> white
ice=np.clip((lum-0.62)*4,0,1)
landc=landc*(1-ice)+np.array([0.95,0.98,1.0])*ice
# ocean: vivid blue gradient by latitude + depth shading from blue marble
y=np.linspace(0,1,H)[:,None,None]
lat=np.abs(y-0.5)*2
base=np.array([0.05,0.38,0.92])*(1-lat)+np.array([0.04,0.25,0.78])*lat
base=np.broadcast_to(base,(H,W,3)).copy()
oc=base*(0.85+0.9*np.clip(lum,0,0.35)) 
oc=np.clip(oc,0,1)
# coastal shallow glow
m=Image.fromarray((land*255).astype(np.uint8))
sh=np.asarray(m.filter(ImageFilter.GaussianBlur(10)),dtype=np.float32)[...,None]/255
shallow=np.clip(sh*(1-land[...,None])*2.2,0,1)
oc=oc*(1-shallow*0.6)+np.array([0.25,0.72,1.0])*shallow*0.6
land3=land[...,None]
out=landc*land3+oc*(1-land3)
Image.fromarray((np.clip(out,0,1)*255).astype(np.uint8)).save('/workspace/citation-globe/assets/earth-wii.jpg',quality=88)
oceanmask=Image.fromarray(((1-land)*255).astype(np.uint8)).resize((1024,512),Image.LANCZOS)
oceanmask.save('/workspace/citation-globe/assets/ocean-mask.png',optimize=True)
