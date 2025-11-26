# GraphQL Query Examples

## Access GraphQL Playground

Open in browser: `http://localhost:5000/graphql`

---

## Authentication Queries

### 1. Register User

```graphql
mutation {
  register(
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
  ) {
    user {
      id
      email
      name
      role
      createdAt
    }
    token
  }
}
```

### 2. Login

```graphql
mutation {
  login(email: "user@example.com", password: "password123") {
    user {
      id
      email
      name
    }
    token
  }
}
```

### 3. Get Current User (Requires Auth Header)

```graphql
query {
  me {
    id
    email
    name
    role
    createdAt
  }
}
```

**HTTP Headers:**

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

---

## Image Queries

### 1. Get All Images

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

### 2. Search Images

```graphql
query {
  images(search: "building") {
    images {
      id
      name
      isBookmarked
    }
    pagination {
      total
    }
  }
}
```

### 3. Filter Bookmarked Images

```graphql
query {
  images(bookmarked: true) {
    images {
      id
      name
      uploadedAt
    }
    pagination {
      total
    }
  }
}
```

### 4. Get Single Image

```graphql
query {
  image(id: "IMAGE_ID_HERE") {
    id
    name
    originalName
    filename
    filepath
    size
    mimetype
    isBookmarked
    uploadedAt
    updatedAt
  }
}
```

### 5. Advanced Search with Sorting

```graphql
query {
  images(
    search: "panorama"
    bookmarked: false
    page: 1
    limit: 5
    sortBy: "size"
    order: "desc"
  ) {
    images {
      id
      name
      size
      isBookmarked
    }
    pagination {
      total
      pages
    }
  }
}
```

---

## Analytics Queries

### 1. Get Full Analytics

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

### 2. Get Summary Only

```graphql
query {
  analytics {
    summary {
      totalImages
      bookmarkedCount
      bookmarkPercentage
    }
  }
}
```

---

## Image Mutations

### 1. Toggle Bookmark (Requires Auth)

```graphql
mutation {
  toggleBookmark(id: "IMAGE_ID_HERE") {
    id
    name
    isBookmarked
    updatedAt
  }
}
```

### 2. Delete Image (Requires Auth)

```graphql
mutation {
  deleteImage(id: "IMAGE_ID_HERE")
}
```

---

## Combined Queries

### Get Everything at Once

```graphql
query {
  # Get images
  images(limit: 5) {
    images {
      id
      name
      isBookmarked
    }
  }

  # Get analytics
  analytics {
    summary {
      totalImages
      bookmarkedCount
    }
  }

  # Get current user (if authenticated)
  me {
    email
    name
  }
}
```

---

## Using cURL

### Register

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { register(email: \"test@example.com\", password: \"pass123\", name: \"Test User\") { user { id email } token } }"
  }'
```

### Get Images

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ images { images { id name } } }"
  }'
```

### With Authentication

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ me { email name } }"
  }'
```

### Toggle Bookmark

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation { toggleBookmark(id: \"IMAGE_ID\") { id isBookmarked } }"
  }'
```

---

## Query Variables

Instead of hardcoding values, use variables:

### Query with Variables

```graphql
query GetImages($search: String, $bookmarked: Boolean, $page: Int) {
  images(search: $search, bookmarked: $bookmarked, page: $page) {
    images {
      id
      name
      isBookmarked
    }
    pagination {
      total
    }
  }
}
```

### Variables JSON

```json
{
  "search": "building",
  "bookmarked": true,
  "page": 1
}
```

---

## Error Handling

GraphQL returns errors in a structured format:

```json
{
  "errors": [
    {
      "message": "Not authenticated",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ],
  "data": null
}
```

Common error codes:

- `UNAUTHENTICATED` - No valid token provided
- `NOT_FOUND` - Resource not found
- `BAD_USER_INPUT` - Invalid input data

---

## Tips

1. **Use GraphQL Playground** for interactive testing
2. **Enable introspection** to see full schema
3. **Use fragments** for reusable query parts
4. **Batch queries** to reduce network requests
5. **Use variables** instead of hardcoding values

---

## Fragments Example

```graphql
fragment ImageDetails on Image {
  id
  name
  size
  isBookmarked
  uploadedAt
}

query {
  images {
    images {
      ...ImageDetails
    }
  }

  image(id: "123") {
    ...ImageDetails
    filepath
    mimetype
  }
}
```

---

## Aliases Example

```graphql
query {
  bookmarked: images(bookmarked: true) {
    images {
      id
      name
    }
  }

  unbookmarked: images(bookmarked: false) {
    images {
      id
      name
    }
  }
}
```

---

## Next Steps

1. Test queries in GraphQL Playground
2. Integrate with frontend (Apollo Client)
3. Add subscriptions for real-time updates
4. Implement data loaders for optimization
5. Add more complex queries as needed
