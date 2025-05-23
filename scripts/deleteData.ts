import { forceDeleteOrder, forceDeleteUser } from './forceDelete'

async function main() {
    try {
        // Get command line arguments
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            console.log('Please provide IDs to delete as command line arguments');
            console.log('Example: npx ts-node scripts/deleteData.ts ORD-123 USER-456');
            process.exit(1);
        }

        for (const id of args) {
            if (id.startsWith('ORD-')) {
                console.log(`Deleting order: ${id}`);
                await forceDeleteOrder(id);
            } else if (id.startsWith('USER-')) {
                console.log(`Deleting user: ${id}`);
                await forceDeleteUser(id);
            } else {
                console.log(`Skipping unknown ID format: ${id}`);
            }
        }

        console.log('All deletions completed successfully');
    } catch (error) {
        console.error('Error during deletion:', error);
        process.exit(1);
    }
}

// Run the script
main(); 