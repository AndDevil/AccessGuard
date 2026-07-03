export const logger = {
  info: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.log(`\x1b[32m[INFO] [${timestamp}]\x1b[0m ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.warn(`\x1b[33m[WARN] [${timestamp}]\x1b[0m ${message}`, ...args);
  },
  error: (message: string, error?: any, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    console.error(`\x1b[31m[ERROR] [${timestamp}]\x1b[0m ${message}`, error || '', ...args);
  }
};
