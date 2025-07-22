import fs from "fs/promises";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SocksProxyAgent } from "socks-proxy-agent";
import dotenv from "dotenv";
import { URL } from "url";
import { Logger } from "./logger.js";
dotenv.config();
const log = new Logger();
const DELAY_TIME = process.env.DELAY_TIME
  ? JSON.parse(process.env.DELAY_TIME)
  : [3, 30];


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
async function getAccessTokens(TOKEN_FILE="tokens.txt") {
  try {
    const tokenData = await fs.readFile(TOKEN_FILE, 'utf8');
    const tokens = tokenData.split('\n').map(token => token.trim()).filter(token => token.length > 0);

    if (tokens.length === 0) {
      throw new Error('No tokens found in tokens.txt');
    }
    log.info(`🌐 [INFO] Loaded ${tokens.length} tokens from ${TOKEN_FILE}`);
    return tokens;
  } catch (error) {
    log.error(`[ERROR] Failed to read tokens from tokens.txt: ${error.message}`);
    throw error;
  }
}
// 获取钱包
async function getWallet(WALLET_FILE='wallet.txt') {
  try {
    const walletData = await fs.readFile('wallet.txt', 'utf8');
    const wallets = walletData.split('\n').map(wallet => wallet.trim()).filter(wallet => wallet.length > 0);

    if (wallets.length === 0) {
      throw new Error('No wallets found in tokens.txt');
    }
    log.info(`🌐 [INFO] Loaded ${wallets.length} wallets from ${WALLET_FILE}`);
    return wallets;
  } catch (error) {
    log.error( `[ERROR] Failed to read wallets from wallets.txt: ${error.message}`);
    throw error;
  }
}

// 获取代理信息
async function getProxies(PROXIES_FILE = 'proxies.txt') {
  try {
    const proxyData = await fs.readFile(PROXIES_FILE, 'utf8');
    const proxies = proxyData.split('\n').map(proxy => proxy.trim()).filter(proxy => proxy.length > 0);

    if (proxies.length === 0) {
      log.info(`[WARNING] No proxies found in ${PROXIES_FILE}. Running without proxies.`);
      return [];
    }

    log.info(`🌐 [INFO] Loaded ${proxies.length} proxies from ${PROXIES_FILE}`);
    return proxies;
  } catch (error) {
    log.error(`[WARNING] Failed to read proxies from ${PROXIES_FILE}: ${error.message}. Running without proxies.`);
    return [];
  }
}

// 延迟函数
function delay(ms) {
  if (ms) {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
  } else {
    const [min, max] = DELAY_TIME;
    const randomDelay = Math.floor(Math.random() * (max - min + 1)) + min;
    log.info(`${randomDelay}s 后执行下一个任务！`)
    return new Promise(resolve => setTimeout(resolve, 1000 * randomDelay));
  }
}

export { readAccounts, createProxyAgent, getProxies, getAccessTokens, delay, getWallet };  
