import { db } from '../store/database.js';

const isBlank = process.argv.includes('--blank') || !process.argv.includes('--demo');

if (isBlank) {
  db.resetToBlank();
  console.log('\n======================================================');
  console.log('✅ AegisGov AI: System reset to BLANK state successfully.');
  console.log('------------------------------------------------------');
  console.log(' - Data Sources:      0 (Empty)');
  console.log(' - Agent Identities:  0 (Empty)');
  console.log(' - LLM Models:        0 (Empty)');
  console.log(' - Action Policies:   0 (Empty)');
  console.log(' - Approvals Queue:   0 (Empty)');
  console.log(' - Evidence Ledger:   0 (Empty)');
  console.log(' - ISO 42001 Controls: 20 (Reset to NO status)');
  console.log('======================================================\n');
} else {
  db.resetToDemo();
  console.log('\n======================================================');
  console.log('✅ AegisGov AI: System restored to DEMO state.');
  console.log(' - Preloaded presets: Air Canada, Samsung, Zillow, SaaStr');
  console.log('======================================================\n');
}

