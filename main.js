import { randomUUID } from "crypto";
import { Logger } from "./utils/logger.js";
import HttpClient from "./request/httpClient.js";
import { readAccounts, createProxyAgent } from "./utils/index.js";
import nodeSchedule from "node-schedule";
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
    const getData = await http.get("https://api.adviceslip.com/advice", {
      headers: {
        Authorization: `Bearer 123123123123`,
      },
      httpsAgent: axiosConfig.httpsAgent,
    });
    log.info("数据", getData.data, { stringify: true });
    return getData;
  } catch (error) {
    if (retryCount > 0) {
      log.warn(`请求失败，剩余重试次数: ${retryCount - 1}`);
      log.error("错误详情:", error.message);
      // 等待一段时间后重试
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
  const tasks = accounts.map((item) => {
    return getRequest(item.token, item.proxy);
  });

  try {
    await Promise.all(tasks);
    log.info("所有账户处理完成。");
  } catch (error) {
    log.error("处理账户时出错:", error.message);
  }
}
// 定时器函数
try {
  nodeSchedule.scheduleJob("*/10 * * * * *", () => {
    main();
  });
} catch (error) {
  log.error("定时任务错误:", error.message);
}
