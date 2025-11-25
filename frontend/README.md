# Panorama Viewer Frontend

A modern React application for viewing and managing 360° panorama images.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run with Docker
npm run docker:up
```

## 📋 Requirements Met

✅ **Upload & Download panorama images**
✅ **List panorama images in a table with metadata**
✅ **Search panorama images by name**
✅ **Bookmark panorama images**
✅ **Filter panorama images by bookmark status**
✅ **Show data analytics with charts**
✅ **Panorama viewer with Three.js**

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Ant Design** - UI components
- **Three.js** - 3D panorama rendering
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation
- **Zustand** - State management

## 📁 Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── services/        # API services
├── hooks/           # Custom hooks
├── types/           # TypeScript types
├── utils/           # Utilities
└── styles/          # Global styles
```

## 🐳 Docker

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker build -t panorama-frontend .
docker run -p 3000:80 panorama-frontend
```

## 🔧 Configuration

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Panorama Viewer
VITE_MAX_FILE_SIZE=10485760
```

## 📝 Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Lint code
- `npm run type-check` - Type checking
- `npm run docker:up` - Start with Docker
- `npm run docker:down` - Stop Docker
- `npm run docker:logs` - View logs

## 🎨 Features

### Authentication

- JWT-based authentication
- Login/Register forms
- Protected routes
- Auto token refresh

### Image Management

- Upload panorama images (drag & drop)
- Search by name
- Filter by bookmark status
- Sort by date/name/size
- Pagination
- Download images
- Delete images

### Panorama Viewer

- 360° equirectangular projection
- Mouse/touch controls
- Zoom in/out
- Fullscreen mode
- Smooth animations

### Analytics Dashboard

- Total images count
- Bookmark statistics
- Storage usage
- Upload trends (chart)
- Bookmark distribution (pie chart)

### Responsive Design

- Mobile-friendly
- Tablet optimized
- Desktop enhanced

## 🔐 Security

- JWT token storage
- Protected API routes
- XSS protection
- CSRF protection
- Secure headers (nginx)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

Output in `dist/` directory.

### Deploy with Nginx

```bash
docker build -t panorama-frontend .
docker run -d -p 80:80 panorama-frontend
```

### Environment Variables

Set `VITE_API_URL` to your production API URL.

## 🐛 Troubleshooting

### Port 3000 in use

```bash
# Change port
FRONTEND_PORT=3001 npm run docker:up
```

### API connection failed

1. Check backend is running
2. Verify VITE_API_URL in .env
3. Check CORS settings

### Docker build fails

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📄 License

MIT

## 👥 Author

Created for Airsquire fullstack engineer interview
