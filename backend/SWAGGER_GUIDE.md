# Swagger API Documentation Guide

## Overview

Swagger UI has been successfully integrated into the Panorama Image Management API. This provides interactive API documentation where you can explore and test all endpoints directly from your browser.

## Access Swagger UI

Once the server is running, you can access the Swagger documentation at:

**Swagger UI Interface:**

```
http://localhost:5000/api-docs
```

**Swagger JSON Specification:**

```
http://localhost:5000/api-docs.json
```

## Features

### 📚 Complete API Documentation

- **Authentication Endpoints**: Register, login, and get current user
- **Image Management**: Upload, list, get, download, bookmark, and delete images
- **Analytics**: Get comprehensive analytics data
- **Activities**: Track user activities

### 🔐 JWT Authentication Testing

The Swagger UI includes built-in authentication support:

1. **Register or Login** to get a JWT token
2. Click the **"Authorize"** button at the top right
3. Enter your token in the format: `Bearer YOUR_TOKEN_HERE`
4. All subsequent requests will include the authentication header

### 🧪 Interactive Testing

- **Try it out**: Click "Try it out" on any endpoint
- **Fill parameters**: Enter required parameters and request body
- **Execute**: Click "Execute" to make a real API call
- **View response**: See the actual response with status code, headers, and body

## Quick Start

### 1. Start the Server

```bash
cd backend
npm run dev
```

### 2. Open Swagger UI

Navigate to `http://localhost:5000/api-docs` in your browser

### 3. Test Authentication Flow

#### Register a New User

1. Expand `POST /api/auth/register`
2. Click "Try it out"
3. Enter user details:

```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

4. Click "Execute"
5. Copy the `token` from the response

#### Authorize Requests

1. Click the **"Authorize"** button (lock icon) at the top
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"
4. Click "Close"

#### Test Protected Endpoint

1. Expand `GET /api/auth/me`
2. Click "Try it out"
3. Click "Execute"
4. You should see your user data

### 4. Test Image Operations

#### Upload an Image

1. Expand `POST /api/images`
2. Click "Try it out"
3. Click "Choose File" and select a panorama image
4. Optionally enter a custom name
5. Click "Execute"
6. Copy the image `id` from the response

#### List Images

1. Expand `GET /api/images`
2. Click "Try it out"
3. Set optional filters:
   - `search`: Search by name
   - `bookmarked`: true/false
   - `page`: Page number
   - `limit`: Items per page
   - `sortBy`: uploadedAt, name, or size
   - `order`: asc or desc
4. Click "Execute"

#### Toggle Bookmark

1. Expand `PATCH /api/images/{id}/bookmark`
2. Click "Try it out"
3. Enter the image ID
4. Click "Execute"

#### Download Image

1. Expand `GET /api/images/{id}/download`
2. Click "Try it out"
3. Enter the image ID
4. Click "Execute"
5. The image file will be downloaded

#### Get Analytics

1. Expand `GET /api/images/analytics`
2. Click "Try it out"
3. Click "Execute"
4. View comprehensive analytics data

## API Endpoints Summary

### Authentication

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | Login user        | No            |
| GET    | `/api/auth/me`       | Get current user  | Yes           |

### Images

| Method | Endpoint                    | Description      | Auth Required |
| ------ | --------------------------- | ---------------- | ------------- |
| POST   | `/api/images`               | Upload image     | No            |
| GET    | `/api/images`               | List images      | No            |
| GET    | `/api/images/{id}`          | Get single image | No            |
| GET    | `/api/images/{id}/download` | Download image   | No            |
| PATCH  | `/api/images/{id}/bookmark` | Toggle bookmark  | No            |
| DELETE | `/api/images/{id}`          | Delete image     | No            |

### Analytics

| Method | Endpoint                | Description   | Auth Required |
| ------ | ----------------------- | ------------- | ------------- |
| GET    | `/api/images/analytics` | Get analytics | No            |

## Schema Definitions

### Image Schema

```json
{
  "id": "string",
  "name": "string",
  "originalName": "string",
  "filename": "string",
  "filepath": "string",
  "size": "number",
  "mimetype": "string",
  "isBookmarked": "boolean",
  "uploadedAt": "date-time",
  "updatedAt": "date-time"
}
```

### User Schema

```json
{
  "id": "string",
  "email": "string (email format)",
  "name": "string",
  "role": "user | admin",
  "createdAt": "date-time"
}
```

### Error Schema

```json
{
  "success": false,
  "error": {
    "message": "string"
  }
}
```

## Response Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 500  | Internal Server Error |

## Tips for Using Swagger UI

### 1. Explore Before Testing

- Browse all available endpoints
- Read descriptions and parameter requirements
- Check response schemas

### 2. Use Example Values

- Swagger provides example values for all fields
- Modify them to test different scenarios

### 3. Check Response Headers

- Click on "Headers" tab to see response headers
- Useful for debugging CORS and authentication issues

### 4. Download OpenAPI Spec

- Use the JSON spec at `/api-docs.json`
- Import into Postman, Insomnia, or other API clients
- Generate client SDKs using OpenAPI Generator

### 5. Test Error Cases

- Try invalid data to see error responses
- Test authentication failures
- Check validation errors

## Integration with Other Tools

### Postman

1. In Postman, click "Import"
2. Select "Link"
3. Enter: `http://localhost:5000/api-docs.json`
4. Click "Continue" and "Import"

### Insomnia

1. In Insomnia, click "Import/Export"
2. Select "Import Data" → "From URL"
3. Enter: `http://localhost:5000/api-docs.json`
4. Click "Fetch and Import"

### OpenAPI Generator

Generate client libraries in various languages:

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i http://localhost:5000/api-docs.json \
  -g typescript-axios \
  -o ./generated-client
```

## Customization

The Swagger configuration is located at:

```
backend/src/config/swagger.ts
```

You can customize:

- API title and description
- Server URLs
- Contact information
- License
- Security schemes
- Schema definitions
- Tags and grouping

## Troubleshooting

### Swagger UI Not Loading

- Check if server is running on port 5000
- Clear browser cache
- Check console for errors

### Authentication Not Working

- Ensure you include "Bearer " prefix
- Check token expiration (default: 7 days)
- Verify JWT_SECRET is set in .env

### File Upload Issues

- Ensure Content-Type is multipart/form-data
- Check file size limits in multer config
- Verify upload directory permissions

## Next Steps

1. ✅ **Explore the API** using Swagger UI
2. ✅ **Test all endpoints** interactively
3. ✅ **Export the spec** for client generation
4. ✅ **Share with frontend team** for integration
5. ✅ **Use in development** for API testing

## Additional Resources

- [Swagger Documentation](https://swagger.io/docs/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger UI GitHub](https://github.com/swagger-api/swagger-ui)

---

**Happy API Testing! 🚀**
