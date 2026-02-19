import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logPath = path.resolve(__dirname, 'debug_root.log');
console.log('Writing to:', logPath);

try {
    fs.appendFileSync(logPath, `[TEST] ${new Date().toISOString()} Log check (ESM)\n`);
    console.log('✅ Write success');
} catch (e) {
    console.error('❌ Write failed:', e);
}
