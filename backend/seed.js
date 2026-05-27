const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Exam = require('./models/Exam');
const Submission = require('./models/Submission');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing database collections...');
    // Delete all records to start fresh
    await User.deleteOne({ email: 'admin@proctor.com' });
    await User.deleteOne({ email: 'student@proctor.com' });
    await Exam.deleteOne({ title: 'Web Development Core Trivia' });
    await Exam.deleteOne({ title: 'Advanced React & Architecture' });
    
    // Clear submissions to prevent broken references
    const submissions = await Submission.find({});
    for (const sub of submissions) {
      await Submission.deleteOne({ _id: sub._id || sub.id });
    }

    console.log('Database cleared.');

    // 1. Hash Passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    // 2. Create Users
    console.log('Seeding users...');
    const admin = await User.create({
      name: 'Dr. Jane Teacher',
      email: 'admin@proctor.com',
      password: adminPassword,
      role: 'admin'
    });

    const student = await User.create({
      name: 'Alex Student',
      email: 'student@proctor.com',
      password: studentPassword,
      role: 'student'
    });

    console.log(`Users seeded successfully:`);
    console.log(`- Admin: admin@proctor.com (pw: admin123)`);
    console.log(`- Student: student@proctor.com (pw: student123)`);

    // 3. Create Exams
    console.log('Seeding mock exams...');

    const exam1 = await Exam.create({
      title: 'Web Development Core Trivia',
      description: 'Test your foundation in HTML, CSS, JavaScript, and Web protocols. Keep focus on the screen.',
      duration: 10, // 10 minutes
      totalQuestions: 5,
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
        },
        {
          questionText: 'Which of the following is NOT a semantic HTML5 element?',
          options: ['<article>', '<section>', '<div>', '<aside>'],
          correctOption: 2
        },
        {
          questionText: 'What does CSS stand for?',
          options: [
            'Creative Style Sheets',
            'Cascading Style Sheets',
            'Computer Style Sheets',
            'Colorful Style Sheets'
          ],
          correctOption: 1
        },
        {
          questionText: 'What is the purpose of the navigator.mediaDevices.getUserMedia() API?',
          options: [
            'To read files from the local storage',
            'To access microphone and camera media streams',
            'To monitor user browser tabs in the background',
            'To fetch user system and location metrics'
          ],
          correctOption: 1
        }
      ]
    });

    const exam2 = await Exam.create({
      title: 'Advanced React & Architecture',
      description: 'Deepen your knowledge of advanced React hook implementations, rendering lifecycles, and context management.',
      duration: 15, // 15 minutes
      totalQuestions: 5,
      questions: [
        {
          questionText: 'Which React hook is specifically optimized to memoize a computed value between renders?',
          options: ['useCallback', 'useMemo', 'useEffect', 'useRef'],
          correctOption: 1
        },
        {
          questionText: 'What happens when you update a React state variable directly without using the set state function?',
          options: [
            'React immediately triggers a warning and updates the view',
            'The value changes, but React will not trigger a re-render to update the user interface',
            'React throws a compile-time fatal error',
            'The value remains completely unchanged'
          ],
          correctOption: 1
        },
        {
          questionText: 'In React, what is the primary benefit of adding a key prop to list items?',
          options: [
            'To uniquely apply CSS styles to each individual element',
            'To help React identify which items have changed, are added, or are removed',
            'To automatically bind local component state to the DOM',
            'To encrypt list data for secure rendering'
          ],
          correctOption: 1
        },
        {
          questionText: 'Which hook should be preferred to execute side effects that require DOM measurements before the paint occurs?',
          options: ['useEffect', 'useLayoutEffect', 'useImperativeHandle', 'useInsertionEffect'],
          correctOption: 1
        },
        {
          questionText: 'When using React Context, what is a common cause of unnecessary re-renders?',
          options: [
            'Passing static strings instead of numbers in context provider value',
            'Consumers re-rendering whenever any field in the context provider value object changes',
            'Declaring the context provider outside of the src directory',
            'Using multiple contexts instead of a single giant state object'
          ],
          correctOption: 1
        }
      ]
    });

    console.log('Exams seeded successfully!');
    console.log('Database seeding complete! Ready to start.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error.message);
    process.exit(1);
  }
};

seedData();
