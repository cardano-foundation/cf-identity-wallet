import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const auditFilePath = join(__dirname, '..', 'audit-results.json');
const configPath = join(__dirname, '..', 'configs', 'ignored-node-vulnerabilities.json');

let auditResults, ignoredData;

try {
  auditResults = JSON.parse(fs.readFileSync(auditFilePath, 'utf8'));
} catch (error) {
  console.error(`Failed to read or parse audit results: ${error}`);
  process.exit(1);
}

try {
  ignoredData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`Failed to read or parse configuration: ${error}`);
  process.exit(1);
}

const ignoredIDs = new Set(ignoredData.ignoredIDs);

function getEmoji(severity) {
  switch (severity) {
    case 'critical': return '🔴';
    case 'high': return '🚨';
    case 'moderate': return '⚠️';
    case 'low': return 'ℹ️';
    case 'info': return '🔍';
    default: return '🔍';
  }
}

function formatColumn(value, width) {
  return value.length > width ? value.slice(0, width - 3) + '...' : value.padEnd(width);
}

console.log(`Starting vulnerability audit. Checking for issues...`);
console.log(`Loading ignored vulnerabilities from: ${configPath}\n`);

let vulnerabilitiesToDisplay = [];
let totalIgnored = 0;
let totalVulnerabilities = 0;

Object.entries(auditResults.vulnerabilities).forEach(([_, vuln]) => {
  const severity = vuln.severity;
  const name = vuln.name;
  const viaWithSource = vuln.via && vuln.via.filter(v => typeof v === 'object' && v.source);

  if (!viaWithSource || viaWithSource.length === 0) {
    return; // Skip vulnerabilities with no `source`
  }

  totalVulnerabilities++; // Increment total vulnerabilities processed

  const isIgnoredByID = viaWithSource.some(v => ignoredIDs.has(v.source.toString()));
  if (isIgnoredByID) {
    totalIgnored++; // Increment ignored vulnerabilities
  }

  const status = isIgnoredByID
    ? `Ignored (Advisory ID)`
    : `Found (Requires Attention)`;

  vulnerabilitiesToDisplay.push({
    name,
    severity,
    status,
    isIgnored: isIgnoredByID,
  });
});

// Sort vulnerabilities: Show "Requires Attention" first
vulnerabilitiesToDisplay.sort((a, b) => {
  if (a.isIgnored === b.isIgnored) {
    return 0;
  }
  return a.isIgnored ? 1 : -1;
});

const col1Width = 25; // Vulnerability column width
const col2Width = 10; // Severity column width
const col3Width = 30; // Status column width

console.log(
  `${formatColumn('Vulnerability', col1Width)} | ${formatColumn('Severity', col2Width)}    | ${formatColumn('Status', col3Width)}`
);
console.log('-'.repeat(col1Width + col2Width + col3Width + 6));

let criticalCount = 0;

vulnerabilitiesToDisplay.forEach(vuln => {
  const { name, severity, status, isIgnored } = vuln;

  if (!isIgnored) {
    criticalCount++;
  }

  console.log(
    `${formatColumn(name, col1Width)} | ${getEmoji(severity)} ${formatColumn(severity, col2Width)} | ${formatColumn(status, col3Width)}`
  );
});

console.log('\n' + '-'.repeat(col1Width + col2Width + col3Width + 6));
console.log(`\nAudit completed. Summary:`);
console.log(`${getEmoji('info')} Total ignored: ${totalIgnored} of ${totalVulnerabilities} vulnerabilities.`);

if (criticalCount > 0) {
  console.error(
    `${getEmoji('critical')} There are ${criticalCount} critical vulnerabilities that need attention.`
  );
  console.log("\n\nWhat to do next:");
  console.log("1. Run 'npm audit' for a detailed report.");
  console.log("2. Run 'npm audit --json' for a more detailed JSON formatted report.");
  console.log("3. To investigate a specific package, use 'npm list [package-name]', replacing [package-name] with the actual name of the package.");
  console.log("4. Consider updating or replacing vulnerable packages.");
  if (totalIgnored > 0) {
    console.log("\nNote: Some vulnerabilities are ignored based on specific source IDs in 'configs/ignored-node-vulnerabilities.json'.");
  }
  process.exit(1);
} else {
  console.log(`${getEmoji('info')} No critical vulnerabilities found.`);
  console.log("\nAll clear! No further action is required, but keep monitoring regularly.");
}
