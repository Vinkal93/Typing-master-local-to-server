# Typing Masterclass

A premium, full-featured online typing practice and test platform created by Vinkal Prajapati. Test your typing speed (WPM), track accuracy, and learn touch typing through structured courses, exams, and interactive games in both English and Hindi.

## Features

- **Typing Course & Lessons**: Structured levels for beginners, intermediate, and advanced typists.
- **Fast Track Engine**: High-performance engine designed to accelerate typing reflexes.
- **Exam Mode**: Simulate real-world typing tests (including CPCT mocks) with advanced scoring.
- **Smart Practice**: Tracks missed keys and generates custom drills to target weak spots.
- **Analytics & History**: Detailed error analysis, finger heatmaps, and full practice/test history.
- **Secure Licensing**: Administrator-controlled monthly licensing gates to unlock premium content.
- **Live Admin Control Room**: Redesigned administrative panel featuring real-time visitors logging, custom route gating, and Firestore key generator.

## Technologies Used

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn-ui
- **Database & Sync**: Firebase Firestore (Real-time Config & License validation), LocalStorage caching
- **Analytics**: Local visitor event tracking & Live device sync

## Getting Started

Follow these steps to run the application locally:

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables. Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

## License & Branding

Owned and managed by **Vinkal Prajapati**. All rights reserved.
