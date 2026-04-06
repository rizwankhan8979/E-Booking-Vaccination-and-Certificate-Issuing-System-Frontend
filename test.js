const api = fetch('http://localhost:8080/auth/forgot-password-request', {
  method: 'POST',
  headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer some.invalid.token'
  },
  body: JSON.stringify({ email: 'rizwankhan897979@gmail.com' })
}).then(async res => {
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  console.log('Body:', text);
}).catch(console.error);
