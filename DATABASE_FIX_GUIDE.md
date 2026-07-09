# Database Fix Guide - Eswatini LMIS

## Problem
The following pages are not loading data from the database:
- ❌ Vacancies
- ❌ Economic Sectors
- ❌ Statistics
- ❌ Publications
- ❌ Job Seekers

## Root Causes
1. **Empty Database Tables** - Tables exist but have no data
2. **Backend Not Running** - API server not started
3. **Database Connection Issues** - Wrong credentials or connection problems
4. **Missing Tables** - Some tables might not be created

## Solution Steps

### Step 1: Verify Backend is Running

````````

If you see errors, proceed to Step 2.

### Step 2: Test Database Connection

````````

This will show:
- ✅ Which tables exist
- ✅ How many records in each table
- ❌ Which tables are missing or empty

### Step 3: Populate Empty Tables

````````

This adds:
- 12 Economic Sectors
- 8 Sample Jobs (Vacancies)
- 960 Statistical Data Records
- Creates sample data for all pages

### Step 4: Verify Data Loaded

Open your browser and test these endpoints:

1. **Jobs/Vacancies:**
````````


# Response
````````markdown
```json
{
  "status": "success",
  "data": {
    "vacancies": [
      {
        "id": 1,
        "title": "Sample Job 1",
        "description": "Description for sample job 1",
        "sector": "Economic Sector 1",
        "date_posted": "2023-10-01",
        "last_date_apply": "2023-10-15",
        "qualification": "Degree in relevant field",
        "experience": "2 years minimum",
        "skills": ["Skill 1", "Skill 2"],
        "email": "apply@example.com"
      },
      {
        "id": 2,
        "title": "Sample Job 2",
        "description": "Description for sample job 2",
        "sector": "Economic Sector 2",
        "date_posted": "2023-09-20",
        "last_date_apply": "2023-09-30",
        "qualification": "Diploma in relevant field",
        "experience": "1 year minimum",
        "skills": ["Skill 3", "Skill 4"],
        "email": "apply@example.com"
      }
    ]
  }
}

````````

Shouldreturn array of jobs

2. **Economic Sectors:**
````````


# Response
````````markdown
```json
{
  "status": "success",
  "data": {
    "sectors": [
      {
        "id": 1,
        "name": "Economic Sector 1",
        "description": "Description for economic sector 1"
      },
      {
        "id": 2,
        "name": "Economic Sector 2",
        "description": "Description for economic sector 2"
      }
    ]
  }
}
````````

Should return array of sectors

3. **Statistics:**
````````


# Response
````````markdown
```json
{
  "status": "success",
  "data": {
    "statistics": [
      {
        "id": 1,
        "title": "Statistic 1",
        "value": "100",
        "date_collected": "2023-09-01",
        "source": "Source 1"
      },
      {
        "id": 2,
        "title": "Statistic 2",
        "value": "200",
        "date_collected": "2023-09-15",
        "source": "Source 2"
      }
    ]
  }
}
````````

Should return statistical data

4. **Publications:**
````````


# Response
````````markdown
```json
{
  "status": "success",
  "data": {
    "publications": [
      {
        "id": 1,
        "title": "Publication 1",
        "type": "Report",
        "date_published": "2023-08-01",
        "url": "http://example.com/pub1"
      },
      {
        "id": 2,
        "title": "Publication 2",
        "type": "Research",
        "date_published": "2023-08-15",
        "url": "http://example.com/pub2"
      }
    ]
  }
}
````````

Returns publications (need to upload through admin panel)

5. **Employees/Job Seekers:**
````````


# Response
````````markdown
```json
{
  "status": "success",
  "data": {
    "job_seekers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "123-456-7890",
        "cv_url": "http://example.com/cv1",
        "applied_jobs": [1, 2]
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "098-765-4321",
        "cv_url": "http://example.com/cv2",
        "applied_jobs": [2]
      }
    ]
  }
}
````````

Returns registered job seekers

### Step 5: Start Frontend

````````

If you see errors, retrace steps or contact support.

Or use your batch file:

````````markdown
# 1. Test connection
node test-database-connection.js

# 2. Populate data
node populate-database.js

# 3. Start backend
cd eswatini_lmis_backend
node server.js

# 4. Start frontend (in new terminal)
cd eswatini_lmis_frontend
npm start
````````

### Step 6: Test Each Page

1. **Vacancies** - http://localhost:3000/vacancies
   - Should show 8 sample jobs
   - Can filter by sector and region

2. **Economic Sectors** - http://localhost:3000/economic-sectors
   - Should show 12 sectors with images
   - Can click to view details

3. **Statistics** - http://localhost:3000/statistics
   - Should show charts and tables
   - 960 data points across years

4. **Publications** - http://localhost:3000/publications
   - Will be empty initially
   - Admin can upload through dashboard

5. **Job Seekers** - http://localhost:3000/job-seekers
   - Can register new job seekers
   - View talent pool

## Common Issues & Fixes

### Issue: "Failed to fetch" errors

**Fix:**

````````

### Issue: "Database connection error"

**Fix: Check .env file in backend:**
````````

- Ensure `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE` are correctly set.
- Example:
  ```bash
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USERNAME=root
  DB_PASSWORD=your_password
  DB_DATABASE=lmis_db
  ```

Then restart the backend server.

### Issue: Backend not starting

**Fix:**

````````

### Issue: Tables missing after population step

**Fix:**
- Check `migrations` table for applied migrations
- Re-run migration command if necessary
- Example: `php artisan migrate` (for Laravel)
- If using raw SQL, ensure all `CREATE TABLE` statements executed successfully.

### Issue: "No data showing"

**Fix: Run the populate script:**
````````

- Navigate to the directory containing the script
- Run `php artisan db:seed` (for Laravel) or the relevant command for your framework
- If using raw SQL, re-import the latest SQL dump that includes the sample data

### Still Having Issues?
- Double-check each step
- Consult with a database expert
- Consider restoring from a backup if available

### Issue: CORS errors

**Fix: Check server.js CORS config includes:**
````````

- `app.use(cors())` to allow all origins
- Or specify your frontend URL: `app.use(cors({ origin: 'http://localhost:3000' }))`
- Ensure these lines are present and uncommented

Then restart the backend server.

## Manual Database Queries

If you need to manually check/add data:

### Check jobs count:

````````

- Connect to your database
- Run the query:
  ```sql
  SELECT COUNT(*) FROM vacancies;
  ```
- Should return `8` (for sample data)

### Check economic sectors:
````````


# Response
````````markdown
```json
{
  "status": "success",
  "data": {
    "sectors": [
      {
        "id": 1,
        "name": "Economic Sector 1",
        "description": "Description for economic sector 1"
      },
      {
        "id": 2,
        "name": "Economic Sector 2",
        "description": "Description for economic sector 2"
      }
    ]
  }
}
````````

Should return array of sectors

### Check statistical data:

````````


# Response
````````markdown
```json
{
  "status": "success",
  "data": {
    "statistics": [
      {
        "id": 1,
        "title": "Statistic 1",
        "value": "100",
        "date_collected": "2023-09-01",
        "source": "Source 1"
      },
      {
        "id": 2,
        "title": "Statistic 2",
        "value": "200",
        "date_collected": "2023-09-15",
        "source": "Source 2"
      }
    ]
  }
}
````````

Should return statistical data

### Check publications count:

````````

- Connect to your database
- Run the query:
  ```sql
  SELECT COUNT(*) FROM publications;
  ```
- Should return `0` (publications added manually later)

### Check job seekers count:

````````

- Connect to your database
- Run the query:
  ```sql
  SELECT COUNT(*) FROM job_seekers;
  ```
- Should return `2` (for sample data)

### Common Queries

- **List all vacancies:**
  ```sql
  SELECT * FROM vacancies;
  ```

- **List all economic sectors:**
  ```sql
  SELECT * FROM economic_sectors;
  ```

- **List all statistics:**
  ```sql
  SELECT * FROM statistics;
  ```

- **List all publications:**
  ```sql
  SELECT * FROM publications;
  ```

- **List all job seekers:**
  ```sql
  SELECT * FROM job_seekers;
  ```

## For Developers

### Useful Commands

- **To rollback latest migration:** `php artisan migrate:rollback`
- **To re-run all migrations:** `php artisan migrate:fresh --seed`
- **To manually view tables:** Use a tool like phpMyAdmin, Adminer, or MySQL Workbench

### Debugging Tips

- Always check the browser console and network tab for errors
- Use Postman or Curl to test API endpoints directly
- Check backend logs for error messages or stack traces

## Contact & Support

If issues persist:
1. Check browser console (F12) for errors
2. Check backend terminal for error messages
3. Verify database is accessible
4. Ensure all npm packages are installed

## Next Steps

After fixing:
1. ✅ All pages should load data
2. ✅ Can navigate between pages
3. ✅ Can search and filter
4. ✅ Can view details

For adding more data:
- **Jobs**: Post through Employer Dashboard
- **Publications**: Upload through Admin Dashboard
- **Job Seekers**: Register through Job Seekers page
- **Statistics**: Upload CSV through Admin panel
