-- Education and Training Data for Eswatini
-- Based on LMIS and labor market requirements

-- Clear existing data
DELETE FROM education_training;

-- Insert Education and Training Programs
INSERT INTO education_training (title, category, description) VALUES

-- VOCATIONAL TRAINING
('Industrial Fitting and Machining', 'Vocational Training', 'Practical training in machine shop operations, tool use, and precision fitting. Includes safety protocols and industrial standards compliance for manufacturing sector.'),
('Electrical Installation and Maintenance', 'Vocational Training', 'Training in electrical systems installation, troubleshooting, and maintenance. Covers wiring, circuit design, and safety standards for construction and industrial applications.'),
('Plumbing and Water Supply Systems', 'Vocational Training', 'Comprehensive training in plumbing installation, maintenance, and water system design. Includes pipe fitting, drainage systems, and water conservation techniques.'),
('Welding and Metal Fabrication', 'Vocational Training', 'Advanced welding techniques including MIG, TIG, and arc welding. Metal fabrication, structural design, and quality control for construction and manufacturing.'),
('Automotive Repair and Maintenance', 'Vocational Training', 'Vehicle maintenance, engine repair, electrical systems, and diagnostic techniques. Includes modern automotive technology and diagnostic equipment training.'),
('Construction and Building Trades', 'Vocational Training', 'Carpentry, masonry, concrete work, and general construction practices. Safety compliance and project management basics for the construction industry.'),
('Hair and Beauty Services', 'Vocational Training', 'Professional hair styling, cutting, coloring, and beauty treatment techniques. Business management and customer service skills for self-employment.'),
('Tailoring and Fashion Design', 'Vocational Training', 'Pattern making, garment construction, alterations, and basic fashion design. Includes use of sewing equipment and quality standards.'),

-- TECHNICAL TRAINING
('Information Technology Fundamentals', 'Technical Training', 'Basic computer skills, operating systems, and software applications. Internet usage, email, and introduction to programming concepts.'),
('Network Administration and IT Support', 'Technical Training', 'Network setup, configuration, troubleshooting, and security. IT support ticketing systems and help desk management for growing tech sector.'),
('Database Management Systems', 'Technical Training', 'SQL, database design, data management, and analysis. Practical experience with PostgreSQL, MySQL, and enterprise database systems.'),
('Web Development and Design', 'Technical Training', 'HTML, CSS, JavaScript, and responsive design. Frontend and backend development for building modern web applications.'),
('Cybersecurity Fundamentals', 'Technical Training', 'Information security principles, threat identification, and risk management. Essential cybersecurity skills for protecting organizational data.'),

-- PROFESSIONAL DEVELOPMENT
('Project Management Essentials', 'Professional Development', 'Project planning, scheduling, budgeting, and risk management. Agile and traditional methodologies for effective project delivery.'),
('Business Management and Entrepreneurship', 'Professional Development', 'Business planning, financial management, and startup development. Self-employment and small business management skills.'),
('Leadership and Team Management', 'Professional Development', 'Leadership styles, team dynamics, conflict resolution, and organizational behavior. Management skills for supervisory and executive roles.'),
('Customer Service Excellence', 'Professional Development', 'Communication skills, problem-solving, and customer satisfaction. Essential for retail, hospitality, and service sectors.'),
('Human Resources Management', 'Professional Development', 'Recruitment, training, performance management, and employee relations. HR policies and labor law compliance for Eswatini.'),
('Financial Management and Accounting', 'Professional Development', 'Basic accounting principles, bookkeeping, and financial analysis. Business accounting and tax compliance for small businesses.'),
('Sales and Marketing Skills', 'Professional Development', 'Sales techniques, product knowledge, and marketing strategies. Digital marketing and customer relationship management.'),

-- HEALTHCARE AND WELLNESS
('Nursing Assistant and Care Support', 'Healthcare', 'Patient care basics, hygiene, and support for healthcare professionals. Essential skills for healthcare facilities and home care services.'),
('Public Health and Sanitation', 'Healthcare', 'Community health education, disease prevention, and sanitation practices. Focus on public health issues relevant to Eswatini.'),
('HIV/AIDS Counseling and Testing', 'Healthcare', 'Counseling techniques, testing procedures, and support services. Training aligned with Eswatini''s health initiatives and prevention programs.'),
('First Aid and Emergency Response', 'Healthcare', 'CPR, first aid techniques, and emergency response procedures. Critical skills for workplace safety and community resilience.'),
('Occupational Health and Safety', 'Healthcare', 'Workplace safety protocols, hazard identification, and risk management. OSHA and international standards compliance for worker protection.'),

-- AGRICULTURE AND RURAL DEVELOPMENT
('Sustainable Agriculture and Farming', 'Agriculture', 'Modern farming techniques, crop management, and soil conservation. Including organic farming and climate-smart agriculture for rural Eswatini.'),
('Livestock Management and Veterinary Basic Care', 'Agriculture', 'Animal husbandry, disease prevention, and basic veterinary care. Skills for improving livestock productivity and rural livelihoods.'),
('Agricultural Entrepreneurship', 'Agriculture', 'Value-added product development, farm business management, and market linkages. Supporting agricultural entrepreneurship in rural areas.'),

-- LANGUAGE AND COMMUNICATION
('English Language Communication', 'Language Training', 'Grammar, writing, speaking, and listening skills. Essential for business communication and professional advancement in Eswatini.'),
('Siswati Language Enhancement', 'Language Training', 'Professional Siswati communication for business and government sectors. Cultural communication and workplace language skills.'),
('Professional Communication Skills', 'Language Training', 'Business writing, presentation skills, and intercultural communication. Enhancing professional effectiveness across industries.'),

-- GOVERNMENT AND REGULATORY
('Labor Law and Employment Rights', 'Government/Regulatory', 'Eswatini labor laws, employment regulations, and worker rights. Essential for HR professionals and compliance officers.'),
('Business Registration and Compliance', 'Government/Regulatory', 'Business registration procedures, tax compliance, and regulatory requirements in Eswatini. Guidance for entrepreneurs and business owners.'),
('Environmental Compliance and Sustainability', 'Government/Regulatory', 'Environmental regulations, sustainability practices, and green business certification. Compliance with Eswatini environmental standards.'),

-- DIGITAL SKILLS
('Digital Literacy for Workers', 'Digital Skills', 'Essential digital tools, cloud computing basics, and digital communication. Preparing workers for modern digital workplace demands.'),
('Social Media and Digital Marketing', 'Digital Skills', 'Social media platforms, content creation, and online marketing strategies. Skills for modern business and entrepreneurship.'),
('E-Commerce and Online Business', 'Digital Skills', 'Setting up online stores, payment systems, and digital transactions. Supporting the growing e-commerce sector in Eswatini.'),

-- ENERGY AND UTILITIES
('Renewable Energy Installation', 'Energy/Utilities', 'Solar panel installation, maintenance, and troubleshooting. Supporting Eswatini''s renewable energy initiatives and sustainability goals.'),
('Water and Sanitation Management', 'Energy/Utilities', 'Water treatment, distribution systems, and maintenance. Essential for infrastructure and service delivery sectors.'),

-- CREATIVE INDUSTRIES
('Graphic Design and Visual Communication', 'Creative Industries', 'Adobe Creative Suite, design principles, and visual communication. Supporting creative economy growth in Eswatini.'),
('Photography and Videography', 'Creative Industries', 'Camera operation, lighting, composition, and post-production. Skills for media, marketing, and creative sector employment.'),
('Event Planning and Management', 'Creative Industries', 'Event organization, logistics, budgeting, and vendor management. Supporting tourism and hospitality sectors.')
;

-- Display summary
SELECT category, COUNT(*) as program_count 
FROM education_training 
GROUP BY category 
ORDER BY category;
