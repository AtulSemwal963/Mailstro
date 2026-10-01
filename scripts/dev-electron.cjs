const { spawn } = require('node:child_process');

const vite = spawn('cmd.exe', ['/c', 'npm run dev:renderer'], {
  stdio: 'inherit',
  windowsHide: false,
});

const wait = spawn(
  'cmd.exe',
  ['/c', 'npx wait-on http://localhost:5173'],
  {
    stdio: 'inherit',
    windowsHide: false,
  }
);

wait.on('close', (code) => {
  if (code !== 0) {
    vite.kill();
    process.exit(code ?? 1);
  }

  const electron = spawn(
    'cmd.exe',
    ['/c', 'npx electron .'],
    {
      stdio: 'inherit',
      windowsHide: false,
      env: {
        ...process.env,
        VITE_DEV_SERVER_URL: 'http://localhost:5173/',
      },
    }
  );

  electron.on('close', (electronCode) => {
    vite.kill();
    process.exit(electronCode ?? 0);
  });
});

process.on('SIGINT', () => {
  vite.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  vite.kill();
  process.exit(0);
});