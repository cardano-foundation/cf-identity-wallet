import Log4js from 'log4js';

Log4js.configure({
  appenders: {
    app: { type: "file", filename: "./.logs/test-run.log" },
    out: { type: "stdout" },
  },
  categories: {
    default: {
      appenders: ["app", "out"],
      level: "debug",
    },
  },
});

export const log = Log4js.getLogger();
