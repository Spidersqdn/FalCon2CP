# เอา Route Map ขึ้นเว็บ (แผนที่ทั้งชุด 3 GB)

แนวทาง: แปลงแผนที่เป็น **ไฟล์เดียว `map.pmtiles`** แล้วเอาขึ้น **GitHub Pages ของ repo DataBase**
browser จะดึงเฉพาะส่วนที่ดูอยู่ ไม่ต้องโหลดทั้ง 3 GB

## A) สร้าง map.pmtiles (เลือก 1 วิธี)
**วิธี 1 – QGIS (แนะนำ, รวมได้หลายระวาง)**
1. ลาก `A.TOC` เข้า QGIS > เลือกชุด TPC/JOG ที่ต้องการ
2. Processing Toolbox > `Generate XYZ tiles (MBTiles)`
   - Extent: คำนวณจาก layer, Min zoom 7, Max zoom 12 (JOG = 13)
   - Tile format: JPG, Quality 75 > Output `map.mbtiles`
3. ดาวน์โหลด `pmtiles.exe` จาก github.com/protomaps/go-pmtiles/releases แล้วรัน
   ```
   pmtiles convert map.mbtiles map.pmtiles
   ```
**วิธี 2 – Command line (1 ชุดแผนที่)** ใน OSGeo4W Shell
```
make_pmtiles.bat "C:\...\RPF\A.TOC"
```

## B) เอาขึ้น online (repo DataBase, GitHub Pages)
1. github.com/Spidersqdn/DataBase > Releases > `falcon2cp-maps` > Edit
2. ลบไฟล์เก่า (ถ้ามี) แล้วลากไฟล์ `.pmtiles` ใหม่ใส่ > Update release
3. Actions > **Build offline map and deploy** > Run workflow
4. ไฟล์จะอยู่ที่ `https://spidersqdn.github.io/DataBase/FalCon2CP/<ชื่อไฟล์>.pmtiles` (ถ้าเป็นไฟล์ใหม่ ให้เพิ่ม URL ใน `config.js`)
- ข้อจำกัด: ไฟล์ละไม่เกิน 2 GB, ทั้งเว็บ DataBase ไม่เกิน 1 GB (ตอนนี้ใช้ ~660 MB), 1:50k ไม่เอาขึ้น online

## ความปลอดภัย
- GitHub Pages = สาธารณะ ใครมีลิงก์ก็เปิดได้
- เส้นทางที่วาด **ไม่ถูกอัปโหลด** เก็บใน browser ของแต่ละเครื่องเท่านั้น (ส่งต่อด้วย Export CSV/KML)
- ตรวจสอบสิทธิ์การเผยแพร่แผนที่ CADRG กับหน่วยก่อน

## หมายเหตุ
- ใช้ในเครื่อง (offline) แบบ pmtiles ต้องใช้ server ที่รองรับ Range เช่น `npx http-server -p 8000`
  (python http.server ใช้ไม่ได้กับ pmtiles; ใช้โฟลเดอร์ `tiles/` แทนได้)
- เปิดแผนที่ไฟล์อื่น: `index.html?map=ชื่อไฟล์.pmtiles`
