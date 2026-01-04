import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const provider = process.argv[2]; // 'sqlite' or 'postgresql'

  if (!provider) {
    console.error('Please specify a provider: sqlite or postgresql');
    process.exit(1);
  }

  console.log(`Setting Prisma provider to: ${provider}`);

  if (provider === 'postgresql') {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    // Ensure we don't accidentally double-replace if it was already postgresql
    // Regex is better but simple string replacement works if we assume consistent formatting
  } else if (provider === 'sqlite') {
    schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
  }

  fs.writeFileSync(schemaPath, schema);
  console.log('schema.prisma updated successfully.');
} catch (error) {
  console.error('Error updating schema.prisma:', error);
  process.exit(1);
}

