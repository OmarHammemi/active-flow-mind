module.exports = {
  apps: [
    {
      name: "active-flow-mind",
      script: "npm",
      args: "run dev",
      cwd: "/home/omar/Habit/active-flow-mind",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3006,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
