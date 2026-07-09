// populate-database.js
// Populates empty tables with sample data

const { Pool } = require('pg');
require('dotenv').config({ path: './eswatini_lmis_backend/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function populateDatabase() {
    console.log('\n📊 POPULATING DATABASE WITH SAMPLE DATA\n');
    console.log('='.repeat(60));

    try {
        // 1. Populate Economic Sectors
        console.log('\n1️⃣  Populating Economic Sectors...');
        const sectorsCount = await pool.query('SELECT COUNT(*) FROM economic_sectors');

        if (parseInt(sectorsCount.rows[0].count) === 0) {
            const sectors = [
                { name: 'Agriculture, Forestry and Fishing', desc: 'Primary sector involving farming, forestry, and fishing activities', gdp: 8.5, employment: 15.2 },
                { name: 'Mining and Quarrying', desc: 'Extraction of minerals and natural resources', gdp: 2.1, employment: 1.5 },
                { name: 'Manufacturing', desc: 'Production of goods and industrial products', gdp: 38.2, employment: 20.3 },
                { name: 'Construction', desc: 'Building and infrastructure development', gdp: 4.5, employment: 7.8 },
                { name: 'Wholesale and Retail Trade', desc: 'Trade and distribution of goods', gdp: 12.3, employment: 18.5 },
                { name: 'Transportation and Storage', desc: 'Movement and storage of goods and people', gdp: 5.2, employment: 4.6 },
                { name: 'Accommodation and Food Service Activities', desc: 'Hotels, restaurants, and tourism services', gdp: 2.8, employment: 5.3 },
                { name: 'Information and Communication', desc: 'ICT services and telecommunications', gdp: 3.5, employment: 2.1 },
                { name: 'Financial and Insurance Activities', desc: 'Banking and financial services', gdp: 8.9, employment: 3.2 },
                { name: 'Education', desc: 'Educational services and institutions', gdp: 6.2, employment: 11.4 },
                { name: 'Human Health and Social Work Activities', desc: 'Healthcare and social services', gdp: 5.1, employment: 8.7 },
                { name: 'Public Administration and Defence', desc: 'Government services and public sector', gdp: 15.8, employment: 12.9 }
            ];

            for (const sector of sectors) {
                await pool.query(`
                    INSERT INTO economic_sectors (sector_name, description, contribution_to_gdp, employment_percentage)
                    VALUES ($1, $2, $3, $4)
                `, [sector.name, sector.desc, sector.gdp, sector.employment]);
            }
            console.log(`   ✅ Added ${sectors.length} economic sectors`);
        } else {
            console.log(`   ℹ️  Economic sectors already populated (${sectorsCount.rows[0].count} records)`);
        }

        // 2. Populate Sample Jobs
        console.log('\n2️⃣  Populating Sample Jobs...');
        const jobsCount = await pool.query('SELECT COUNT(*) FROM jobs');

        if (parseInt(jobsCount.rows[0].count) === 0) {
            const jobs = [
                { title: 'Software Developer', org: 'Tech Solutions Eswatini', sector: 'Information and Communication', location: 'Mbabane', type: 'Full-time', desc: 'Develop web applications using React and Node.js' },
                { title: 'Agricultural Officer', org: 'Ministry of Agriculture', sector: 'Agriculture, Forestry and Fishing', location: 'Manzini', type: 'Full-time', desc: 'Manage agricultural programs and support farmers' },
                { title: 'Nurse', org: 'Mbabane Government Hospital', sector: 'Human Health and Social Work Activities', location: 'Mbabane', type: 'Full-time', desc: 'Provide nursing care to patients' },
                { title: 'Teacher', org: 'Waterford Kamhlaba', sector: 'Education', location: 'Mbabane', type: 'Full-time', desc: 'Teach mathematics and sciences' },
                { title: 'Accountant', org: 'Standard Bank Eswatini', sector: 'Financial and Insurance Activities', location: 'Mbabane', type: 'Full-time', desc: 'Manage financial records and reporting' },
                { title: 'Civil Engineer', org: 'Construction Ltd', sector: 'Construction', location: 'Manzini', type: 'Contract', desc: 'Design and supervise construction projects' },
                { title: 'Hotel Manager', org: 'Royal Swazi Hotel', sector: 'Accommodation and Food Service Activities', location: 'Ezulwini', type: 'Full-time', desc: 'Manage hotel operations and staff' },
                { title: 'Data Analyst', org: 'Central Bank of Eswatini', sector: 'Financial and Insurance Activities', location: 'Mbabane', type: 'Full-time', desc: 'Analyze economic data and prepare reports' }
            ];

            for (const job of jobs) {
                await pool.query(`
                    INSERT INTO jobs (title, organisation_name, sector, location, job_type, description, status, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, 'open', NOW())
                `, [job.title, job.org, job.sector, job.location, job.type, job.desc]);
            }
            console.log(`   ✅ Added ${jobs.length} sample jobs`);
        } else {
            console.log(`   ℹ️  Jobs already populated (${jobsCount.rows[0].count} records)`);
        }

        // 3. Populate Statistical Data
        console.log('\n3️⃣  Populating Statistical Data...');
        const statsCount = await pool.query('SELECT COUNT(*) FROM statistical_data');

        if (parseInt(statsCount.rows[0].count) === 0) {
            const years = [2020, 2021, 2022, 2023, 2024];
            const categories = ['Employment', 'Unemployment', 'Labour Force'];
            const industries = ['Manufacturing', 'Agriculture', 'Services', 'Construction'];
            const regions = ['Hhohho', 'Lubombo', 'Manzini', 'Shiselweni'];

            let count = 0;
            for (const year of years) {
                for (const category of categories) {
                    for (const industry of industries) {
                        for (const region of regions) {
                            const value = Math.floor(Math.random() * 10000) + 1000;
                            await pool.query(`
                                INSERT INTO statistical_data (year, category, industry, region, value, created_at)
                                VALUES ($1, $2, $3, $4, $5, NOW())
                            `, [year, category, industry, region, value]);
                            count++;
                        }
                    }
                }
            }
            console.log(`   ✅ Added ${count} statistical records`);
        } else {
            console.log(`   ℹ️  Statistical data already populated (${statsCount.rows[0].count} records)`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Database population complete!\n');
        console.log('You can now access:');
        console.log('  • Vacancies page');
        console.log('  • Economic Sectors page');
        console.log('  • Statistics page');
        console.log('  • Publications page (manual upload needed)');
        console.log('  • Job Seekers page (register through UI)\n');

    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        console.error(err.stack);
    } finally {
        await pool.end();
    }
}

populateDatabase();