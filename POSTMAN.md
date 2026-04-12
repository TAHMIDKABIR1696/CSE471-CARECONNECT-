# 📬 Postman API Testing Guide — User Profiles & Babysitter Discovery

Complete step-by-step guide to test the **User Profiles & Babysitter Discovery** feature using Postman.

> **Base URL:** `http://localhost:5000/api`

---

## Table of Contents

1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Configure Postman Environment](#2-configure-postman-environment)
3. [Test 1 — Register a Parent](#3-test-1--register-a-parent)
4. [Test 2 — Register a Babysitter](#4-test-2--register-a-babysitter)
5. [Test 3 — Login as Parent](#5-test-3--login-as-parent)
6. [Test 4 — Login as Babysitter](#6-test-4--login-as-babysitter)
7. [Test 5 — Get Parent Profile](#7-test-5--get-parent-profile)
8. [Test 6 — Update Parent Profile](#8-test-6--update-parent-profile)
9. [Test 7 — Add Children to Parent](#9-test-7--add-children-to-parent)
10. [Test 8 — Update a Child Profile](#10-test-8--update-a-child-profile)
11. [Test 9 — Get All Children](#11-test-9--get-all-children)
12. [Test 10 — Delete a Child](#12-test-10--delete-a-child)
13. [Test 11 — Get Babysitter Profile](#13-test-11--get-babysitter-profile)
14. [Test 12 — Update Babysitter Profile](#14-test-12--update-babysitter-profile)
15. [Test 13 — Set Weekly Availability](#15-test-13--set-weekly-availability)
16. [Test 14 — Get My Availability](#16-test-14--get-my-availability)
17. [Test 15 — Upload Profile Picture](#17-test-15--upload-profile-picture)
18. [Test 16 — Upload Certification Document](#18-test-16--upload-certification-document)
19. [Test 17 — Browse All Babysitters (Public)](#19-test-17--browse-all-babysitters-public)
20. [Test 18 — Filter Babysitters by Price & Location](#20-test-18--filter-babysitters-by-price--location)
21. [Test 19 — View a Specific Babysitter Profile](#21-test-19--view-a-specific-babysitter-profile)
22. [Test 20 — Social Login (Google/Facebook)](#22-test-20--social-login-googlefacebook)
23. [Error Scenario Tests](#23-error-scenario-tests)
24. [Quick Reference Table](#24-quick-reference-table)
25. [Source Code Reference — Where to Find Each API's Code](#25-source-code-reference--where-to-find-each-apis-code)

---

## 1. Prerequisites & Setup

### Start the Backend Server

```bash
cd backend
npm install         # install dependencies (first time only)
npm run dev         # starts server on http://localhost:5000
```

You should see:
```
🚀 Server running on port 5000
✅ Connected to MongoDB
```

### Install Postman

Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/) or use the web version.

---

## 2. Configure Postman Environment

Setting up an environment lets you reuse tokens and IDs across requests.

### Step 1: Create a New Environment

1. Click the **Environments** tab (top-left sidebar) → **+ Create Environment**
2. Name it: `Sneho Local`
3. Add these variables:

| Variable             | Initial Value                  | Type    |
|----------------------|-------------------------------|---------|
| `BASE_URL`           | `http://localhost:5000/api`   | default |
| `PARENT_TOKEN`       | *(leave empty)*               | default |
| `SITTER_TOKEN`       | *(leave empty)*               | default |
| `PARENT_ID`          | *(leave empty)*               | default |
| `SITTER_ID`          | *(leave empty)*               | default |
| `SITTER_PROFILE_ID`  | *(leave empty)*               | default |
| `CHILD_ID`           | *(leave empty)*               | default |

4. Click **Save** and select `Sneho Local` from the environment dropdown (top-right corner).

### Step 2: Create a Collection

1. Click **Collections** → **+ New Collection**
2. Name it: `Sneho - User Profiles & Babysitter Discovery`
3. All requests below will be added inside this collection

---

## 3. Test 1 — Register a Parent

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `POST`                               |
| **URL**     | `{{BASE_URL}}/auth/register`         |
| **Headers** | `Content-Type: application/json`     |

### Body (raw → JSON):

```json
{
  "name": "Sarah Johnson",
  "email": "sarah.parent@example.com",
  "password": "password123",
  "role": "PARENT",
  "phone": "01712345678",
  "location": "Gulshan, Dhaka"
}
```

### Expected Response (201 Created):

```json
{
  "success": true,
  "message": "Registration successful!",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "...",
    "name": "Sarah Johnson",
    "email": "sarah.parent@example.com",
    "role": "PARENT",
    "isApproved": false,
    "isBanned": false
  }
}
```

### Auto-Save Token (Tests tab):

Paste this script in the **Scripts → Post-response** tab:

```javascript
if (pm.response.code === 201) {
    const res = pm.response.json();
    pm.environment.set("PARENT_TOKEN", res.token);
    pm.environment.set("PARENT_ID", res.user.id);
    console.log("✅ Parent token saved!");
}
```

Click **Send** → Verify status `201 Created`.

---

## 4. Test 2 — Register a Babysitter

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `POST`                               |
| **URL**     | `{{BASE_URL}}/auth/register`         |
| **Headers** | `Content-Type: application/json`     |

### Body (raw → JSON):

```json
{
  "name": "Fatima Akter",
  "email": "fatima.sitter@example.com",
  "password": "password123",
  "role": "BABYSITTER",
  "phone": "01898765432",
  "location": "Dhanmondi, Dhaka"
}
```

### Expected Response (201 Created):

```json
{
  "success": true,
  "message": "Registration successful!",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "...",
    "name": "Fatima Akter",
    "email": "fatima.sitter@example.com",
    "role": "BABYSITTER",
    "isApproved": false
  }
}
```

### Auto-Save Token (Scripts → Post-response):

```javascript
if (pm.response.code === 201) {
    const res = pm.response.json();
    pm.environment.set("SITTER_TOKEN", res.token);
    pm.environment.set("SITTER_ID", res.user.id);
    console.log("✅ Sitter token saved!");
}
```

> ⚠️ **Note:** Babysitters have `isApproved: false` by default. To test browsing, you'll need an admin to approve them, OR directly update the database:
>
> ```bash
> # Using MongoDB shell or Compass, set isApproved to true for testing
> db.User.updateOne({ email: "fatima.sitter@example.com" }, { $set: { isApproved: true } })
> ```

---

## 5. Test 3 — Login as Parent

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `POST`                               |
| **URL**     | `{{BASE_URL}}/auth/login`            |
| **Headers** | `Content-Type: application/json`     |

### Body (raw → JSON):

```json
{
  "email": "sarah.parent@example.com",
  "password": "password123"
}
```

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "...",
    "name": "Sarah Johnson",
    "email": "sarah.parent@example.com",
    "role": "PARENT"
  }
}
```

### Auto-Save Token (Scripts → Post-response):

```javascript
if (pm.response.code === 200) {
    const res = pm.response.json();
    pm.environment.set("PARENT_TOKEN", res.token);
    pm.environment.set("PARENT_ID", res.user.id);
    console.log("✅ Parent login token saved!");
}
```

---

## 6. Test 4 — Login as Babysitter

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `POST`                               |
| **URL**     | `{{BASE_URL}}/auth/login`            |
| **Headers** | `Content-Type: application/json`     |

### Body (raw → JSON):

```json
{
  "email": "fatima.sitter@example.com",
  "password": "password123"
}
```

### Auto-Save Token (Scripts → Post-response):

```javascript
if (pm.response.code === 200) {
    const res = pm.response.json();
    pm.environment.set("SITTER_TOKEN", res.token);
    pm.environment.set("SITTER_ID", res.user.id);
    console.log("✅ Sitter login token saved!");
}
```

---

## 7. Test 5 — Get Parent Profile

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `GET`                                       |
| **URL**     | `{{BASE_URL}}/user/profile`                 |

### Authorization Tab:

| Type          | Value                    |
|---------------|--------------------------|
| **Type**      | Bearer Token             |
| **Token**     | `{{PARENT_TOKEN}}`       |

### Expected Response (200 OK):

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Sarah Johnson",
    "email": "sarah.parent@example.com",
    "role": "PARENT",
    "phoneNumber": "01712345678",
    "profilePicture": null,
    "isApproved": false,
    "parentProfile": {
      "id": "...",
      "locationAddress": null,
      "latitude": null,
      "longitude": null,
      "situation": null,
      "minBudget": 0,
      "maxBudget": 0,
      "requiredDays": null,
      "children": []
    }
  }
}
```

---

## 8. Test 6 — Update Parent Profile

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `PUT`                                       |
| **URL**     | `{{BASE_URL}}/user/update-profile`          |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{PARENT_TOKEN}}` |

### Body (raw → JSON):

```json
{
  "name": "Sarah Johnson",
  "phone": "01712345678",
  "location": "Gulshan-2, Dhaka",
  "latitude": 23.7925,
  "longitude": 90.4078,
  "minBudget": 300,
  "maxBudget": 800,
  "requiredDays": "MONDAY,WEDNESDAY,FRIDAY",
  "situation": "Working parent, needs weekday care"
}
```

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "Profile updated successfully!",
  "user": {
    "name": "Sarah Johnson",
    "phoneNumber": "01712345678",
    "parentProfile": {
      "locationAddress": "Gulshan-2, Dhaka",
      "latitude": 23.7925,
      "longitude": 90.4078,
      "minBudget": 300,
      "maxBudget": 800,
      "requiredDays": "MONDAY,WEDNESDAY,FRIDAY",
      "situation": "Working parent, needs weekday care"
    }
  }
}
```

---

## 9. Test 7 — Add Children to Parent

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `POST`                               |
| **URL**     | `{{BASE_URL}}/children`              |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{PARENT_TOKEN}}` |

### Body (raw → JSON) — First Child:

```json
{
  "name": "Aryan",
  "age": 5,
  "gender": "male",
  "specialNeeds": "None",
  "stubbornnessLvl": 3,
  "interests": "Drawing, Lego, Dinosaurs"
}
```

### Expected Response (201 Created):

```json
{
  "success": true,
  "message": "Child added successfully!",
  "child": {
    "id": "...",
    "parentId": "...",
    "name": "Aryan",
    "age": 5,
    "gender": "male",
    "specialNeeds": "None",
    "stubbornnessLvl": 3,
    "interests": "Drawing, Lego, Dinosaurs"
  }
}
```

### Auto-Save Child ID (Scripts → Post-response):

```javascript
if (pm.response.code === 201) {
    const res = pm.response.json();
    pm.environment.set("CHILD_ID", res.child.id);
    console.log("✅ Child ID saved: " + res.child.id);
}
```

### Add a Second Child (optional):

Send another `POST` with:

```json
{
  "name": "Mira",
  "age": 3,
  "gender": "female",
  "specialNeeds": "Mild speech delay",
  "stubbornnessLvl": 7,
  "interests": "Singing, Dolls"
}
```

---

## 10. Test 8 — Update a Child Profile

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `PUT`                                |
| **URL**     | `{{BASE_URL}}/children/{{CHILD_ID}}` |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{PARENT_TOKEN}}` |

### Body (raw → JSON):

```json
{
  "age": 6,
  "interests": "Drawing, Lego, Dinosaurs, Swimming",
  "stubbornnessLvl": 4
}
```

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "Child profile updated!",
  "child": {
    "id": "...",
    "name": "Aryan",
    "age": 6,
    "stubbornnessLvl": 4,
    "interests": "Drawing, Lego, Dinosaurs, Swimming"
  }
}
```

---

## 11. Test 9 — Get All Children

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `GET`                                |
| **URL**     | `{{BASE_URL}}/children`              |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{PARENT_TOKEN}}` |

### Expected Response (200 OK):

```json
{
  "success": true,
  "children": [
    {
      "id": "...",
      "name": "Mira",
      "age": 3,
      "gender": "female",
      "stubbornnessLvl": 7
    },
    {
      "id": "...",
      "name": "Aryan",
      "age": 6,
      "gender": "male",
      "stubbornnessLvl": 4
    }
  ]
}
```

---

## 12. Test 10 — Delete a Child

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `DELETE`                             |
| **URL**     | `{{BASE_URL}}/children/{{CHILD_ID}}` |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{PARENT_TOKEN}}` |

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "Child profile deleted."
}
```

---

## 13. Test 11 — Get Babysitter Profile

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `GET`                                |
| **URL**     | `{{BASE_URL}}/sitters/me`            |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{SITTER_TOKEN}}` |

### Expected Response (200 OK):

```json
{
  "success": true,
  "sitter": {
    "id": "...",
    "userId": "...",
    "bio": null,
    "experienceYears": 0,
    "hourlyRate": 0,
    "locationAddress": null,
    "averageRating": 0,
    "totalRatings": 0,
    "badges": null,
    "user": {
      "name": "Fatima Akter",
      "email": "fatima.sitter@example.com",
      "phoneNumber": "01898765432",
      "profilePicture": null
    },
    "certifications": [],
    "availabilities": []
  }
}
```

### Auto-Save Sitter Profile ID (Scripts → Post-response):

```javascript
if (pm.response.code === 200) {
    const res = pm.response.json();
    pm.environment.set("SITTER_PROFILE_ID", res.sitter.id);
    console.log("✅ Sitter Profile ID saved: " + res.sitter.id);
}
```

---

## 14. Test 12 — Update Babysitter Profile

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `PUT`                                       |
| **URL**     | `{{BASE_URL}}/user/update-profile`          |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{SITTER_TOKEN}}` |

### Body (raw → JSON):

```json
{
  "name": "Fatima Akter",
  "phone": "01898765432",
  "bio": "Experienced babysitter with 4 years of childcare experience. First Aid & CPR certified. Great with toddlers and special needs children.",
  "experienceYears": 4,
  "hourlyRate": 500,
  "location": "Dhanmondi-27, Dhaka",
  "latitude": 23.7464,
  "longitude": 90.3760
}
```

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "Profile updated successfully!",
  "user": {
    "name": "Fatima Akter",
    "phoneNumber": "01898765432",
    "babysitter": {
      "bio": "Experienced babysitter with 4 years...",
      "experienceYears": 4,
      "hourlyRate": 500,
      "locationAddress": "Dhanmondi-27, Dhaka",
      "latitude": 23.7464,
      "longitude": 90.3760
    }
  }
}
```

---

## 15. Test 13 — Set Weekly Availability

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `POST`                                      |
| **URL**     | `{{BASE_URL}}/sitters/availability`         |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{SITTER_TOKEN}}` |

### Body (raw → JSON):

```json
{
  "schedule": [
    { "dayOfWeek": "Monday",    "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": "Tuesday",   "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": "Wednesday", "startTime": "10:00", "endTime": "16:00" },
    { "dayOfWeek": "Thursday",  "startTime": "09:00", "endTime": "17:00" },
    { "dayOfWeek": "Friday",    "startTime": "09:00", "endTime": "14:00" },
    { "dayOfWeek": "Saturday",  "startTime": "10:00", "endTime": "13:00" }
  ]
}
```

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "Availability updated!"
}
```

> 💡 **Tip:** Sending this request again replaces all previous availability. To clear all availability, send `{ "schedule": [] }`.

---

## 16. Test 14 — Get My Availability

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `GET`                                       |
| **URL**     | `{{BASE_URL}}/sitters/availability`         |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{SITTER_TOKEN}}` |

### Expected Response (200 OK):

```json
{
  "success": true,
  "schedule": [
    {
      "id": "...",
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true,
      "babysitterId": "..."
    },
    {
      "id": "...",
      "dayOfWeek": "Tuesday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true,
      "babysitterId": "..."
    }
  ]
}
```

---

## 17. Test 15 — Upload Profile Picture

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `POST`                                      |
| **URL**     | `{{BASE_URL}}/upload/profile`               |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{SITTER_TOKEN}}` |

### Body Tab:

1. Select **form-data** (not raw JSON)
2. Add a field:

| Key    | Type   | Value                          |
|--------|--------|--------------------------------|
| `file` | **File** | *(select a .jpg/.png image from your computer)* |

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "filePath": "/uploads/profiles/file-1709912345678-123456789.jpg",
  "url": "http://localhost:5000/uploads/profiles/file-1709912345678-123456789.jpg"
}
```

> 📎 **Constraints:** Max 5MB. Allowed types: jpeg, jpg, png, gif.

---

## 18. Test 16 — Upload Certification Document

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `POST`                                      |
| **URL**     | `{{BASE_URL}}/upload/document`              |

### Authorization Tab:

| Type      | Value              |
|-----------|--------------------|
| **Type**  | Bearer Token       |
| **Token** | `{{SITTER_TOKEN}}` |

### Body Tab (form-data):

| Key            | Type     | Value                               |
|----------------|----------|-------------------------------------|
| `file`         | **File** | *(select a .pdf/.jpg certificate)*  |
| `documentType` | Text     | `certification`                     |
| `title`        | Text     | `First Aid & CPR Certificate`       |
| `issuedBy`     | Text     | `Bangladesh Red Crescent Society`   |
| `issueDate`    | Text     | `2024-06-15`                        |

### Expected Response (201 Created):

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "certification": {
    "id": "...",
    "babysitterId": "...",
    "title": "First Aid & CPR Certificate",
    "documentUrl": "/uploads/documents/file-...",
    "issuedBy": "Bangladesh Red Crescent Society",
    "issueDate": "2024-06-15T00:00:00.000Z"
  },
  "filePath": "/uploads/documents/file-...",
  "url": "http://localhost:5000/uploads/documents/file-..."
}
```

---

## 19. Test 17 — Browse All Babysitters (Public)

> ⚠️ This endpoint is **public** — no authentication needed. But only **approved** babysitters appear.

| Field     | Value                                         |
|-----------|-----------------------------------------------|
| **Method**  | `GET`                                       |
| **URL**     | `{{BASE_URL}}/sitters`                      |

### No Authorization Required

### Expected Response (200 OK):

```json
{
  "success": true,
  "sitters": [
    {
      "id": "...",
      "name": "Fatima Akter",
      "babysitter": {
        "id": "...",
        "bio": "Experienced babysitter with 4 years...",
        "hourlyRate": 500,
        "locationAddress": "Dhanmondi-27, Dhaka",
        "experienceYears": 4,
        "averageRating": 0,
        "availabilities": [
          { "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "17:00", "isAvailable": true }
        ]
      }
    }
  ]
}
```

> If the response is empty, make sure the babysitter's `isApproved` is set to `true` (see the note in [Test 2](#4-test-2--register-a-babysitter)).

---

## 20. Test 18 — Filter Babysitters by Price & Location

| Field     | Value                                                                  |
|-----------|------------------------------------------------------------------------|
| **Method**  | `GET`                                                                |
| **URL**     | `{{BASE_URL}}/sitters?minPrice=200&maxPrice=600&location=Dhanmondi`  |

### No Authorization Required

### Query Parameters Breakdown:

| Param      | Value        | Description                          |
|------------|-------------|--------------------------------------|
| `minPrice` | `200`       | Minimum hourly rate (BDT)            |
| `maxPrice` | `600`       | Maximum hourly rate (BDT)            |
| `location` | `Dhanmondi` | Filter by location (substring match) |

### Expected Response (200 OK):

Only babysitters matching all filters are returned.

```json
{
  "success": true,
  "sitters": [
    {
      "id": "...",
      "name": "Fatima Akter",
      "babysitter": {
        "hourlyRate": 500,
        "locationAddress": "Dhanmondi-27, Dhaka"
      }
    }
  ]
}
```

### Try Other Filter Combinations:

| URL                                          | Description                     |
|----------------------------------------------|---------------------------------|
| `{{BASE_URL}}/sitters`                       | All approved sitters            |
| `{{BASE_URL}}/sitters?minPrice=1000`         | Sitters charging ≥ 1000 BDT    |
| `{{BASE_URL}}/sitters?location=Gulshan`      | Sitters in Gulshan area         |
| `{{BASE_URL}}/sitters?maxPrice=300`          | Budget-friendly sitters         |

---

## 21. Test 19 — View a Specific Babysitter Profile

| Field     | Value                                                     |
|-----------|-----------------------------------------------------------|
| **Method**  | `GET`                                                   |
| **URL**     | `{{BASE_URL}}/sitters/{{SITTER_PROFILE_ID}}`            |

### No Authorization Required

### Expected Response (200 OK):

```json
{
  "success": true,
  "sitter": {
    "id": "...",
    "userId": "...",
    "bio": "Experienced babysitter with 4 years...",
    "experienceYears": 4,
    "hourlyRate": 500,
    "locationAddress": "Dhanmondi-27, Dhaka",
    "averageRating": 0,
    "totalRatings": 0,
    "badges": null,
    "user": {
      "name": "Fatima Akter",
      "email": "fatima.sitter@example.com",
      "phoneNumber": "01898765432",
      "isApproved": true,
      "profilePicture": "/uploads/profiles/file-..."
    },
    "availabilities": [
      { "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "17:00", "isAvailable": true },
      { "dayOfWeek": "Tuesday", "startTime": "09:00", "endTime": "17:00", "isAvailable": true }
    ],
    "certifications": [
      {
        "title": "First Aid & CPR Certificate",
        "issuedBy": "Bangladesh Red Crescent Society",
        "issueDate": "2024-06-15T00:00:00.000Z"
      }
    ],
    "reviews": []
  }
}
```

> 💡 You can also use the **User ID** (`{{SITTER_ID}}`) instead of the Sitter Profile ID. Both work — the API tries the Sitter ID first, then falls back to User ID.

---

## 22. Test 20 — Social Login (Google/Facebook)

| Field     | Value                                  |
|-----------|----------------------------------------|
| **Method**  | `POST`                               |
| **URL**     | `{{BASE_URL}}/auth/social`           |
| **Headers** | `Content-Type: application/json`     |

### Body (raw → JSON):

```json
{
  "email": "john.doe@gmail.com",
  "name": "John Doe",
  "provider": "google"
}
```

### Expected Response (200 OK):

```json
{
  "success": true,
  "message": "google login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "role": "PARENT"
  }
}
```

> Social login automatically creates a PARENT account if the email doesn't exist yet.

---

## 23. Error Scenario Tests

Test these to verify proper error handling.

### 23.1 — Register with Duplicate Email

**Request:** Same `POST /auth/register` with an email already used.

**Expected Response (400):**
```json
{ "message": "User already exists!" }
```

### 23.2 — Login with Wrong Password

**Request:** `POST /auth/login` with correct email but wrong password.

**Expected Response (400):**
```json
{ "message": "Invalid credentials" }
```

### 23.3 — Access Protected Route Without Token

**Request:** `GET /user/profile` with no Authorization header.

**Expected Response (401):**
```json
{ "message": "Not authorized. No token provided" }
```

### 23.4 — Access Protected Route with Expired/Invalid Token

**Request:** `GET /user/profile` with `Authorization: Bearer invalid_token_here`

**Expected Response (401):**
```json
{ "message": "Invalid token" }
```

### 23.5 — Register with Missing Required Fields

**Request:** `POST /auth/register` without the `role` field.

**Expected Response (400):**
```json
{ "message": "Missing required field: role" }
```

### 23.6 — Register with Short Password

**Request:** `POST /auth/register` with `"password": "123"`

**Expected Response (400):**
```json
{ "message": "password must be between 6 and 100 characters" }
```

### 23.7 — Add Child Without Parent Profile

**Request:** `POST /children` using a BABYSITTER token.

**Expected Response (404):**
```json
{ "message": "Parent profile not found. Please complete your profile first." }
```

### 23.8 — Upload Oversized File

**Request:** `POST /upload/profile` with a file larger than 5MB.

**Expected Response (400/500):** Multer error message about file size.

---

## 24. Quick Reference Table

| #  | Test                         | Method   | URL                                  | Auth             |
|----|------------------------------|----------|--------------------------------------|------------------|
| 1  | Register Parent              | `POST`   | `/api/auth/register`                 | None             |
| 2  | Register Babysitter          | `POST`   | `/api/auth/register`                 | None             |
| 3  | Login Parent                 | `POST`   | `/api/auth/login`                    | None             |
| 4  | Login Babysitter             | `POST`   | `/api/auth/login`                    | None             |
| 5  | Get Parent Profile           | `GET`    | `/api/user/profile`                  | Parent Token     |
| 6  | Update Parent Profile        | `PUT`    | `/api/user/update-profile`           | Parent Token     |
| 7  | Add Child                    | `POST`   | `/api/children`                      | Parent Token     |
| 8  | Update Child                 | `PUT`    | `/api/children/:id`                  | Parent Token     |
| 9  | Get All Children             | `GET`    | `/api/children`                      | Parent Token     |
| 10 | Delete Child                 | `DELETE` | `/api/children/:id`                  | Parent Token     |
| 11 | Get Sitter Profile           | `GET`    | `/api/sitters/me`                    | Sitter Token     |
| 12 | Update Sitter Profile        | `PUT`    | `/api/user/update-profile`           | Sitter Token     |
| 13 | Set Availability             | `POST`   | `/api/sitters/availability`          | Sitter Token     |
| 14 | Get Availability             | `GET`    | `/api/sitters/availability`          | Sitter Token     |
| 15 | Upload Profile Picture       | `POST`   | `/api/upload/profile`                | Any Token        |
| 16 | Upload Certification         | `POST`   | `/api/upload/document`               | Sitter Token     |
| 17 | Browse All Sitters           | `GET`    | `/api/sitters`                       | None (public)    |
| 18 | Filter Sitters               | `GET`    | `/api/sitters?minPrice=&maxPrice=`   | None (public)    |
| 19 | View Sitter Detail           | `GET`    | `/api/sitters/:id`                   | None (public)    |
| 20 | Social Login                 | `POST`   | `/api/auth/social`                   | None             |

---

## 🔁 Recommended Testing Order

Follow this exact sequence for a smooth testing workflow:

```
1. Register Parent          → saves PARENT_TOKEN
2. Register Babysitter      → saves SITTER_TOKEN
3. Login Parent             → refreshes PARENT_TOKEN
4. Login Babysitter         → refreshes SITTER_TOKEN
5. Get Parent Profile       → verify empty profile
6. Update Parent Profile    → fill in details
7. Add Child (x2)           → saves CHILD_ID
8. Get All Children         → verify both children
9. Update Child             → modify one child
10. Get Sitter Profile      → verify empty sitter profile, saves SITTER_PROFILE_ID
11. Update Sitter Profile   → fill in bio, rate, experience
12. Set Availability        → add weekly schedule
13. Get Availability        → verify schedule saved
14. Upload Profile Picture  → upload sitter photo
15. Upload Certification    → upload a certificate PDF
16. Approve Sitter (DB)     → set isApproved: true in MongoDB
17. Browse All Sitters      → verify sitter appears in public list
18. Filter Sitters           → test price and location filters
19. View Sitter Detail      → view full profile with certifications & availability
20. Delete Child            → cleanup test
21. Error Scenarios         → test all error cases
```

> 💡 **Pro Tip:** After saving the Postman scripts for auto-setting tokens, you can use Postman's **Collection Runner** to run all tests in sequence automatically.

---

## 25. Source Code Reference — Where to Find Each API's Code

The backend follows **MVC (Model-View-Controller)** architecture. For every API endpoint, there are **3 files** you need to look at:

```
Route  →  defines the URL path & HTTP method
Controller  →  handles the request/response logic
Model  →  performs the actual database operations
```

### 📂 Project Structure (relevant files)

```
backend/src/
├── routes/              # Step 1: URL definitions & middleware wiring
│   ├── authRoutes.ts
│   ├── userRoutes.ts
│   ├── childRoutes.ts
│   ├── sitterRoutes.ts
│   └── uploadRoutes.ts
├── controllers/         # Step 2: Request handling logic
│   ├── authController.ts
│   ├── userController.ts
│   ├── childController.ts
│   ├── sitterController.ts
│   └── uploadController.ts
├── models/              # Step 3: Database (Prisma) operations
│   ├── userModel.ts
│   ├── childModel.ts
│   ├── sitterModel.ts
│   └── uploadModel.ts
├── services/            # External APIs & business logic
│   └── emailService.ts
├── middleware/           # Auth, validation, rate limiting
│   ├── authMiddleware.ts
│   └── validationMiddleware.ts
├── config/
│   └── db.ts            # Prisma client connection
├── types/
│   └── index.ts         # TypeScript type definitions
└── app.ts               # Main Express app — mounts all routes
```

---

### 🗺️ Per-Test Code Map

Below is the exact file path for every test's **Route → Controller → Model** flow.

#### Tests 1–2: Register (Parent & Babysitter)

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/authRoutes.ts`            | `POST /register` — validation middleware chain |
| **Controller** | `backend/src/controllers/authController.ts`   | `registerUser` function — hashes password, generates JWT |
| **Model**      | `backend/src/models/userModel.ts`             | `createWithProfile()` — creates User + Parent/Babysitter profile in a transaction |
| **Service**    | `backend/src/services/emailService.ts`        | `sendRegistrationEmail()` — sends welcome email |
| **Middleware** | `backend/src/middleware/validationMiddleware.ts` | `validateRequired`, `validateEmail`, `validateLength` |

#### Tests 3–4: Login (Parent & Babysitter)

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/authRoutes.ts`            | `POST /login` — validation middleware        |
| **Controller** | `backend/src/controllers/authController.ts`   | `loginUser` function — bcrypt compare, JWT generation |
| **Model**      | `backend/src/models/userModel.ts`             | `findByEmail()` — looks up user by email     |

#### Test 5: Get Parent Profile

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/userRoutes.ts`            | `GET /profile` — `protect` middleware        |
| **Controller** | `backend/src/controllers/userController.ts`   | `getUserProfile` function                    |
| **Model**      | `backend/src/models/userModel.ts`             | `findByIdWithProfile()` — includes parentProfile + children or babysitter |
| **Middleware** | `backend/src/middleware/authMiddleware.ts`     | `protect` — extracts & verifies JWT, attaches `req.user` |

#### Test 6: Update Parent Profile

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/userRoutes.ts`            | `PUT /update-profile` — `protect` middleware |
| **Controller** | `backend/src/controllers/userController.ts`   | `updateProfile` function                     |
| **Model**      | `backend/src/models/userModel.ts`             | `updateProfile()` — updates User fields + role-specific profile (Parent or Babysitter) |

#### Tests 7–10: Children CRUD (Add, Update, Get All, Delete)

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/childRoutes.ts`           | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |
| **Controller** | `backend/src/controllers/childController.ts`  | `addChild`, `getMyChildren`, `updateChild`, `deleteChild` |
| **Model**      | `backend/src/models/childModel.ts`            | `create()`, `findByParentId()`, `update()`, `remove()`, `getParentByUserId()` |

#### Tests 11–12: Get & Update Babysitter Profile

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/sitterRoutes.ts`          | `GET /me` — `protect` middleware             |
| **Controller** | `backend/src/controllers/sitterController.ts` | `getMySitterProfile` function                |
| **Model**      | `backend/src/models/sitterModel.ts`           | `findByUserIdWithDetails()` — includes user info, certifications, availabilities |
| *(update uses same files as Test 6)* | `userController.ts` → `userModel.ts` | `updateProfile()` handles BABYSITTER role fields (bio, hourlyRate, experienceYears, latitude, longitude) |

#### Tests 13–14: Set & Get Availability

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/sitterRoutes.ts`          | `POST /availability`, `GET /availability`    |
| **Controller** | `backend/src/controllers/sitterController.ts` | `updateAvailability`, `getMyAvailability`    |
| **Model**      | `backend/src/models/sitterModel.ts`           | `replaceAvailability()` — deletes old + creates new, `getAvailability()` |

#### Test 15: Upload Profile Picture

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/uploadRoutes.ts`          | `POST /profile` — `protect` + `upload.single("file")` |
| **Controller** | `backend/src/controllers/uploadController.ts` | `uploadProfilePicture` function + multer config (storage, fileFilter, limits) |
| **Model**      | `backend/src/models/uploadModel.ts`           | `updateProfilePicture()` — updates User.profilePicture |

#### Test 16: Upload Certification Document

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/uploadRoutes.ts`          | `POST /document` — `protect` + `upload.single("file")` |
| **Controller** | `backend/src/controllers/uploadController.ts` | `uploadDocument` function — handles certification type |
| **Model**      | `backend/src/models/uploadModel.ts`           | `findSitterByUserId()`, `createCertification()` |

#### Tests 17–18: Browse & Filter Babysitters (Public)

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/sitterRoutes.ts`          | `GET /` — no auth required                   |
| **Controller** | `backend/src/controllers/sitterController.ts` | `getSitters` function — extracts query filters |
| **Model**      | `backend/src/models/sitterModel.ts`           | `findAll(filters)` — builds dynamic Prisma `where` clause with location, minPrice, maxPrice |

#### Test 19: View Specific Babysitter Profile

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/sitterRoutes.ts`          | `GET /:id` — no auth required                |
| **Controller** | `backend/src/controllers/sitterController.ts` | `getSitterById` function — dual lookup (tries sitter ID, then user ID) |
| **Model**      | `backend/src/models/sitterModel.ts`           | `findByIdWithDetails()`, `getReviewsForSitter()` |

#### Test 20: Social Login (Google/Facebook)

| Layer      | File                                              | What to look at                              |
|------------|---------------------------------------------------|----------------------------------------------|
| **Route**      | `backend/src/routes/authRoutes.ts`            | `POST /social` — validation middleware       |
| **Controller** | `backend/src/controllers/authController.ts`   | `socialLogin` function — creates account if email not found |
| **Model**      | `backend/src/models/userModel.ts`             | `findByEmail()`, `createSocialUser()` — creates User + Parent profile |

---

### 🔧 Shared Infrastructure Files

These files are used across **all** API endpoints:

| File                                           | Purpose                                                    |
|------------------------------------------------|------------------------------------------------------------|
| `backend/src/app.ts`                           | Main Express app — mounts all route groups at `/api/*` prefixes |
| `backend/src/config/db.ts`                     | Prisma client instance — the single database connection    |
| `backend/src/middleware/authMiddleware.ts`      | `protect` — JWT verification, attaches `req.user`          |
| `backend/src/middleware/validationMiddleware.ts`| Input validators: `validateRequired`, `validateEmail`, `validateLength` |
| `backend/src/middleware/rateLimiter.ts`         | Rate limiting: `authLimiter` (auth routes), `apiLimiter` (all routes) |
| `backend/src/middleware/sanitizer.ts`           | Input sanitization against XSS/injection                   |
| `backend/src/middleware/requestId.ts`           | Adds unique request ID to each request for tracing         |
| `backend/src/types/index.ts`                   | TypeScript types: `AuthRequest`, `GpsLog`, etc.            |
| `backend/prisma/schema.prisma`                 | Database schema — all 20 models & 6 enums (MongoDB)        |

---

### 🔍 How to Read the Code Flow for Any API

Follow this 4-step process to understand any endpoint:

```
Step 1: Route File
   → Find the HTTP method & URL path
   → See which middleware runs (auth, validation)
   → See which controller function is called

Step 2: Controller File
   → Find the named function
   → See request parsing (req.body, req.params, req.query)
   → See which Model/Service functions are called
   → See the response format (res.status().json())

Step 3: Model File
   → Find the called function
   → See the exact Prisma query (findUnique, create, update, etc.)
   → See what data is included/selected from the database

Step 4: Service File (if applicable)
   → External API calls (OpenAI, Stripe, email)
   → Pure business logic (matching algorithm)
```

**Example — Tracing `POST /api/auth/register`:**

```
1. backend/src/routes/authRoutes.ts        → POST "/register" calls registerUser
2. backend/src/controllers/authController.ts → registerUser() hashes password, calls UserModel.createWithProfile()
3. backend/src/models/userModel.ts          → createWithProfile() runs prisma.$transaction to create User + profile
4. backend/src/services/emailService.ts     → sendRegistrationEmail() sends welcome email via nodemailer
```

---

## 27. Troubleshooting Common Errors

### 1. `Route /auth/login not found` (404)
- **Cause:** You are missing the `/api` prefix in your URL.
- **Solution:** Ensure your URL is `http://localhost:5000/api/auth/login`, not `http://localhost:5000/auth/login`.

### 2. `Cannot read properties of undefined (reading 'email')` or "Missing request body"
- **Cause:** The server cannot parse your request body because the `Content-Type` header is missing.
- **Solution:** In Postman, go to the **Body** tab, select **raw**, and choose **JSON** from the dropdown menu. This automatically sets `Content-Type: application/json`.

### 3. `PrismaClientInitializationError`
- **Cause:** Database connection failed.
- **Solution:** Ensure your MongoDB is running and your `.env` file has the correct `DATABASE_URL`.

---

## 28. How to Test "Find a Sitter" in Postman

This section guides you through testing the `GET /api/sitters` endpoint, which is used by the **Find a Sitter** page to list and filter babysitters.

### Prerequisites: Admin Approval

To appear in search results, a babysitter must have `isApproved: true`. By default, new registrations are pending approval. Follow these steps to approve a sitter first.

#### Step 1: Register an Admin Account
To approve users, you need an Admin account.
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Super Admin",
    "email": "admin@test.com",
    "password": "123456",
    "role": "ADMIN",
    "phone": "01500000000"
  }
  ```
- **Action:** Copy the `token` from the response. This is your `ADMIN_TOKEN`.

#### Step 2: Approve the Babysitter
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/admin/approve/<BABYSITTER_USER_ID>`
  - Replace `<BABYSITTER_USER_ID>` with the `id` of the babysitter you registered earlier (e.g., from Test 2).
- **Headers:**
  - `Authorization`: `Bearer <ADMIN_TOKEN>`
- **Body:** None.
- **Expected Response:** `{ "success": true, "message": "User approved successfully!" }`

---

### Step 3: List All Approved Sitters
Now that you have an approved sitter, you can list them.

- **Method:** `GET`
- **URL:** `http://localhost:5000/api/sitters`
- **Headers:** None (Public endpoint).
- **Body:** None.
- **Expected Response:** A list of approved babysitters.
  ```json
  {
    "success": true,
    "sitters": [
      {
        "id": "65f2a...",
        "name": "Ayesha Khan",
        "babysitter": {
          "id": "...",
          "bio": "Experienced...",
          "hourlyRate": 500,
          "locationAddress": "Chittagong, Bangladesh",
          "experienceYears": 3,
          "averageRating": 0,
          "availabilities": []
        }
      }
    ]
  }
  ```

---

### Step 4: Apply Filters
You can filter the list by passing query parameters in the URL.

#### Scenario 1: Filter by Location
Finds sitters whose address contains "Chittagong" (case-insensitive).
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/sitters?location=Chittagong`

#### Scenario 2: Filter by Price Range
Finds sitters with an hourly rate between 300 and 600 BDT.
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/sitters?minPrice=300&maxPrice=600`

#### Scenario 3: Combined Filter
Finds sitters in "Dhaka" with a max rate of 1000 BDT.
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/sitters?location=Dhaka&maxPrice=1000`

---

## 29. How to Test "Who Booked Whom" (Booking System)

Yes, you can test exactly which parent booked which babysitter. This involves a multi-step process: **Parent** creates a request → **Parent** sees the pending booking → **Babysitter** sees the request → **Admin** sees all bookings.

### Step 1: Parent Creates a Booking
First, log in as a **Parent** (use `PARENT_TOKEN`).
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/bookings`
- **Headers:** `Authorization: Bearer <PARENT_TOKEN>`
- **Body (JSON):**
  ```json
  {
    "babysitterId": "<BABYSITTER_ID>",  // Use the ID from "Find a Sitter" results (e.g., "65f2...")
    "startTime": "2026-05-10T10:00:00Z",
    "endTime": "2026-05-10T14:00:00Z"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Booking request sent successfully!",
    "booking": { "id": "BOOKING_123", "status": "PENDING", ... }
  }
  ```

### Step 2: Parent Checks "My Bookings"
The parent can see who they booked.
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/bookings`
- **Headers:** `Authorization: Bearer <PARENT_TOKEN>`
- **Response:**
  ```json
  {
    "success": true,
    "bookings": [
      {
        "id": "BOOKING_123",
        "babysitter": {
          "user": { "name": "Ayesha Khan", "email": "ayesha@test.com" } // ✅ Shows which Sitter
        },
        "status": "PENDING"
      }
    ]
  }
  ```

### Step 3: Babysitter Checks "Incoming Requests"
The babysitter logs in to see which parent booked them.
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/bookings`
- **Headers:** `Authorization: Bearer <BABYSITTER_TOKEN>`
- **Response:**
  ```json
  {
    "success": true,
    "bookings": [
      {
        "id": "BOOKING_123",
        "parent": {
          "user": { "name": "Raisul Islam", "email": "raisul@test.com" } // ✅ Shows which Parent
        },
        "status": "PENDING"
      }
    ]
  }
  ```

### Step 4: Admin Checks All Bookings
The admin can see the full picture: who booked whom.
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/admin/bookings`
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
- **Response:**
  ```json
  {
    "success": true,
    "bookings": [
      {
        "id": "BOOKING_123",
        "parent": { "user": { "name": "Raisul Islam" } },     // ✅ Who booked
        "babysitter": { "user": { "name": "Ayesha Khan" } },  // ✅ Who was booked
        "status": "PENDING"
      }
    ]
  }
  ```
