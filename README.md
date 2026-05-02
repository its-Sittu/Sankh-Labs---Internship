# Lead Management Dashboard 🚀

A professional, high-performance Lead Management Dashboard built with **React** and **Vite**. This application is designed to help businesses efficiently capture, track, and manage leads while ensuring maximum data integrity through robust validation systems.

## ✨ Key Features

- **Dynamic Lead Tracking**: Add and view leads instantly with a clean, intuitive interface.
- **Intelligent Follow-up Dashboard**: 
  - **Today's Follow-ups**: Automatically highlights leads scheduled for the current day.
  - **Categorized Sections**: Separate views for upcoming and past follow-ups.
- **Robust Form Validation (Real-time)**:
  - **Smart Validation**: Instant visual feedback as you type (`onChange`) and when you leave a field (`onBlur`).
  - **Visual Indicators**: Invalid fields are highlighted with red borders and descriptive error messages.
  - **Button Guard**: Submit button remains disabled until all required fields meet validation criteria.
- **Data Integrity**: 
  - **Automatic Sanitization**: Trims whitespace from all inputs before saving.
  - **10-Digit Mobile Validation**: Ensures phone numbers are exactly 10 digits and numeric only.
- **Premium UI/UX**:
  - Modern, responsive design optimized for all screen sizes.
  - Smooth micro-animations and transitions.
  - Semantic iconography using **Lucide React**.

## 🛠️ Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| **Full Name** | Required, min 3 characters | *Name must be at least 3 characters* |
| **Phone Number** | Required, exactly 10 numeric digits | *Phone number must be exactly 10 digits* |

## 🚀 Tech Stack

- **Frontend**: React.js
- **Build Tool**: Vite
- **Styling**: Vanilla CSS3 (Custom Design System)
- **Icons**: Lucide React
- **State Management**: React Hooks (`useState`, `useEffect`)
- **Persistence**: LocalStorage

## 🏁 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/its-Sittu/Sankh-Labs---Internship.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "Skill Labs"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── App.jsx        # Main application logic & state management
├── App.css        # Specific component styles
├── index.css      # Global design system & validation styles
└── assets/        # Static assets and images
```

---
*Developed as part of the Skill Labs Internship Program.*
