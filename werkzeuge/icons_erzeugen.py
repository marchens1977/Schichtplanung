"""Erzeugt die App-Symbole (Kalender) in den Farben Blau #002D72 und Orange #FF5910.
Start: python3 werkzeuge/icons_erzeugen.py   (braucht Pillow: pip install pillow)"""
from PIL import Image, ImageDraw
import os

BLUE=(0,45,114); ORANGE=(255,89,16); WHITE=(255,255,255)
LIGHT=(200,214,236); DARK=(0,30,77)
OUT=os.path.join(os.path.dirname(__file__),'..','icons')

def icon(size, scale):
    S=4; W=size*S  # hochauflösend zeichnen, dann verkleinern (glatte Kanten)
    im=Image.new('RGB',(W,W),BLUE); d=ImageDraw.Draw(im)
    u=lambda v: v*W/512
    c=256; half=lambda v: c+(v-256)*scale
    x0,x1=u(half(92)),u(half(420)); y0,y1=u(half(118)),u(half(420)); hy=u(half(190))
    r=u(22*scale)
    d.rounded_rectangle([x0,y0,x1,y1],r,fill=WHITE)
    d.rounded_rectangle([x0,y0,x1,hy],r,fill=ORANGE); d.rectangle([x0,hy-r,x1,hy],fill=ORANGE)
    for rx in (184,328):
        d.rounded_rectangle([u(half(rx-12)),u(half(86)),u(half(rx+12)),u(half(150))],u(12*scale),fill=WHITE,outline=DARK,width=int(u(4*scale)))
    cols=[[LIGHT,BLUE,LIGHT],[BLUE,ORANGE,LIGHT]]
    for ri,row in enumerate(cols):
        for ci,col in enumerate(row):
            bx=124+ci*92; by=222+ri*84
            d.rounded_rectangle([u(half(bx)),u(half(by)),u(half(bx+72)),u(half(by+70))],u(10*scale),fill=col)
    return im.resize((size,size),Image.LANCZOS)

icon(512,1).save(os.path.join(OUT,'icon-512.png'))
icon(192,1).save(os.path.join(OUT,'icon-192.png'))
icon(180,1).save(os.path.join(OUT,'apple-touch-icon.png'))
icon(512,0.75).save(os.path.join(OUT,'icon-maskable-512.png'))
print('Symbole erzeugt.')
