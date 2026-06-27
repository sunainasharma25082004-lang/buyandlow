const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const port = process.env.API_PORT || '5000';

function updateEnv(apiUrl) {
  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => !/^\s*EXPO_PUBLIC_API_URL\s*=/.test(line) && !/^#\s*Auto-set/.test(line));
  }

  const content = [
    '# Auto-set - API tunnel for phone dev',
    `EXPO_PUBLIC_API_URL=${apiUrl}`,
    '',
    ...lines.filter((line) => line.trim()),
  ].join('\n');

  fs.writeFileSync(envPath, content);
}

const child = spawn('npx', ['--yes', 'localtunnel', '--port', port], {
  shell: true,
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let saved = false;

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  const match = text.match(/your url is:\s*(https?:\/\/\S+)/i);
  if (match && !saved) {
    saved = true;
    const apiUrl = `${match[1].trim().replace(/\/$/, '')}/api`;
    updateEnv(apiUrl);
    console.log(`\n[BuyLow] Phone API URL saved: ${apiUrl}\n`);
  }
});

child.stderr.on('data', (chunk) => process.stderr.write(chunk));

child.on('close', (code) => process.exit(code || 0));

const cleanup = () => {
  try { child.kill(); } catch { /* ignore */ }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);