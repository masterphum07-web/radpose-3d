# OrbitNotes

MVP ของแอปบันทึกเลคเชอร์และเตรียมสอบ ตามเอกสารโปรเจกต์ที่ให้มา

## ทดลองใช้งาน

เปิด `index.html` ในเบราว์เซอร์ หรือรันเซิร์ฟเวอร์ง่าย ๆ:

```bash
python -m http.server 3000
```

แล้วเปิด http://localhost:3000

ตอนนี้มี Dashboard, วิชา, คลังไฟล์, Exam Radar และการอัดเสียงจริงด้วย MediaRecorder ในเครื่อง ส่วน Whisper/Gemini/Supabase ต้องเติม environment variables และ backend ก่อนนำขึ้น production

## Google Drive storage

Frontend เชื่อมกับ Apps Script Web App ที่ตั้งค่าไว้ให้แล้ว และอัปโหลดเสียงเป็นช่วงละประมาณ 5 นาทีเข้า Google Drive พร้อมบันทึกข้อมูลลง Google Sheet โดยใช้ `DRIVE_FOLDER_ID` และ `SHEET_ID` ที่กำหนดใน `app.js` และ `apps-script/Code.gs`
