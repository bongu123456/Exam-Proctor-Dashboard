

const API_URL = 'https://exam-proctor-dashboard.onrender.com';

async function seedProd() {
  console.log('Registering admin...');
  const adminRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Jane Teacher',
      email: 'admin@proctor.com',
      password: 'admin123',
      role: 'admin'
    })
  });
  
  if (!adminRes.ok) {
    // Maybe already exists, let's try to login
    console.log('Admin registration failed, trying to login...');
  }
  
  const adminLoginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@proctor.com',
      password: 'admin123'
    })
  });
  
  const adminData = await adminLoginRes.json();
  if (!adminLoginRes.ok) {
    console.error('Failed to login admin:', adminData);
    return;
  }
  
  const adminToken = adminData.token;
  console.log('Admin token acquired.');

  console.log('Creating exams...');
  const exam1 = {
    title: 'Web Development Core Trivia',
    description: 'Test your foundation in HTML, CSS, JavaScript, and Web protocols. Keep focus on the screen.',
    duration: 10,
    questions: [
      {
        questionText: 'Which HTTP status code represents a successful resource creation?',
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctOption: 1
      },
      {
        questionText: 'What is the correct way to detect a tab-switch or minimize state in JavaScript?',
        options: [
          'Using the browser window.onblur event listener only',
          'Checking the document.visibilityState using the Page Visibility API',
          'Subscribing to the navigator.activeTab API',
          'It is impossible to detect tab switches due to sandboxing'
        ],
        correctOption: 1
      }
    ]
  };

  const examRes = await fetch(`${API_URL}/api/exams`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(exam1)
  });

  const examData = await examRes.json();
  if (examRes.ok) {
    console.log('Exam created successfully:', examData.title);
  } else {
    console.error('Failed to create exam:', examData);
  }
  
  console.log('Done!');
}

seedProd();
