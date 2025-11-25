# IT Services CRM - Frontend

A complete, fully responsive admin dashboard for managing IT services CRM operations including leads, requirements, and quotations.

## 🎯 Features

### Authentication
- Secure JWT-based authentication
- Auto-redirect on token expiration
- Protected routes throughout the application

### Leads Management
- **Mobile-based client identification** - Use mobile number as unique identifier
- **Multiple requirements per client** - Track unlimited requirements for each client
- Create, view, edit leads with comprehensive information
- Client lookup by mobile number (auto-fill for existing clients)
- **Editable client fields** - Name, email, mobile, WhatsApp can be updated anytime
- Track technology, platform, budget, and status
- Follow-up management with dates and status
- Quick contact actions (phone, WhatsApp, email)

### Quotations Management
- Professional quotation creation with PDF generation
- **Mobile-based client lookup** - Start by entering mobile number
- **Requirement selection** - Choose from client's existing requirements
- **Editable template fields** - All client and requirement details remain editable
- Link quotations to specific requirements (leadId)
- Status tracking (Draft, Sent, Approved, Rejected)
- PDF upload and download functionality
- Comprehensive quotation list with filtering

### Dashboard
- Overview statistics
- Recent leads and quotations
- Quick access to all modules

## 🏗️ Architecture

### Backend Integration
The CRM follows a specific architecture:
- **No separate Client table** - Client data stored with each lead
- **Lead = Client + Requirement** - Each lead row represents one client requirement
- **Mobile as unique identifier** - Group multiple requirements by mobile number
- **Quotations linked to requirements** - Each quotation references a specific leadId

### Key Endpoints Expected

**Authentication:**
- `POST /api/auth/login` - Login with email and password

**Leads:**
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get single lead
- `GET /api/leads/by-mobile/:mobile` - Get all leads for a mobile number
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead (including client fields)
- `DELETE /api/leads/:id` - Delete lead

**Quotations:**
- `GET /api/quotations` - Get all quotations
- `GET /api/quotations/:id` - Get single quotation
- `POST /api/quotations/upload` - Create quotation with PDF upload
- `PUT /api/quotations/:id` - Update quotation
- `POST /api/quotations/:id/upload-pdf` - Upload PDF for existing quotation
- `DELETE /api/quotations/:id` - Delete quotation

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running (see backend documentation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and set your API URL:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📋 Usage Guide

### First Time Setup
1. Access the login page at `/login`
2. Enter your credentials (configured in backend)
3. You'll be redirected to the dashboard

### Creating a Lead
1. Navigate to Leads → Create Lead
2. Enter mobile number and click "Fetch Existing Client"
   - If client exists: Name, email, WhatsApp will auto-fill (but remain editable)
   - If new client: Fill in all client details
3. Previous requirements will be shown (if any)
4. Fill in the new requirement details:
   - Technology (dropdown)
   - Platform (dropdown)
   - Received Date
   - Lead Source (dropdown)
   - Follow-up Status (enum dropdown)
   - Follow-up Date
   - Budget (enum dropdown)
   - Lead Status (enum dropdown)
   - Description
5. Click "Create Lead"

### Editing a Lead
1. From Leads list, click "Edit" on any lead
2. **All fields are editable** including:
   - Client info (name, mobile, email, WhatsApp)
   - Requirement details
3. Click "Update Lead" to save changes

### Creating a Quotation
1. Navigate to Quotations → Create Quotation
2. **Mobile Popup appears**:
   - Enter client's mobile number
   - System fetches all requirements for that mobile
   - Select the specific requirement for this quotation
3. **Quotation Template Opens**:
   - Client name auto-fills from database
   - All other fields remain editable (email, WhatsApp, technology, address, etc.)
   - Edit any section of the quotation template
   - Add/remove scope sections
   - Customize timeline, costs, and terms
4. Click "Save & Upload" to generate and save PDF

### Viewing Lead Details
1. Click "View" on any lead
2. See complete client and requirement information
3. View all quotations linked to this requirement
4. Quick access to create new quotation for this requirement
5. Use contact action buttons (phone, WhatsApp, email)

## 🎨 Design System

The application uses a professional teal and coral color scheme:
- **Primary**: Teal (180° 70% 45%) - Main brand color
- **Accent**: Coral (15° 85% 60%) - Call-to-action elements
- **Success**: Green (142° 71% 45%)
- **Warning**: Orange (38° 92% 50%)
- **Destructive**: Red (0° 72% 51%)

All colors are defined as HSL values in `src/index.css` for easy theming.

## 📱 Responsive Design

The dashboard is fully responsive:
- **Mobile**: Collapsible sidebar with hamburger menu
- **Tablet**: Optimized layouts for medium screens
- **Desktop**: Full sidebar and multi-column layouts

## 🔒 Security Features

- JWT token stored in localStorage
- Automatic token validation on each request
- Auto-logout on 401 responses
- Protected routes with redirect to login
- No sensitive data logged in production

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Query** - Server state management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Select** - Enhanced dropdowns
- **html2pdf.js** - PDF generation

## 📦 Project Structure

```
src/
├── api/              # API client and endpoints
│   ├── axiosConfig.ts
│   ├── auth.ts
│   ├── leads.ts
│   └── quotations.ts
├── components/       # Reusable components
│   ├── layout/
│   │   └── DashboardLayout.tsx
│   ├── ui/          # Shadcn components
│   └── ProtectedRoute.tsx
├── pages/           # Page components
│   ├── leads/
│   │   ├── LeadsList.tsx
│   │   ├── CreateLead.tsx
│   │   ├── ViewLead.tsx
│   │   └── EditLead.tsx
│   ├── quotations/
│   │   ├── QuotationsList.tsx
│   │   ├── QuotationCreate.tsx
│   │   ├── EditQuotation.tsx
│   │   └── MobilePopup.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Index.tsx
├── types/           # TypeScript types and enums
│   └── index.ts
├── App.tsx          # Main app component
└── index.css        # Design system
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL`: Backend API base URL

### Customization
- Colors: Edit `src/index.css` HSL values
- Company branding: Update quotation template in `QuotationCreate.tsx`
- Enum values: Match backend enums in `src/types/index.ts`

## 🐛 Troubleshooting

### Login Issues
- Verify backend API is running
- Check `VITE_API_URL` in `.env`
- Ensure credentials are correct

### Leads Not Loading
- Check network tab for API errors
- Verify JWT token is being sent
- Check backend CORS settings

### PDF Generation Issues
- Ensure `html2pdf.js` is installed
- Check browser console for errors
- Verify quotation data is complete

## 📄 License

[Your License Here]

## 👥 Support

For support and questions, contact [your-email@example.com]
