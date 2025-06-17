# Express + Prisma API Example Requests (Curl)


## Users

### GET /users
Get all users (optionally sorted and filtered):

```bash
curl "http://localhost:8080/users?orderBy=name&order=desc&search=john"
```

### POST /users
Create a new user:

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```


## Posts

### GET /posts
Get all posts (optionally sorted and filtered):

```bash
curl "http://localhost:8080/posts?orderBy=createdAt&order=desc&search=my"
```

### POST /posts
Create a new post (replace 1 with an actual authorId):

```bash
curl -X POST http://localhost:8080/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of the post.",
    "published": true,
    "authorId": 1
  }'
```


## Profiles

## GET /profiles
Get all profiles (optionally sorted and filtered):

```bash
curl "http://localhost:8080/profiles?orderBy=id&order=asc&search=developer"
```

### POST /profiles
Create a new profile (replace 1 with an actual userId):

```bash
curl -X POST http://localhost:8080/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Full-stack developer",
    "userId": 3
  }'
```

<!-- TODOs: add DELETE, PUT requests, after updating to non-example schema -->