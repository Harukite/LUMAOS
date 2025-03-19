import { randomUUID } from "crypto";
import { Logger } from "./utils/logger.js";
import HttpClient from "./request/httpClient.js";
import { readAccounts, createProxyAgent,delay } from "./utils/index.js";
import nodeSchedule from "node-schedule";
import generateTechStyle from "./utils/banner.js";
// 创建 HttpClient 实例，但不立即初始化
const http = new HttpClient();
const log = new Logger({ prefix: "LuMao" });

async function getRequest(account, currentProxy, retryCount = 3) {
  const axiosConfig = {
    data: { account },
    timeout: 10000, // 10秒超时
  };
  try {
    if (currentProxy) {
      const proxyAgent = createProxyAgent(currentProxy);
      if (proxyAgent) {
        axiosConfig.httpsAgent = proxyAgent;
        log.info(`使用代理: ${currentProxy} 处理账户: ${account}`);
      } else {
        log.warn(`账号: ${account}，不使用代理`);
      }
    }
    // 发起请求
    const getData = await http.get(
      "https://api.ipify.org?format=json",
      axiosConfig
    );
    log.success("数据", getData, { stringify: true });
    return getData;
  } catch (error) {
    if (retryCount > 0) {
      log.warn(`请求失败，剩余重试次数: ${retryCount - 1}`);
      log.error("错误详情:", error.message);
      // 等待一段时间后重试
      await delay(3 * Math.random());
      return getRequest(account, currentProxy, retryCount - 1);
    } else {
      log.error(`账户 ${account} 请求失败，已用尽重试次数`);
      throw error;
    }
  }
}

// 主函数
async function main() {
  const accounts = await readAccounts();
  if (accounts.length === 0) {
    log.warn("没有要处理的账户。");
    return;
  }

  for (let i = 0; i < accounts.length; i++) {
    await getRequest(accounts[i].token, accounts[i].proxy);
    await delay(3 * Math.random());
  }
}
// 定时器函数
try {
  console.log(generateTechStyle("Super Cool Project"));
  nodeSchedule.scheduleJob("*/10 * * * * *", () => {
    main();
  });
} catch (error) {
  log.error("定时任务错误:", error.message);
}
