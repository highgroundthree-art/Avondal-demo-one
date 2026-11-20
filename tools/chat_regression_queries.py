from playwright.sync_api import sync_playwright
Q=["KTM 250 2023","ball joint for my 2023 KTM 250","I need a ball joint for my quad","ball joints for a TRX250","top end for my TRX450R","plug for my yz250","new pads for my dirt bike","R/R for my KLX650","head bearings for my bike","need a carb for my rancher","fuel valve honda","my four wheeler won't crank starter sportsman","knobbies 25x10-12","kill switch","gear oil for my diff","CV axle for my CFMOTO","tie rod for my Can-Am","air filter for my Honda TRX420","brake shoes for a Polaris outlaw 90","I want a throttle cable for my pit bike","clutch cable 2006 trx450r","grips","AF4142","exhaust leak on my pioneer 1000","fork seals for my KX250","ball joint for my atc 200"]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={"width":1300,"height":900})
    pg.goto("file:///home/claude/avondal-demo-one/index.html");pg.wait_for_timeout(300)
    for q in Q:
        r=pg.evaluate("q=>{const r=window.__adb.searchParts(q,{});return [r.veh,r.vt,r.vehText,r.hasPart,r.total,r.list.map(p=>p.name.slice(0,34)).join(' / ')]}",q)
        print(f"{q[:40]:40} | {r[0]} {r[1]} [{r[2]}] part={r[3]} n={r[4]} | {r[5]}")
    b.close()
