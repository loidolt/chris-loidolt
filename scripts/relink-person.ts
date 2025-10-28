import PocketBase from 'pocketbase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

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

async function relinkRecords(collectionName: string, newPersonId: string) {
	try {
		console.log(`\n🔗 Relinking ${collectionName}...`);
		const records = await pb.collection(collectionName).getFullList();

		let updateCount = 0;
		for (const record of records) {
			// Check if record has a person field
			if (record.person) {
				// Update person field - handle both single and multi-person relations
				const personValue = Array.isArray(record.person) ? [newPersonId] : newPersonId;

				await pb.collection(collectionName).update(record.id, {
					person: personValue
				});
				updateCount++;
			}
		}

		console.log(`✅ Updated ${updateCount} records in ${collectionName}`);
	} catch (error) {
		console.error(`❌ Failed to relink ${collectionName}:`, error);
	}
}

async function main() {
	const newPersonId = 'xryraitihbwnzsf';

	console.log(`🚀 Relinking all records to person: ${newPersonId}\n`);

	try {
		await authenticateAdmin();

		// Check if the person exists
		try {
			const person = await pb.collection('persons').getOne(newPersonId);
			console.log(`✅ Found person: ${person.name} (${person.slug})\n`);
		} catch (error) {
			console.error(`❌ Person with ID ${newPersonId} not found!`);
			process.exit(1);
		}

		// Relink all collections
		await relinkRecords('projects', newPersonId);
		await relinkRecords('services', newPersonId);
		await relinkRecords('skills', newPersonId);
		await relinkRecords('qualifications', newPersonId);

		console.log('\n✅ Relinking completed successfully!');
	} catch (error) {
		console.error('\n❌ Relinking failed:', error);
		process.exit(1);
	}
}

main();
