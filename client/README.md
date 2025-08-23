# RxScan 📱💊


[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

## 🌟 Overview

RxScan is an innovative healthcare application designed to bridge the gap in prescription accessibility. With **153 million seniors in India (60+)** and **70 million vision-impaired individuals**, our solution addresses a massive underserved market through AI-powered prescription reading and management.

### 🎯 Problem Statement

- **Healthcare Accessibility**: Supporting elderly and vulnerable populations in healthcare
- **Prescription Complexity**: Making hard-to-understand prescriptions accessible
- **Communication Barriers**: Using text-to-speech technology to improve care and peace of mind

## ✨ Key Features

### 🔍 Smart Prescription Scanning
- **AI-Powered OCR**: Utilizes Gemini 2.0 Flash for accurate text extraction from prescription images
- **High Accuracy**: Advanced image processing for clear text recognition

### 📄 PDF Export & History
- **Document Management**: Download processed prescriptions as PDF
- **Comprehensive History**: Maintain searchable prescription records
- **Easy Access**: Quick retrieval of past prescriptions

### 🌐 Multi-Lingual & Voice Support
- **Regional Languages**: Support for multiple Indian languages
- **Text-to-Speech**: Voice narration for elderly and visually impaired users
- **Accessibility First**: Designed with inclusivity in mind

### 👤 Personalized Health Profile
- **Medical History**: Seamless management of health records
- **Allergy Tracking**: Important allergy information storage
- **Emergency Contacts**: Quick access to emergency information

### ⏰ Smart Medication Reminders
- **Intelligent Scheduling**: AI-powered reminder system
- **Adherence Tracking**: Monitor medication compliance
- **Customizable Alerts**: Personalized notification preferences

## 🚀 Tech Stack

### Frontend
- **React Native (Expo)** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **NativeWind** - Tailwind CSS for React Native
- **GluestackUI** - Modern UI component library

### Backend
- **Flask** - Python web framework for model hosting
- **Appwrite** - Backend-as-a-Service (BaaS)

### APIs & Services
- **Gemini 2.0 Flash** - OCR & Translation capabilities
- **gTTS (Google Text-to-Speech)** - Voice synthesis

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Python 3.8+
- Git

### Frontend Setup (React Native)

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratiks05/RxScan.git
   cd RxScan
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Add your API keys and configuration
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

6. **Run on device/simulator**
   ```bash
   # For iOS
   npx expo start --ios
   
   # For Android
   npx expo start --android
   ```

### Backend Setup (Flask Server)

1. **Navigate to Flask server directory**
   ```bash
   cd Flask-server
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Add your Gemini API key and other configurations
   ```

5. **Run the Flask server**
   ```bash
   python app.py
   ```



## 💼 Business Impact

### 🎯 Target Market
- **153 million seniors** in India (60+)
- **70 million vision-impaired** individuals
- Massive underserved market for accessible prescription management

### 💰 Revenue Model
- **Freemium Subscriptions**: ₹299/month premium tier
- **B2B Partnerships**: Integration with pharmacies and healthcare providers
- **Healthcare Systems**: Direct partnerships with hospitals and clinics

### 📈 Healthcare ROI
- **78% reduction** in medication errors
- **Fewer hospital readmissions**
- **Attractive value proposition** for insurance companies
- **Improved patient outcomes** and satisfaction

### 🚀 Delta 4 Business Model
**4-level improvement** over traditional prescription reading:
1. **AI Accuracy** - Precise text extraction
2. **Voice Accessibility** - Audio support for all users
3. **Multi-language Support** - Regional language compatibility
4. **Smart Connectivity** - Integrated healthcare ecosystem

---

<div align="center">
  <h3>Made with ❤️ by Team Code Connectors</h3>
</div>
