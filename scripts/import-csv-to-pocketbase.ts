import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

// Helper function to parse CSV file
function parseCSV(filePath: string): any[] {
	const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
	return parse(fileContent, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true // Handle UTF-8 BOM
	});
}

// Helper function to convert Airtable date format to ISO
function convertDate(dateStr: string): string {
	if (!dateStr) return '';
	try {
		// Handle format like "10/19/2018" or "6/11/2023 11:54am"
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return '';
		return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
	} catch (e) {
		console.error(`Failed to parse date: ${dateStr}`);
		return '';
	}
}

// Helper function to convert comma-separated values to array
function parseArray(value: string): string[] {
	if (!value) return [];
	return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
}

// Helper function to convert checkbox to boolean
function parseBoolean(value: string): boolean {
	return value === 'checked' || value === 'true' || value === 'TRUE';
}

async function authenticateAdmin() {
	try {
		await pb.admins.authWithPassword(
			process.env.POCKETBASE_ADMIN_EMAIL!,
			process.env.POCKETBASE_ADMIN_PASSWORD!
		);
		console.log('✅ Authenticated as admin');
	} catch (error) {
		console.error('❌ Failed to authenticate:', error);
		throw error;
	}
}

async function getOrCreatePerson(name: string): Promise<string> {
	// Use the existing Chris Loidolt person ID
	const existingPersonId = 'xryraitihbwnzsf';

	try {
		// Check if person exists
		const person = await pb.collection('persons').getOne(existingPersonId);
		console.log(`✅ Using existing person: ${person.name} (${person.slug})`);
		return person.id;
	} catch (error) {
		// If person doesn't exist, fall back to creating one
		const slug = name.toLowerCase().replace(/\s+/g, '-');

		try {
			// Check if person exists by slug
			const persons = await pb.collection('persons').getFullList({
				filter: `slug = "${slug}"`
			});

			if (persons.length > 0) {
				return persons[0].id;
			}

			// Create person if doesn't exist
			const person = await pb.collection('persons').create({
				name: name,
				slug: slug,
				email: `${slug}@example.com`
			});

			console.log(`✅ Created person: ${name}`);
			return person.id;
		} catch (createError) {
			console.error(`❌ Failed to get/create person ${name}:`, createError);
			throw createError;
		}
	}
}

async function importProjects() {
	console.log('\n📦 Importing Projects...');
	const csvPath = path.join(process.cwd(), 'other', 'Posts-All Posts.csv');
	const projects = parseCSV(csvPath);

	// Get default person (Chris)
	const personId = await getOrCreatePerson('Chris Loidolt');

	let successCount = 0;
	let errorCount = 0;

	for (const row of projects) {
		try {
			const projectData: any = {
				title: row.Title,
				slug: row.Slug,
				description: row.Excerpt || '',
				longDescription: row.Summary || '',
				markdown: row.Markdown || '',
				tags: parseArray(row.Tags),
				categories: parseArray(row.Categories),
				date: convertDate(row.Date),
				repository: row.Repository || '',
				modelPath: row.ModelPath || '',
				modelUrl: row['Model URL'] || '',
				attribution: row.Attribution || '',
				status: row.Status || 'Draft',
				cleanRepo: parseBoolean(row['Clean Repo']),
				featured: false,
				person: [personId],
				scope: 'Personal',
				visibility: 'Public'
			};

			// Check if project with this slug already exists
			const existing = await pb.collection('projects').getFullList({
				filter: `slug = "${row.Slug}"`
			});

			if (existing.length > 0) {
				console.log(`⚠️  Project "${row.Title}" already exists, skipping...`);
				continue;
			}

			await pb.collection('projects').create(projectData);
			console.log(`✅ Created project: ${row.Title}`);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to import project "${row.Title}":`, error);
			errorCount++;
		}
	}

	console.log(`\n📊 Projects: ${successCount} created, ${errorCount} errors`);
}

async function importQualifications() {
	console.log('\n🎓 Importing Qualifications...');
	const csvPath = path.join(process.cwd(), 'other', 'Qualifications-All Qualifications.csv');

	// Check if file exists
	if (!fs.existsSync(csvPath)) {
		console.log('⚠️  Qualifications CSV not found, skipping...');
		return;
	}

	const qualifications = parseCSV(csvPath);

	// Get default person (Chris)
	const personId = await getOrCreatePerson('Chris Loidolt');

	let successCount = 0;
	let errorCount = 0;

	for (const row of qualifications) {
		try {
			const qualData: any = {
				title: row.Name || row.Title,
				institution: row.Institution || '',
				year: row.Year || '',
				description: row.Summary || row.Description || '',
				person: personId
			};

			await pb.collection('qualifications').create(qualData);
			console.log(`✅ Created qualification: ${qualData.title}`);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to import qualification "${row.Name || row.Title}":`, error);
			errorCount++;
		}
	}

	console.log(`\n📊 Qualifications: ${successCount} created, ${errorCount} errors`);
}

async function importServices() {
	console.log('\n🔧 Importing Services...');
	const csvPath = path.join(process.cwd(), 'other', 'Services-All Services.csv');

	// Check if file exists
	if (!fs.existsSync(csvPath)) {
		console.log('⚠️  Services CSV not found, skipping...');
		return;
	}

	const services = parseCSV(csvPath);

	// Get default person (Chris)
	const personId = await getOrCreatePerson('Chris Loidolt');

	let successCount = 0;
	let errorCount = 0;

	for (const row of services) {
		try {
			const serviceData: any = {
				title: row.Name,
				subtitle: row.Subtitle || '',
				description: row.Summary || '',
				url: row.URL || '',
				moreInfo: row['More Info'] || '',
				active: row.Status === 'Published',
				person: [personId],
				scope: 'Personal',
				visibility: 'Public',
				order: 0
			};

			await pb.collection('services').create(serviceData);
			console.log(`✅ Created service: ${row.Name}`);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to import service "${row.Name}":`, error);
			errorCount++;
		}
	}

	console.log(`\n📊 Services: ${successCount} created, ${errorCount} errors`);
}

async function importSkills() {
	console.log('\n💡 Importing Skills from Qualifications CSV...');
	const csvPath = path.join(process.cwd(), 'other', 'Qualifications-All Qualifications.csv');

	// Check if file exists
	if (!fs.existsSync(csvPath)) {
		console.log('⚠️  Qualifications CSV not found, skipping...');
		return;
	}

	const skills = parseCSV(csvPath);

	// Get default person (Chris)
	const personId = await getOrCreatePerson('Chris Loidolt');

	let successCount = 0;
	let errorCount = 0;

	for (const row of skills) {
		// Only import items with Type = "Skills" or "Programming" (not "Ratings")
		if (!row.Type || row.Type === 'Ratings') continue;

		try {
			const skillData: any = {
				name: row.Name,
				summary: row.Summary || '',
				type: row.Type,
				category: row.Category || '',
				categories: parseArray(row.Categories),
				level: row.Level || '',
				moreInfo: row['More Info'] || '',
				person: [personId],
				scope: 'Personal',
				visibility: 'Public',
				order: 0
			};

			await pb.collection('skills').create(skillData);
			console.log(`✅ Created skill: ${row.Name}`);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to import skill "${row.Name}":`, error);
			errorCount++;
		}
	}

	console.log(`\n📊 Skills: ${successCount} created, ${errorCount} errors`);
}

async function importRatings() {
	console.log('\n🏆 Importing Ratings/Qualifications from CSV...');
	const csvPath = path.join(process.cwd(), 'other', 'Qualifications-All Qualifications.csv');

	// Check if file exists
	if (!fs.existsSync(csvPath)) {
		console.log('⚠️  Qualifications CSV not found, skipping...');
		return;
	}

	const ratings = parseCSV(csvPath);

	// Get default person (Chris)
	const personId = await getOrCreatePerson('Chris Loidolt');

	let successCount = 0;
	let errorCount = 0;

	for (const row of ratings) {
		// Only import items with Type = "Ratings"
		if (row.Type !== 'Ratings') continue;

		try {
			const qualData: any = {
				title: row.Name,
				institution: row.Category || '', // Use category as institution for ratings
				year: '',
				description: row.Summary || '',
				person: personId
			};

			await pb.collection('qualifications').create(qualData);
			console.log(`✅ Created qualification: ${row.Name}`);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to import qualification "${row.Name}":`, error);
			errorCount++;
		}
	}

	console.log(`\n📊 Qualifications (from ratings): ${successCount} created, ${errorCount} errors`);
}

async function main() {
	console.log('🚀 Starting CSV import to PocketBase...\n');

	try {
		await authenticateAdmin();
		await importProjects();
		await importServices();
		await importSkills();
		await importRatings();

		console.log('\n✅ Import completed successfully!');
	} catch (error) {
		console.error('\n❌ Import failed:', error);
		process.exit(1);
	}
}

main();
