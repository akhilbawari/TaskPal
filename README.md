# TaskPal

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-blue" alt="React">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.5-green" alt="Spring Boot">
</p>

TaskPal is a powerful task management platform designed for professionals who need to organize complex projects with nested subtasks, priority scoring, and calendar integration.

## 🚀 [Live Demo](https://taskspal.netlify.app/)

**Demo Credentials:**
- Email: akhilbawari0804@gmail.com
- Password: Demo@123

## ✨ Features

- **Nested Task Hierarchy**: Create unlimited levels of subtasks
- **Smart Priority Scoring**: Automatic calculation based on weight (1-5) and due dates
- **Multiple Views**: Calendar and list views with drag-and-drop reordering
- **Google Calendar Integration**: Sync tasks and receive notifications
- **Secure Authentication**: Email/password login with JWT security

## 🔧 Tech Stack

### Frontend
- React 19 with Vite
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- dnd-kit for drag-and-drop functionality
- Recharts & D3.js for data visualization

### Backend
- Spring Boot 3.4.5 with Java 21
- PostgreSQL database with JPA
- Spring Security with JWT authentication
- Google Calendar API integration
- RESTful API architecture

## 🏗️ Project Structure

### Frontend
```
Frontend/
├── src/
│   ├── components/     # UI components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   ├── redux/          # State management
│   └── utils/          # Utility functions
└── ...
```

### Backend
```
Backend/
├── src/main/java/com/taskpal/
│   ├── controller/     # REST controllers
│   ├── model/          # Entity classes
│   ├── repository/     # Data access
│   ├── service/        # Business logic
│   └── security/       # Authentication
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js (latest LTS)
- PostgreSQL
- Google API credentials (for Calendar)

### Backend Setup
```bash
# Clone repository
git clone https://github.com/akhilbawari/TaskPal.git

# Configure database in application.properties
# Build and run
cd TaskPal/Backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
# Install dependencies
cd TaskPal/Frontend
npm install

# Start development server
npm run dev
```

## 📝 API Documentation

API documentation is available at `/swagger-ui.html` when the backend server is running.


## 👨‍💻 Author

Developed by [Akhil Bawari](https://github.com/akhilbawari)
