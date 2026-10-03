import axios from 'axios';

async function testShivamForgot() {
  console.log('Testing forgot password for shivamdavande348@gmail.com...');
  try {
    const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email: 'shivamdavande348@gmail.com'
    });
    console.log('✅ Response:', res.status, res.data);
  } catch (err: any) {
    console.error('❌ Error:', err.response?.status, err.response?.data || err.message);
  }
}

testShivamForgot();
