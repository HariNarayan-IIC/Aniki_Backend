// logger.middleware.js
import chalk from 'chalk';

export default function logger(req, res, next) {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    res.on('finish', () => {
        const duration = Date.now() - start;

        const method = chalk.cyan(req.method);
        const url = chalk.magentaBright(req.originalUrl);

        const statusColor =
            res.statusCode >= 500 ? chalk.red :
            res.statusCode >= 400 ? chalk.yellow :
            res.statusCode >= 300 ? chalk.magenta :
            res.statusCode >= 200 ? chalk.green :
            chalk.gray;

        const status = statusColor(res.statusCode);

        const time = chalk.blue(`${duration}ms`);

        console.log(`${timestamp}: ${method} ${url} ${status} - ${time}`);
    });

    next();
}