# OrbitNotes

MVP ของแอปบันทึกเลคเชอร์และเตรียมสอบ ตามเอกสารโปรเจกต์ที่ให้มา

## ทดลองใช้งาน

เปิด `index.html` ในเบราว์เซอร์ หรือรันเซิร์ฟเวอร์ง่าย ๆ:

```bash
python -m http.server 3000
```

แล้วเปิด http://localhost:3000

ตอนนี้มี Dashboard, วิชา, คลังไฟล์, Exam Radar และการอัดเสียงจริงด้วย MediaRecorder ในเครื่อง ส่วน Whisper/Gemini/Supabase ต้องเติม environment variables และ backend ก่อนนำขึ้น production
