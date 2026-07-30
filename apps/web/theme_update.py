import os
import re

files_to_process = [
    'app/page.tsx',
    'app/dashboard/page.tsx',
    'app/records/page.tsx',
    'app/chat/page.tsx',
    'components/AppLayout.tsx'
]

replacements = [
    (r"'#f9fafb'", "var(--bg-color)"),
    (r"'white'", "var(--card-bg)"),
    (r"'#ffffff'", "var(--card-bg)"),
    (r"'#f3f4f6'", "var(--bg-secondary)"),
    (r"'#e5e7eb'", "var(--border-color)"),
    (r"'#111827'", "var(--text-primary)"),
    (r"'#6b7280'", "var(--text-secondary)"),
    (r"'#9ca3af'", "var(--text-muted)"),
    (r"'#4b5563'", "var(--text-secondary)"),
    (r"'#374151'", "var(--text-primary)"),
    (r"'#1f2937'", "var(--text-primary)"),
    (r"'#0f172a'", "var(--text-primary)"),
    (r"'#475569'", "var(--text-secondary)"),
    (r"'#e2e8f0'", "var(--border-color)"),
    (r"'#cbd5e1'", "var(--border-color)"),
    (r"'#94a3b8'", "var(--text-muted)"),
    (r"'#ef4444'", "var(--accent-red)"),
    (r"'#fee2e2'", "var(--accent-red-light)"),
    (r"'#fef2f2'", "var(--bg-secondary)"),
    (r"'#fecaca'", "var(--border-color)"),
    (r"'#d1d5db'", "var(--border-dark)")
]

for filepath in files_to_process:
    full_path = os.path.join(r'D:\E-mrg\apps\web', filepath)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace hex colors inside style={{ ... }} objects.
    # To be safe, we just replace them globally where they are strings (surrounded by quotes)
    # or inside string templates.
    for old, new in replacements:
        # replace double quotes too
        old_dq = old.replace("'", '"')
        content = content.replace(old, f"'{new}'")
        content = content.replace(old_dq, f'"{new}"')
        
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Colors updated to CSS variables!')
