const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'app/page.tsx',
    'app/dashboard/page.tsx',
    'app/records/page.tsx',
    'app/chat/page.tsx',
    'components/AppLayout.tsx'
];

const replacements = [
    ["'#f9fafb'", "'var(--bg-color)'"],
    ['"#f9fafb"', '"var(--bg-color)"'],
    ["'white'", "'var(--card-bg)'"],
    ['"white"', '"var(--card-bg)"'],
    ["'#ffffff'", "'var(--card-bg)'"],
    ['"#ffffff"', '"var(--card-bg)"'],
    ["'#f3f4f6'", "'var(--bg-secondary)'"],
    ['"#f3f4f6"', '"var(--bg-secondary)"'],
    ["'#e5e7eb'", "'var(--border-color)'"],
    ['"#e5e7eb"', '"var(--border-color)"'],
    ["'#111827'", "'var(--text-primary)'"],
    ['"#111827"', '"var(--text-primary)"'],
    ["'#6b7280'", "'var(--text-secondary)'"],
    ['"#6b7280"', '"var(--text-secondary)"'],
    ["'#9ca3af'", "'var(--text-muted)'"],
    ['"#9ca3af"', '"var(--text-muted)"'],
    ["'#4b5563'", "'var(--text-secondary)'"],
    ['"#4b5563"', '"var(--text-secondary)"'],
    ["'#374151'", "'var(--text-primary)'"],
    ['"#374151"', '"var(--text-primary)"'],
    ["'#1f2937'", "'var(--text-primary)'"],
    ['"#1f2937"', '"var(--text-primary)"'],
    ["'#0f172a'", "'var(--text-primary)'"],
    ['"#0f172a"', '"var(--text-primary)"'],
    ["'#475569'", "'var(--text-secondary)'"],
    ['"#475569"', '"var(--text-secondary)"'],
    ["'#e2e8f0'", "'var(--border-color)'"],
    ['"#e2e8f0"', '"var(--border-color)"'],
    ["'#cbd5e1'", "'var(--border-color)'"],
    ['"#cbd5e1"', '"var(--border-color)"'],
    ["'#94a3b8'", "'var(--text-muted)'"],
    ['"#94a3b8"', '"var(--text-muted)"'],
    ["'#ef4444'", "'var(--accent-red)'"],
    ['"#ef4444"', '"var(--accent-red)"'],
    ["'#fee2e2'", "'var(--accent-red-light)'"],
    ['"#fee2e2"', '"var(--accent-red-light)"'],
    ["'#fef2f2'", "'var(--bg-secondary)'"],
    ['"#fef2f2"', '"var(--bg-secondary)"'],
    ["'#fecaca'", "'var(--border-color)'"],
    ['"#fecaca"', '"var(--border-color)"'],
    ["'#d1d5db'", "'var(--border-dark)'"],
    ['"#d1d5db"', '"var(--border-dark)"']
];

for (const filepath of filesToProcess) {
    const fullPath = path.join('D:\\E-mrg\\apps\\web', filepath);
    if (!fs.existsSync(fullPath)) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    for (const [oldStr, newStr] of replacements) {
        content = content.split(oldStr).join(newStr);
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Colors updated!');
