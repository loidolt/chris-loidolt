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

async function deleteAllRecords(collectionName: string) {
	try {
		console.log(`\n🗑️  Deleting all records from ${collectionName}...`);
		const records = await pb.collection(collectionName).getFullList();

		let deletedCount = 0;
		for (const record of records) {
			await pb.collection(collectionName).delete(record.id);
			deletedCount++;
		}

		console.log(`✅ Deleted ${deletedCount} records from ${collectionName}`);
	} catch (error) {
		console.error(`❌ Failed to delete from ${collectionName}:`, error);
	}
}

async function main() {
	console.log('🧹 Starting cleanup of PocketBase data...\n');

	try {
		await authenticateAdmin();

		// Delete in order to respect foreign key constraints
		await deleteAllRecords('projects');
		await deleteAllRecords('services');
		await deleteAllRecords('skills');
		await deleteAllRecords('qualifications');

		console.log('\n✅ Cleanup completed successfully!');
	} catch (error) {
		console.error('\n❌ Cleanup failed:', error);
		process.exit(1);
	}
}

main();
