import sharp from 'sharp';

await sharp('assets/social-preview.svg').png().toFile('public/social-preview.png');
await sharp('public/favicon.svg').resize(32, 32).png().toFile('public/favicon-32.png');
await sharp('public/favicon.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('Generated social-preview.png (1200×630), favicon-32.png and apple-touch-icon.png.');
