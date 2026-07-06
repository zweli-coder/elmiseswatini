# ELMIS API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
6. [Response Format](#response-format)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## Overview

The ELMIS (Eswatini Labour Market Information System) API provides programmatic access to comprehensive labour market data including:
- Job listings and vacancies
- Labour statistics and indicators
- Economic sector information
- Education and training opportunities
- Publications and reports

**API Version:** 1.0  
**Last Updated:** 2026-07-03

---

## Authentication

### Public Endpoints
Most endpoints are publicly accessible without authentication.

### Protected Endpoints (Admin Only)
Protected endpoints require Bearer token authentication:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  https://api.elmis.gov.sz/api/admin/statistics
```

---

## Base URL

**Development:**
```
http://localhost:3001/api
```

**Production:**
```
https://elmis-eswatini-api.onrender.com/api
```

---

## Rate Limiting

- **Limit:** 1,000 requests per hour per IP address
- **Headers:** Rate limit info is included in response headers
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Endpoints

### 1. Publications

#### GET /publications
Retrieve all publications, reports, and documents.

**Parameters:**
- `type` (optional): Filter by type (Laws, Policies, Reports, Questionnaires)
- `year` (optional): Filter by year
- `category` (optional): Filter by category
- `search` (optional): Search query

**Response:**
```json
{
  "publications": [
    {
      "id": "1",
      "title": "Labour Market Report 2024",
      "description": "Annual labour market analysis",
      "category": "Report",
      "type": "Reports",
      "year": "2024",
      "file_url": "/uploads/publications/report-2024.pdf",
      "file_type": "pdf",
      "size": "2.5 MB",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `404`: No publications found
- `500`: Server error

---

### 2. Statistics

#### GET /statistics
Retrieve labour market statistics and indicators.

**Parameters:**
- `year` (optional): Filter by specific year
- `sector` (optional): Filter by economic sector
- `type` (optional): Filter by statistic type
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "statistics": [
    {
      "id": "1",
      "title": "Employment Rate Q1 2024",
      "value": "85.2",
      "unit": "percentage",
      "year": "2024",
      "quarter": "Q1",
      "sector": "Manufacturing",
      "description": "Employment rate across manufacturing sector",
      "source": "Ministry of Labour",
      "created_at": "2024-03-31T00:00:00Z"
    }
  ],
  "total": 145,
  "limit": 100,
  "offset": 0
}
```

#### GET /statistics/:id
Retrieve a specific statistic record.

**Response:**
```json
{
  "id": "1",
  "title": "Employment Rate Q1 2024",
  "value": "85.2",
  "unit": "percentage",
  "year": "2024",
  "quarter": "Q1",
  "sector": "Manufacturing"
}
```

---

### 3. Vacancies

#### GET /vacancies
Retrieve all job vacancies.

**Parameters:**
- `sector` (optional): Filter by economic sector
- `status` (optional): Filter by status (active, closed, pending)
- `employer` (optional): Filter by employer ID
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset
- `search` (optional): Search query

**Response:**
```json
{
  "vacancies": [
    {
      "id": "1",
      "title": "Software Engineer",
      "description": "Develop and maintain web applications",
      "sector": "Information Technology",
      "employer_id": "emp-001",
      "employer_name": "Tech Company Ltd",
      "location": "Mbabane",
      "salary_range": "12000-18000",
      "currency": "SZL",
      "employment_type": "Full-time",
      "experience_required": "2-3 years",
      "status": "active",
      "posted_date": "2024-06-01T10:00:00Z",
      "closing_date": "2024-07-15T23:59:59Z",
      "applications_count": 25
    }
  ],
  "total": 342,
  "limit": 50,
  "offset": 0
}
```

#### GET /vacancies/:id
Retrieve a specific vacancy details.

**Response:**
```json
{
  "id": "1",
  "title": "Software Engineer",
  "description": "...",
  "requirements": [
    "Bachelor's degree in Computer Science",
    "2-3 years experience"
  ],
  "benefits": [
    "Health insurance",
    "Annual leave"
  ],
  "status": "active"
}
```

#### POST /vacancies (Admin Only)
Create a new job vacancy.

**Request:**
```json
{
  "title": "Project Manager",
  "description": "Lead project initiatives",
  "sector": "Project Management",
  "location": "Mbabane",
  "salary_range": "15000-20000",
  "employment_type": "Full-time",
  "experience_required": "3-5 years",
  "closing_date": "2024-08-15T23:59:59Z"
}
```

**Response:** Created vacancy object with ID

---

### 4. Economic Sectors

#### GET /economic-sectors
Retrieve all economic sectors.

**Response:**
```json
{
  "sectors": [
    {
      "id": "1",
      "name": "Agriculture",
      "description": "Agricultural and farming activities",
      "icon": "farming",
      "vacancies_count": 45,
      "job_seekers_count": 1230,
      "employment_rate": "78.5"
    },
    {
      "id": "2",
      "name": "Manufacturing",
      "description": "Manufacturing and production",
      "icon": "factory",
      "vacancies_count": 120,
      "job_seekers_count": 2340,
      "employment_rate": "82.3"
    }
  ]
}
```

#### GET /economic-sectors/:id
Retrieve sector details with related data.

**Response:**
```json
{
  "id": "1",
  "name": "Agriculture",
  "description": "Agricultural and farming activities",
  "statistics": {
    "total_employment": 45000,
    "unemployment_rate": "12.5"
  },
  "vacancies": [...],
  "training_programs": [...]
}
```

---

### 5. Job Seekers

#### GET /jobseekers
Retrieve job seeker profiles (public info only).

**Parameters:**
- `sector` (optional): Filter by preferred sector
- `experience_level` (optional): Entry, Intermediate, Senior
- `limit` (optional): Default 50

**Response:**
```json
{
  "job_seekers": [
    {
      "id": "js-001",
      "name": "John Doe",
      "email": "john@example.com",
      "preferred_sector": "Technology",
      "experience_level": "Intermediate",
      "qualifications": ["Bachelor's in CS"],
      "registered_date": "2024-01-10T00:00:00Z"
    }
  ]
}
```

#### POST /register/jobseeker
Register a new job seeker account.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "phone": "+268XXXXXXXX",
  "preferred_sector": "Healthcare",
  "experience_level": "Entry"
}
```

**Response:**
```json
{
  "id": "js-002",
  "message": "Registration successful. Please verify your email.",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 6. Employers

#### GET /employers
Retrieve employer profiles.

**Response:**
```json
{
  "employers": [
    {
      "id": "emp-001",
      "name": "ABC Corporation",
      "email": "contact@abc.com",
      "sector": "Manufacturing",
      "location": "Mbabane",
      "website": "https://abc.com",
      "employees_count": 250,
      "registered_date": "2023-05-20T00:00:00Z"
    }
  ]
}
```

#### POST /register/employer
Register a new employer account.

**Request:**
```json
{
  "company_name": "Tech Solutions Ltd",
  "email": "hr@techsolutions.com",
  "password": "companyPass123",
  "phone": "+268XXXXXXXX",
  "sector": "Information Technology",
  "location": "Mbabane",
  "website": "https://techsolutions.com"
}
```

---

### 7. Education & Training

#### GET /education-training
Retrieve education and training programs.

**Parameters:**
- `category` (optional): Filter by program category
- `level` (optional): Diploma, Certificate, Degree
- `sector` (optional): Related sector

**Response:**
```json
{
  "programs": [
    {
      "id": "prog-001",
      "title": "Diploma in Software Development",
      "provider": "Eswatini Institute of Technology",
      "level": "Diploma",
      "duration": "2 years",
      "sector": "Information Technology",
      "description": "Comprehensive software development program",
      "contact": "info@eit.ac.sz",
      "website": "https://eit.ac.sz"
    }
  ]
}
```

---

### 8. Career Advice

#### GET /career-advice
Retrieve career guidance articles and tips.

**Parameters:**
- `slug` (optional): Specific article slug
- `category` (optional): Filter by category

**Response:**
```json
{
  "articles": [
    {
      "id": "1",
      "title": "Tips for Job Interview Success",
      "slug": "job-interview-tips",
      "category": "Interview Preparation",
      "content": "...",
      "author": "HR Expert",
      "published_date": "2024-05-10T00:00:00Z"
    }
  ]
}
```

---

## Response Format

### Success Response
All successful responses follow this format:

```json
{
  "data": [...],
  "message": "Success message",
  "status": 200
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional error details if applicable"
}
```

---

## Error Handling

### Common Error Codes

| Code | Message | Explanation |
|------|---------|-------------|
| 400 | Bad Request | Invalid query parameters or request body |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for this resource |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 413 | Payload Too Large | Request body exceeds size limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Error Response Example
```json
{
  "error": "Invalid publication type",
  "status": 400,
  "details": "Valid types are: Laws, Policies, Reports, Questionnaires"
}
```

---

## Examples

### Example 1: Get Job Vacancies in Manufacturing
```bash
curl -X GET "https://api.elmis.gov.sz/api/vacancies?sector=Manufacturing&status=active&limit=10"
```

**Response:**
```json
{
  "vacancies": [
    {
      "id": "1",
      "title": "Production Manager",
      "sector": "Manufacturing",
      "employer_name": "XYZ Manufacturing",
      "salary_range": "18000-22000",
      "status": "active"
    }
  ],
  "total": 35
}
```

### Example 2: Search Publications
```bash
curl -X GET "https://api.elmis.gov.sz/api/publications?type=Reports&year=2024&search=employment"
```

### Example 3: Get Economic Sector Details
```bash
curl -X GET "https://api.elmis.gov.sz/api/economic-sectors/1"
```

### Example 4: Register as Job Seeker
```bash
curl -X POST "https://api.elmis.gov.sz/api/register/jobseeker" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+268XXXXXXXX",
    "preferred_sector": "Technology"
  }'
```

### Example 5: Post Job Vacancy (Admin)
```bash
curl -X POST "https://api.elmis.gov.sz/api/vacancies" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sales Executive",
    "description": "Sell products and services",
    "sector": "Sales",
    "location": "Mbabane",
    "salary_range": "10000-15000",
    "employment_type": "Full-time",
    "experience_required": "1-2 years",
    "closing_date": "2024-08-30T23:59:59Z"
  }'
```

---

## Best Practices

1. **Caching**: Cache frequently requested data locally to reduce API calls
2. **Pagination**: Use `limit` and `offset` for large datasets
3. **Error Handling**: Always check response status and handle errors gracefully
4. **Rate Limiting**: Monitor your request rate to avoid hitting limits
5. **Security**: Never expose API tokens in client-side code
6. **Filtering**: Use available filters to narrow results and improve performance

---

## Support & Contact

For API support, questions, or issues:

- **Email:** api-support@elmis.gov.sz
- **Documentation:** https://elmis.gov.sz/api-docs
- **Status Page:** https://status.elmis.gov.sz
- **Issues:** Submit bugs or feature requests via the support portal

---

## Version History

### v1.0 (Current)
- Initial API release
- All main endpoints available
- Authentication support
- Rate limiting implemented

---

**Last Updated:** July 3, 2026  
**API Version:** 1.0  
**Status:** Production
