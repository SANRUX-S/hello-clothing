import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = 'C:/Users/Mike/.gemini/antigravity/brain/ce3011be-9f33-47ea-8285-036714c5628d/.user_uploaded/media_1793277697808_c3d83aa8.jpg';
const outputDir = 'public/hero';

async function enhance() {
  console.log('Loading clean source image:', inputPath);
  const inputBuffer = fs.readFileSync(inputPath);

  // 1. High-Precision 2.5K (2560 x 1440) Master JPG
  console.log('Rendering 2560x1440 with Lanczos3 and 4:4:4 chroma...');
  await sharp(inputBuffer)
    .resize(2560, 1440, {
      kernel: sharp.kernel.lanczos3,
      fit: 'cover'
    })
    .sharpen({
      sigma: 1.15,
      m1: 0.9,
      m2: 2.2,
      x1: 2,
      y2: 10,
      y3: 20
    })
    .jpeg({
      quality: 98,
      chromaSubsampling: '4:4:4',
      trellisQuantisation: true,
      overshootDeringing: true,
      optimizeScans: true
    })
    .toFile(path.join(outputDir, 'couple-campaign.jpg'));

  // 2. High-Efficiency 2.5K (2560 x 1440) WebP
  console.log('Rendering 2560x1440 WebP (effort 6, quality 96)...');
  await sharp(inputBuffer)
    .resize(2560, 1440, {
      kernel: sharp.kernel.lanczos3,
      fit: 'cover'
    })
    .sharpen({
      sigma: 1.15,
      m1: 0.9,
      m2: 2.2,
      x1: 2,
      y2: 10,
      y3: 20
    })
    .webp({
      quality: 96,
      effort: 6,
      smartSubsample: true
    })
    .toFile(path.join(outputDir, 'couple-campaign.webp'));

  // 3. Ultra-Crisp 4K (3840 x 2160) for high-DPI / Retina screens
  console.log('Rendering 3840x2160 4K Ultra HD asset...');
  await sharp(inputBuffer)
    .resize(3840, 2160, {
      kernel: sharp.kernel.lanczos3,
      fit: 'cover'
    })
    .sharpen({
      sigma: 1.35,
      m1: 1.1,
      m2: 2.3
    })
    .jpeg({
      quality: 98,
      chromaSubsampling: '4:4:4',
      trellisQuantisation: true,
      overshootDeringing: true
    })
    .toFile(path.join(outputDir, 'couple-campaign-4k.jpg'));

  const jpgStat = fs.statSync(path.join(outputDir, 'couple-campaign.jpg'));
  const webpStat = fs.statSync(path.join(outputDir, 'couple-campaign.webp'));
  const k4Stat = fs.statSync(path.join(outputDir, 'couple-campaign-4k.jpg'));

  console.log('✓ Successfully generated all high-resolution hero assets:');
  console.log(`  - couple-campaign.jpg (2560x1440): ${(jpgStat.size / 1024).toFixed(1)} KB`);
  console.log(`  - couple-campaign.webp (2560x1440): ${(webpStat.size / 1024).toFixed(1)} KB`);
  console.log(`  - couple-campaign-4k.jpg (3840x2160): ${(k4Stat.size / 1024).toFixed(1)} KB`);
}

enhance().catch(err => {
  console.error('Enhancement failed:', err);
  process.exit(1);
});
