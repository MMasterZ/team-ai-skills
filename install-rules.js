const fs = require('fs');
const path = require('path');

// ถอยกลับไปที่ Root ของโปรเจกต์เพื่อนในทีม (ถอยจาก node_modules/@org/package)
const projectRoot = path.resolve(__dirname, '../../..'); 

const sourceFile = path.join(__dirname, 'rules', 'team-guidelines.md');
const targetFile = path.join(projectRoot, '.cursorrules'); 

try {
  // ทำงานเฉพาะตอนที่ถูกติดตั้งลงใน node_modules เท่านั้น (ป้องกันการก๊อปปี้ทับในโปรเจกต์ตัวเอง)
  if (__dirname.indexOf('node_modules') !== -1) {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ Team AI Rules installed successfully!');
  }
} catch (error) {
  console.error('❌ Failed to install AI rules:', error);
}