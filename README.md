# Internshipper

Internshipper is a comprehensive platform designed to streamline the internship application and tracking process. It provides a centralized hub for students to discover opportunities and for administrators to manage internship postings.

## Features

- **User Authentication:** Secure signup and login for students and administrators.
- **Internship Discovery:** Browse and search for available internship opportunities with filters.
- **Internship Management:** Administrators can post, edit, and delete internship listings.
- **Application Tracking:** Users can track their applied internships and their status.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Dark Mode Support:** Toggle between light and dark themes for a personalized experience.

## Technologies Used

### Frontend
- **React 19:** Modern UI library.
- **Vite:** Fast build tool and development server.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **React Router Dom:** For declarative routing.
- **TanStack Query (React Query):** For efficient data fetching and caching.
- **Axios:** For making API requests.

### Backend
- **Node.js & Express:** Robust server-side framework.
- **MongoDB & Mongoose:** NoSQL database for flexible data storage.
- **JSON Web Tokens (JWT):** For secure user authentication.
- **Cloudinary:** For image storage and management.
- **Bcryptjs:** For password hashing.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image uploads)

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/internshipper.git
   cd internshipper
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
internshipper/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── api/        # API service layer
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth and Theme contexts
│   │   ├── pages/      # Application pages/routes
│   │   └── utils/      # Helper functions
│   └── public/          # Static assets
├── server/              # Backend Node.js/Express application
│   ├── config/         # DB and Cloudinary configurations
│   ├── middleware/     # Custom Express middlewares
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── utils/          # Backend utilities
└── README.md
```

## License

This project is licensed under the MIT License.
