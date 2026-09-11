# @mmasterz/team-ai-skills

แพ็กเกจกลางสำหรับแจก **AI coding rules ของทีม** ไปยังทุกโปรเจกต์ เขียนกฎไว้ที่เดียว ทุกโปรเจกต์ที่ `npm install` แพ็กเกจนี้จะได้ไฟล์ rules ติดไปอัตโนมัติ ไม่ต้องก๊อปมือทีละ repo

Source of truth มีไฟล์เดียวคือ [`rules/team-guidelines.md`](rules/team-guidelines.md)

---

## Install (ในโปรเจกต์ปลายทาง)

แพ็กเกจอยู่บน **GitHub Packages** (private registry) ไม่ใช่ npm สาธารณะ ต้องตั้งค่า registry + token ก่อน

### 1. สร้าง GitHub Personal Access Token

สร้าง PAT (classic) ที่ Settings → Developer settings → Tokens ให้สิทธิ์ **`read:packages`** อย่างเดียวพอ

### 2. ใส่ token ไว้ที่ user-level ไม่ใช่ในโปรเจกต์

วิธีที่ปลอดภัยที่สุดคือเก็บ token ไว้ที่ `~/.npmrc` (เครื่องละครั้ง ใช้ได้ทุกโปรเจกต์) แล้ว **ไม่ต้องมีไฟล์ `.npmrc` ในโปรเจกต์เลย**

```bash
npm config set @mmasterz:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken <YOUR_TOKEN>
```

> ⚠️ ถ้าจำเป็นต้องสร้าง `.npmrc` ในโปรเจกต์จริง ๆ **ต้องใส่ `.npmrc` ใน `.gitignore` ก่อนเสมอ**
> token ที่หลุดขึ้น GitHub ถือว่าใช้ไม่ได้แล้ว ต้อง revoke แล้วออกใหม่ ไม่ใช่แค่ลบ commit

### 3. ติดตั้ง

```bash
npm install @mmasterz/team-ai-skills --save-dev
```

ถ้าสำเร็จจะเห็น `✅ Team AI Rules installed successfully!` และมีไฟล์ `.cursorrules` โผล่ที่ root ของโปรเจกต์

---

## How it works

```
npm install
  └─ postinstall → node install-rules.js
       ├─ เช็คว่าตัวเองอยู่ใน node_modules ไหม (ถ้าไม่ใช่ = กำลัง dev ใน repo นี้ → ไม่ทำอะไร)
       ├─ ถอยขึ้นไป 3 ชั้นจาก node_modules/@mmasterz/team-ai-skills เพื่อหา root ของโปรเจกต์
       └─ copy rules/team-guidelines.md → <project-root>/.cursorrules
```

ทั้งหมดอยู่ใน [`install-rules.js`](install-rules.js) ~18 บรรทัด ไม่มี dependency

---

## How to update rules

1. แก้ [`rules/team-guidelines.md`](rules/team-guidelines.md)
2. bump version ใน `package.json` — **ข้อนี้ลืมไม่ได้** ถ้า version เท่าเดิม npm จะไม่ยอม publish และเครื่องทีมก็จะไม่ดึงของใหม่
3. publish

   ```bash
   npm version patch      # หรือ minor / major
   npm publish
   git push --follow-tags
   ```
4. บอกทีมให้รัน

   ```bash
   npm update @mmasterz/team-ai-skills
   ```

   `postinstall` จะยิงอีกรอบแล้วเขียน `.cursorrules` ทับให้เอง

> การ publish ต้องใช้ token ที่มีสิทธิ์ `write:packages` (คนละตัวกับที่ทีมใช้ติดตั้ง)

---

## Limitations (รู้ไว้ก่อนใช้)

- **เขียน `.cursorrules` ทับทุกครั้งที่ install** ถ้าโปรเจกต์ไหนมี `.cursorrules` เฉพาะของตัวเอง จะโดนทับหายทันที ตอนนี้ยังไม่มีกลไก merge หรือสำรองไฟล์เดิม
- **ยังไม่รองรับ Claude Code** installer เขียนเฉพาะ `.cursorrules` ซึ่งมีแต่ Cursor ที่อ่าน ส่วน Claude Code อ่าน `CLAUDE.md` แปลว่าตอนนี้ rules ไปไม่ถึง Claude Code เลย ทั้งที่ทีมใช้ทั้งสองตัวคู่กัน (Claude Code รันใน terminal ของ Cursor) — ดู [Roadmap](#roadmap)
- **ผูกกับโครงสร้าง `node_modules` แบบ npm** โค้ดถอยขึ้น 3 ชั้นตรง ๆ ถ้าทีมย้ายไป pnpm (ซึ่งวางแพ็กเกจคนละแบบ) path จะเพี้ยน ควรเปลี่ยนไปใช้ env var `INIT_CWD` ที่ npm/yarn/pnpm ตั้งให้อยู่แล้ว
- **ถ้า postinstall ล้มเหลว จะไม่ทำให้ install พัง** ตัว `try/catch` กลืน error ไว้ ข้อดีคือ `npm install` ไม่เจ๊ง ข้อเสียคืออาจไม่มีใครสังเกตว่า rules ไม่ได้ลง

---

## Roadmap

- [ ] เขียน `CLAUDE.md` เพิ่มจาก source เดียวกัน โดย **append ใต้ marker** ไม่ใช่ copy ทับ เพราะโปรเจกต์ปลายทางมักมี `CLAUDE.md` เฉพาะของตัวเอง (คำสั่ง build, สถาปัตยกรรม ฯลฯ) ที่ห้ามหาย:

  ```
  <!-- BEGIN team-ai-skills (auto-generated, do not edit) -->
  ...เนื้อหาจาก rules/team-guidelines.md...
  <!-- END team-ai-skills -->
  ```

  รอบถัดไปแทนที่เฉพาะช่วงระหว่าง marker ถ้ายังไม่มี marker ค่อย append ต่อท้าย — แบบนี้รัน `npm install` กี่รอบไฟล์ก็ไม่บวม
- [ ] ใช้ `INIT_CWD` แทนการถอย path 3 ชั้น
- [ ] พิจารณา Cursor Project Rules (`.cursor/rules/*.mdc`) ซึ่งกำหนด scope ต่อ glob ได้ — **ต้องเช็คเวอร์ชัน Cursor ที่ทีมใช้ก่อน** ว่ารองรับหรือยัง ถ้าทำควรเขียนคู่กับ `.cursorrules` ไว้ก่อนเพื่อ backward compat

---

## Repo layout

```
team-ai-skills/
├── install-rules.js          # postinstall script
├── package.json
├── rules/
│   └── team-guidelines.md    # ← แก้กฎที่นี่ที่เดียว
├── .gitignore                # กัน .npmrc หลุด
└── .npmrc                    # (local only, gitignored) registry + token
```
