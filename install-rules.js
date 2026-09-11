const fs = require('fs');
const path = require('path');

// tag ประจำแพ็กเกจ ใช้ทำเครื่องหมาย hook ที่แพ็กเกจนี้เป็นคนใส่
// แพ็กเกจอื่นในอนาคตให้ใช้ tag ของตัวเอง จะได้ไม่ลบ hook ของกันและกัน
const TAG = 'team-ai-skills';

// อ่านชื่อกับเวอร์ชันจาก package.json เพื่อเอาไปโชว์ตอนติดตั้งเสร็จ
// ทีมจะได้เห็นว่าเครื่องตัวเองได้ rules เวอร์ชันไหนไปแล้ว
const pkg = require('./package.json');

// หา root ของโปรเจกต์ปลายทาง
// INIT_CWD คือโฟลเดอร์ที่ผู้ใช้รัน npm install (npm / yarn / pnpm ตั้งให้เหมือนกัน)
// ถ้าไม่มีค่อยถอยขึ้น 3 ชั้นจาก node_modules/@scope/package
function resolveProjectRoot() {
  const initCwd = process.env.INIT_CWD;
  if (initCwd && !initCwd.includes('node_modules')) return initCwd;
  return path.resolve(__dirname, '../../..');
}

// ก๊อปปี้ทั้งโฟลเดอร์แบบ recursive (เขียนเองเพื่อให้รองรับ Node เวอร์ชันเก่าด้วย)
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
      count++;
    }
  }
  return count;
}

// ใส่ hooks ลง .claude/settings.json ของโปรเจกต์ปลายทาง
// สำคัญ: ต้อง merge ไม่ใช่เขียนทับ เพราะปลายทางอาจมี settings ของตัวเองอยู่แล้ว
// และต้อง idempotent — รัน npm install กี่รอบ hook ก็ไม่ซ้ำ
function mergeHooks(projectRoot, sourceHooks) {
  const settingsFile = path.join(projectRoot, '.claude', 'settings.json');
  let settings = {};

  if (fs.existsSync(settingsFile)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } catch (e) {
      // ไฟล์เดิมพัง อ่านไม่ออก — ข้ามไปเลย ดีกว่าเขียนทับจนของทีมหาย
      console.warn('⚠️  .claude/settings.json อ่านไม่ออก ข้ามการติดตั้ง hooks');
      return 0;
    }
  }

  settings.hooks = settings.hooks || {};
  let installed = 0;

  for (const event of Object.keys(sourceHooks)) {
    const existing = Array.isArray(settings.hooks[event]) ? settings.hooks[event] : [];

    // เอาของเดิมที่แพ็กเกจนี้เคยใส่ไว้ออกก่อน (ดูจาก statusMessage ที่ขึ้นต้นด้วย tag)
    // hook ของผู้ใช้เองหรือของแพ็กเกจอื่นจะไม่ถูกแตะ
    const kept = existing.filter(function (group) {
      const hooks = Array.isArray(group.hooks) ? group.hooks : [];
      return !hooks.some(function (h) {
        return String(h.statusMessage || '').indexOf(TAG + ':') === 0;
      });
    });

    settings.hooks[event] = kept.concat(sourceHooks[event]);
    installed += sourceHooks[event].length;
  }

  fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n');
  return installed;
}

// เตือนถ้าโปรเจกต์ปลายทางยังไม่ได้ตั้ง auto-update
// อ่านอย่างเดียว ไม่แก้ package.json ของใคร เพราะตอน npm install
// npm ก็กำลังเขียนไฟล์นี้อยู่เหมือนกัน เขียนชนกันแล้วของหาย
function warnIfNoAutoUpdate(projectRoot) {
  const pkgFile = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgFile)) return;

  let targetPkg;
  try {
    targetPkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  } catch (e) {
    return;
  }

  const scripts = targetPkg.scripts || {};

  // ไม่มี script ชื่อ dev ก็ไม่ต้องเตือน เพราะ predev จะไม่มีวันถูกเรียก
  if (!scripts.dev) return;
  if (String(scripts.predev || '').indexOf(pkg.name) !== -1) return;

  console.warn('');
  console.warn('⚠️  ยังไม่ได้ตั้ง auto-update — เครื่องนี้จะค้างอยู่เวอร์ชันเดิมจนกว่าจะสั่ง npm update เอง');
  console.warn('    ใส่บรรทัดนี้ใน "scripts" ของ package.json:');
  console.warn('');
  console.warn('    "predev": "npm update ' + pkg.name + ' || true"');
  console.warn('');
}

try {
  // ทำงานเฉพาะตอนถูกติดตั้งลง node_modules เท่านั้น (กันไม่ให้ก๊อปทับตอน dev ในแพ็กเกจตัวเอง)
  if (__dirname.indexOf('node_modules') !== -1) {
    const projectRoot = resolveProjectRoot();

    // 1) rules สำหรับ Cursor
    fs.copyFileSync(
      path.join(__dirname, 'rules', 'team-guidelines.md'),
      path.join(projectRoot, '.cursorrules')
    );

    // 2) skills สำหรับ Claude Code — ก๊อปทุกตัวที่มีในแพ็กเกจ
    //    เพิ่ม skill ใหม่ = วางโฟลเดอร์เพิ่มใน .claude/skills/ ไม่ต้องแก้ไฟล์นี้
    const skillCount = copyDir(
      path.join(__dirname, '.claude', 'skills'),
      path.join(projectRoot, '.claude', 'skills')
    );

    // 3) hooks — อ่านจาก settings.json ของแพ็กเกจแล้ว merge เข้าของปลายทาง
    let hookCount = 0;
    const ownSettingsFile = path.join(__dirname, '.claude', 'settings.json');
    if (fs.existsSync(ownSettingsFile)) {
      const ownSettings = JSON.parse(fs.readFileSync(ownSettingsFile, 'utf8'));
      if (ownSettings.hooks) hookCount = mergeHooks(projectRoot, ownSettings.hooks);
    }

    console.log(
      '✅ ' + pkg.name + '@' + pkg.version + ' installed: ' +
      '.cursorrules, ' + skillCount + ' skill file(s), ' + hookCount + ' hook(s)'
    );

    warnIfNoAutoUpdate(projectRoot);
  }
} catch (error) {
  console.error('❌ Failed to install AI rules:', error.message);
}
