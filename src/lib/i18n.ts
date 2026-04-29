import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Unified Health Intelligence",
      "dashboard": "Dashboard",
      "patients": "Patients",
      "appointments": "Appointments",
      "telehealth": "Telehealth",
      "risk_prediction": "AI Risk Prediction",
      "login": "Login",
      "signup": "Sign Up",
      "logout": "Logout",
      "add_patient": "Add Patient Record",
      "age": "Age",
      "glucose": "Glucose (mg/dL)",
      "blood_pressure": "Blood Pressure (mm Hg)",
      "bmi": "BMI",
      "insulin": "Insulin (mu U/ml)",
      "risk_level": "Risk Level",
      "recommendation": "Recommendation",
      "doctor_view": "Doctor Portal",
      "patient_view": "Patient Portal",
      "language": "Language",
      "prediction_result": "Prediction Result",
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "welcome": "Welcome to Unified Health Platform",
      "booking": "Book Appointment",
      "chat": "Consultation Chat"
    }
  },
  kn: {
    translation: {
      "app_name": "ಏಕೀಕೃತ ಆರೋಗ್ಯ ಬುದ್ಧಿಮತ್ತೆ",
      "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "patients": "ರೋಗಿಗಳು",
      "appointments": "ನೇಮಕಾತಿಗಳು",
      "telehealth": "ಟೆಲಿಹೆಲ್ತ್",
      "risk_prediction": "AI ಆರೋಗ್ಯ ಅಪಾಯದ ಭವಿಷ್ಯ",
      "login": "ಲಾಗಿನ್",
      "signup": "ಸೈನ್ ಅಪ್",
      "logout": "ಲಾಗ್ ಔಟ್",
      "add_patient": "ರೋಗಿಯ ದಾಖಲೆ ಸೇರಿಸಿ",
      "age": "ವಯಸ್ಸು",
      "glucose": "ಗ್ಲೂಕೋಸ್",
      "blood_pressure": "ರಕ್ತದೊತ್ತಡ",
      "bmi": "ಬಿಎಂಐ (BMI)",
      "insulin": "ಇನ್ಸುಲಿನ್",
      "risk_level": "ಅಪಾಯದ ಮಟ್ಟ",
      "recommendation": "ಶಿಫಾರಸು",
      "doctor_view": "ವೈದ್ಯರ ಪೋರ್ಟಲ್",
      "patient_view": "ರೋಗಿಗಳ ಪೋರ್ಟಲ್",
      "language": "ಭಾಷೆ",
      "prediction_result": "ಭವಿಷ್ಯದ ಫಲಿತಾಂಶ",
      "low": "ಕಡಿಮೆ",
      "medium": "ಮಧ್ಯಮ",
      "high": "ಹೆಚ್ಚು",
      "welcome": "ಏಕೀಕೃತ ಆರೋಗ್ಯ ವೇದಿಕೆಗೆ ಸ್ವಾಗತ",
      "booking": "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
      "chat": "ಸಮಾಲೋಚನೆ ಚಾಟ್"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
