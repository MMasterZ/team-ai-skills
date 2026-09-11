# Team AI Coding Standards

- Frontend: Vue 3 (Composition API), Quasar Framework, TypeScript
- Backend: Node.js, Firebase (Firestore, Cloud Functions)

## Coding Rules
- ห้ามเขียนโค้ดที่ซับซ้อนเกินจำเป็น (Overengineering) เน้นโครงสร้างเรียบง่ายที่มนุษย์อ่านเข้าใจและแก้ไขต่อได้
- หากมีการทำงานกับ UI ให้ใช้ Layout และ Component มาตรฐานของ Quasar เสมอ
- การจัดการ State ให้หลีกเลี่ยงวิธีที่ซับซ้อน ให้ใช้ Vue Reactivity ปกติก่อน
- ฟังก์ชันและตัวแปรต้องตั้งชื่อเป็นภาษาอังกฤษแบบ camelCase ที่สื่อความหมายชัดเจน
- ต้องคอมเมนต์อธิบาย Logic หรือ Business Rule ที่สำคัญเป็น "ภาษาไทย" เสมอ