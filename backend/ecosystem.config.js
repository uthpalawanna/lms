// PM2 process manager config for the SHRI LMS backend.
//
// Setup on the server (one-time):
//   npm install -g pm2
//
// Start the app with this config:
//   cd backend
//   pm2 start ecosystem.config.js
//
// Make it survive a server reboot:
//   pm2 startup        # prints a command — copy/paste and run it once
//   pm2 save           # saves the current process list to restore on boot
//
// Common commands afterwards:
//   pm2 status                 # see if it's running
//   pm2 logs shri-backend      # tail logs
//   pm2 restart shri-backend   # restart after a deploy
//   pm2 reload shri-backend    # zero-downtime restart

module.exports = {
  apps: [
    {
      name: "shri-backend",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      // Restart if it crashes, but don't loop forever if something's
      // fundamentally broken (e.g. bad Mongo credentials).
      max_restarts: 10,
      min_uptime: "10s",
      // Restart automatically if memory usage gets out of hand.
      max_memory_restart: "300M",
      // PM2's own log files (separate from your app's morgan/console logs).
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      time: true,
    },
  ],
};