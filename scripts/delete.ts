import { forceDeleteOrder, forceDeleteUser } from './forceDelete'

// Get the command line arguments
const args = process.argv.slice(2)
const command = args[0]
const id = args[1]

if (!command || !id) {
    console.log('Usage:')
    console.log('To delete an order: npm run delete order <order-id>')
    console.log('To delete a user: npm run delete user <user-id>')
    process.exit(1)
}

async function main() {
    try {
        if (command === 'order') {
            await forceDeleteOrder(id)
        } else if (command === 'user') {
            await forceDeleteUser(id)
        } else {
            console.log('Invalid command. Use "order" or "user"')
            process.exit(1)
        }
    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

main() 