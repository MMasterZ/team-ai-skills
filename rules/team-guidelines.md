# Team AI Coding Standards

- Frontend: Vue 3 (Composition API), Quasar Framework, TypeScript
- Backend: Node.js, Firebase (Firestore, Cloud Functions)

## Coding Rules
- ห้ามเขียนโค้ดที่ซับซ้อนเกินจำเป็น (Overengineering) เน้นโครงสร้างเรียบง่ายที่มนุษย์อ่านเข้าใจและแก้ไขต่อได้
- หากมีการทำงานกับ UI ให้ใช้ Layout และ Component มาตรฐานของ Quasar เสมอ
- การจัดการ State ให้หลีกเลี่ยงวิธีที่ซับซ้อน ให้ใช้ Vue Reactivity ปกติก่อน
- ฟังก์ชันและตัวแปรต้องตั้งชื่อเป็นภาษาอังกฤษแบบ camelCase ที่สื่อความหมายชัดเจน
- ต้องคอมเมนต์อธิบาย Logic หรือ Business Rule ที่สำคัญเป็น "ภาษาไทย" เสมอ
- เมื่อต้องการเรียกใช้งานให้ force ไปที่ `/caveman` เท่านั้น

---

# คู่มือมาตรฐานการพัฒนาโค้ดสำหรับ Vue.js และการทำงานร่วมกับ AI

(Vue.js & AI-Assisted Engineering Standards)

## 1. วัตถุประสงค์ (Objective)

สร้างมาตรฐานกลางในการพัฒนาเว็บแอปพลิเคชันด้วย Vue.js (TypeScript) ทั้งสำหรับการเขียนโค้ดโดยนักพัฒนา และการควบคุม AI Assistants ให้สร้างโค้ดที่มีโครงสร้างเดียวกัน ปลอดภัย ประสิทธิภาพสูง และส่งต่องานได้ทันทีโดยไม่มีข้อขัดแย้งเรื่อง Base Code

---

## 2. โครงสร้างและการจัดรูปแบบโค้ด (Vue.js Code Style & Formatting)

- **เครื่องมือบังคับใช้อัตโนมัติ (Automated Tooling):**
    - ใช้ **ESLint** (ร่วมกับ `@vue/eslint-config-typescript`) และ **Prettier** จัดรูปแบบโค้ด
    - ตั้งค่า **Pre-commit Hook** (Husky + lint-staged) ตรวจสอบไฟล์ `.vue`, `.ts`, `.js` ก่อน Commit
- **รูปแบบ Component:**
    - บังคับใช้ **Single File Component (SFC)** ร่วมกับ **`<script setup lang="ts">`** เท่านั้น (ห้ามใช้ Options API ในโปรเจกต์ใหม่)
    - ลำดับแท็กใน SFC: `<script setup lang="ts">` -> `<template>` -> `<style scoped>`
- **การตั้งชื่อ (Naming Conventions):**
    - Component files: ใช้ **PascalCase** เสมอ (เช่น `UserProfileCard.vue`, `AgentMetricChart.vue`) ห้ามใช้คำเดี่ยวตามกฎของ Vue
    - Composable functions: ใช้ camelCase ขึ้นต้นด้วย `use` เสมอ (เช่น `useAgentSession.ts`)
    - ตัวแปรและฟังก์ชัน: ใช้ `camelCase`
    - Props & Emits: Props ใช้ `camelCase` ใน script แต่เป็น `kebab-case` ใน template / Emits ใช้ `kebab-case` หรือ `camelCase` ตามข้อตกลงทีม
- **โครงสร้างโฟลเดอร์ (Folder Architecture):**
    - `src/components/` แยกย่อยตาม Domain หรือ UI Components กลาง
    - `src/composables/` เก็บ State/Logic ที่นำกลับมาใช้ซ้ำได้
    - `src/stores/` เก็บ Pinia stores
    - `src/types/` หรือ `src/models/` เก็บ TypeScript Interfaces/Types
    - `src/services/` หรือ `src/api/` เก็บ Logic การยิง API และติดต่อระบบภายนอก

---

## 3. ความปลอดภัยของข้อมูลและประเภท (TypeScript & Vue Typing)

- **Strict Typing:**
    - เปิด `strict: true` ใน `tsconfig.json` และ **ห้ามใช้ `any` เด็ดขาด** (ใช้ `unknown` ร่วมกับ Type Narrowing หากยังไม่ทราบประเภทข้อมูล)
- **Props & Emits Definition:**
    - กำหนด Props ด้วย Type-based Declaration เท่านั้น:
    `defineProps<{ title: string; count?: number }>()`
    - กำหนด Emits ด้วย Type-based:
    `defineEmits<{ (e: 'update', value: string): void }>()`
- **Data Models:**
    - กำหนด Interface หรือ Type ชัดเจนสำหรับ Entity ทุกตัว เช่น Interface ของ Agent, Metrics, User Data

---

## 4. สถาปัตยกรรมและ State Management (Vue Architecture)

- **Pinia State Management:**
    - จัดการ Global State ด้วย **Pinia** (Setup Store syntax หรือ Option syntax ให้ตรงกันทั้งทีม แนะนำ Setup Store)
    - ห้าม Mutate State ข้าม Store โดยตรง ให้ทำผ่าน Actions
- **Composables vs Components:**
    - ดึง Business Logic ที่ซับซ้อนออกจากไฟล์ `.vue` ไปไว้ใน `composables/` เพื่อให้ Component ทำหน้าที่เฉพาะการแสดงผล (Presentation Layer)
- **Scoped Styles:**
    - บังคับใช้ `<style scoped>` ทุก Component เสมอ ป้องกัน CSS รั่วไหลไปกระทบ Component อื่น

---

## 5. การจัดการข้อผิดพลาดและบันทึกระบบ (Error Handling & Logging)

- **Global Error Boundary:**
    - ติดตั้ง `app.config.errorHandler` ในระดับ Root เพื่อดักจับ Error ที่หลุดมาจาก Vue Component Tree
- **No Silent Failures:**
    - ห้ามปล่อย `catch (error) {}` ว่างเปล่า ต้องมี UI Feedback (เช่น Toast, Notification, Error State) แจ้งเตือนผู้ใช้เสมอ
- **Structured Logging:**
    - สร้าง Logging Utility กลาง ห้ามใช้ `console.log()` ทิ้งไว้ในโค้ด Production

---

## 6. การทดสอบและเกณฑ์เสร็จสมบูรณ์ (Testing & Definition of Done)

- **Definition of Done (DoD):**
    1. โค้ดผ่าน `vue-tsc --noEmit` (Type Check) และ ESLint 100%
    2. Component มี Unit Test ด้วย **Vitest** และ **Vue Test Utils** ครอบคลุมพฤติกรรมหลัก
    3. สามารถ Build ผ่านคำสั่ง `vite build` ได้โดยไม่มี Error
- **Mocking API:**
    - Mock Network Request ด้วย MSW (Mock Service Worker) หรือ Vitest Spies ห้ามยิง API Production ในเทสต์

---

## 7. วินัยการใช้งาน Git และการรีวิวโค้ด (Git Hygiene & Code Review)

- **Conventional Commits:** ใช้รูปแบบสากล `feat:`, `fix:`, `refactor:`, `style:`, `chore:`
- **PR Rules:**
    - ห้าม Push เข้า `main` หรือ `develop` โดยตรง
    - แนบภาพ Screenshot หรือ Video ใน PR หากมีการเปลี่ยนแปลงด้าน UI/UX

---

## 8. กฎการควบคุม AI สำหรับงาน Vue.js (AI Guardrails in Vue Development)

- **โหมดการเรียกใช้งาน AI (AI Invocation Mode):**
    - เมื่อต้องการเรียกใช้งานให้ force ไปที่ `/caveman` เท่านั้น
- **AI Context Files (`.cursorrules` / Copilot System Prompt):**
    - กำหนดชัดเจนใน System Prompt ว่า:
        - "You must write Vue 3 using `<script setup lang=\"ts\">` only. Never use Vue 2 or Options API."
        - "Always use Pinia for global state, and Vitest for testing."
        - "Always define typed props using `defineProps<{...}>`."
- **ป้องกัน AI Hallucination & Code Bloat:**
    - ห้าม AI แอบ Import ไลบรารีภายนอกที่ไม่ได้ระบุใน `package.json`
    - สั่ง AI ห้ามสร้างตัวแปร `ref` ซ้ำซ้อน และใช้ `computed` อย่างถูกต้อง หลีกเลี่ยง Memory Leak จาก Watcher ที่ไม่จำเป็น
- **Human Accountability:**
    - ผู้พัฒนาต้องตรวจสอบ Re-rendering behavior และ Lifecycle hooks (`onMounted`, `onUnmounted`) ของโค้ดที่ AI สร้างขึ้นเสมอ เพื่อป้องกัน Event Listener หรือ Timer ค้าง

