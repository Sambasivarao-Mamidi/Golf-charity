# Golf Charity Subscription Platform

A full-stack MERN (MongoDB, Express, React, Node.js) golf lottery platform where subscribers can submit scores, enter weekly draws, and support charities.

## Features

- **User Authentication** - JWT-based registration/login with role-based access
- **Subscription System** - Stripe-powered monthly/yearly subscriptions
- **Score Submission** - Submit up to 5 golf scores per week
- **Weekly Draws** - Random or weighted winner selection (3/4/5 match prizes)
- **Charity Integration** - Donations go to user-selected charities
- **Winner Verification** - Admin approves winners with proof upload
- **Reports & Analytics** - Dashboard with charts and exportable reports
- **Email Notifications** - Welcome emails, password reset, winner notifications

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: JWT, bcrypt
- **Payments**: Stripe
- **Email**: SendGrid (via Twilio)
- **Image Upload**: Cloudinary

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Create .env file (see Environment Variables below)
cp .env.example .env

# Run development server (port 5000)
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client URL
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (SendGrid)
EMAIL_MODE=real
EMAIL_FROM=Your Name <your-email@gmail.com>
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
│   └── ...
├── config/                 # Database & cloud config
├── controllers/           # Route handlers (MVC)
├── middleware/            # Auth, validation, rate limiting
├── models/                # MongoDB schemas
├── routes/                # Express routes
├── seeds/                 # Database seeding scripts
├── services/              # External services (Stripe)
├── utils/                 # Email, validators
├── server.js              # Express entry point
└── package.json
```

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repo
4. Set environment variables in Render dashboard
5. Deploy

### Frontend (Vercel)

1. Import the repo in Vercel
2. Select the `client` folder as root
3. Add environment variable:
   - `VITE_API_URL` = your backend URL (e.g., https://your-backend.onrender.com)
4. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Subscriptions
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout
- `POST /api/subscriptions/webhook` - Stripe webhook
- `GET /api/subscriptions/status` - Get subscription status

### Scores
- `GET /api/scores` - Get user's scores
- `POST /api/scores` - Submit score
- `PUT /api/scores/:id` - Update score
- `DELETE /api/scores/:id` - Delete score

### Draws
- `GET /api/draws` - List draws
- `GET /api/draws/:id` - Get draw details
- `POST /api/draws` - Create draw (admin)
- `POST /api/draws/:id/publish` - Publish draw (admin)
- `GET /api/draws/winners/me` - Get user's winnings
- `POST /api/draws/:drawId/winners/:winnerId/upload` - Upload proof

### Charities
- `GET /api/charities` - List charities
- `POST /api/charities` - Create charity (admin)
- `PUT /api/charities/:id` - Update charity (admin)
- `POST /api/charities/:id/donate` - Make donation

### Users
- `GET /api/users` - List users (admin)
- `PUT /api/users/:id` - Update user (admin)
- `POST /api/users/:id/reset-password` - Admin reset password

### Reports
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/winners` - Winner reports
- `GET /api/reports/charities` - Charity reports

## Seeding Data

```bash
# Seed admin user
npm run seed:admin

# Seed charities
npm run seed:charities
```

Default admin credentials:
- Email: admin@golfcharity.com
- Password: Admin123!

## License

MIT
