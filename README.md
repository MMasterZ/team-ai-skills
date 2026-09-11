# @mmasterz/team-ai-skills

แพ็กเกจกลางสำหรับแจก **AI coding rules ของทีม** ไปยังทุกโปรเจกต์ เขียนกฎไว้ที่เดียว ทุกโปรเจกต์ที่ `npm install` แพ็กเกจนี้จะได้ไฟล์ rules ติดไปอัตโนมัติ ไม่ต้องก๊อปมือทีละ repo

Source of truth มีไฟล์เดียวคือ [`rules/team-guidelines.md`](rules/team-guidelines.md)

---

## Install (ในโปรเจกต์ปลายทาง)

ลงตรงจาก git tag ของ repo นี้ **ไม่ต้องใช้ token ไม่ต้องตั้ง registry ไม่ต้องมี `.npmrc`**

```bash
npm install "github:MMasterZ/team-ai-skills#semver:^1.2.0" --save-dev
```

pnpm

```bash
pnpm add -D "github:MMasterZ/team-ai-skills#semver:^1.2.0"
```

ถ้าสำเร็จจะเห็นบรรทัดนี้ พร้อมบอกเวอร์ชันที่ได้ไป

```
✅ @mmasterz/team-ai-skills@1.2.1 installed: .cursorrules, 1 skill file(s), 2 hook(s)
```

ไม่เห็นบรรทัดนี้ = ยังไม่ได้ลง ดู [Troubleshooting](#troubleshooting)

### `#semver:` ห้ามลืม

ส่วนนี้คือหัวใจ ถ้าไม่ใส่ `npm update` จะไม่มีวันทำงาน

```json
"github:MMasterZ/team-ai-skills#semver:^1.2.0"   // ✅ ไล่ตาม git tag ให้เอง
"github:MMasterZ/team-ai-skills"                 // ❌ ค้างเวอร์ชันเดิมถาวร
```

แบบล่างไม่มีเลขให้ npm เทียบ มันเลยไม่รู้ว่ามีของใหม่ ลงผิดไปแล้วดู [Troubleshooting](#troubleshooting)

### ทางเลือก: GitHub Packages (ต้องใช้ token)

ไม่จำเป็นต้องใช้ เก็บไว้เผื่อวันที่ repo ต้องเปลี่ยนเป็น private

<details>
<summary>กดดูวิธี</summary>

GitHub Packages **บังคับ token เสมอ** ต่อให้ repo เป็น public ก็ตาม

1. สร้าง PAT (classic) ที่ Settings → Developer settings → Tokens ให้สิทธิ์ **`read:packages`** พอ
2. เก็บ token ไว้ที่ `~/.npmrc` ระดับเครื่อง อย่าไว้ในโปรเจกต์

   ```bash
   npm config set @mmasterz:registry https://npm.pkg.github.com
   npm config set //npm.pkg.github.com/:_authToken <YOUR_TOKEN>
   ```

3. ลง

   ```bash
   npm install @mmasterz/team-ai-skills --save-dev
   ```

> ⚠️ ถ้าจำเป็นต้องมี `.npmrc` ในโปรเจกต์จริง ๆ **ต้องใส่ `.npmrc` ใน `.gitignore` ก่อนเสมอ**
> token ที่หลุดขึ้น GitHub ถือว่าใช้ไม่ได้แล้ว ต้อง revoke แล้วออกใหม่ ไม่ใช่แค่ลบ commit

</details>

## ตั้งให้อัปเดตอัตโนมัติ (แนะนำ)

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

จากนั้น **bump version แล้ว push tag** — ทีมไล่ตาม git tag เพราะฉะนั้น tag คือตัวปล่อยของ ไม่มี tag = ไม่มีใครได้ของใหม่

```bash
npm version patch      # หรือ minor / major — สร้าง commit + tag ให้เอง
git push --follow-tags
```

`--follow-tags` ลืมไม่ได้ ถ้าลืม tag จะค้างอยู่ในเครื่องตัวเอง ทีมมองไม่เห็น

แล้วบอกทีมให้รัน

```bash
npm update @mmasterz/team-ai-skills
```

หรือไม่ต้องบอกก็ได้ ถ้าเขาตั้ง auto-update ไว้แล้ว

### เช็คว่า tag ขึ้นไปจริง

```bash
git ls-remote --tags origin
```

ต้องเห็น tag ตัวใหม่ล่าสุด

<details>
<summary>ถ้ายังใช้ GitHub Packages คู่กันอยู่ด้วย</summary>

ต้อง `npm publish` เพิ่มอีกขั้น และ token ต้องมีสิทธิ์ `write:packages` (คนละตัวกับที่ทีมใช้ติดตั้ง)

```bash
npm publish
npm pack --dry-run    # เช็คไฟล์ก่อน: ต้องมี rules/ .claude/ และต้องไม่มี .npmrc
```

npm **ห้าม publish ทับ version เดิมเด็ดขาด** ต้อง bump ทุกครั้ง

</details>

---

## Troubleshooting

### `npm update` ไม่ทำงาน ค้างเวอร์ชันเดิมตลอด

เปิด `package.json` ดูบรรทัด dependency ถ้าเป็นแบบนี้คือขาด `#semver:`

```json
"@mmasterz/team-ai-skills": "github:MMasterZ/team-ai-skills"
```

npm ไม่มีเลขให้เทียบ เลยไม่รู้ว่ามีของใหม่ แก้โดยลงใหม่ให้มี `#semver:`

```bash
npm uninstall @mmasterz/team-ai-skills
npm install "github:MMasterZ/team-ai-skills#semver:^1.2.0" --save-dev
```

pnpm ใช้

```bash
pnpm remove @mmasterz/team-ai-skills
pnpm add -D "github:MMasterZ/team-ai-skills#semver:^1.2.0"
```

เสร็จแล้วเช็คว่าบรรทัดนั้นมี `#semver:` ต่อท้ายจริง

> เครื่องหมาย `"` ครอบ URL ห้ามลืม ถ้าไม่ครอบ shell บางตัวจะกิน `#` ทิ้ง แล้วกลายเป็นไม่มี semver อีก

### ลงแล้วแต่ไม่เห็นบรรทัด `✅`

`postinstall` ไม่ได้รัน เช็ค 2 อย่าง

- ตั้ง `--ignore-scripts` ไว้หรือเปล่า (`npm config get ignore-scripts`)
- ใช้ `npm ci` หรือเปล่า — `npm ci` รัน postinstall แต่ลงตาม lock เป๊ะ ไม่ดึงเวอร์ชันใหม่

### เห็น `1 hook(s)` แทนที่จะเป็น `2 hook(s)`

ยังได้ของเก่าอยู่ ต้องได้ `1.2.0` ขึ้นไป

```bash
npm install "github:MMasterZ/team-ai-skills#semver:^1.2.0" --save-dev
```

---

## Limitations (รู้ไว้ก่อนใช้)

- **เขียน `.cursorrules` ทับทุกครั้งที่ install** ถ้าโปรเจกต์ไหนมี `.cursorrules` เฉพาะของตัวเอง จะโดนทับหายทันที (ต่างจาก `settings.json` ที่ merge ให้) — ของเฉพาะโปรเจกต์ให้ไปไว้ใน `CLAUDE.md` แทน
- **ไฟล์ skill ชื่อซ้ำจะถูกทับ** ถ้าโปรเจกต์ปลายทางมี `.claude/skills/caveman/` ของตัวเองอยู่ จะโดนของแพ็กเกจทับ
- **ยังไม่แจก `CLAUDE.md`** rules หลักไปถึง Claude Code ผ่าน skill กับ hook แล้ว แต่ตัว `rules/team-guidelines.md` เต็ม ๆ ยังไม่ได้ถูกวางเป็น `CLAUDE.md` ที่ปลายทาง — ดู [Roadmap](#roadmap)
- **ถ้า postinstall ล้มเหลว จะไม่ทำให้ install พัง** `try/catch` กลืน error ไว้ ข้อดีคือ `npm install` ไม่เจ๊ง ข้อเสียคืออาจไม่มีใครสังเกตว่าของไม่ได้ลง ให้ดูบรรทัด `✅ Team AI Rules installed: ...` ตอน install
- **hook ที่เพิ่งติดตั้งอาจยังไม่ทำงานใน session ที่เปิดค้างอยู่** ให้เปิด `/hooks` หนึ่งครั้งหรือเริ่ม session ใหม่
- **วิธีลงจาก git tag ต้องมี `git` ในเครื่อง และ repo ต้องเป็น public** ถ้าวันหนึ่งต้องเปลี่ยน repo เป็น private ต้องย้ายไปใช้ GitHub Packages + token แทน
- **ลงจาก git จะได้ทั้ง repo ไม่สนใจ `files` ใน `package.json`** ตอนนี้ทั้งแพ็กเกจ 35 kB เลยไม่กระทบอะไร

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
└── .gitignore                    # กัน .npmrc หลุด

# .npmrc ไม่จำเป็นแล้ว ใช้เฉพาะตอนจะ npm publish ขึ้น GitHub Packages
```
