// httpClient.js
import axios from "axios";

class UserAgentGenerator {
  static browsers = {
    chrome: {
      userAgents: [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      ],
      details: {
        platform: "Windows",
        platformVersion: "10.0",
        browserName: "Chrome",
        browserVersion: "110.0",
        architecture: "x64",
        mobile: false,
        uaPlatform: "Windows",
        secChUa: '"Chromium";v="110", "Google Chrome";v="110"',
        secChUaMobile: "?0",
        secChUaPlatform: '"Windows"',
      },
      macDetails: {
        platform: "Macintosh",
        platformVersion: "10.15.7",
        browserName: "Chrome",
        browserVersion: "110.0",
        architecture: "x64",
        mobile: false,
        uaPlatform: "macOS",
        secChUa: '"Chromium";v="110", "Google Chrome";v="110"',
        secChUaMobile: "?0",
        secChUaPlatform: '"macOS"',
      },
    },
  };

  static getRandomBrowserProfile() {
    const browserKeys = Object.keys(this.browsers);
    const randomBrowserKey =
      browserKeys[Math.floor(Math.random() * browserKeys.length)];
    const browser = this.browsers[randomBrowserKey];

    // 随机选择 userAgent
    const userAgents = browser.userAgents;
    const randomUserAgent =
      userAgents[Math.floor(Math.random() * userAgents.length)];

    // 根据 userAgent 选择对应的详细信息
    const isWindowsAgent = randomUserAgent.includes("Windows NT");
    const details = isWindowsAgent ? browser.details : browser.macDetails;

    return {
      userAgent: randomUserAgent,
      details: details,
    };
  }

  static generateHeaders(browserProfile) {
    const { userAgent, details } = browserProfile;

    const baseHeaders = {
      "User-Agent": userAgent,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
    };

    // 添加安全相关头部
    baseHeaders["Sec-Ch-Ua"] = details.secChUa;
    baseHeaders["Sec-Ch-Ua-Mobile"] = details.secChUaMobile;
    baseHeaders["Sec-Ch-Ua-Platform"] = details.secChUaPlatform;

    // 返回头部信息和解析后的 URL 信息
    return {
      headers: baseHeaders,
    };
  }
}

class HttpClient {
  constructor() {}

  async get(url, config = {}) {
    const browserProfile = UserAgentGenerator.getRandomBrowserProfile();
    const { headers } = UserAgentGenerator.generateHeaders(browserProfile);
    return axios.get(url, {
      headers: {
        ...headers,
        ...config.headers,
      },
      agent: config.httpsAgent,
    });
  }

  async post(url, data = {}, config = {}) {
    const browserProfile = UserAgentGenerator.getRandomBrowserProfile();
    const { headers } = UserAgentGenerator.generateHeaders(browserProfile);
    return axios.post(url, data, {
      headers: {
        ...headers,
        ...config.headers,
      },
      httpsAgent: config.httpsAgent,
    });
  }
  // 异步初始化方法
}
export default HttpClient;
