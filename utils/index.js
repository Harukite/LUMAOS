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

// 创建代理 Agent
function createProxyAgent(proxyUrl) {
  try {
     if (proxyUrl) {
    if (proxyUrl.startsWith("http://")) {
      return new HttpsProxyAgent(proxyUrl);
    } else if (
      proxyUrl.startsWith("socks4://") ||
      proxyUrl.startsWith("socks5://")
    ) {
      return new SocksProxyAgent(proxyUrl);
    } else {
      log.warn(`Unsupported proxy type: ${proxyUrl}`);
      return null;
    }
  }
  return null;
  } catch (error) {
    log.error("创建代理 Agent 错误:", error);
    return null;
  }
}

export { readAccounts,createProxyAgent };
