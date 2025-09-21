# Drobná Stavba - Construction Website

A modern web application for small construction projects with user authentication, order management, and interactive forms.

## Features

- **User Authentication**: Register, login, and logout functionality
- **Interactive Form**: Multi-field form with validation including:
  - Text field for work description
  - Checkbox for contact consent
  - Select dropdown for work type
  - Phone number with format validation
  - Interactive map for location selection
- **Order Management**: View and manage user orders
- **Responsive Design**: Modern, mobile-friendly interface
- **Database**: SQLite database for data persistence

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Authentication**: bcrypt for password hashing, express-session for sessions
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Maps**: Leaflet.js for interactive maps

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   Open your browser and go to `http://localhost:3000`

### Database

The application automatically creates a SQLite database (`database.sqlite`) with the following tables:
- `users`: User accounts with authentication
- `orders`: User orders with form data and location coordinates

## Usage

1. **Registration**: Create a new account using the "Registrovat" button
2. **Login**: Use your credentials to log in
3. **Create Order**: Click "Nová objednávka" to access the form
4. **Fill Form**: Complete all required fields:
   - Describe the work needed
   - Select work type from dropdown
   - Enter valid phone number
   - Check consent checkbox
   - Click on map to select location
5. **Submit**: Click "Odeslat objednávku" when all fields are valid
6. **View Orders**: Return to homepage to see your submitted orders

## Form Validation

- **Text Field**: Required, must not be empty
- **Select Box**: Required, must select a work type
- **Phone Number**: Required, must match international format
- **Checkbox**: Optional consent for contact
- **Map**: Required, must click to select location
- **Submit Button**: Only enabled when all required fields are valid

## API Endpoints

- `GET /` - Homepage
- `GET /form` - Order form (requires authentication)
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info
- `GET /api/orders` - Get user orders
- `POST /api/submit-form` - Submit new order

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization
- SQL injection protection with parameterized queries

## Development

The project structure:
```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── database.sqlite        # SQLite database (created automatically)
└── public/                # Static files
    ├── homepage.html      # Main page
    ├── form.html          # Order form page
    ├── styles.css         # CSS styling
    ├── homepage.js        # Homepage functionality
    └── form.js            # Form functionality
```

## License

MIT License - feel free to use and modify as needed.
