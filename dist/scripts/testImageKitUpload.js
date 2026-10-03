"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imageKitService_1 = require("../services/imageKitService");
const env_1 = require("../config/env");
async function testIK() {
    console.log('ImageKit Config:');
    console.log('Public Key:', env_1.config.imageKit.publicKey);
    console.log('Private Key exists:', !!env_1.config.imageKit.privateKey);
    console.log('URL Endpoint:', env_1.config.imageKit.urlEndpoint);
    // Tiny 1x1 transparent PNG buffer
    const samplePng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    try {
        const result = await (0, imageKitService_1.uploadToImageKit)(samplePng, `test_${Date.now()}.png`, '/test');
        console.log('Upload Result:', result);
    }
    catch (e) {
        console.error('Upload Error:', e);
    }
}
testIK();
