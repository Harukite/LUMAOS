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

// 获取tokens
async function getAccessTokens() {
    try {
        const tokenData = await fs.readFile('tokens.txt', 'utf8');
        const tokens = tokenData.split('\n')
            .map(token => token.trim())
            .filter(token => token.length > 0);
        
        if (tokens.length === 0) {
            throw new Error('No tokens found in tokens.txt');
        }
        return tokens;
    } catch (error) {
        console.error(chalk.red.bold(`[ERROR] Failed to read tokens from tokens.txt: ${error.message}`));
        throw error;
    }
}

// 获取代理信息
async function getProxies() {
    try {
        const proxyData = await fs.readFile(PROXIES_FILE, 'utf8');
        const proxies = proxyData.split('\n')
            .map(proxy => proxy.trim())
            .filter(proxy => proxy.length > 0);
        
        if (proxies.length === 0) {
            console.log(chalk.yellow(`[WARNING] No proxies found in ${PROXIES_FILE}. Running without proxies.`));
            return [];
        }
        
        console.log(chalk.white(`🌐 [INFO] Loaded ${proxies.length} proxies from ${PROXIES_FILE}`));
        return proxies;
    } catch (error) {
        console.error(chalk.yellow(`[WARNING] Failed to read proxies from ${PROXIES_FILE}: ${error.message}. Running without proxies.`));
        return [];
    }
}

export { readAccounts,createProxyAgent,getProxies,getAccessTokens };  
