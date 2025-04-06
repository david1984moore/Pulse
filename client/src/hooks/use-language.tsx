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
  updateBillDetails: string;
  updateBill: string;
  updating: string;
  billUpdatedSuccess: string;
  billUpdateFailed: string;
  billUpdateError: string;
  updateIncomeDetails: string;
  updateIncome: string;
  incomeUpdatedSuccess: string;
  incomeUpdatedDescription: string;
  incomeUpdateFailed: string;
  incomeUpdateError: string;
  selectFrequency: string;
  custom: string;
  selectIncomeToRemove: string;
  selectBillToRemove: string;
  remove: string;
  cancel: string;
  chatbotPlaceholder: string;
  chatbotInitialMessage: string;
  chatbotErrorMessage: string;
  canISpend: string;
  balance: string;
  thinking: string;
  ask: string;
  send: string;
  yesSafeToSpend: string;
  yesSafeToSpendNoBills: string;
  yesButBeCareful: string;
  sorryCannotSpend: string;
  language: string;
  english: string;
  spanish: string;
  to: string;
  or: string;
  forgotPassword: string;
  signingIn: string;
  creatingAccount: string;
  financialSummary: string;
  monthlyIncome: string;
  monthlyBills: string;
  availableToSpend: string;
  yourBills: string;
  yourIncome: string;
  noBillsAddedYet: string;
  noIncomeAddedYet: string;
  dueOnThe: string;
  recentDeductions: string;
  job: string;
  weekly: string;
  'bi-weekly': string;
  mo: string;
  paymentCalendar: string;
  calendarLegend: string;
  billsDue: string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  electric: string;
  rent: string;
  phoneService: string;
  water: string;
  internet: string;
  // Landing page
  heroTitle: string;
  heroDescription: string;
  getStarted: string;
  signIn: string;
  goToDashboard: string;
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
    heroTitle: "Take control of your finances",
    heroDescription: "Track your money, manage bills, and know exactly what you can spend with Pulse - your personal financial assistant.",
    getStarted: "Get Started",
    signIn: "Sign In",
    goToDashboard: "Go to Dashboard",
    
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
    updateBalance: "Update",
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
    updateBillDetails: "Update the details of your bill.",
    updateBill: "Update Bill",
    updating: "Updating...",
    billUpdatedSuccess: "Your bill has been updated successfully.",
    billUpdateFailed: "Failed to update bill",
    billUpdateError: "There was an error updating your bill. Please try again.",
    
    // Edit Income Modal
    updateIncomeDetails: "Update the details of your income source.",
    updateIncome: "Update Income",
    incomeUpdatedSuccess: "Income updated",
    incomeUpdatedDescription: "Your income has been updated successfully.",
    incomeUpdateFailed: "Failed to update income",
    incomeUpdateError: "There was an error updating your income. Please try again.",
    selectFrequency: "Select frequency",
    custom: "Custom",
    
    // Remove Income/Bill Modals
    selectIncomeToRemove: "Select Income to Remove",
    selectBillToRemove: "Select Bill to Remove",
    remove: "Remove",
    cancel: "Cancel",
    
    // Chatbot
    chatbotPlaceholder: "Ask if you can afford something...",
    chatbotInitialMessage: "Hello! I'm your spending assistant. Ask me if you can afford something based on your current financial situation.",
    chatbotErrorMessage: "Sorry, I couldn't process your request. Please try again later.",
    canISpend: "Can I spend",
    balance: "Balance",
    thinking: "Thinking...",
    ask: "Ask",
    send: "Send",
    // Chatbot response translations (keep English as-is since they match server responses)
    yesSafeToSpend: "Yes, you can spend $%amount%. Your balance after this purchase will be $%newBalance%. Your next bill %billName% ($%billAmount%) is due in %days% days, which will leave you with $%remainingBalance%.",
    yesSafeToSpendNoBills: "Yes, you can spend $%amount%. Your balance after this purchase will be $%newBalance%.",
    yesButBeCareful: "You can spend $%amount%, but be careful. Your balance after this purchase will be $%newBalance%, and you have $%upcomingBills% in upcoming bills which would leave you with $%remainingBalance%.",
    sorryCannotSpend: "Sorry, you cannot spend $%amount% as it would exceed your current account balance of $%balance%.",

    // Language toggle
    language: "Language",
    english: "English",
    spanish: "Spanish",
    
    // Additional translations
    financialSummary: "Financial Summary",
    monthlyIncome: "Monthly Income",
    monthlyBills: "Monthly Bills",
    availableToSpend: "Available to spend",
    yourBills: "Your Bills",
    yourIncome: "Your Income",
    noBillsAddedYet: "No bills added yet.",
    noIncomeAddedYet: "No income added yet.",
    dueOnThe: "Due on the",
    recentDeductions: "Recent deductions",
    job: "Job",
    weekly: "Weekly",
    'bi-weekly': "Bi-weekly",
    mo: "mo",
    paymentCalendar: "Payment Calendar",
    calendarLegend: "Calendar Legend",
    billsDue: "Bills Due",
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
    
    // Bill names
    electric: "Electric",
    rent: "Rent",
    phoneService: "Phone Service",
    water: "Water",
    internet: "Internet"
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
    heroTitle: "Toma el control de tus finanzas",
    heroDescription: "Seguimiento de tu dinero, gestión de facturas y conoce exactamente lo que puedes gastar con Pulse - tu asistente financiero personal.",
    getStarted: "Comenzar",
    signIn: "Iniciar Sesión",
    goToDashboard: "Ir al Panel",
    
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
    updateBalance: "Actualizar",
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
    updateBillDetails: "Actualiza los detalles de tu factura.",
    updateBill: "Actualizar factura",
    updating: "Actualizando...",
    billUpdatedSuccess: "Tu factura ha sido actualizada exitosamente.",
    billUpdateFailed: "Error al actualizar la factura",
    billUpdateError: "Hubo un error al actualizar tu factura. Por favor, intenta de nuevo.",
    
    // Edit Income Modal
    updateIncomeDetails: "Actualiza los detalles de tu fuente de ingresos.",
    updateIncome: "Actualizar ingreso",
    incomeUpdatedSuccess: "Ingreso actualizado",
    incomeUpdatedDescription: "Tu ingreso ha sido actualizado exitosamente.",
    incomeUpdateFailed: "Error al actualizar el ingreso",
    incomeUpdateError: "Hubo un error al actualizar tu ingreso. Por favor, intenta de nuevo.",
    selectFrequency: "Selecciona la frecuencia",
    custom: "Personalizado",
    
    // Remove Income/Bill Modals
    selectIncomeToRemove: "Seleccione el ingreso para eliminar",
    selectBillToRemove: "Seleccione la factura para eliminar",
    remove: "Eliminar",
    cancel: "Cancelar",
    
    // Chatbot
    chatbotPlaceholder: "Pregunta si puedes permitirte algo...",
    chatbotInitialMessage: "¡Hola! Soy tu asistente de gastos. Pregúntame si puedes permitirte algo basado en tu situación financiera actual.",
    chatbotErrorMessage: "Lo siento, no pude procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.",
    canISpend: "¿Puedo gastar",
    balance: "Saldo",
    thinking: "Pensando...",
    ask: "Preguntar",
    send: "Enviar",
    // Chatbot response translations
    yesSafeToSpend: "Sí, puedes gastar $%amount%. Tu saldo después de esta compra será de $%newBalance%. Tu próxima factura %billName% ($%billAmount%) vence en %days% días, lo que te dejará con $%remainingBalance%.",
    yesSafeToSpendNoBills: "Sí, puedes gastar $%amount%. Tu saldo después de esta compra será de $%newBalance%.",
    yesButBeCareful: "Puedes gastar $%amount%, pero ten cuidado. Tu saldo después de esta compra será de $%newBalance%, y tienes $%upcomingBills% en facturas próximas, lo que te dejaría con $%remainingBalance%.",
    sorryCannotSpend: "Lo siento, no puedes gastar $%amount% ya que excedería tu saldo actual de $%balance%.",

    // Language toggle
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    
    // Additional translations
    financialSummary: "Resumen Financiero",
    monthlyIncome: "Ingresos Mensuales",
    monthlyBills: "Facturas Mensuales",
    availableToSpend: "Disponible para gastar",
    yourBills: "Tus Facturas",
    yourIncome: "Tus Ingresos",
    noBillsAddedYet: "No hay facturas añadidas todavía.",
    noIncomeAddedYet: "No hay ingresos añadidos todavía.",
    dueOnThe: "Vence el",
    recentDeductions: "Deducciones recientes",
    job: "Trabajo",
    weekly: "Semanal",
    'bi-weekly': "Quincenal",
    mo: "mes",
    paymentCalendar: "Calendario de Pagos",
    calendarLegend: "Leyenda del Calendario",
    billsDue: "Facturas por Pagar",
    sun: "Dom",
    mon: "Lun",
    tue: "Mar",
    wed: "Mié",
    thu: "Jue",
    fri: "Vie",
    sat: "Sáb",
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre",
    
    // Bill names
    electric: "Electricidad",
    rent: "Alquiler",
    phoneService: "Servicio Telefónico",
    water: "Agua",
    internet: "Internet"
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