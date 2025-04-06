import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the translations type structure
type FrequencyOptions = {
  biweekly: string;
  monthly: string;
  yearly: string;
};

type TranslationData = {
  welcome: string;
  logout: string;
  login: string;
  signup: string;
  dashboard: string;
  featuresTitle: string;
  featuresTagline: string;
  featuresDescription: string;
  incomeManagementTitle: string;
  incomeManagementDescription: string;
  calendarViewTitle: string;
  calendarViewDescription: string;
  spendingAssistantTitle: string;
  spendingAssistantDescription: string;
  copyright: string;
  rememberMe: string;
  loginDescription: string;
  signupDescription: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  emailLabel: string;
  passwordLabel: string;
  nameLabel: string;
  accountBalance: string;
  updateBalance: string;
  incomeAndBills: string;
  calendar: string;
  chatbot: string;
  addIncome: string;
  addBill: string;
  removeIncome: string;
  removeBill: string;
  remaining: string;
  previousBalance: string;
  dueBills: string;
  addIncomeTitle: string;
  editIncomeTitle: string;
  sourceLabel: string;
  sourcePlaceholder: string;
  amountLabel: string;
  frequencyLabel: string;
  frequencyOptions: FrequencyOptions;
  addBillTitle: string;
  editBillTitle: string;
  billNameLabel: string;
  billNamePlaceholder: string;
  amountPlaceholder: string;
  dueDateLabel: string;
  selectIncomeToRemove: string;
  selectBillToRemove: string;
  remove: string;
  cancel: string;
  chatbotPlaceholder: string;
  chatbotInitialMessage: string;
  send: string;
  language: string;
  english: string;
  spanish: string;
  to: string;
  or: string;
  forgotPassword: string;
  signingIn: string;
  creatingAccount: string;
};

type Translations = {
  [key in 'en' | 'es']: TranslationData;
};

// Define the translations for English and Spanish
const translations: Translations = {
  en: {
    // Common
    welcome: "Welcome,",
    logout: "Logout",
    login: "Login",
    signup: "Sign Up",
    dashboard: "Dashboard",
    to: "to",
    or: "or",
    
    // Landing page
    featuresTitle: "Features",
    featuresTagline: "Keep your finger on the pulse of your money",
    featuresDescription: "Simple tools that help you track income, manage bills, and make smarter spending decisions.",
    incomeManagementTitle: "Income & Bill Management",
    incomeManagementDescription: "Easily track your income sources and upcoming bills. Get a clear picture of your financial obligations.",
    calendarViewTitle: "Calendar View",
    calendarViewDescription: "See all your bills on a monthly calendar to plan ahead and never miss a payment.",
    spendingAssistantTitle: "Spending Assistant",
    spendingAssistantDescription: "Ask our chatbot if you can afford to make a purchase. Get smart advice based on your current financial situation.",
    copyright: "© 2025 pulse. All rights reserved.",
    
    // Auth page
    rememberMe: "Remember me",
    loginDescription: "Enter your credentials to access your account",
    signupDescription: "Create a new account to get started",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    emailLabel: "Email",
    passwordLabel: "Password",
    nameLabel: "Name",
    forgotPassword: "Forgot your password?",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    
    // Dashboard page
    accountBalance: "Account Balance",
    updateBalance: "Update Balance",
    incomeAndBills: "Income & Bills",
    calendar: "Calendar",
    chatbot: "Spending Assistant",
    addIncome: "Add Income",
    addBill: "Add Bill",
    removeIncome: "Remove Income",
    removeBill: "Remove Bill",
    remaining: "Remaining Balance:",
    previousBalance: "Previous Balance:",
    dueBills: "Due Bills:",
    
    // Add/Edit Income Modal
    addIncomeTitle: "Add Income Source",
    editIncomeTitle: "Edit Income Source",
    sourceLabel: "Income Source",
    sourcePlaceholder: "e.g. Salary, Freelance, etc.",
    amountLabel: "Amount",
    frequencyLabel: "Frequency",
    frequencyOptions: {
      biweekly: "Bi-weekly",
      monthly: "Monthly",
      yearly: "Yearly"
    },
    
    // Add/Edit Bill Modal
    addBillTitle: "Add New Bill",
    editBillTitle: "Edit Bill",
    billNameLabel: "Bill Name",
    billNamePlaceholder: "e.g. Rent, Electricity, etc.",
    amountPlaceholder: "e.g. $1000",
    dueDateLabel: "Due Date (day of month)",
    
    // Remove Income/Bill Modals
    selectIncomeToRemove: "Select Income to Remove",
    selectBillToRemove: "Select Bill to Remove",
    remove: "Remove",
    cancel: "Cancel",
    
    // Chatbot
    chatbotPlaceholder: "Ask if you can afford something...",
    chatbotInitialMessage: "Hello! I'm your spending assistant. Ask me if you can afford something based on your current financial situation.",
    send: "Send",

    // Language toggle
    language: "Language",
    english: "English",
    spanish: "Spanish"
  },
  es: {
    // Common
    welcome: "Bienvenido,",
    logout: "Cerrar sesión",
    login: "Iniciar sesión",
    signup: "Registrarse",
    dashboard: "Panel",
    to: "a",
    or: "o",
    
    // Landing page
    featuresTitle: "Características",
    featuresTagline: "Mantén el pulso de tu dinero",
    featuresDescription: "Herramientas simples que te ayudan a seguir ingresos, administrar facturas y tomar decisiones de gastos más inteligentes.",
    incomeManagementTitle: "Gestión de Ingresos y Facturas",
    incomeManagementDescription: "Seguimiento fácil de tus fuentes de ingresos y facturas próximas. Obtén una imagen clara de tus obligaciones financieras.",
    calendarViewTitle: "Vista de Calendario",
    calendarViewDescription: "Mira todas tus facturas en un calendario mensual para planificar con anticipación y nunca perder un pago.",
    spendingAssistantTitle: "Asistente de Gastos",
    spendingAssistantDescription: "Pregunta a nuestro chatbot si puedes permitirte hacer una compra. Obtén consejos inteligentes basados en tu situación financiera actual.",
    copyright: "© 2025 pulse. Todos los derechos reservados.",
    
    // Auth page
    rememberMe: "Recordarme",
    loginDescription: "Ingresa tus credenciales para acceder a tu cuenta",
    signupDescription: "Crea una nueva cuenta para empezar",
    dontHaveAccount: "¿No tienes una cuenta?",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    nameLabel: "Nombre",
    forgotPassword: "¿Olvidaste tu contraseña?",
    signingIn: "Iniciando sesión...",
    creatingAccount: "Creando cuenta...",
    
    // Dashboard page
    accountBalance: "Saldo de la cuenta",
    updateBalance: "Actualizar saldo",
    incomeAndBills: "Ingresos y Facturas",
    calendar: "Calendario",
    chatbot: "Asistente de Gastos",
    addIncome: "Añadir ingreso",
    addBill: "Añadir factura",
    removeIncome: "Eliminar ingreso",
    removeBill: "Eliminar factura",
    remaining: "Saldo restante:",
    previousBalance: "Saldo anterior:",
    dueBills: "Facturas a pagar:",
    
    // Add/Edit Income Modal
    addIncomeTitle: "Añadir fuente de ingresos",
    editIncomeTitle: "Editar fuente de ingresos",
    sourceLabel: "Fuente de ingresos",
    sourcePlaceholder: "ej. Salario, Freelance, etc.",
    amountLabel: "Monto",
    frequencyLabel: "Frecuencia",
    frequencyOptions: {
      biweekly: "Quincenal",
      monthly: "Mensual",
      yearly: "Anual"
    },
    
    // Add/Edit Bill Modal
    addBillTitle: "Añadir nueva factura",
    editBillTitle: "Editar factura",
    billNameLabel: "Nombre de la factura",
    billNamePlaceholder: "ej. Alquiler, Electricidad, etc.",
    amountPlaceholder: "ej. $1000",
    dueDateLabel: "Fecha de vencimiento (día del mes)",
    
    // Remove Income/Bill Modals
    selectIncomeToRemove: "Seleccione el ingreso para eliminar",
    selectBillToRemove: "Seleccione la factura para eliminar",
    remove: "Eliminar",
    cancel: "Cancelar",
    
    // Chatbot
    chatbotPlaceholder: "Pregunta si puedes permitirte algo...",
    chatbotInitialMessage: "¡Hola! Soy tu asistente de gastos. Pregúntame si puedes permitirte algo basado en tu situación financiera actual.",
    send: "Enviar",

    // Language toggle
    language: "Idioma",
    english: "Inglés",
    spanish: "Español"
  }
};

type Language = 'en' | 'es';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Create the context
export const LanguageContext = createContext<LanguageContextType | null>(null);

// Create the provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get stored language from localStorage or default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return (savedLanguage === 'en' || savedLanguage === 'es') ? savedLanguage : 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let currentObj: any = translations[language];
    
    // Navigate through nested keys
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      
      if (currentObj && typeof currentObj === 'object' && currentKey in currentObj) {
        currentObj = currentObj[currentKey];
      } else {
        // If key not found, try English fallback
        let fallback: any = translations['en'];
        
        // Navigate through the same path in fallback
        for (let j = 0; j <= i; j++) {
          const fallbackKey = keys[j];
          if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
            fallback = fallback[fallbackKey];
          } else {
            return key; // Return the key if fallback also fails
          }
        }
        
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    return typeof currentObj === 'string' ? currentObj : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for using the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}