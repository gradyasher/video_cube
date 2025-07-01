import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/assets/mockups';
const outputDir = './public/assets/mockups';

fs.mkdirSync(outputDir, { recursive: true });

const processFile = (filePath, subDir) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(outputDir, subDir, `${fileName}.webp`);

  fs.mkdirSync(path.join(outputDir, subDir), { recursive: true });

  sharp(filePath)
    .resize({ width: 1000 })
    .webp({ quality: 70 })
    .toFile(outputPath)
    .then(() => console.log(`✅ Compressed: ${outputPath}`))
    .catch(err => console.error(`❌ Failed: ${filePath}`, err));
};

const walkDir = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const relativeDir = path.relative(inputDir, dir);

    if (stat.isDirectory()) walkDir(fullPath);
    else if (stat.isFile() && /\.(jpe?g|png)$/i.test(file)) {
      processFile(fullPath, relativeDir);
    }
  });
};

walkDir(inputDir);
