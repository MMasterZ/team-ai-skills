# Team AI Coding Standards

- Frontend: Vue 3 (Composition API), Quasar Framework, TypeScript
- Backend: Node.js, Firebase (Firestore, Cloud Functions)

## Coding Rules
- ห้ามเขียนโค้ดที่ซับซ้อนเกินจำเป็น (Overengineering) เน้นโครงสร้างเรียบง่ายที่มนุษย์อ่านเข้าใจและแก้ไขต่อได้
- หากมีการทำงานกับ UI ให้ใช้ Layout และ Component มาตรฐานของ Quasar เสมอ
- การจัดการ State ให้หลีกเลี่ยงวิธีที่ซับซ้อน ให้ใช้ Vue Reactivity ปกติก่อน
- ฟังก์ชันและตัวแปรต้องตั้งชื่อเป็นภาษาอังกฤษแบบ camelCase ที่สื่อความหมายชัดเจน
- ต้องคอมเมนต์อธิบาย Logic หรือ Business Rule ที่สำคัญเป็น "ภาษาไทย" เสมอ

## Data & Naming

- **หนึ่งแนวคิดทางธุรกิจ = หนึ่ง getter เดียว** ห้ามเช็ค field ดิบกระจายตามไฟล์
  ถ้าต้องถามว่า "บัญชีนี้เป็น demo ไหม" ให้มี `isDemo` ที่เดียวใน store แล้วเรียกใช้ทุกที่
  _เคสจริง: มีวิธีถามคำถามเดียวกัน 4 แบบ (`studentType=='demo'`, `accountType=='demo'`, `isDemoAccount`, `isDemo`) กระจาย 24+ จุด ทำให้ feature ไม่ทำงานเพราะเช็คคนละ field กับที่ backend ส่งมา_

- **ตั้งชื่อตามสิ่งที่เก็บจริง ไม่ใช่สิ่งที่ตั้งใจจะให้เป็น**
  ถ้าเก็บ timestamp หมดอายุ ให้ชื่อ `demoExpiresAt` ไม่ใช่ `demoRemaining`
  _เคสจริง: `demoRemaining` เก็บ timestamp หมดอายุ แต่ชื่อบอกว่า "เวลาที่เหลือ" → client คำนวณสลับด้าน นาฬิกาโชว์ 6 ชม. ทั้งที่ตั้งไว้ 3 ชม._

- **เทียบค่าต้องเทียบหน่วยเดียวกันเสมอ** ก่อนเขียนเงื่อนไขให้ถามว่าสองฝั่งเป็นหน่วยอะไร (ms / วินาที / timestamp)
  _เคสจริง: `if (demoRemaining > 300000)` เอา timestamp 13 หลักไปเทียบกับ 5 นาที → จริงตลอด ป้ายเตือนเวลาใกล้หมดไม่เคยทำงาน_

## Vue / Component

- **UI ชิ้นเดียวกันที่โผล่หลายหน้า ต้องแยกเป็น component ห้าม copy-paste**
  _เคสจริง: หน้าเล่นวิดีโอ 6 หน้า ใส่ `playsinline` ครบ 5 หน้า หลุดไป 1 → นักเรียนบน iPad ดูวิดีโอไม่ได้ กว่าจะรู้คือมี ticket แจ้งเข้ามา_

- **ข้อมูลจาก store / API ที่ใช้ใน template ต้องกัน null เสมอ** ใช้ optional chaining + ค่า default (`store.data?.tier ?? ''`, `arr?.includes(x)`)
  _เคสจริง: `studentStore.studentData.tier` พังทั้งหน้าตอน logout เพราะ store ถูก reset ก่อน route เปลี่ยน และ `courseData.levelSkills.includes()` throw ตอนคอร์สยังโหลดไม่เสร็จ_

- **ทุกอย่างที่ "เปิด" ไว้ ต้อง "ปิด" ใน `onBeforeUnmount`** — `setInterval` / `setTimeout` ที่วนต่อ / `addEventListener` / Firebase `onSnapshot`
  _เคสจริง: animation chain ไม่เคยถูก stop ตอน teardown → เข้า-ออกหน้า lobby ทีไรก็ทิ้ง interval ค้างสะสมเรื่อย ๆ_

- **ชื่อ event ต้องตรงกันทั้ง 3 จุด**: `emit()` ↔ `defineEmits()` ↔ `@listener` ฝั่ง parent
  _เคสจริง: `emit("practice")` แต่ประกาศ `defineEmits(['lesson-learning'])` และ parent ฟัง `@lesson-learning` → กดปุ่มแล้วเงียบ ไม่มี error ให้เห็น_

- **แก้ที่ source of truth ไม่ใช่แก้ที่ template** ถ้าเงื่อนไขเดียวกันถูกใช้ทั้งการแสดงผลและการทำงาน ให้ดึงเป็น computed ตัวเดียวแล้วใช้ทั้ง `v-if`/`:disable` และ `@click`
  _เคสจริง: ไอคอนกุญแจโชว์ว่าล็อก แต่ `@click` ไม่ได้เช็คเงื่อนไขเดียวกัน → กดทะลุเข้าไปทำแบบฝึกหัดที่ล็อกอยู่ได้_

## Security & Hygiene

- **ห้าม commit URL ของ local emulator หรือ IP เครื่องตัวเอง** ใช้ env var เสมอ ถ้าต้องการ URL local ให้เก็บไว้เป็นคอมเมนต์
  _เคสจริง: เจอ `http://192.168.1.45:5001/...` hardcode ค้าง 4 จุดใน store ถ้าขึ้น production คือพังทั้งระบบ_

- **ลบ debug log ก่อน merge** (`console.log("*** ...")` และเพื่อน ๆ)
  _เคสจริง: เจอค้าง 19 บรรทัดใน Cloud Function ที่กำลังจะ deploy_
