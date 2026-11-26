// URL แผนที่ online: GitHub Pages ของ repo DataBase (ไฟล์อยู่ใน Release `falcon2cp-maps`)
// เพิ่ม/แก้รายการแผนที่ใน MAPS (แสดงเป็นตัวเลือกในเว็บ)
window.CONFIG = {
  MAP_URL: "https://spidersqdn.github.io/DataBase/FalCon2CP/map250k.pmtiles",
  MAPS: [
    { name: "JOG 1:250,000", url: "https://spidersqdn.github.io/DataBase/FalCon2CP/map250k.pmtiles" },
    { name: "TPC 1:500,000", url: "https://spidersqdn.github.io/DataBase/FalCon2CP/map500k.pmtiles" }
  ],
  // ข้อมูลช่องค้นหาสถานที่: โฟลเดอร์ CoWork ของ repo DataBase (AP.txt, สนามบิน ทบ.txt, AD.txt, places.json)
  COWORK_URL: "https://spidersqdn.github.io/DataBase/CoWork/",
  DEFAULT_KT: 90,
  // รหัสผ่านเข้าแอป: เก็บเป็น SHA-256 (hex) ของรหัสผ่าน; ว่าง "" = ไม่ต้อง login
  // เปลี่ยนรหัส: เปิดแอป > Console พิมพ์ f2cpHash("รหัสใหม่") แล้ววางค่าที่ได้ที่นี่
  PASS_HASH: "7233021ea05ec7a53f3d6403d5a80cd5a2063d4d9b884b19beda15bc3b102095"
};
