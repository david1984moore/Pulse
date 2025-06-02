Pulse - Personal Finance Management App
A sophisticated financial tracking application that transforms personal finance management into an engaging, interactive experience with cutting-edge UI design and smart financial insights.

Features
Real-time Financial Tracking: Track income, bills, and expenses with instant balance calculations
AI-Powered Spending Advisor: Ask Alice, your financial assistant, if you can afford specific purchases
Interactive Calendar: Visual bill tracking with dynamic month display and due date indicators
Responsive Design: Optimized for mobile, tablet, and desktop with clean, modern UI
Secure Authentication: Password-based login with session management
Multi-language Support: English and Spanish language options
Real-time Animations: ECG-style animations for financial insights
Tech Stack
Frontend
React 18 with TypeScript
Tailwind CSS for styling
Wouter for client-side routing
TanStack Query for data fetching
React Hook Form with Zod validation
Lucide React for icons
Framer Motion for animations
Backend
Express.js with TypeScript
PostgreSQL with Drizzle ORM
Passport.js for authentication
Express Session with PostgreSQL store
CSRF protection with rate limiting
Development
Vite for build tooling
ESBuild for production builds
TypeScript for type safety
Getting Started
Prerequisites
Node.js 18+
PostgreSQL database
npm or yarn
Installation
Clone the repository:
git clone https://github.com/david1984moore/Pulse.git
cd Pulse
Install dependencies:
npm install
Set up environment variables:
Create a .env file with:
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
NODE_ENV=development
Set up the database:
npm run db:push
Start the development server:
npm run dev
The app will be available at http://localhost:5000

Project Structure
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Backend Express application
│   ├── routes.ts          # API routes
│   ├── auth.ts           # Authentication logic
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── package.json          # Project dependencies
Available Scripts
npm run dev - Start development server
npm run build - Build for production
npm run start - Start production server
npm run check - Type checking
npm run db:push - Push database schema changes
Features Overview
Financial Dashboard
Income and expense tracking
Bill due date management
Account balance monitoring
Spending categorization
AI Financial Assistant (Alice)
Natural language spending queries
Real-time affordability analysis
Bill due date awareness
Contextual financial advice
Calendar Integration
Visual bill tracking
Monthly view with navigation
Due date indicators
Interactive bill management
Security Features
Secure user authentication
Password hashing with salt
CSRF protection
Rate limiting
Session management
Deployment
The application is ready for deployment on platforms like:

Heroku
Railway
Render
DigitalOcean App Platform
AWS
Google Cloud Platform
Ensure you set up the required environment variables on your deployment platform.

Contributing
Fork the repository
Create a feature branch
Make your changes
Add tests if applicable
Submit a pull request
License
This project is licensed under the MIT License.

Support
For support or questions, please open an issue on the GitHub repository.
