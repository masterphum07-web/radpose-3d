# OrbitNotes Google Drive + Sheets bridge

1. สร้าง Google Sheet และ Google Drive folder สำหรับ OrbitNotes
2. เปิด Extensions → Apps Script แล้ววาง `Code.gs`
3. ไปที่ Project Settings → Script properties แล้วเพิ่ม:
   - `SHEET_ID` = ไอดี Google Sheet
   - `DRIVE_FOLDER_ID` = ไอดีโฟลเดอร์ Drive
4. เลือกฟังก์ชัน `setupSheet` แล้วกด Run ครั้งแรกเพื่อสร้างหัวตารางและอนุญาตสิทธิ์
5. Deploy → New deployment → Web app → Execute as Me → Anyone with the link
6. นำ Web app URL ไปใส่ใน `NEXT_PUBLIC_APPS_SCRIPT_URL` หรือ config ของ frontend

POST ตัวอย่างสำหรับบันทึกเสียง:

```json
{
  "action": "saveRecording",
  "fileName": "lecture-001.webm",
  "mimeType": "audio/webm",
  "audioBase64": "...",
  "title": "Calculus",
  "durationSeconds": 120
}
```

หมายเหตุ: Apps Script รับ payload ได้จำกัด จึงเหมาะกับไฟล์สั้นหรือ metadata bridge เท่านั้น สำหรับเลคเชอร์ยาวควรอัปโหลดตรงเข้า Supabase Storage หรือ Cloud Storage แล้วส่งเฉพาะ URL มาเก็บใน Sheet
