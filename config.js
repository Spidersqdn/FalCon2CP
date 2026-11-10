// แก้บรรทัดนี้ให้เป็น URL ของแผนที่บน Cloudflare R2 (Public URL ของ bucket + /map.pmtiles)
// เพิ่ม/แก้รายการแผนที่ใน MAPS (แสดงเป็นตัวเลือกในเว็บ)
window.CONFIG = {
  MAP_URL: "https://spidersqdn.github.io/DataBase/FalCon2CP/map250k.pmtiles",
  MAPS: [
    { name: "JOG 1:250,000", url: "https://spidersqdn.github.io/DataBase/FalCon2CP/map250k.pmtiles" },
    { name: "TPC 1:500,000", url: "https://spidersqdn.github.io/DataBase/FalCon2CP/map500k.pmtiles" }
  ],
  DEFAULT_KT: 90
};
