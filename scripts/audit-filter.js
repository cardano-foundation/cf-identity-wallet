import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const auditFilePath = join(__dirname, 'audit-results.json');
const configPath = join(__dirname, '..', 'configs', 'ignored-node-vulnerabilities.json');

const auditResults = JSON.parse(fs.readFileSync(auditFilePath));
const ignoredData = JSON.parse(fs.readFileSync(configPath));
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

Object.entries(auditResults.vulnerabilities).forEach(([_, vuln]) => {
  const severity = vuln.severity;
  const name = vuln.name;

  // Filter vulnerabilities: Only process those with a `source` in the `via` field
  const viaWithSource = vuln.via && vuln.via.filter(v => typeof v === 'object' && v.source);

  if (!viaWithSource || viaWithSource.length === 0) {
    return; // Skip vulnerabilities with no `source`
  }

  // Check if the vulnerability is ignored
  const isIgnoredByID = viaWithSource.some(v => ignoredIDs.has(v.source.toString()));

  const status = isIgnoredByID
    ? `Ignored (Advisory ID)`
    : `Found (Requires Attention)`;

  // Add the vulnerability to the list to display
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
console.log(`Audit completed. Summary:`);

if (criticalCount > 0) {
  console.error(
    `${getEmoji('critical')} There are ${criticalCount} critical vulnerabilities that need attention.`
  );
  process.exit(1);
} else {
  console.log(`${getEmoji('info')} No critical vulnerabilities found.`);
}

process.stdout.write('\n');