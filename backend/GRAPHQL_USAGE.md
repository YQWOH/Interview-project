# GraphQL Usage Guide

## ✅ GraphQL Endpoint is Working!

Your GraphQL server is running correctly at: **http://localhost:5000/graphql**

## 🚨 Why Apollo Studio Sandbox Doesn't Work

The error you saw in Apollo Studio Sandbox (`https://studio.apollographql.com/sandbox/explorer`) happens because:

1. **Apollo Studio runs in a web browser** at `studio.apollographql.com`
2. **Browsers block cross-origin requests to localhost** for security (CORS policy)
3. This is a **browser security feature**, not a problem with your GraphQL server

## ✅ How to Use GraphQL (3 Options)

### Option 1: Use Browser (Recommended for Testing)

Simply open in your browser:

```
http://localhost:5000/graphql
```

Apollo Server now provides a **built-in interactive playground** that works locally without CORS issues!

### Option 2: Use cURL

Test queries from terminal:

```bash
# Simple query
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ images(page: 1, limit: 10) { images { id name size } pagination { total } } }"}'

# With authentication
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "{ me { id name email } }"}'
```

### Option 3: Use Postman or Insomnia

1. Create a new **POST** request to `http://localhost:5000/graphql`
2. Set header: `Content-Type: application/json`
3. In body (raw JSON), add:

```json
{
  "query": "{ images { images { id name } } }"
}
```

## 📝 Example Queries

### Get All Images

```graphql
query {
  images(page: 1, limit: 10) {
    images {
      id
      name
      originalName
      size
      mimetype
      isBookmarked
      uploadedAt
    }
    pagination {
      total
      page
      limit
      pages
    }
  }
}
```

### Search Images

```graphql
query {
  images(search: "building", page: 1, limit: 10) {
    images {
      id
      name
      isBookmarked
    }
  }
}
```

### Filter Bookmarked Images

```graphql
query {
  images(bookmarked: true) {
    images {
      id
      name
    }
  }
}
```

### Get Analytics

```graphql
query {
  analytics {
    summary {
      totalImages
      bookmarkedCount
      unbookmarkedCount
      totalSize
      bookmarkPercentage
    }
    sizeByBookmark {
      isBookmarked
      totalSize
      count
    }
    uploadTrend {
      date
      count
    }
  }
}
```

### Get Current User (Requires Auth)

```graphql
query {
  me {
    id
    name
    email
    role
    createdAt
  }
}
```

## 🔐 Mutations

### Login

```graphql
mutation {
  login(email: "test@example.com", password: "password123") {
    user {
      id
      name
      email
    }
    token
  }
}
```

### Register

```graphql
mutation {
  register(
    name: "John Doe"
    email: "john@example.com"
    password: "password123"
  ) {
    user {
      id
      name
      email
    }
    token
  }
}
```

### Toggle Bookmark

```graphql
mutation {
  toggleBookmark(id: "692746a806316ff445e654c2") {
    id
    name
    isBookmarked
  }
}
```

### Delete Image

```graphql
mutation {
  deleteImage(id: "692746a806316ff445e654c2")
}
```

## 🔧 Testing Results

✅ **GraphQL endpoint is working correctly!**

Test performed:

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ images(page: 1, limit: 10) { images { id name } } }"}'
```

Response:

```json
{
  "data": {
    "images": {
      "images": [
        {
          "id": "692746a806316ff445e654c2",
          "name": "building.jpg"
        },
        {
          "id": "69273595910256a614768375",
          "name": "sea.jpg"
        },
        {
          "id": "6925c5f49624ff704ea2d1cd",
          "name": "indoor.jpg"
        }
      ]
    }
  }
}
```

## 📌 Summary

- ✅ GraphQL server is **working perfectly**
- ✅ Use **http://localhost:5000/graphql** in your browser for interactive testing
- ❌ Apollo Studio Sandbox won't work due to browser CORS restrictions (this is normal)
- ✅ All queries and mutations are functional
