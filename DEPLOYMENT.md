# Deployment Configuration

## Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_API_URL=http://localhost:5294/api/v1
```

### Production Environment

For production deployment, update the `.env.production` file:

```env
VITE_API_URL=https://api.urbania360.com/api/v1
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Server will start on http://localhost:5173
```

## Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

## Docker Deployment (Optional)

### Dockerfile

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5294;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:5294/api/v1
    depends_on:
      - backend
    networks:
      - urbania-network

  backend:
    image: urbania360-backend:latest
    ports:
      - "5294:5294"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=...
    networks:
      - urbania-network

networks:
  urbania-network:
    driver: bridge
```

## Build and Deploy

```bash
# Build Docker image
docker build -t urbania360-frontend:latest .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f frontend
```

## Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable in Vercel dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-api.com/api/v1`

## Netlify Deployment

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

4. Set environment variable in Netlify dashboard:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-api.com/api/v1`

## Azure Static Web Apps

1. Install Azure CLI and Static Web Apps CLI

2. Create `staticwebapp.config.json`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/*.{css,scss,js,png,gif,ico,jpg,svg}"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
```

3. Deploy via GitHub Actions or Azure CLI

## CORS Configuration

Ensure your backend API allows requests from your frontend domain.

In your .NET backend, configure CORS in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins(
                "http://localhost:5173",  // Development
                "https://urbania360.com"  // Production
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

app.UseCors("AllowFrontend");
```

## Health Check

The frontend will automatically connect to the backend API. To verify:

1. Open browser console
2. Check Network tab for API calls to `VITE_API_URL`
3. Ensure responses are successful (2xx status codes)

## Troubleshooting

### API Connection Issues

- Verify `VITE_API_URL` is correct
- Check CORS configuration in backend
- Ensure backend is running and accessible
- Check browser console for errors

### Authentication Issues

- Verify JWT token is being saved to localStorage
- Check token expiration
- Ensure Authorization header is being sent

### Permission Issues

- Verify user role is correctly stored
- Check permission logic in `permissions.js`
- Ensure backend is returning correct role in JWT

## Monitoring

Consider adding monitoring tools:

- **Sentry** for error tracking
- **Google Analytics** for user behavior
- **LogRocket** for session replay

## Performance Optimization

1. Enable gzip compression in nginx
2. Configure caching headers
3. Use CDN for static assets
4. Implement code splitting
5. Lazy load routes

## Security Checklist

- ✅ HTTPS enabled in production
- ✅ CORS properly configured
- ✅ JWT tokens stored securely
- ✅ Sensitive data not exposed in frontend
- ✅ API calls use Authorization headers
- ✅ Input validation on frontend
- ✅ Content Security Policy configured
