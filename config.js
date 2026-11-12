// URL แผนที่ online: GitHub Pages ของ repo DataBase (ไฟล์อยู่ใน Release `falcon2cp-maps`)
// เพิ่ม/แก้รายการแผนที่ใน MAPS (แสดงเป็นตัวเลือกในเว็บ)
window.CONFIG = {
  MAP_URL: "https://spidersqdn.github.io/DataBase/FalCon2CP/map250k.pmtiles",
  MAPS: [
    { name: "JOG 1:250,000", url: "https://spidersqdn.github.io/DataBase/FalCon2CP/map250k.pmtiles" },
    { name: "TPC 1:500,000", url: "https://spidersqdn.github.io/DataBase/FalCon2CP/map500k.pmtiles" }
  ],
  // ข้อมูลช่องค้นหาสถานที่ (สร้างจาก repo AirNavFlow โดย workflow ของ repo DataBase)
  PLACES_URL: "https://spidersqdn.github.io/DataBase/FalCon2CP/places.json",
  DEFAULT_KT: 90
};
