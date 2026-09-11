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

ถ้าสำเร็จจะเห็นบรรทัดนี้ พร้อมบอกเวอร์ชันที่ได้ไป

```
✅ @mmasterz/team-ai-skills@1.1.0 installed: .cursorrules, 1 skill file(s), 1 hook(s)
```

ไม่เห็นบรรทัดนี้ = ยังไม่ได้ลง

### 4. ตั้งให้อัปเดตอัตโนมัติ (แนะนำ)

npm **ไม่อัปเดตเอง** ถ้าไม่ตั้งอะไรเลย ทีมจะค้างอยู่เวอร์ชันเดิมจนกว่าจะมีคนสั่ง `npm update` เอง

**คนที่ใช้ Claude Code ไม่ต้องทำอะไร** แพ็กเกจแถม `SessionStart` hook มาให้แล้ว ทุกครั้งที่เปิด session มันรัน `npm update` ให้เองเบื้องหลัง (`async` ไม่ทำให้เปิดช้า)

ขั้นตอนข้างล่างนี้มีไว้กันพลาดสำหรับ **คนที่ใช้ Cursor อย่างเดียว ไม่ได้เปิด Claude Code** — วิธีที่ตรงกับงานที่สุดคือผูกไว้กับคำสั่งที่ทุกคนต้องรันอยู่แล้วทุกวัน — `npm run dev`

เพิ่มใน `package.json` ของโปรเจกต์ปลายทาง

```json
{
  "scripts": {
    "predev": "npm update @mmasterz/team-ai-skills || true",
    "dev": "quasar dev"
  }
}
```

npm รัน `predev` ให้อัตโนมัติก่อน `dev` เสมอ ไม่ต้องจำอะไรเพิ่ม

- `|| true` สำคัญมาก — เน็ตล่ม, token หมดอายุ, registry ล่ม จะได้ไม่บล็อกไม่ให้เปิด dev
- แลกมาด้วยเวลาเปิด dev ช้าขึ้นเล็กน้อย และต้องต่อเน็ต

**ต้องเช็คด้วยว่า version range เป็น `^`** ไม่งั้น `npm update` ขยับไม่ได้

```json
"@mmasterz/team-ai-skills": "^1.1.0"   // ✅ ขยับตามได้
"@mmasterz/team-ai-skills": "1.1.0"    // ❌ ตรึงตาย ไม่ขยับ
```

ถ้าลืมใส่ `predev` ตัว installer จะเตือนให้ตอน `npm install` (เตือนอย่างเดียว **ไม่แก้ `package.json` ให้**  เพราะตอนติดตั้ง npm ก็กำลังเขียนไฟล์นั้นอยู่เหมือนกัน เขียนชนกันแล้วของหาย)

> `npm ci` ลงตาม `package-lock.json` เป๊ะ ๆ และไม่รัน `predev` ด้วย ถ้า CI ใช้ `npm ci` เครื่อง CI จะไม่ได้ rules เวอร์ชันใหม่ — ปกติไม่เป็นปัญหา เพราะ rules มีไว้ให้คนเขียนโค้ด ไม่ใช่ให้ CI

---

## How it works

```
npm install
  └─ postinstall → node install-rules.js
       ├─ ทำงานเฉพาะตอนอยู่ใน node_modules (ไม่งั้นคือกำลัง dev ในแพ็กเกจเอง → ข้าม)
       ├─ หา root ปลายทางจาก INIT_CWD (fallback: ถอยขึ้น 3 ชั้น)
       ├─ rules/team-guidelines.md  →  <root>/.cursorrules            (Cursor อ่าน)
       ├─ .claude/skills/**         →  <root>/.claude/skills/**       (Claude Code อ่าน)
       └─ hooks ใน .claude/settings.json  →  merge เข้า <root>/.claude/settings.json
```

ทั้งหมดอยู่ใน [`install-rules.js`](install-rules.js) ไม่มี dependency

### การ merge hooks ปลอดภัยแค่ไหน

installer **ไม่เขียนทับ** `.claude/settings.json` ของปลายทาง แต่อ่านมา merge แล้วเขียนกลับ:

- `permissions` และ settings อื่น ๆ ของโปรเจกต์ปลายทาง ไม่ถูกแตะ
- hook ที่ผู้ใช้เขียนเอง ไม่ถูกลบ
- hook ของแพ็กเกจอื่น ไม่ถูกลบ (แยกกันด้วย tag ใน `statusMessage`)
- รัน `npm install` ซ้ำกี่รอบ hook ของแพ็กเกจนี้ก็มีตัวเดียว ไม่ซ้ำ ไม่บวม
- ถ้า `settings.json` เดิมพังจน parse ไม่ได้ จะข้ามไปเฉย ๆ ไม่เขียนทับ

hook ที่แพ็กเกจนี้ใส่จะติด tag `team-ai-skills:` เสมอ ใครอยากเอาออกก็ลบ entry นั้นได้ตรง ๆ หรือดูผ่าน `/hooks`

---

## What gets installed

| ไฟล์ปลายทาง | ใครอ่าน | มาจาก |
|---|---|---|
| `.cursorrules` | Cursor | `rules/team-guidelines.md` |
| `.claude/skills/*/SKILL.md` | Claude Code | `.claude/skills/` ในแพ็กเกจ |
| `.claude/settings.json` (เฉพาะส่วน `hooks`) | Claude Code | `.claude/settings.json` ในแพ็กเกจ |

### Hooks ที่แจกอยู่ตอนนี้

| tag | event | ทำอะไร |
|---|---|---|
| `team-ai-skills:caveman` | `UserPromptSubmit` | บังคับสไตล์ caveman ทุกคำถาม |
| `team-ai-skills:autoupdate` | `SessionStart` | รัน `npm update` เบื้องหลังทุกครั้งที่เปิด session |

### Skills ที่แจกอยู่ตอนนี้

- **`/caveman`** — ตอบสั้น ห้วน คำง่าย ไม่มีน้ำ
  มาพร้อม `UserPromptSubmit` hook ที่ **บังคับใช้สไตล์นี้ทุกคำถามอัตโนมัติ** ไม่ต้องพิมพ์ `/caveman` เอง
  hook กำกับไว้ว่าห้ามใช้สไตล์นี้กับ code block, path, ชื่อตัวแปร, คำสั่ง, เลขเวอร์ชัน และ error message — ของพวกนี้ต้องตรงเป๊ะเสมอ

---

## How to add a new rule or skill

**เพิ่ม/แก้ rules:** แก้ [`rules/team-guidelines.md`](rules/team-guidelines.md)

**เพิ่ม skill ใหม่:** สร้างโฟลเดอร์ใน `.claude/skills/<ชื่อ>/SKILL.md` — installer ก๊อปทุกอย่างในนั้นให้เอง **ไม่ต้องแก้ `install-rules.js`**

**เพิ่ม hook ใหม่:** เพิ่มใน `.claude/settings.json` ของแพ็กเกจ และตั้ง `statusMessage` ขึ้นต้นด้วย `team-ai-skills:` เสมอ ไม่งั้นระบบ merge จะจำไม่ได้ว่าเป็นของเราแล้วจะเกิด hook ซ้ำทุกครั้งที่ install

จากนั้น **bump version แล้ว publish** — ข้อนี้ลืมไม่ได้ ถ้า version เท่าเดิม npm จะไม่ยอม publish และเครื่องทีมก็จะไม่ดึงของใหม่

```bash
npm version patch      # หรือ minor / major
npm publish
git push --follow-tags
```

แล้วบอกทีมให้รัน

```bash
npm update @mmasterz/team-ai-skills
```

> การ publish ต้องใช้ token ที่มีสิทธิ์ `write:packages` (คนละตัวกับที่ทีมใช้ติดตั้ง)

### เช็คก่อน publish ว่าไฟล์ครบ

```bash
npm pack --dry-run
```

ต้องเห็น `rules/`, `.claude/skills/`, `.claude/settings.json` และต้อง **ไม่เห็น `.npmrc`**

---

## Limitations (รู้ไว้ก่อนใช้)

- **เขียน `.cursorrules` ทับทุกครั้งที่ install** ถ้าโปรเจกต์ไหนมี `.cursorrules` เฉพาะของตัวเอง จะโดนทับหายทันที (ต่างจาก `settings.json` ที่ merge ให้) — ของเฉพาะโปรเจกต์ให้ไปไว้ใน `CLAUDE.md` แทน
- **ไฟล์ skill ชื่อซ้ำจะถูกทับ** ถ้าโปรเจกต์ปลายทางมี `.claude/skills/caveman/` ของตัวเองอยู่ จะโดนของแพ็กเกจทับ
- **ยังไม่แจก `CLAUDE.md`** rules หลักไปถึง Claude Code ผ่าน skill กับ hook แล้ว แต่ตัว `rules/team-guidelines.md` เต็ม ๆ ยังไม่ได้ถูกวางเป็น `CLAUDE.md` ที่ปลายทาง — ดู [Roadmap](#roadmap)
- **ถ้า postinstall ล้มเหลว จะไม่ทำให้ install พัง** `try/catch` กลืน error ไว้ ข้อดีคือ `npm install` ไม่เจ๊ง ข้อเสียคืออาจไม่มีใครสังเกตว่าของไม่ได้ลง ให้ดูบรรทัด `✅ Team AI Rules installed: ...` ตอน install
- **hook ที่เพิ่งติดตั้งอาจยังไม่ทำงานใน session ที่เปิดค้างอยู่** ให้เปิด `/hooks` หนึ่งครั้งหรือเริ่ม session ใหม่

---

## Roadmap

- [ ] แจก `rules/team-guidelines.md` เป็น `CLAUDE.md` ที่ปลายทางด้วย โดย **append ใต้ marker** ไม่ใช่ copy ทับ เพราะโปรเจกต์ปลายทางมักมี `CLAUDE.md` เฉพาะของตัวเอง (คำสั่ง build, สถาปัตยกรรม ฯลฯ) ที่ห้ามหาย:

  ```
  <!-- BEGIN team-ai-skills (auto-generated, do not edit) -->
  ...เนื้อหาจาก rules/team-guidelines.md...
  <!-- END team-ai-skills -->
  ```

  รอบถัดไปแทนที่เฉพาะช่วงระหว่าง marker ถ้ายังไม่มี marker ค่อย append ต่อท้าย — แบบเดียวกับที่ `settings.json` ทำอยู่แล้ว
- [ ] `.cursorrules` ควร merge แทนการเขียนทับ เหมือนที่ `settings.json` ทำ
- [ ] พิจารณา Cursor Project Rules (`.cursor/rules/*.mdc`) ซึ่งกำหนด scope ต่อ glob ได้ — **ต้องเช็คเวอร์ชัน Cursor ที่ทีมใช้ก่อน** ว่ารองรับหรือยัง ถ้าทำควรเขียนคู่กับ `.cursorrules` ไว้ก่อนเพื่อ backward compat

---

## Repo layout

```
team-ai-skills/
├── install-rules.js              # postinstall script
├── package.json                  # "files" คุมว่าอะไรถูก publish
├── rules/
│   └── team-guidelines.md        # ← แก้กฎที่นี่ (→ .cursorrules)
├── .claude/
│   ├── settings.json             # ← hooks ที่จะแจก (tag: team-ai-skills:)
│   └── skills/
│       └── caveman/SKILL.md      # ← วางโฟลเดอร์ skill เพิ่มได้เลย
├── .gitignore                    # กัน .npmrc หลุด
└── .npmrc                        # (local only, gitignored) registry + token
```
