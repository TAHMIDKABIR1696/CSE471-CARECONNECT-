# CareConnect - Childcare & Sitter Services Platform

A modern, full-featured childcare and babysitting service platform built with React, TypeScript, and Tailwind CSS.

## Features

### Pages

1. **Home** (`/`)
   - Hero section with gradient background
   - Feature highlights (Verified Caregivers, Flexible Scheduling, etc.)
   - How It Works section
   - Testimonials from families
   - Call-to-action sections

2. **Find a Sitter** (`/find-sitter`)
   - Advanced search functionality with location and date filters
   - Grid of verified caregiver profiles
   - Rating and review system
   - Specialty tags (Infant Care, CPR Certified, etc.)
   - Distance and hourly rate information

3. **Apply as Sitter** (`/apply`)
   - Comprehensive application form
   - Benefits showcase
   - Document upload functionality
   - Requirements checklist
   - Application process timeline

4. **Pricing** (`/pricing`)
   - Three-tier pricing plans (Basic, Premium, Family Plus)
   - Detailed feature comparison
   - Additional services pricing table
   - FAQ section
   - Trust badges and guarantees

5. **Login** (`/login`)
   - Email/password authentication
   - Social login options (Google, Facebook)
   - Remember me functionality
   - Password recovery link

6. **Sign Up** (`/signup`)
   - User registration form
   - Parent/Sitter role selection
   - Social sign-up options
   - Terms and privacy policy acceptance

7. **404 Not Found** (`*`)
   - User-friendly error page
   - Navigation back to home or previous page

### Components

- **Navigation**: Responsive navbar with mobile menu, scroll effects
- **Footer**: Multi-column footer with links, contact info, and social media

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Design Features

- Gradient backgrounds and modern UI
- Fully responsive design
- Smooth transitions and animations
- Accessible form controls
- Professional color scheme (Purple/Blue gradient theme)
- Image optimization with fallback handling

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── figma/
│   │       └── ImageWithFallback.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── FindSitter.tsx
│   │   ├── Apply.tsx
│   │   ├── Pricing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── NotFound.tsx
│   └── App.tsx
├── styles/
│   ├── index.css
│   ├── tailwind.css
│   ├── theme.css
│   └── fonts.css
└── imports/
    └── home.html (original reference)
```

## Getting Started

The application is ready to run. All dependencies are already installed.

## Future Enhancements

- Backend integration with Supabase for data persistence
- Real-time messaging between parents and sitters
- Payment processing integration
- Calendar booking system
- User profile management
- Reviews and ratings system
- Advanced search filters
- Mobile app version
