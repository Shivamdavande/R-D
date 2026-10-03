import { uploadToImageKit } from '../services/imageKitService';
import { config } from '../config/env';

async function testIK() {
  console.log('ImageKit Config:');
  console.log('Public Key:', config.imageKit.publicKey);
  console.log('Private Key exists:', !!config.imageKit.privateKey);
  console.log('URL Endpoint:', config.imageKit.urlEndpoint);

  // Tiny 1x1 transparent PNG buffer
  const samplePng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  try {
    const result = await uploadToImageKit(samplePng, `test_${Date.now()}.png`, '/test');
    console.log('Upload Result:', result);
  } catch (e) {
    console.error('Upload Error:', e);
  }
}

testIK();
