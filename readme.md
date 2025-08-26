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
- **AI-Powered OCR**: Utilizes Gemini 2.5 Flash for accurate text extraction from prescription images
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
- ❖ **React Native (Expo)** - Cross-platform mobile development
- ❖ **TypeScript** - Type-safe JavaScript
- ❖ **NativeWind** - Tailwind CSS for React Native
- ❖ **GluestackUI** - Modern UI component library

### Backend
- ❖ **Flask** - Python web framework for model hosting
- ❖ **Appwrite** - Backend-as-a-Service (BaaS)

### APIs & Services
- ❖ **Gemini 2.5 Flash** - OCR & Translation capabilities
- ❖ **gTTS (Google Text-to-Speech)** - Voice synthesis
- ❖ **AWS S3** - Cloud storage
- ❖ **Azure Speech Service** - Advanced speech capabilities

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Python 3.8+
- Git
- ngrok (for tunneling)

### 1. Clone the Repository
```bash
git clone https://github.com/pratiks05/RxScan.git
cd RxScan
```

### 2. Frontend Setup (Client)

Navigate to the client directory and install dependencies:
```bash
cd client
npm install
```

Start the Expo development server with tunneling:
```bash
npx expo start --tunnel
```

### 3. Backend Setup (Flask Server)

Navigate to the Flask server directory:
```bash
cd flask-server
```

Create and activate a virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Run the Flask server:
```bash
flask run
```

### 4. ngrok Configuration

Create an ngrok configuration file at `ngrok/ngrok.yml`:
```yaml
tunnels:
  webapp:
    proto: http
    addr: 3000

  flask:
    proto: http
    addr: 5000
```

Start ngrok tunneling:
```bash
ngrok start --all --config .\ngrok\ngrok.yml
```

### 5. Environment Configuration

Copy the Node.js and Flask ports from ngrok to your environment variables:
- Note the ngrok URLs for both webapp (port 3000) and flask (port 5000)
- Update your `.env` files with the appropriate ngrok URLs

### 📱 Running the Application

1. **Start the Flask server** (Terminal 1):
   ```bash
   cd flask-server
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   flask run
   ```

2. **Start ngrok tunneling** (Terminal 2):
   ```bash
   ngrok start --all --config .\ngrok\ngrok.yml
   ```

3. **Start the Expo client** (Terminal 3):
   ```bash
   cd client
   npx expo start --tunnel
   ```

4. **Scan the QR code** with the Expo Go app on your mobile device or run on emulator

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

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>Made with ❤️ by Team Code Connectors at Status Code 2!</h3>
</div>