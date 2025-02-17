import fs from "fs/promises";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import { URL } from "url";
import { Logger } from "./logger.js";
const log = new Logger();
// 读取账号信息
async function readAccounts() {
  try {
    await fs.access("accounts.json");
    const data = await fs.readFile("accounts.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      log.warn("No accounts found in accounts.json");
      return [];
    }
    throw err;
  }
}

// 解析代理 URL
function parseProxyUrl(proxyUrl) {
  try {
    const parsedUrl = new URL(proxyUrl);
    const protocol = parsedUrl.protocol.replace(":", "");
    const [username, password] = parsedUrl.username
      ? parsedUrl.username.split(":")
      : [null, null];

    return {
      protocol,
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port),
      username,
      password,
    };
  } catch (error) {
    log.error("代理 URL 解析错误:", error);
    return null;
  }
}

// 创建代理 Agent
function createProxyAgent(proxyUrl) {
  const proxyConfig = parseProxyUrl(proxyUrl);
  if (!proxyConfig) return null;

  try {
    switch (proxyConfig.protocol) {
      case "socks4":
      case "socks5":
        return new SocksProxyAgent(proxyUrl);
      case "http":
      case "https":
        return new HttpsProxyAgent(proxyUrl);
      default:
        log.warn(`不支持的代理协议: ${proxyConfig.protocol}`);
        return null;
    }
  } catch (error) {
    log.error("创建代理 Agent 错误:", error);
    return null;
  }
}

export { readAccounts, parseProxyUrl, createProxyAgent };
