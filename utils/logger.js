import chalk from "chalk";
import util from "util";

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  success: 3,
  debug: 4,
};

class Logger {
  constructor(options = {}) {
    this.prefix = options.prefix || "Mygate-Node";
    this.logLevel = options.logLevel || "info";

    this.colors = {
      info: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
      success: chalk.blue,
      debug: chalk.magenta,
    };
  }

  _shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  _formatValue(value, level, options = {}) {
    const { stringify = false } = options;

    // 处理错误对象
    if (value instanceof Error) {
      return `\n${chalk.red("Error Stack:")} ${value.stack}`;
    }

    // 处理对象和数组
    if (value !== null && (typeof value === "object" || Array.isArray(value))) {
      const valueColor = level === "error" ? chalk.red : chalk.green;

      // 根据 stringify 参数决定展示方式
      if (stringify) {
        try {
          // 尝试使用 JSON.stringify 转换
          const stringValue = JSON.stringify(value);
          return ` ${valueColor(stringValue)}`;
        } catch (e) {
          // 如果 JSON.stringify 失败，使用 toString
          return ` ${valueColor(value.toString())}`;
        }
      } else {
        // 使用 util.inspect 展示原始格式
        const inspectOptions = {
          colors: true,
          depth: 3, // 限制嵌套深度
          compact: false,
          breakLength: 80,
        };

        const formattedValue = util.inspect(value, inspectOptions);
        return `\n${valueColor(formattedValue)}`;
      }
    }

    // 处理普通数据类型
    return ` ${level === "error" ? chalk.red(value) : chalk.green(value)}`;
  }

  log(level, message, value = "", options = {}) {
    // if (!this._shouldLog(level)) return;

    const now = new Date().toISOString();
    const color = this.colors[level] || chalk.white;
    const levelTag = `[ ${level.toUpperCase()} ]`;
    const timestamp = `[ ${now} ]`;

    const formattedMessage = `${chalk.cyan(
      `[ ${this.prefix} ]`
    )} ${chalk.cyanBright(timestamp)} ${color(levelTag)} ${message}`;
    const formattedValue = this._formatValue(value, level, options);

    console.log(`${formattedMessage}${formattedValue}`);
  }

  info(message, value = "", options = {}) {
    this.log("info", message, value, options);
  }

  warn(message, value = "", options = {}) {
    this.log("warn", message, value, options);
  }

  error(message, value = "", options = {}) {
    this.log("error", message, value, options);
  }

  success(message, value = "", options = {}) {
    this.log("success", message, value, options);
  }

  debug(message, value = "", options = {}) {
    this.log("debug", message, value, options);
  }
}

const logger = new Logger();
export { logger, Logger };
