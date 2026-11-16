# EVERYDAY CHAOS — Remotion

การ์ตูน Shorts แนวตั้ง (1080×1920, 24 fps) เขียนด้วย Remotion + TypeScript
แต่ละตอนคือไฟล์คอนฟิกหนึ่งไฟล์: ภาพเริ่มต้นของแต่ละฉาก ความยาว บทพูด และท่าทาง

## เริ่มใช้งาน

ต้องมี Node.js 18 ขึ้นไป

```bash
npm install
npm run dev            # เปิด Remotion Studio เพื่อพรีวิวและไล่เฟรม
npm run render:ep01    # เรนเดอร์เป็น out/everyday-chaos-ep01.mp4
npm run typecheck
```

## โครงสร้าง

```
public/episodes/ep01/        ภาพฉาก scene-1..5.png, music.wav, voice/ (ใส่ไฟล์เสียงพากย์ที่นี่)
src/
├── index.ts                 registerRoot
├── root.tsx                 สร้าง Composition ให้ทุกตอนใน EPISODE_LIST
├── episodes/
│   ├── index.ts             รายการตอนทั้งหมด
│   └── ep01/ep01.config.ts  คอนฟิก EP.01 (ฉาก บทพูด ท่าทาง กล้อง)
├── components/
│   ├── episode-video.tsx    เรียงฉาก + วางเสียงพากย์และดนตรี
│   ├── scene-shot.tsx       คำนวณท่าทางของฉากตามเวลา
│   └── warped-image.tsx     วาดภาพผ่าน mesh ลง canvas
├── utils/
│   ├── mesh-warp.ts         ดัดภาพเฉพาะจุด + เส้นสั่น (line boil) + กล้อง
│   ├── talk.ts              จังหวะขยับปากตามช่วงเวลาของบทพูด
│   └── easing.ts
└── types/episode/episode.types.ts
```

## ใส่เสียงพากย์

1. วางไฟล์เสียงใน `public/episodes/ep01/voice/` เช่น `man.mp3`, `cat.mp3`
2. หาตำแหน่งของแต่ละประโยคในไฟล์:
   ```bash
   npm run detect-lines -- public/episodes/ep01/voice/man.mp3
   ```
3. ใน `src/episodes/ep01/ep01.config.ts` แก้ `durationInSeconds` ของแต่ละบรรทัด แล้วเพิ่ม
   ```ts
   audio: { src: 'episodes/ep01/voice/man.mp3', trimStartInSeconds: 0.12 },
   ```
   ปากและท่าทางจะตามเวลาของบทพูดเองโดยอัตโนมัติ

## ทำตอนใหม่

1. วางภาพฉากใน `public/episodes/<id>/`
2. คัดลอก `src/episodes/ep01/` เป็นโฟลเดอร์ใหม่ แก้ `id`, ภาพ, บทพูด และ `pose` ของแต่ละฉาก
3. เพิ่มตอนใหม่ใน `EPISODE_LIST` (`src/episodes/index.ts`) และเพิ่มสคริปต์ render ใน `package.json`

`pose` คืนค่า `bumps` (จุดที่จะดัดภาพ หน่วยเป็นพิกเซลของภาพต้นฉบับ) และ `camera`
ใช้ `steppedSeconds` กับตัวละคร (ขยับทุก 2 เฟรมแบบ limited animation) และ `seconds` กับกล้อง

## ข้อจำกัด

ตัวละครขยับด้วยการดัดภาพนิ่ง จึงเปลี่ยนท่าหรือกะพริบตาจริงไม่ได้
ถ้าต้องการลิปซิงก์จริง ให้วาดปากแยกเลเยอร์หรือใช้เครื่องมือ image-to-video

## License ของ Remotion

ใช้ฟรีสำหรับบุคคลและบริษัทไม่เกิน 3 คน บริษัทที่ใหญ่กว่านั้นต้องมี Company License
ดู https://www.remotion.dev/docs/license
