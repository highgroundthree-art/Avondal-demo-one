import base64, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, "index.html"), encoding="utf-8").read()
def inline(m):
    path = m.group(2)
    full = os.path.join(root, path)
    if not os.path.isfile(full):
        return m.group(0)
    mime = "image/png" if path.endswith(".png") else "image/jpeg"
    data = base64.b64encode(open(full, "rb").read()).decode()
    return m.group(1) + "data:" + mime + ";base64," + data
html = re.sub(r"""(src="|url\()(images/[^"')]+)""", inline, html)
html = html.replace("url(images/site/'+s[2]+'.jpg)", "url('+(window.__SVCIMG&&__SVCIMG[s[2]]||'images/site/'+s[2]+'.jpg')+')")
svc = {}
for n in os.listdir(os.path.join(root, "images/site")):
    if n.startswith("svc-"):
        svc[n[:-4]] = "data:image/jpeg;base64," + base64.b64encode(open(os.path.join(root, "images/site", n), "rb").read()).decode()
parts = {}
for n in os.listdir(os.path.join(root, "images/parts")):
    parts[n[:-4]] = "data:image/jpeg;base64," + base64.b64encode(open(os.path.join(root, "images/parts", n), "rb").read()).decode()
html = html.replace('img:"images/parts/jm"+p[0]+".jpg"', 'img:(window.__PARTIMG&&__PARTIMG["jm"+p[0]])||"images/parts/jm"+p[0]+".jpg"')
js = "<script>window.__PARTIMG=" + __import__("json").dumps(parts) + ";window.__SVCIMG=" + __import__("json").dumps(svc) + ";</script>"
html = html.replace("<script>\n(function(){", js + "\n<script>\n(function(){", 1)
os.makedirs(os.path.join(root, "dist"), exist_ok=True)
out = os.path.join(root, "dist", "avondale-demo-offline.html")
open(out, "w", encoding="utf-8").write(html)
print(out, os.path.getsize(out) // 1024, "KB")
