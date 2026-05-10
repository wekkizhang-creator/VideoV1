/* global window */
(function () {
  const STORAGE_KEY = "adshot.backend.state.v5";
  const STATE_VERSION = 5;
  const SECOND = 1000;
  const AUTH_CODE_TTL = 10 * 60 * SECOND;
  let idCounter = 0;
  const subscribers = new Set();

  const STYLE_DEFS = [
    { id: "pain", name: "痛点款", short: "痛点", ctr: 2.84, color: "linear-gradient(135deg,#f87171,#ec4899)" },
    { id: "seed", name: "种草款", short: "种草", ctr: 2.12, color: "linear-gradient(135deg,#34d399,#10b981)" },
    { id: "direct", name: "直给款", short: "直给", ctr: 1.46, color: "linear-gradient(135deg,#60a5fa,#3b82f6)" },
    { id: "compare", name: "对比测评款", short: "测评", ctr: 0.92, color: "linear-gradient(135deg,#fbbf24,#f97316)" },
    { id: "story", name: "情景剧款", short: "剧情", ctr: 1.78, color: "linear-gradient(135deg,#a78bfa,#8b5cf6)" },
    { id: "ugc", name: "素人开箱款", short: "开箱", ctr: 1.54, color: "linear-gradient(135deg,#f472b6,#ec4899)" },
  ];

  const MODEL_DEFS = [
    { id: "lite", name: "标清通用", quality: "720p", seconds: 30, credit: 80 },
    { id: "pro", name: "高清精修", quality: "1080p", seconds: 75, credit: 240 },
    { id: "ultra", name: "超清电影", quality: "4K", seconds: 180, credit: 680 },
  ];

  const PLAN_DEFS = [
    { id: "starter", name: "基础版", price: 199, creditsTotal: 12000, seats: 1, shops: 1, label: "适合单店测试" },
    { id: "pro", name: "专业版", price: 699, creditsTotal: 50000, seats: 5, shops: 5, label: "当前套餐" },
    { id: "team", name: "团队版", price: 1999, creditsTotal: 180000, seats: 20, shops: 20, label: "适合多店矩阵" },
  ];

  const CREDIT_PACKAGES = [
    { id: "pack_5k", name: "补充包 5,000", credits: 5000, price: 99, tag: "轻量补充" },
    { id: "pack_20k", name: "增长包 20,000", credits: 20000, price: 329, tag: "推荐" },
    { id: "pack_80k", name: "矩阵包 80,000", credits: 80000, price: 999, tag: "高并发" },
  ];

  const PAYMENT_METHODS = [
    { id: "wechat", name: "微信支付", short: "微信", color: "#16a34a", scheme: "weixin://wxpay/bizpayurl" },
    { id: "alipay", name: "支付宝", short: "支付宝", color: "#1677ff", scheme: "alipays://platformapi/startapp" },
  ];

  const PLATFORM_DEFS = [
    { id: "ocean", name: "巨量引擎", short: "巨", color: "#ff5e5e", connected: true, balance: 24180, scopes: ["素材上传", "投放数据", "计划管理"] },
    { id: "kuaishou", name: "磁力金牛", short: "磁", color: "#ffb820", connected: true, balance: 8420, scopes: ["素材上传", "投放数据"] },
    { id: "qianchuan", name: "千川", short: "千", color: "#00d4aa", connected: false, balance: 0, scopes: ["素材上传", "投放数据"] },
    { id: "wechat", name: "视频号", short: "视", color: "#1aad19", connected: false, balance: 0, scopes: ["素材上传", "投放数据"] },
  ];

  const TEMPLATE_BLUEPRINTS = [
    {
      name: "防晒痛点爆发款",
      category: "美妆个护",
      description: "先戳痛点,再用核心卖点解决夏季晒黑、油腻和补涂焦虑。",
      styleIds: ["pain", "direct"],
      perStyle: 4,
      modelId: "pro",
      duration: 15,
      aspect: "9:16",
      tags: ["痛点钩子", "强转化", "美妆"],
      roi: 4.62,
      ctr: 2.84,
      used: 86,
    },
    {
      name: "数码种草测评款",
      category: "数码配件",
      description: "用真实体验和轻测评结构降低理解门槛,适合耳机、充电宝等数码品。",
      styleIds: ["seed", "compare"],
      perStyle: 3,
      modelId: "pro",
      duration: 30,
      aspect: "9:16",
      tags: ["开箱", "测评", "种草"],
      roi: 3.94,
      ctr: 2.12,
      used: 64,
    },
    {
      name: "厨房好物直给款",
      category: "家居厨具",
      description: "三秒讲清卖点、价格和使用场景,适合强功能型商品快速投流。",
      styleIds: ["direct", "compare"],
      perStyle: 4,
      modelId: "lite",
      duration: 15,
      aspect: "9:16",
      tags: ["直给", "价格锚点", "功能演示"],
      roi: 2.86,
      ctr: 1.46,
      used: 52,
    },
    {
      name: "宠物场景短剧款",
      category: "宠物用品",
      description: "把加班、出差、忘记喂食等场景短剧化,提升代入感。",
      styleIds: ["story", "pain"],
      perStyle: 3,
      modelId: "pro",
      duration: 30,
      aspect: "9:16",
      tags: ["情景剧", "宠物", "代入感"],
      roi: 3.4,
      ctr: 1.78,
      used: 32,
    },
    {
      name: "素人开箱信任款",
      category: "通用模板",
      description: "弱滤镜、弱表演,突出真实开箱和普通人使用反馈。",
      styleIds: ["ugc", "seed"],
      perStyle: 5,
      modelId: "pro",
      duration: 15,
      aspect: "9:16",
      tags: ["UGC", "弱滤镜", "信任感"],
      roi: 3.12,
      ctr: 1.54,
      used: 28,
    },
  ];

  const PRODUCT_CATALOG = [
    {
      key: "sunscreen",
      keywords: ["防晒", "SPF", "喷雾", "军训", "sunscreen"],
      title: "夏季清爽防晒喷雾 SPF50+ 男女通用全身可用持久不脱妆 50ml",
      shortName: "夏季防晒喷雾",
      category: "美妆 / 防晒",
      shop: "夏沐旗舰店",
      platformShop: "天猫旗舰店",
      price: 69.9,
      originalPrice: 99,
      commissionRate: 0.3,
      inventory: "充足",
      rating: 4.9,
      monthlySales: "2.6w+",
      sold: "12.4 万件",
      comments: 8923,
      gmv7d: 482000,
      audience: "18-24 岁学生 / 职场新人女性",
      scene: "军训 / 户外",
      tags: ["护肤个护", "清爽防晒", "通勤补涂"],
      color: "linear-gradient(135deg, #fbbf24 0%, #f97316 52%, #ec4899 100%)",
      sellingPoints: [
        { text: "全身可用,不黏腻不假白", source: "详情页" },
        { text: "SPF50+ PA++++,持续防晒 8 小时", source: "标题" },
        { text: "敏感肌可用,0 酒精 0 香精", source: "评论高频词" },
        { text: "便携 50ml,适合通勤补涂", source: "AI 推断" },
        { text: "买 2 送 1,限时官方旗舰店", source: "促销" },
        { text: "持久不脱妆,告别黏腻油光", source: "AI 推断" },
      ],
    },
    {
      key: "earbuds",
      keywords: ["耳机", "蓝牙", "SoundPro", "降噪", "earbud"],
      title: "SoundPro 主动降噪蓝牙耳机 48 小时续航低延迟游戏通话",
      shortName: "蓝牙耳机 SoundPro",
      category: "数码 / 耳机",
      shop: "声浪数码旗舰店",
      platformShop: "京东自营",
      price: 199,
      originalPrice: 299,
      commissionRate: 0.18,
      inventory: "充足",
      rating: 4.8,
      monthlySales: "1.8w+",
      sold: "8.9 万件",
      comments: 6432,
      gmv7d: 356000,
      audience: "18-35 岁通勤族 / 游戏用户",
      scene: "通勤 / 运动 / 游戏",
      tags: ["数码配件", "主动降噪", "长续航"],
      color: "linear-gradient(135deg,#60a5fa,#8b5cf6)",
      sellingPoints: [
        { text: "主动降噪 42dB,地铁通勤更安静", source: "详情页" },
        { text: "48 小时综合续航,一周少充电", source: "标题" },
        { text: "低延迟游戏模式,声画同步", source: "详情页" },
        { text: "四麦通话降噪,开会更清楚", source: "评论高频词" },
        { text: "入耳轻盈不胀耳,运动不易掉", source: "AI 推断" },
        { text: "新客限时低价,送保护套", source: "促销" },
      ],
    },
    {
      key: "pan",
      keywords: ["不粘锅", "陶瓷", "锅", "煎锅", "pan"],
      title: "陶瓷不粘锅 28cm 少油烟平底煎锅 电磁炉燃气灶通用",
      shortName: "陶瓷不粘锅",
      category: "厨具 / 锅具",
      shop: "良厨生活馆",
      platformShop: "拼多多品牌店",
      price: 89,
      originalPrice: 139,
      commissionRate: 0.22,
      inventory: "库存紧张",
      rating: 4.7,
      monthlySales: "9800+",
      sold: "6.2 万件",
      comments: 3512,
      gmv7d: 211000,
      audience: "25-45 岁家庭主厨 / 租房人群",
      scene: "早餐 / 轻油烹饪",
      tags: ["厨房家居", "少油烟", "易清洗"],
      color: "linear-gradient(135deg,#f87171,#ec4899)",
      sellingPoints: [
        { text: "陶瓷涂层,煎蛋少油也不粘", source: "详情页" },
        { text: "28cm 大口径,一家三口够用", source: "标题" },
        { text: "一冲即净,懒人清洁更省心", source: "评论高频词" },
        { text: "电磁炉燃气灶都能用", source: "详情页" },
        { text: "加厚锅底,受热更均匀", source: "AI 推断" },
        { text: "限时半价,全网最低", source: "促销" },
      ],
    },
    {
      key: "feeder",
      keywords: ["宠物", "喂食器", "猫", "狗", "feeder"],
      title: "宠物自动喂食器 双电源防卡粮 猫狗定时定量远程喂养",
      shortName: "宠物自动喂食器",
      category: "宠物 / 智能用品",
      shop: "小尾巴宠物",
      platformShop: "抖店精选",
      price: 159,
      originalPrice: 229,
      commissionRate: 0.2,
      inventory: "充足",
      rating: 4.85,
      monthlySales: "1.1w+",
      sold: "4.6 万件",
      comments: 2860,
      gmv7d: 176000,
      audience: "上班族铲屎官 / 短途出行人群",
      scene: "出差 / 加班 / 日常喂养",
      tags: ["宠物智能", "远程喂养", "防卡粮"],
      color: "linear-gradient(135deg,#34d399,#06b6d4)",
      sellingPoints: [
        { text: "定时定量出粮,加班也不怕饿到宠物", source: "详情页" },
        { text: "双电源设计,断电也能继续喂", source: "标题" },
        { text: "防卡粮结构,小颗粒猫粮更顺畅", source: "评论高频词" },
        { text: "透明粮桶,余量一眼可见", source: "AI 推断" },
        { text: "手机远程操作,随时补喂", source: "详情页" },
        { text: "爆款同款,限时秒杀", source: "促销" },
      ],
    },
  ];

  const RISK_RULES = [
    { word: "限时", level: "warning", message: "包含限时促销表达,需确认活动真实有效" },
    { word: "最低", level: "danger", message: "疑似绝对化用语,建议改成同档更划算" },
    { word: "敏感肌可用", level: "warning", message: "可能涉及功效承诺,建议改成温和配方" },
    { word: "亲测有效", level: "warning", message: "功效表达偏强,建议补充依据或弱化" },
    { word: "全网", level: "danger", message: "疑似极限词,审核风险较高" },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function now() {
    return Date.now();
  }

  function iso(offsetDays = 0) {
    return new Date(now() + offsetDays * 86400000).toISOString();
  }

  function makeId(prefix) {
    idCounter += 1;
    return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
  }

  function hash(input) {
    const str = String(input || "");
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function styleById(id) {
    return STYLE_DEFS.find((s) => s.id === id) || STYLE_DEFS[0];
  }

  function modelById(id) {
    return MODEL_DEFS.find((m) => m.id === id) || MODEL_DEFS[1];
  }

  function formatRelative(isoString) {
    const diff = now() - new Date(isoString).getTime();
    if (diff < 60 * SECOND) return "刚刚";
    if (diff < 3600 * SECOND) return `${Math.max(1, Math.round(diff / 60000))} 分钟前`;
    if (diff < 86400 * SECOND) return `今天 ${new Date(isoString).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    const d = new Date(isoString);
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  }

  function parsePlatform(link) {
    const value = String(link || "").toLowerCase();
    if (value.includes("taobao") || value.includes("tmall")) return "淘宝/天猫";
    if (value.includes("jd.com")) return "京东";
    if (value.includes("yangkeduo") || value.includes("pinduoduo")) return "拼多多";
    if (value.includes("jinritemai") || value.includes("douyin")) return "抖店";
    if (value.includes("1688")) return "1688";
    return "手动链接";
  }

  function normalizeLink(link) {
    const raw = String(link || "").trim();
    if (!raw) throw new Error("请先粘贴商品链接");
    if (!/^https?:\/\//i.test(raw)) throw new Error("商品链接需要以 http:// 或 https:// 开头");
    return raw;
  }

  function catalogForLink(link) {
    const decoded = safeDecode(link).toLowerCase();
    const hit = PRODUCT_CATALOG.find((item) => item.keywords.some((key) => decoded.includes(key.toLowerCase())));
    return hit || PRODUCT_CATALOG[hash(link) % PRODUCT_CATALOG.length];
  }

  function safeDecode(value) {
    try {
      return decodeURIComponent(String(value || ""));
    } catch (err) {
      return String(value || "");
    }
  }

  function complianceForText(text) {
    const rule = RISK_RULES.find((r) => String(text || "").includes(r.word));
    if (!rule) return { level: "ok", message: null };
    return { level: rule.level, message: rule.message, word: rule.word };
  }

  function buildProduct(link) {
    const normalized = normalizeLink(link);
    const item = catalogForLink(normalized);
    const seed = hash(normalized + item.key);
    const productId = `product_${seed.toString(36)}`;
    const priceNudge = ((seed % 7) - 3) * 0.5;
    const price = Math.max(9.9, Number((item.price + priceNudge).toFixed(1)));
    const commission = Number((price * item.commissionRate).toFixed(1));
    const sellingPoints = item.sellingPoints.map((point, index) => {
      const compliance = complianceForText(point.text);
      return {
        id: `sp_${productId}_${index + 1}`,
        text: point.text,
        source: point.source,
        risk: compliance.level,
        riskMessage: compliance.message,
      };
    });

    return {
      id: productId,
      link: normalized,
      platform: parsePlatform(normalized),
      title: item.title,
      shortName: item.shortName,
      category: item.category,
      shop: item.shop,
      platformShop: item.platformShop,
      price,
      originalPrice: item.originalPrice,
      commission,
      commissionRate: item.commissionRate,
      inventory: item.inventory,
      rating: item.rating,
      monthlySales: item.monthlySales,
      sold: item.sold,
      comments: item.comments,
      gmv7d: item.gmv7d + (seed % 28000),
      audience: item.audience,
      scene: item.scene,
      tags: item.tags,
      color: item.color,
      imageCount: 8 + (seed % 3),
      detailImageCount: 10 + (seed % 6),
      sellingPoints,
      parsedAt: iso(),
    };
  }

  function enrichProduct(product, index = 0, overrides = {}) {
    const seed = hash(product.id || product.link || product.title);
    return {
      ...product,
      status: overrides.status || product.status || "active",
      favorite: overrides.favorite ?? product.favorite ?? index < 2,
      source: overrides.source || product.source || "system",
      generatedCount: overrides.generatedCount ?? product.generatedCount ?? (8 + (seed % 32)),
      assetCount: overrides.assetCount ?? product.assetCount ?? (4 + (seed % 18)),
      templateCount: overrides.templateCount ?? product.templateCount ?? (1 + (seed % 4)),
      lastGeneratedAt: overrides.lastGeneratedAt || product.lastGeneratedAt || iso(-1 * (index + 1)),
      updatedAt: overrides.updatedAt || product.updatedAt || product.parsedAt || iso(-1 * (index + 1)),
      notes: overrides.notes || product.notes || "",
    };
  }

  function createSeedProducts() {
    return PRODUCT_CATALOG.map((item, index) => {
      const product = buildProduct(`https://item.taobao.com/item.htm?id=demo_${encodeURIComponent(item.shortName)}`);
      return enrichProduct(product, index, {
        source: "seed",
        status: index === 2 ? "watching" : "active",
        favorite: index < 2,
        parsedAt: iso(-12 - index * 2),
        updatedAt: iso(-index),
        lastGeneratedAt: iso(-index - 0.5),
      });
    });
  }

  function createSeedTemplates() {
    return TEMPLATE_BLUEPRINTS.map((tpl, index) => ({
      id: `tpl_seed_${index + 1}`,
      ...tpl,
      status: index === 2 ? "paused" : "active",
      source: "system",
      createdAt: iso(-30 + index),
      updatedAt: iso(-index),
      lastUsedAt: iso(-index - 0.2),
    }));
  }

  function createSeedSaasData() {
    return {
      auth: {
        session: null,
        lastSystem: "user",
        verificationCodes: [],
      },
      tenants: [
        {
          id: "tenant_demo",
          company: "小满电商工作室",
          status: "active",
          planId: "pro",
          ownerUserId: "user_owner",
          seatsUsed: 3,
          seatsTotal: 5,
          shops: 3,
          createdAt: iso(-46),
          lastActiveAt: iso(-0.04),
        },
        {
          id: "tenant_growth",
          company: "星禾美妆矩阵",
          status: "trial",
          planId: "starter",
          ownerUserId: "user_growth",
          seatsUsed: 1,
          seatsTotal: 1,
          shops: 1,
          createdAt: iso(-8),
          lastActiveAt: iso(-0.18),
        },
        {
          id: "tenant_team",
          company: "鲸选家居运营部",
          status: "active",
          planId: "team",
          ownerUserId: "user_team",
          seatsUsed: 12,
          seatsTotal: 20,
          shops: 14,
          createdAt: iso(-62),
          lastActiveAt: iso(-0.09),
        },
      ],
      users: [
        {
          id: "user_owner",
          tenantId: "tenant_demo",
          name: "小满电商",
          company: "小满电商工作室",
          email: "ops@xiaoman.example",
          phone: "13800002678",
          password: "demo123456",
          role: "owner",
          status: "active",
          createdAt: iso(-46),
          lastLoginAt: iso(-0.05),
        },
        {
          id: "user_ops",
          tenantId: "tenant_demo",
          name: "投放运营",
          company: "小满电商工作室",
          email: "media@xiaoman.example",
          phone: "13900001888",
          password: "demo123456",
          role: "operator",
          status: "active",
          createdAt: iso(-22),
          lastLoginAt: iso(-0.3),
        },
        {
          id: "user_growth",
          tenantId: "tenant_growth",
          name: "星禾主理人",
          company: "星禾美妆矩阵",
          email: "hello@xinghe.example",
          phone: "13700001999",
          password: "demo123456",
          role: "owner",
          status: "trial",
          createdAt: iso(-8),
          lastLoginAt: iso(-0.18),
        },
        {
          id: "user_team",
          tenantId: "tenant_team",
          name: "鲸选运营长",
          company: "鲸选家居运营部",
          email: "ops@jingxuan.example",
          phone: "13600002000",
          password: "demo123456",
          role: "owner",
          status: "active",
          createdAt: iso(-62),
          lastLoginAt: iso(-0.09),
        },
        {
          id: "admin_root",
          tenantId: "platform",
          name: "平台管理员",
          company: "AdShot SaaS 运营后台",
          email: "admin@adshot.example",
          phone: "13500001111",
          password: "admin123456",
          role: "platform_admin",
          status: "active",
          createdAt: iso(-120),
          lastLoginAt: iso(-0.02),
        },
      ],
      paymentOrders: [
        {
          id: "pay_seed_1",
          orderNo: "AS202605100001",
          type: "plan",
          productId: "pro",
          subject: "专业版月套餐",
          amount: 699,
          credits: 50000,
          method: "wechat",
          methodName: "微信支付",
          status: "paid",
          createdAt: iso(-3),
          paidAt: iso(-3 + 0.01),
          expiresAt: iso(-2.98),
          qrPayload: "weixin://wxpay/bizpayurl?pr=demo_pro",
          tenantId: "tenant_demo",
          operator: "小满电商",
        },
        {
          id: "pay_seed_2",
          orderNo: "AS202605090014",
          type: "credits",
          productId: "pack_20k",
          subject: "增长包 20,000 Credits",
          amount: 329,
          credits: 20000,
          method: "alipay",
          methodName: "支付宝",
          status: "paid",
          createdAt: iso(-1.6),
          paidAt: iso(-1.59),
          expiresAt: iso(-1.58),
          qrPayload: "alipays://platformapi/startapp?appId=20000067&order=demo_pack",
          tenantId: "tenant_demo",
          operator: "小满电商",
        },
      ],
    };
  }

  function scriptFor(product, pointTexts, styleId, index) {
    const hooks = {
      pain: [
        `你是不是也遇到过${pointTexts[0] || "这个问题"}?`,
        `${product.shortName}真正打动我的,是它解决了一个小痛点`,
        `别再踩坑了,${product.shortName}要这样选`,
      ],
      seed: [
        `最近我一直在用这款${product.shortName}`,
        `给你们看一个我回购的${product.shortName}`,
        `如果你也需要${product.scene},可以看看这个`,
      ],
      direct: [
        `${product.shortName},核心就看这三点`,
        `预算有限也想买对,直接看这款`,
        `今天这款${product.shortName}信息很简单`,
      ],
      compare: [
        `同价位里我会先看${product.shortName}`,
        `把普通款和这款放一起,差别很明显`,
        `为什么它更适合${product.audience.split("/")[0].trim()}?`,
      ],
      story: [
        `出门前 5 分钟,我才发现少了它`,
        `朋友问我最近怎么省心了,答案就是这个`,
        `一个真实场景,你就懂它为什么好用了`,
      ],
      ugc: [
        `开箱第一眼,这个细节挺加分`,
        `不做滤镜,直接看它实际表现`,
        `普通人用下来,我最在意这几点`,
      ],
    };
    const pool = hooks[styleId] || hooks.pain;
    const body = pointTexts.slice(0, 3).join("、") || "卖点清晰、价格合适、体验稳定";
    return `${pool[index % pool.length]}。${body},适合${product.audience}。`;
  }

  function metricFor(seed, status, rank = 0) {
    if (status === "draft" || status === "review") return null;
    const tired = status === "tired";
    const baseCtr = tired ? 0.55 + (seed % 25) / 100 : 1.4 + ((seed + rank) % 190) / 100;
    const cvr = tired ? 0.8 + (seed % 18) / 100 : 2.1 + ((seed >> 3) % 210) / 100;
    const cost = 800 + ((seed >> 4) % 7200);
    const roi = tired ? 1.1 + ((seed >> 5) % 80) / 100 : 2.2 + ((seed >> 5) % 260) / 100;
    const gmv = Math.round(cost * roi);
    return {
      impressions: Math.round((3 + ((seed >> 2) % 210)) * 10000),
      clicks: Math.round((3 + ((seed >> 2) % 210)) * 10000 * baseCtr / 100),
      ctr: Number(baseCtr.toFixed(2)),
      cvr: Number(cvr.toFixed(2)),
      cost,
      gmv,
      roi: Number(roi.toFixed(2)),
    };
  }

  function buildAsset({ product, styleId, script, duration, aspect, modelId, jobId, index, status = "draft", createdAt }) {
    const style = styleById(styleId);
    const seed = hash(`${product.id}:${styleId}:${script}:${index}`);
    const compliance = complianceForText(script);
    return {
      id: makeId("asset"),
      jobId,
      productId: product.id,
      productTitle: product.title,
      productName: product.shortName,
      styleId,
      style: style.name,
      color: style.color,
      script,
      duration,
      aspect,
      modelId,
      model: modelById(modelId).name,
      version: `v${1 + (index % 3)}.${index + 1}`,
      createdAt: createdAt || iso(),
      status,
      inLibrary: true,
      score: 62 + (seed % 36),
      compliance: compliance.level,
      complianceMsg: compliance.message,
      metrics: metricFor(seed, status, index),
    };
  }

  function createSeedAssets() {
    const statuses = ["live", "live", "draft", "live", "tired", "live", "review", "live", "live", "tired", "draft", "live"];
    const productKeys = ["sunscreen", "earbuds", "pan", "feeder"];
    const styles = ["pain", "seed", "direct", "compare", "story", "ugc"];
    return Array.from({ length: 24 }, (_, i) => {
      const product = clone(PRODUCT_CATALOG.find((p) => p.key === productKeys[i % productKeys.length]));
      product.id = `seed_product_${product.key}`;
      product.shortName = product.shortName;
      product.title = product.title;
      const styleId = styles[i % styles.length];
      const pointTexts = product.sellingPoints.slice(0, 3).map((p) => p.text);
      return buildAsset({
        product,
        styleId,
        script: scriptFor(product, pointTexts, styleId, i),
        duration: [8, 15, 30][i % 3],
        aspect: "9:16",
        modelId: i % 5 === 0 ? "lite" : "pro",
        jobId: null,
        index: i,
        status: statuses[i % statuses.length],
        createdAt: iso(-1 * (i + 1)),
      });
    });
  }

  function createInitialState() {
    const assets = createSeedAssets();
    const products = createSeedProducts();
    const templates = createSeedTemplates();
    const saas = createSeedSaasData();
    return {
      version: STATE_VERSION,
      auth: saas.auth,
      tenants: saas.tenants,
      users: saas.users,
      paymentOrders: saas.paymentOrders,
      account: {
        id: "acct_xiaoman",
        name: "小满电商",
        company: "小满电商工作室",
        email: "ops@xiaoman.example",
        phone: "138****2678",
        role: "管理员",
        plan: "专业版",
        planId: "pro",
        shops: 3,
        creditsTotal: 50000,
        creditsBalance: 12840,
        billingDay: 15,
        seatsUsed: 3,
        seatsTotal: 5,
        autoRenew: true,
        mfaEnabled: true,
        notifications: {
          jobDone: true,
          lowCredits: true,
          dataAnomaly: true,
          weeklyReport: false,
        },
      },
      platforms: PLATFORM_DEFS.map((item) => ({ ...item, connectedAt: item.connected ? iso(-8) : null, lastSyncAt: item.connected ? iso(-0.007) : null })),
      shops: [
        { id: "shop_1", name: "夏沐旗舰店", platform: "天猫", status: "active", products: 126, connectedAt: iso(-40), lastSyncAt: iso(-0.02) },
        { id: "shop_2", name: "声浪数码旗舰店", platform: "京东", status: "active", products: 88, connectedAt: iso(-28), lastSyncAt: iso(-0.04) },
        { id: "shop_3", name: "小尾巴宠物", platform: "抖店", status: "warning", products: 42, connectedAt: iso(-13), lastSyncAt: iso(-1.2) },
      ],
      billingRecords: [
        { id: "bill_1", type: "recharge", title: "增长包 20,000 Credits", amount: 20000, price: 329, createdAt: iso(-3), operator: "小满电商" },
        { id: "bill_2", type: "consume", title: "夏季防晒喷雾批量生成", amount: -2880, price: 0, createdAt: iso(-2), operator: "系统" },
        { id: "bill_3", type: "consume", title: "蓝牙耳机素材高清生成", amount: -4800, price: 0, createdAt: iso(-1), operator: "系统" },
      ],
      securityEvents: [
        { id: "sec_1", title: "管理员登录", ip: "上海 · 117.144.*.*", createdAt: iso(-0.1), level: "ok" },
        { id: "sec_2", title: "导出素材数据", ip: "上海 · 117.144.*.*", createdAt: iso(-1.6), level: "ok" },
        { id: "sec_3", title: "抖店授权即将过期", ip: "系统提醒", createdAt: iso(-2.2), level: "warning" },
      ],
      products,
      templates,
      jobs: [
        {
          id: "job_seed_1",
          productName: "夏季防晒喷雾",
          title: "夏季防晒喷雾 · 痛点款 v3",
          status: "running",
          total: 24,
          completed: 16,
          progress: 68,
          createdAt: iso(-0.01),
          updatedAt: iso(-0.004),
          thumbnail: "linear-gradient(135deg,#fbbf24,#f97316)",
          synthetic: true,
        },
        {
          id: "job_seed_2",
          productName: "蓝牙耳机 SoundPro",
          title: "蓝牙耳机 SoundPro · 种草混剪",
          status: "done",
          total: 20,
          completed: 20,
          progress: 100,
          createdAt: iso(-0.3),
          updatedAt: iso(-0.2),
          thumbnail: "linear-gradient(135deg,#60a5fa,#8b5cf6)",
          synthetic: true,
        },
        {
          id: "job_seed_3",
          productName: "陶瓷不粘锅",
          title: "陶瓷不粘锅 · 直给款",
          status: "done",
          total: 12,
          completed: 12,
          progress: 100,
          createdAt: iso(-1),
          updatedAt: iso(-0.9),
          thumbnail: "linear-gradient(135deg,#f87171,#ec4899)",
          synthetic: true,
        },
      ],
      assets,
      campaigns: [],
      lastSyncAt: iso(-0.007),
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createInitialState();
      const parsed = JSON.parse(raw);
      return normalizeState(parsed);
    } catch (err) {
      return createInitialState();
    }
  }

  function normalizeState(parsed) {
    const base = createInitialState();
    if (!parsed || typeof parsed !== "object") return base;
    const account = {
      ...base.account,
      ...(parsed.account || {}),
      notifications: {
        ...base.account.notifications,
        ...((parsed.account && parsed.account.notifications) || {}),
      },
    };
    const auth = {
      ...base.auth,
      ...(parsed.auth || {}),
      verificationCodes: Array.isArray(parsed.auth?.verificationCodes) ? parsed.auth.verificationCodes : [],
    };
    return {
      ...base,
      ...parsed,
      version: STATE_VERSION,
      account,
      auth,
      tenants: Array.isArray(parsed.tenants) && parsed.tenants.length ? parsed.tenants : base.tenants,
      users: Array.isArray(parsed.users) && parsed.users.length ? parsed.users : base.users,
      paymentOrders: Array.isArray(parsed.paymentOrders) ? parsed.paymentOrders : base.paymentOrders,
      platforms: Array.isArray(parsed.platforms) ? parsed.platforms : base.platforms,
      shops: Array.isArray(parsed.shops) ? parsed.shops : base.shops,
      billingRecords: Array.isArray(parsed.billingRecords) ? parsed.billingRecords : base.billingRecords,
      securityEvents: Array.isArray(parsed.securityEvents) ? parsed.securityEvents : base.securityEvents,
      products: Array.isArray(parsed.products) && parsed.products.length ? parsed.products.map((product, index) => enrichProduct(product, index)) : base.products,
      templates: Array.isArray(parsed.templates) && parsed.templates.length ? parsed.templates : base.templates,
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : base.jobs,
      assets: Array.isArray(parsed.assets) ? parsed.assets : base.assets,
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : base.campaigns,
      lastSyncAt: parsed.lastSyncAt || base.lastSyncAt,
    };
  }

  let state = loadState();

  function persist() {
    try {
      if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      // localStorage may be unavailable in some embedded previews. The in-memory
      // state still keeps the app usable for the current session.
    }
  }

  function notify() {
    const snapshot = clone(state);
    subscribers.forEach((listener) => {
      try { listener(snapshot); } catch (err) { /* subscriber errors stay isolated */ }
    });
  }

  function save(mutator, shouldNotify = true) {
    mutator(state);
    persist();
    if (shouldNotify) notify();
  }

  function ensureProduct(product) {
    const nextProduct = enrichProduct(product, state.products.length, { source: product.source || "parsed", updatedAt: iso() });
    const index = state.products.findIndex((p) => p.id === product.id);
    if (index >= 0) state.products[index] = { ...state.products[index], ...nextProduct };
    else state.products.unshift(nextProduct);
  }

  function calculateCost({ styles, perStyle, modelId, duration }) {
    const model = modelById(modelId);
    const count = Math.max(0, (styles || []).length * Number(perStyle || 0));
    return Math.round(count * model.credit * (Number(duration || 15) / 15));
  }

  function materializeJob(job) {
    if (!job || job.synthetic || !Array.isArray(job.items)) return job;
    if (job.status === "cancelled") return job;
    if (job.status === "paused") return job;

    const elapsed = Math.max(0, now() - job.startedAt - (job.pausedMs || 0));
    const activeMs = job.estimatedMs || 16000;
    let completed = 0;
    job.items = job.items.map((item, index) => {
      const startDelay = index * 420;
      const itemDuration = activeMs * (0.55 + (index % 4) * 0.08);
      const raw = ((elapsed - startDelay) / itemDuration) * 100;
      const progress = clamp(raw, item.progress || 0, 100);
      let stage = "queued";
      if (progress >= 100) stage = "done";
      else if (progress > 78) stage = "encoding";
      else if (progress > 32) stage = "rendering";
      else if (progress > 0) stage = "scripting";
      if (stage === "done") completed += 1;
      return { ...item, progress, stage };
    });

    job.completed = completed;
    job.progress = Math.round(job.items.reduce((sum, item) => sum + item.progress, 0) / job.items.length);
    job.updatedAt = iso();
    if (completed === job.items.length) {
      job.status = "done";
      job.progress = 100;
      job.completedAt = job.completedAt || iso();
      ensureJobAssets(job);
    }
    return job;
  }

  function materializeAllJobs() {
    let changed = false;
    state.jobs.forEach((job) => {
      const before = JSON.stringify({ status: job.status, progress: job.progress, completed: job.completed });
      materializeJob(job);
      const after = JSON.stringify({ status: job.status, progress: job.progress, completed: job.completed });
      if (before !== after) changed = true;
    });
    if (changed) persist();
  }

  function ensureJobAssets(job) {
    if (!job || !Array.isArray(job.items)) return;
    job.items.forEach((item, index) => {
      if (state.assets.some((asset) => asset.id === item.assetId)) return;
      const asset = buildAsset({
        product: job.product,
        styleId: item.styleId,
        script: item.script,
        duration: job.config.duration,
        aspect: job.config.aspect,
        modelId: job.config.modelId,
        jobId: job.id,
        index,
        status: "draft",
        createdAt: job.completedAt || iso(),
      });
      asset.id = item.assetId;
      state.assets.unshift(asset);
    });
  }

  function getGeneratedAssets(job) {
    ensureJobAssets(job);
    return job.items.map((item) => state.assets.find((asset) => asset.id === item.assetId)).filter(Boolean);
  }

  function statusLabel(status) {
    return {
      running: "生成中",
      done: "已完成",
      paused: "已暂停",
      cancelled: "已取消",
      live: "投放中",
      draft: "草稿",
      tired: "已疲劳",
      review: "审核中",
    }[status] || status;
  }

  function homeStats() {
    materializeAllJobs();
    const assets = state.assets;
    const live = assets.filter((a) => a.status === "live");
    const cost = live.reduce((sum, a) => sum + (a.metrics ? a.metrics.cost : 0), 0);
    const gmv = live.reduce((sum, a) => sum + (a.metrics ? a.metrics.gmv : 0), 0);
    const roi = cost ? gmv / cost : 0;
    return [
      { label: "生成素材", value: String(assets.length), unit: "条", delta: "+32", deltaDir: "up", hint: "本周", accent: "var(--brand)" },
      { label: "投放消耗", value: `¥${cost.toLocaleString()}`, delta: "+12.4%", deltaDir: "up", hint: "vs 上周", accent: "var(--warning)" },
      { label: "GMV", value: `¥${gmv.toLocaleString()}`, delta: "+28.1%", deltaDir: "up", hint: "vs 上周", accent: "var(--success)" },
      { label: "平均 ROI", value: roi.toFixed(2), delta: "-0.12", deltaDir: "down", hint: "vs 上周", accent: "var(--info)" },
    ];
  }

  function recentProjects() {
    materializeAllJobs();
    return state.jobs.slice(0, 6).map((job) => ({
      id: job.id,
      name: job.title || `${job.productName} · 批量生成`,
      time: formatRelative(job.updatedAt || job.createdAt),
      status: statusLabel(job.status),
      progress: job.progress,
      count: job.status === "running" || job.status === "paused" ? `${job.completed || 0}/${job.total}` : `${job.total} 条`,
      thumb: job.thumbnail || (job.product && job.product.color) || "linear-gradient(135deg,#60a5fa,#8b5cf6)",
    }));
  }

  function optimizeList() {
    return state.assets
      .filter((asset) => asset.metrics)
      .sort((a, b) => {
        const aScore = a.status === "tired" ? 100 : a.metrics.roi > 3.5 ? 50 : 0;
        const bScore = b.status === "tired" ? 100 : b.metrics.roi > 3.5 ? 50 : 0;
        return bScore - aScore || a.metrics.roi - b.metrics.roi;
      })
      .slice(0, 3)
      .map((asset) => ({
        id: asset.id,
        name: `${asset.productName} · ${asset.style} ${asset.version}`,
        reason: asset.status === "tired"
          ? `CTR ${asset.metrics.ctr}% · 低于均值 60%`
          : `ROI ${asset.metrics.roi} · 建议加大投放`,
        action: asset.status === "tired" ? "克隆爆款重做" : "复制成新批次",
        severity: asset.status === "tired" ? "danger" : "success",
      }));
  }

  function trendRows() {
    const names = ["防晒喷雾 · 痛点款", "蓝牙耳机 · 种草款", "陶瓷锅 · 直给款"];
    const colors = ["var(--brand)", "var(--success)", "var(--warning)"];
    return names.map((name, index) => {
      const seed = hash(name);
      const data = Array.from({ length: 7 }, (_, i) => Number((2 + index * 0.4 + i * 0.22 + ((seed >> i) % 14) / 20).toFixed(2)));
      const first = data[0];
      const last = data[data.length - 1];
      return {
        name,
        roi: last,
        dir: last >= first ? "up" : "down",
        delta: `${last >= first ? "+" : ""}${(last - first).toFixed(1)}`,
        color: colors[index],
        data,
      };
    });
  }

  function stylePerformance() {
    return STYLE_DEFS.slice(0, 4).map((style, index) => {
      const count = state.assets.filter((asset) => asset.styleId === style.id).length;
      return {
        name: style.name,
        ctr: style.ctr,
        cnt: count || [86, 64, 52, 28][index],
        pct: [95, 71, 49, 31][index],
        color: ["var(--brand)", "var(--success)", "var(--info)", "var(--warning)"][index],
      };
    });
  }

  function overviewData(period = 7) {
    materializeAllJobs();
    const live = state.assets.filter((asset) => asset.metrics);
    const cost = live.reduce((sum, asset) => sum + asset.metrics.cost, 0);
    const gmv = live.reduce((sum, asset) => sum + asset.metrics.gmv, 0);
    const clicks = live.reduce((sum, asset) => sum + asset.metrics.clicks, 0);
    const impressions = live.reduce((sum, asset) => sum + asset.metrics.impressions, 0);
    const roi = cost ? gmv / cost : 0;
    const days = period === 1 ? 1 : period === 30 ? 30 : 7;
    const trend = Array.from({ length: days === 30 ? 10 : days }, (_, i) => ({
      label: days === 30 ? `5-${i * 3 + 1}` : `5-${i + 1}`,
      value: Math.round((cost / Math.max(1, days)) * (0.72 + ((i * 19) % 40) / 100)),
      highlight: i === Math.min(4, days - 1),
    }));
    return {
      stats: [
        { label: "投放消耗", value: `¥${cost.toLocaleString()}`, delta: "+12.4%", dir: "up", sub: "vs 上周" },
        { label: "GMV", value: `¥${gmv.toLocaleString()}`, delta: "+28.1%", dir: "up", sub: "vs 上周" },
        { label: "ROI", value: roi.toFixed(2), delta: "-0.12", dir: "down", sub: "vs 上周" },
        { label: "转化用户", value: Math.round(clicks * 0.076).toLocaleString(), delta: "+18.2%", dir: "up", sub: "vs 上周" },
        { label: "千次曝光成本", value: `¥${impressions ? (cost / impressions * 1000).toFixed(1) : "0.0"}`, delta: "-2.1%", dir: "up", sub: "vs 上周" },
      ],
      trend,
      funnel: [
        { label: "曝光", value: impressions, color: "var(--brand)" },
        { label: "点击", value: clicks, color: "#7aa3ff" },
        { label: "进店", value: Math.round(clicks * 0.58), color: "#9bb8ff" },
        { label: "加购", value: Math.round(clicks * 0.16), color: "#bccdff" },
        { label: "下单", value: Math.round(clicks * 0.076), color: "var(--success)" },
      ],
      styles: STYLE_DEFS.map((style) => {
        const group = live.filter((asset) => asset.styleId === style.id);
        const groupCost = group.reduce((sum, asset) => sum + asset.metrics.cost, 0);
        const groupGmv = group.reduce((sum, asset) => sum + asset.metrics.gmv, 0);
        const avgCtr = group.length ? group.reduce((sum, asset) => sum + asset.metrics.ctr, 0) / group.length : style.ctr;
        const groupRoi = groupCost ? groupGmv / groupCost : 2.1;
        return {
          name: style.name,
          count: group.length || 8,
          ctr: Number(avgCtr.toFixed(2)),
          roi: Number(groupRoi.toFixed(2)),
          top: clamp(Math.round((groupRoi / 5) * 100), 18, 96),
        };
      }).sort((a, b) => b.roi - a.roi),
    };
  }

  function getCurrentPlan() {
    return PLAN_DEFS.find((plan) => plan.id === state.account.planId) || PLAN_DEFS[1];
  }

  function usageStats() {
    materializeAllJobs();
    const monthJobs = state.jobs.filter((job) => new Date(job.createdAt).getMonth() === new Date().getMonth());
    const consumed = state.billingRecords
      .filter((record) => record.type === "consume")
      .reduce((sum, record) => sum + Math.abs(record.amount), 0);
    const liveAssets = state.assets.filter((asset) => asset.status === "live").length;
    return {
      generatedThisMonth: monthJobs.reduce((sum, job) => sum + (job.total || 0), 0),
      consumedCredits: consumed,
      liveAssets,
      connectedPlatforms: state.platforms.filter((platform) => platform.connected).length,
      activeShops: state.shops.filter((shop) => shop.status === "active").length,
    };
  }

  function accountCenterData() {
    return {
      account: state.account,
      currentPlan: getCurrentPlan(),
      plans: PLAN_DEFS,
      creditPackages: CREDIT_PACKAGES,
      paymentMethods: PAYMENT_METHODS,
      paymentOrders: (state.paymentOrders || []).slice(0, 8).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      platforms: state.platforms,
      shops: state.shops,
      billingRecords: state.billingRecords.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      securityEvents: state.securityEvents.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      usage: usageStats(),
    };
  }

  function normalizeIdentifier(value) {
    return String(value || "").trim().toLowerCase();
  }

  function publicUser(user) {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  }

  function currentUser() {
    const userId = state.auth?.session?.userId;
    return (state.users || []).find((user) => user.id === userId) || null;
  }

  function isPlatformAdmin(user) {
    return !!user && user.role === "platform_admin";
  }

  function roleName(role) {
    return {
      owner: "企业管理员",
      operator: "投放运营",
      finance: "财务",
      platform_admin: "平台管理员",
    }[role] || "成员";
  }

  function sessionPayload() {
    const user = currentUser();
    return {
      authenticated: !!user,
      currentUser: publicUser(user),
      isAdmin: isPlatformAdmin(user),
      system: state.auth?.lastSystem || "user",
      account: state.account,
    };
  }

  function findUserByIdentifier(identifier) {
    const target = normalizeIdentifier(identifier);
    return (state.users || []).find((user) => normalizeIdentifier(user.email) === target || normalizeIdentifier(user.phone) === target);
  }

  function buildSession(user, system) {
    return {
      token: makeId("sess"),
      userId: user.id,
      tenantId: user.tenantId,
      createdAt: iso(),
      expiresAt: new Date(now() + 7 * 86400000).toISOString(),
      system: system || (isPlatformAdmin(user) ? "admin" : "user"),
    };
  }

  function applyUserToAccount(draft, user) {
    if (!user || isPlatformAdmin(user)) return;
    const tenant = draft.tenants.find((item) => item.id === user.tenantId);
    const plan = PLAN_DEFS.find((item) => item.id === tenant?.planId) || PLAN_DEFS[0];
    draft.account.name = user.name;
    draft.account.company = user.company || tenant?.company || draft.account.company;
    draft.account.email = user.email;
    draft.account.phone = user.phone;
    draft.account.role = roleName(user.role);
    draft.account.plan = plan.name;
    draft.account.planId = plan.id;
    draft.account.seatsUsed = tenant?.seatsUsed || 1;
    draft.account.seatsTotal = tenant?.seatsTotal || plan.seats;
    draft.account.shops = tenant?.shops ?? draft.shops.length;
  }

  function assertVerificationCode(target, code, scene) {
    if (String(code || "").trim() === "000000") return;
    const normalized = normalizeIdentifier(target);
    const record = (state.auth?.verificationCodes || []).find((item) =>
      item.target === normalized && item.scene === scene && item.code === String(code || "").trim() && item.expiresAt > iso()
    );
    if (!record) throw new Error("验证码无效或已过期");
  }

  function paymentMethodById(methodId) {
    return PAYMENT_METHODS.find((item) => item.id === methodId) || PAYMENT_METHODS[0];
  }

  function orderNo() {
    const suffix = String(100000 + (hash(`${now()}:${idCounter}`) % 900000));
    return `AS${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${suffix}`;
  }

  function buildQrPayload(order, method) {
    const payload = encodeURIComponent(`${order.orderNo}:${order.amount}:${order.subject}`);
    if (method.id === "alipay") return `${method.scheme}?appId=20000067&order=${payload}`;
    return `${method.scheme}?pr=${payload}`;
  }

  function applyPaidOrder(draft, order) {
    if (order.type === "credits") {
      draft.account.creditsBalance += order.credits || 0;
      draft.account.creditsTotal = Math.max(draft.account.creditsTotal, draft.account.creditsBalance);
      draft.billingRecords.unshift({
        id: makeId("bill"),
        type: "recharge",
        title: order.subject,
        amount: order.credits || 0,
        price: order.amount,
        method: order.methodName,
        orderNo: order.orderNo,
        createdAt: iso(),
        operator: draft.account.name,
      });
    }
    if (order.type === "plan") {
      const plan = PLAN_DEFS.find((item) => item.id === order.productId);
      if (!plan) return;
      const current = PLAN_DEFS.find((item) => item.id === draft.account.planId) || PLAN_DEFS[0];
      draft.account.planId = plan.id;
      draft.account.plan = plan.name;
      draft.account.creditsTotal = Math.max(plan.creditsTotal, draft.account.creditsBalance);
      draft.account.seatsTotal = plan.seats;
      draft.account.shops = draft.shops.length;
      const tenant = draft.tenants.find((item) => item.id === order.tenantId);
      if (tenant) {
        tenant.planId = plan.id;
        tenant.seatsTotal = plan.seats;
        tenant.status = "active";
        tenant.lastActiveAt = iso();
      }
      draft.billingRecords.unshift({
        id: makeId("bill"),
        type: "plan",
        title: `${current.name} → ${plan.name}`,
        amount: plan.creditsTotal - current.creditsTotal,
        price: order.amount,
        method: order.methodName,
        orderNo: order.orderNo,
        createdAt: iso(),
        operator: draft.account.name,
      });
    }
  }

  function adminDashboardData() {
    const paidOrders = (state.paymentOrders || []).filter((order) => order.status === "paid");
    const pendingOrders = (state.paymentOrders || []).filter((order) => order.status === "pending");
    const revenue = paidOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
    return {
      stats: [
        { label: "租户数", value: state.tenants.length, sub: `${state.tenants.filter((item) => item.status === "active").length} 个活跃` },
        { label: "注册用户", value: state.users.filter((user) => user.role !== "platform_admin").length, sub: "含企业管理员与运营成员" },
        { label: "支付收入", value: `¥${revenue.toLocaleString()}`, sub: "演示订单累计" },
        { label: "待支付订单", value: pendingOrders.length, sub: "微信 / 支付宝" },
      ],
      tenants: state.tenants.map((tenant) => ({
        ...tenant,
        planName: (PLAN_DEFS.find((plan) => plan.id === tenant.planId) || PLAN_DEFS[0]).name,
        owner: publicUser(state.users.find((user) => user.id === tenant.ownerUserId)),
      })),
      users: state.users.map(publicUser),
      paymentOrders: (state.paymentOrders || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      plans: PLAN_DEFS,
      paymentMethods: PAYMENT_METHODS,
      securityEvents: state.securityEvents.slice(0, 12),
    };
  }

  function productSummary() {
    const products = state.products || [];
    return {
      total: products.length,
      active: products.filter((product) => product.status === "active").length,
      favorite: products.filter((product) => product.favorite).length,
      generated: products.reduce((sum, product) => sum + (product.generatedCount || 0), 0),
    };
  }

  function listProductLibrary(filters = {}) {
    let products = (state.products || []).map((product, index) => enrichProduct(product, index));
    if (filters.status && filters.status !== "all") products = products.filter((product) => product.status === filters.status);
    if (filters.category && filters.category !== "all") products = products.filter((product) => product.category === filters.category);
    if (filters.favorite) products = products.filter((product) => product.favorite);
    if (filters.query) {
      const q = String(filters.query).trim().toLowerCase();
      products = products.filter((product) => [product.title, product.shortName, product.shop, product.category].join(" ").toLowerCase().includes(q));
    }
    return products.sort((a, b) => new Date(b.updatedAt || b.parsedAt) - new Date(a.updatedAt || a.parsedAt));
  }

  function templateSummary() {
    const templates = state.templates || [];
    return {
      total: templates.length,
      active: templates.filter((template) => template.status === "active").length,
      system: templates.filter((template) => template.source === "system").length,
      avgRoi: templates.length ? (templates.reduce((sum, template) => sum + (template.roi || 0), 0) / templates.length).toFixed(2) : "0.00",
    };
  }

  function listTemplateLibrary(filters = {}) {
    let templates = state.templates || [];
    if (filters.status && filters.status !== "all") templates = templates.filter((template) => template.status === filters.status);
    if (filters.category && filters.category !== "all") templates = templates.filter((template) => template.category === filters.category);
    if (filters.query) {
      const q = String(filters.query).trim().toLowerCase();
      templates = templates.filter((template) => [template.name, template.description, template.category, ...(template.tags || [])].join(" ").toLowerCase().includes(q));
    }
    return templates.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  function hydrateTemplate(input = {}) {
    const styleIds = (input.styleIds || input.styles || ["pain"]).filter(Boolean);
    const modelId = input.modelId || "pro";
    const model = modelById(modelId);
    const category = input.category || "自定义模板";
    return {
      id: input.id || makeId("tpl"),
      name: String(input.name || "未命名模板").trim() || "未命名模板",
      category,
      description: String(input.description || "基于当前生成参数保存的投流模板").trim(),
      styleIds,
      perStyle: Number(input.perStyle || 4),
      modelId,
      modelName: model.name,
      duration: Number(input.duration || 15),
      aspect: input.aspect || "9:16",
      tags: input.tags || styleIds.map((id) => styleById(id).short),
      status: input.status || "active",
      source: input.source || "custom",
      roi: Number(input.roi || 3.2),
      ctr: Number(input.ctr || 1.8),
      used: Number(input.used || 0),
      createdAt: input.createdAt || iso(),
      updatedAt: iso(),
      lastUsedAt: input.lastUsedAt || null,
    };
  }

  const api = {
    subscribe(listener) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },

    resetDemoData() {
      state = createInitialState();
      persist();
      notify();
      return clone(state);
    },

    getConstants() {
      return clone({ styles: STYLE_DEFS, models: MODEL_DEFS, paymentMethods: PAYMENT_METHODS, plans: PLAN_DEFS, creditPackages: CREDIT_PACKAGES });
    },

    getSession() {
      return clone(sessionPayload());
    },

    loginWithDemo(system = "user") {
      const user = state.users.find((item) => system === "admin" ? item.role === "platform_admin" : item.id === "user_owner");
      if (!user) throw new Error("演示账号不存在");
      save((draft) => {
        const draftUser = draft.users.find((item) => item.id === user.id);
        draftUser.lastLoginAt = iso();
        draft.auth.session = buildSession(draftUser, system === "admin" ? "admin" : "user");
        draft.auth.lastSystem = draft.auth.session.system;
        applyUserToAccount(draft, draftUser);
      });
      return api.getSession();
    },

    requestAuthCode(target, scene = "login") {
      const normalized = normalizeIdentifier(target);
      if (!normalized) throw new Error("请输入手机号或邮箱");
      const code = String(100000 + (hash(`${normalized}:${scene}:${now()}`) % 900000));
      const expiresAt = new Date(now() + AUTH_CODE_TTL).toISOString();
      save((draft) => {
        draft.auth.verificationCodes = (draft.auth.verificationCodes || [])
          .filter((item) => item.expiresAt > iso() && !(item.target === normalized && item.scene === scene));
        draft.auth.verificationCodes.push({ target: normalized, scene, code, expiresAt, createdAt: iso() });
        draft.securityEvents.unshift({
          id: makeId("sec"),
          title: `发送${scene === "register" ? "注册" : scene === "reset" ? "重置密码" : "登录"}验证码`,
          ip: normalized,
          createdAt: iso(),
          level: "ok",
        });
      });
      return clone({ target: normalized, scene, code, expiresAt, channel: normalized.includes("@") ? "email" : "sms" });
    },

    registerAccount(input = {}) {
      const name = String(input.name || "").trim();
      const company = String(input.company || "").trim();
      const email = normalizeIdentifier(input.email);
      const phone = normalizeIdentifier(input.phone);
      const password = String(input.password || "");
      const target = phone || email;
      if (!input.agree) throw new Error("请先同意服务协议");
      if (!name || !company || !email || !phone) throw new Error("请完整填写企业、姓名、邮箱和手机号");
      if (password.length < 8) throw new Error("密码至少 8 位");
      if (findUserByIdentifier(email) || findUserByIdentifier(phone)) throw new Error("账号已存在，请直接登录");
      try {
        assertVerificationCode(target, input.code, "register");
      } catch (err) {
        assertVerificationCode(email, input.code, "register");
      }
      const starter = PLAN_DEFS[0];
      let createdUser = null;
      save((draft) => {
        const tenantId = makeId("tenant");
        const userId = makeId("user");
        draft.tenants.unshift({
          id: tenantId,
          company,
          status: "trial",
          planId: starter.id,
          ownerUserId: userId,
          seatsUsed: 1,
          seatsTotal: starter.seats,
          shops: 0,
          createdAt: iso(),
          lastActiveAt: iso(),
        });
        createdUser = {
          id: userId,
          tenantId,
          name,
          company,
          email,
          phone,
          password,
          role: "owner",
          status: "trial",
          createdAt: iso(),
          lastLoginAt: iso(),
        };
        draft.users.unshift(createdUser);
        draft.account = {
          ...draft.account,
          name,
          company,
          email,
          phone,
          role: roleName("owner"),
          plan: starter.name,
          planId: starter.id,
          shops: 0,
          creditsTotal: starter.creditsTotal,
          creditsBalance: starter.creditsTotal,
          seatsUsed: 1,
          seatsTotal: starter.seats,
        };
        draft.auth.verificationCodes = (draft.auth.verificationCodes || []).filter((item) => item.target !== target);
        draft.auth.session = buildSession(createdUser, "user");
        draft.auth.lastSystem = "user";
        draft.securityEvents.unshift({ id: makeId("sec"), title: "新租户注册并登录", ip: email, createdAt: iso(), level: "ok" });
      });
      return api.getSession();
    },

    loginWithPassword(input = {}) {
      const user = findUserByIdentifier(input.identifier);
      if (!user || user.password !== String(input.password || "")) throw new Error("账号或密码错误");
      if (user.status === "disabled") throw new Error("账号已被禁用，请联系管理员");
      save((draft) => {
        const draftUser = draft.users.find((item) => item.id === user.id);
        draftUser.lastLoginAt = iso();
        const system = isPlatformAdmin(draftUser) ? "admin" : "user";
        draft.auth.session = buildSession(draftUser, system);
        draft.auth.lastSystem = system;
        applyUserToAccount(draft, draftUser);
        draft.securityEvents.unshift({ id: makeId("sec"), title: "账号密码登录", ip: draftUser.email || draftUser.phone, createdAt: iso(), level: "ok" });
      });
      return api.getSession();
    },

    loginWithCode(input = {}) {
      const target = normalizeIdentifier(input.target);
      const user = findUserByIdentifier(target);
      if (!user) throw new Error("账号不存在，请先注册");
      assertVerificationCode(target, input.code, "login");
      save((draft) => {
        const draftUser = draft.users.find((item) => item.id === user.id);
        draftUser.lastLoginAt = iso();
        const system = isPlatformAdmin(draftUser) ? "admin" : "user";
        draft.auth.verificationCodes = (draft.auth.verificationCodes || []).filter((item) => item.target !== target);
        draft.auth.session = buildSession(draftUser, system);
        draft.auth.lastSystem = system;
        applyUserToAccount(draft, draftUser);
      });
      return api.getSession();
    },

    resetPassword(input = {}) {
      const target = normalizeIdentifier(input.target);
      const password = String(input.password || "");
      if (password.length < 8) throw new Error("新密码至少 8 位");
      const user = findUserByIdentifier(target);
      if (!user) throw new Error("账号不存在");
      assertVerificationCode(target, input.code, "reset");
      save((draft) => {
        const draftUser = draft.users.find((item) => item.id === user.id);
        draftUser.password = password;
        draft.auth.verificationCodes = (draft.auth.verificationCodes || []).filter((item) => item.target !== target);
        draft.securityEvents.unshift({ id: makeId("sec"), title: "重置登录密码", ip: target, createdAt: iso(), level: "warning" });
      });
      return clone({ ok: true });
    },

    logout() {
      save((draft) => {
        draft.auth.session = null;
        draft.auth.lastSystem = "user";
      });
      return api.getSession();
    },

    switchSystem(system) {
      const user = currentUser();
      if (!user) throw new Error("请先登录");
      if (system === "admin" && !isPlatformAdmin(user)) throw new Error("没有后台管理权限");
      save((draft) => {
        draft.auth.lastSystem = system === "admin" ? "admin" : "user";
        if (draft.auth.session) draft.auth.session.system = draft.auth.lastSystem;
      });
      return api.getSession();
    },

    getAdminDashboardData() {
      const user = currentUser();
      if (!isPlatformAdmin(user)) throw new Error("没有后台管理权限");
      return clone(adminDashboardData());
    },

    updateTenantStatus(tenantId, status) {
      const user = currentUser();
      if (!isPlatformAdmin(user)) throw new Error("没有后台管理权限");
      save((draft) => {
        const tenant = draft.tenants.find((item) => item.id === tenantId);
        if (!tenant) return;
        tenant.status = status;
        tenant.lastActiveAt = iso();
      });
      return api.getAdminDashboardData();
    },

    updateUserStatus(userId, status) {
      const user = currentUser();
      if (!isPlatformAdmin(user)) throw new Error("没有后台管理权限");
      save((draft) => {
        const target = draft.users.find((item) => item.id === userId);
        if (!target || target.role === "platform_admin") return;
        target.status = status;
      });
      return api.getAdminDashboardData();
    },

    createPaymentOrder(input = {}) {
      const method = paymentMethodById(input.method);
      const type = input.type === "credits" ? "credits" : "plan";
      const product = type === "credits"
        ? CREDIT_PACKAGES.find((item) => item.id === input.packageId)
        : PLAN_DEFS.find((item) => item.id === input.planId);
      if (!product) throw new Error(type === "credits" ? "充值包不存在" : "套餐不存在");
      const user = currentUser();
      const tenantId = user?.tenantId || "tenant_demo";
      const order = {
        id: makeId("pay"),
        orderNo: orderNo(),
        type,
        productId: product.id,
        subject: type === "credits" ? `${product.name} Credits` : `${product.name}月套餐`,
        amount: product.price,
        credits: type === "credits" ? product.credits : product.creditsTotal,
        method: method.id,
        methodName: method.name,
        status: "pending",
        createdAt: iso(),
        paidAt: null,
        expiresAt: new Date(now() + 30 * 60 * SECOND).toISOString(),
        tenantId,
        operator: state.account.name,
      };
      order.qrPayload = buildQrPayload(order, method);
      save((draft) => {
        draft.paymentOrders.unshift(order);
      });
      return clone({ order, accountCenter: api.getAccountCenterData() });
    },

    payPaymentOrder(orderId) {
      save((draft) => {
        const order = draft.paymentOrders.find((item) => item.id === orderId);
        if (!order) throw new Error("订单不存在");
        if (order.status !== "pending") return;
        order.status = "paid";
        order.paidAt = iso();
        applyPaidOrder(draft, order);
      });
      return api.getAccountCenterData();
    },

    cancelPaymentOrder(orderId) {
      save((draft) => {
        const order = draft.paymentOrders.find((item) => item.id === orderId);
        if (!order || order.status !== "pending") return;
        order.status = "cancelled";
        order.cancelledAt = iso();
      });
      return api.getAccountCenterData();
    },

    getProductLibraryData(filters = {}) {
      const products = listProductLibrary(filters);
      const categories = Array.from(new Set((state.products || []).map((product) => product.category))).filter(Boolean);
      return clone({ products, summary: productSummary(), categories });
    },

    async parseProductToLibrary(link) {
      const result = await api.parseProduct(link);
      return clone({ product: result.product, library: api.getProductLibraryData() });
    },

    toggleProductFavorite(productId) {
      save((draft) => {
        const product = draft.products.find((item) => item.id === productId);
        if (!product) return;
        product.favorite = !product.favorite;
        product.updatedAt = iso();
      });
      return api.getProductLibraryData();
    },

    updateProductStatus(productId, status) {
      save((draft) => {
        const product = draft.products.find((item) => item.id === productId);
        if (!product) return;
        product.status = status;
        product.updatedAt = iso();
      });
      return api.getProductLibraryData();
    },

    deleteProduct(productId) {
      save((draft) => {
        draft.products = draft.products.filter((product) => product.id !== productId);
      });
      return api.getProductLibraryData();
    },

    useProduct(productId) {
      let product = null;
      save((draft) => {
        product = draft.products.find((item) => item.id === productId) || null;
        if (product) {
          product.lastUsedAt = iso();
          product.updatedAt = iso();
        }
      });
      return clone(product);
    },

    getTemplateLibraryData(filters = {}) {
      const templates = listTemplateLibrary(filters);
      const categories = Array.from(new Set((state.templates || []).map((template) => template.category))).filter(Boolean);
      return clone({ templates, summary: templateSummary(), categories });
    },

    saveTemplate(input) {
      const template = hydrateTemplate(input);
      save((draft) => {
        const index = draft.templates.findIndex((item) => item.id === template.id);
        if (index >= 0) draft.templates[index] = { ...draft.templates[index], ...template, createdAt: draft.templates[index].createdAt };
        else draft.templates.unshift(template);
      });
      return api.getTemplateLibraryData();
    },

    duplicateTemplate(templateId) {
      let cloneTemplate = null;
      save((draft) => {
        const template = draft.templates.find((item) => item.id === templateId);
        if (!template) return;
        cloneTemplate = hydrateTemplate({
          ...template,
          id: makeId("tpl"),
          name: `${template.name} 副本`,
          source: "custom",
          used: 0,
          createdAt: iso(),
          lastUsedAt: null,
        });
        draft.templates.unshift(cloneTemplate);
      });
      return clone(cloneTemplate);
    },

    toggleTemplateStatus(templateId) {
      save((draft) => {
        const template = draft.templates.find((item) => item.id === templateId);
        if (!template) return;
        template.status = template.status === "active" ? "paused" : "active";
        template.updatedAt = iso();
      });
      return api.getTemplateLibraryData();
    },

    deleteTemplate(templateId) {
      save((draft) => {
        draft.templates = draft.templates.filter((template) => template.id !== templateId || template.source === "system");
      });
      return api.getTemplateLibraryData();
    },

    useTemplate(templateId) {
      let template = null;
      save((draft) => {
        template = draft.templates.find((item) => item.id === templateId) || null;
        if (template) {
          template.used = (template.used || 0) + 1;
          template.lastUsedAt = iso();
          template.updatedAt = iso();
        }
      });
      return clone(template);
    },

    getAccount() {
      return clone(state.account);
    },

    getAccountCenterData() {
      return clone(accountCenterData());
    },

    updateAccountProfile(patch) {
      save((draft) => {
        draft.account = {
          ...draft.account,
          name: String(patch.name || draft.account.name).trim() || draft.account.name,
          company: String(patch.company || draft.account.company).trim() || draft.account.company,
          email: String(patch.email || draft.account.email).trim() || draft.account.email,
          phone: String(patch.phone || draft.account.phone).trim() || draft.account.phone,
        };
        draft.securityEvents.unshift({
          id: makeId("sec"),
          title: "更新账户资料",
          ip: "本机操作",
          createdAt: iso(),
          level: "ok",
        });
      });
      return api.getAccountCenterData();
    },

    toggleNotification(key) {
      save((draft) => {
        draft.account.notifications[key] = !draft.account.notifications[key];
      });
      return api.getAccountCenterData();
    },

    setAutoRenew(value) {
      save((draft) => {
        draft.account.autoRenew = !!value;
      });
      return api.getAccountCenterData();
    },

    toggleMfa() {
      save((draft) => {
        draft.account.mfaEnabled = !draft.account.mfaEnabled;
        draft.securityEvents.unshift({
          id: makeId("sec"),
          title: draft.account.mfaEnabled ? "开启两步验证" : "关闭两步验证",
          ip: "本机操作",
          createdAt: iso(),
          level: draft.account.mfaEnabled ? "ok" : "warning",
        });
      });
      return api.getAccountCenterData();
    },

    rechargeCredits(packageId) {
      const pack = CREDIT_PACKAGES.find((item) => item.id === packageId);
      if (!pack) throw new Error("充值包不存在");
      save((draft) => {
        draft.account.creditsBalance += pack.credits;
        draft.account.creditsTotal = Math.max(draft.account.creditsTotal, draft.account.creditsBalance);
        draft.billingRecords.unshift({
          id: makeId("bill"),
          type: "recharge",
          title: pack.name,
          amount: pack.credits,
          price: pack.price,
          createdAt: iso(),
          operator: draft.account.name,
        });
      });
      return api.getAccountCenterData();
    },

    switchPlan(planId) {
      const plan = PLAN_DEFS.find((item) => item.id === planId);
      if (!plan) throw new Error("套餐不存在");
      save((draft) => {
        const current = PLAN_DEFS.find((item) => item.id === draft.account.planId) || PLAN_DEFS[1];
        draft.account.planId = plan.id;
        draft.account.plan = plan.name;
        draft.account.creditsTotal = Math.max(plan.creditsTotal, draft.account.creditsBalance);
        draft.account.seatsTotal = plan.seats;
        draft.account.shops = draft.shops.length;
        draft.billingRecords.unshift({
          id: makeId("bill"),
          type: "plan",
          title: `${current.name} → ${plan.name}`,
          amount: plan.creditsTotal - current.creditsTotal,
          price: plan.price,
          createdAt: iso(),
          operator: draft.account.name,
        });
      });
      return api.getAccountCenterData();
    },

    connectPlatform(platformId) {
      save((draft) => {
        const platform = draft.platforms.find((item) => item.id === platformId);
        if (!platform) return;
        platform.connected = true;
        platform.connectedAt = iso();
        platform.lastSyncAt = iso();
        platform.balance = platform.balance || (platform.id === "qianchuan" ? 5200 : 3600);
        draft.securityEvents.unshift({
          id: makeId("sec"),
          title: `授权连接 ${platform.name}`,
          ip: "OAuth 回调",
          createdAt: iso(),
          level: "ok",
        });
      });
      return api.getAccountCenterData();
    },

    disconnectPlatform(platformId) {
      save((draft) => {
        const platform = draft.platforms.find((item) => item.id === platformId);
        if (!platform) return;
        platform.connected = false;
        platform.connectedAt = null;
        draft.securityEvents.unshift({
          id: makeId("sec"),
          title: `解除授权 ${platform.name}`,
          ip: "本机操作",
          createdAt: iso(),
          level: "warning",
        });
      });
      return api.getAccountCenterData();
    },

    syncPlatform(platformId) {
      save((draft) => {
        const platform = draft.platforms.find((item) => item.id === platformId);
        if (!platform || !platform.connected) return;
        platform.lastSyncAt = iso();
        platform.balance += (hash(platform.id + Date.now()) % 800) - 240;
        if (platform.balance < 0) platform.balance = 0;
      });
      return api.getAccountCenterData();
    },

    addShop(input = {}) {
      const name = String(input.name || "").trim();
      if (!name) throw new Error("请输入店铺名称");
      save((draft) => {
        const platform = String(input.platform || "天猫").trim() || "天猫";
        draft.shops.unshift({
          id: makeId("shop"),
          name,
          platform,
          status: "active",
          products: 0,
          connectedAt: iso(),
          lastSyncAt: iso(),
        });
        draft.account.shops = draft.shops.length;
      });
      return api.getAccountCenterData();
    },

    removeShop(shopId) {
      save((draft) => {
        draft.shops = draft.shops.filter((shop) => shop.id !== shopId);
        draft.account.shops = draft.shops.length;
      });
      return api.getAccountCenterData();
    },

    getShellData() {
      materializeAllJobs();
      const summary = api.getLibrarySummary();
      return clone({
        account: state.account,
        session: sessionPayload(),
        summary,
        products: productSummary(),
        templates: templateSummary(),
        lastSyncAt: state.lastSyncAt,
      });
    },

    calculateCost,

    async parseProduct(link) {
      await sleep(650 + (hash(link) % 450));
      const product = enrichProduct(buildProduct(link), 0, { source: "parsed", favorite: false, generatedCount: 0, assetCount: 0, templateCount: 0, lastGeneratedAt: null });
      save((draft) => {
        const index = draft.products.findIndex((p) => p.id === product.id);
        if (index >= 0) draft.products[index] = { ...draft.products[index], ...product, favorite: draft.products[index].favorite };
        else draft.products.unshift(product);
      });
      return clone({
        product,
        logs: [
          { label: "连接电商平台", time: "0.4s", done: true },
          { label: `抓取商品图片(${product.imageCount}/${product.imageCount})`, time: "0.6s", done: true },
          { label: "提取商品规格与卖点", time: "0.3s", done: true },
          { label: "AI 分析竞品爆款关键词", time: "0.7s", done: true },
          { label: "构建商品知识库", time: "0.4s", done: true },
        ],
      });
    },

    createGenerationJob(config) {
      const product = clone(config.product);
      if (!product || !product.id) throw new Error("请先完成商品解析");
      const styles = (config.styles || []).filter(Boolean);
      if (!styles.length) throw new Error("至少选择一种脚本风格");
      const perStyle = Number(config.perStyle || 1);
      const duration = Number(config.duration || 15);
      const aspect = config.aspect || "9:16";
      const modelId = config.modelId || "pro";
      const selectedPoints = (config.sellingPoints || product.sellingPoints || []).map((p) => typeof p === "string" ? p : p.text).filter(Boolean);
      const totalCredits = calculateCost({ styles, perStyle, modelId, duration });
      if (state.account.creditsBalance < totalCredits) throw new Error(`Credits 余额不足,还差 ${(totalCredits - state.account.creditsBalance).toLocaleString()}`);

      const jobId = makeId("job");
      const items = [];
      styles.forEach((styleId) => {
        for (let i = 0; i < perStyle; i += 1) {
          const globalIndex = items.length;
          items.push({
            id: `${jobId}_item_${globalIndex + 1}`,
            assetId: makeId("asset"),
            styleId,
            style: styleById(styleId).name,
            script: scriptFor(product, selectedPoints, styleId, i),
            progress: 0,
            stage: "queued",
          });
        }
      });

      const model = modelById(modelId);
      const job = {
        id: jobId,
        product,
        productName: product.shortName,
        title: `${product.shortName} · 批量生成`,
        status: "running",
        total: items.length,
        completed: 0,
        progress: 0,
        items,
        config: { styles, perStyle, duration, aspect, modelId, modelName: model.name, totalCredits },
        startedAt: now(),
        estimatedMs: Math.max(7000, Math.round(items.length * model.seconds * 65 * (duration / 15))),
        pausedMs: 0,
        createdAt: iso(),
        updatedAt: iso(),
        thumbnail: product.color,
      };

      save((draft) => {
        state = draft;
        ensureProduct(product);
        draft.account.creditsBalance -= totalCredits;
        draft.billingRecords.unshift({
          id: makeId("bill"),
          type: "consume",
          title: `${product.shortName} · 批量生成 ${items.length} 条`,
          amount: -totalCredits,
          price: 0,
          createdAt: iso(),
          operator: draft.account.name,
        });
        const storedProduct = draft.products.find((item) => item.id === product.id);
        if (storedProduct) {
          storedProduct.generatedCount = (storedProduct.generatedCount || 0) + items.length;
          storedProduct.assetCount = (storedProduct.assetCount || 0) + items.length;
          storedProduct.lastGeneratedAt = iso();
          storedProduct.updatedAt = iso();
          storedProduct.status = "active";
        }
        draft.jobs.unshift(job);
      });
      return clone(materializeJob(job));
    },

    getJob(jobId) {
      const job = state.jobs.find((item) => item.id === jobId);
      if (!job) return null;
      materializeJob(job);
      persist();
      return clone(job);
    },

    pauseJob(jobId) {
      save((draft) => {
        const job = draft.jobs.find((item) => item.id === jobId);
        if (!job || job.status !== "running") return;
        materializeJob(job);
        job.status = "paused";
        job.pausedAt = now();
        job.updatedAt = iso();
      });
      return api.getJob(jobId);
    },

    resumeJob(jobId) {
      save((draft) => {
        const job = draft.jobs.find((item) => item.id === jobId);
        if (!job || job.status !== "paused") return;
        job.pausedMs = (job.pausedMs || 0) + (now() - (job.pausedAt || now()));
        job.status = "running";
        job.pausedAt = null;
        job.updatedAt = iso();
      });
      return api.getJob(jobId);
    },

    cancelJob(jobId) {
      save((draft) => {
        const job = draft.jobs.find((item) => item.id === jobId);
        if (!job || job.status === "done") return;
        job.status = "cancelled";
        job.updatedAt = iso();
      });
      return api.getJob(jobId);
    },

    getJobAssets(jobId) {
      const job = state.jobs.find((item) => item.id === jobId);
      if (!job) return [];
      materializeJob(job);
      if (job.status !== "done") return [];
      const assets = getGeneratedAssets(job);
      persist();
      return clone(assets);
    },

    addAssetsToLibrary(assetIds) {
      save((draft) => {
        draft.assets.forEach((asset) => {
          if (assetIds.includes(asset.id)) {
            asset.inLibrary = true;
            asset.status = asset.status === "review" ? "review" : "draft";
          }
        });
      });
      return api.listAssets();
    },

    launchAssets(assetIds, platform = "巨量引擎") {
      save((draft) => {
        draft.assets.forEach((asset, index) => {
          if (!assetIds.includes(asset.id)) return;
          asset.status = "live";
          asset.launchedAt = iso();
          asset.platform = platform;
          asset.metrics = asset.metrics || metricFor(hash(asset.id), "live", index);
        });
        draft.campaigns.unshift({
          id: makeId("campaign"),
          platform,
          assetIds,
          status: "review",
          createdAt: iso(),
        });
      });
      return api.listAssets();
    },

    cloneAssets(assetIds) {
      const clones = [];
      save((draft) => {
        assetIds.forEach((id) => {
          const asset = draft.assets.find((item) => item.id === id);
          if (!asset) return;
          const next = clone(asset);
          next.id = makeId("asset");
          next.status = "draft";
          next.version = `${asset.version}-copy`;
          next.createdAt = iso();
          next.metrics = null;
          next.score = clamp(asset.score + 3, 60, 99);
          clones.push(next);
          draft.assets.unshift(next);
        });
      });
      return clone(clones);
    },

    deleteAssets(assetIds) {
      save((draft) => {
        draft.assets = draft.assets.filter((asset) => !assetIds.includes(asset.id));
      });
      return api.listAssets();
    },

    listAssets(filters = {}) {
      materializeAllJobs();
      let assets = state.assets.filter((asset) => asset.inLibrary !== false);
      if (filters.style && filters.style !== "all") assets = assets.filter((asset) => asset.style === filters.style || asset.styleId === filters.style);
      if (filters.status && filters.status !== "all") assets = assets.filter((asset) => asset.status === filters.status);
      return clone(assets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    },

    getLibrarySummary() {
      materializeAllJobs();
      const assets = state.assets;
      return clone({
        total: assets.length,
        live: assets.filter((asset) => asset.status === "live").length,
        hot: assets.filter((asset) => asset.metrics && asset.metrics.roi > 3).length,
        needOptimize: assets.filter((asset) => asset.status === "tired" || (asset.metrics && asset.metrics.roi < 2)).length,
      });
    },

    getHomeData() {
      return clone({
        stats: homeStats(),
        recentProjects: recentProjects(),
        optimizeList: optimizeList(),
        trendRows: trendRows(),
        stylePerformance: stylePerformance(),
        reminders: [
          { type: "warning", icon: "Warning", title: "4 条素材投放疲劳", desc: "近 3 天 CTR 持续下滑 > 30%", action: "查看" },
          { type: "success", icon: "Trend", title: "2 条爆款建议加投", desc: "ROI > 4.0,还可放大 3 倍", action: "克隆" },
          { type: "brand", icon: "Star", title: "同行新爆款 6 条", desc: "美妆品类,7 日内点赞 10w+", action: "克隆" },
        ],
      });
    },

    getDataOverview(period = 7) {
      return clone(overviewData(period));
    },

    getCreativeRanking() {
      const assets = state.assets
        .filter((asset) => asset.metrics)
        .sort((a, b) => b.metrics.roi - a.metrics.roi)
        .slice(0, 12);
      return clone(assets.map((asset, index) => ({
        rank: index + 1,
        id: asset.id,
        product: `${asset.productName} ${asset.version}`,
        style: asset.style,
        color: asset.color,
        exposure: `${(asset.metrics.impressions / 10000).toFixed(1)}w`,
        ctr: asset.metrics.ctr,
        cvr: asset.metrics.cvr,
        cost: asset.metrics.cost,
        gmv: asset.metrics.gmv,
        roi: asset.metrics.roi,
        top: index < 3,
        bad: index >= Math.max(0, assets.length - 3),
      })));
    },

    getDiagnostics() {
      const tired = state.assets.find((asset) => asset.status === "tired") || state.assets[0];
      const top = state.assets.filter((asset) => asset.metrics).sort((a, b) => b.metrics.roi - a.metrics.roi)[0] || state.assets[0];
      return clone([
        {
          type: "danger",
          icon: "Warning",
          title: `「${tired.productName} · ${tired.style} ${tired.version}」投放疲劳`,
          desc: "近 3 天 CTR 明显下滑。建议暂停投放并克隆高 ROI 素材结构重新生成。",
          metrics: [["CTR", `${tired.metrics ? tired.metrics.ctr : 0.6}%`, "-67%", "down"], ["ROI", tired.metrics ? String(tired.metrics.roi) : "1.42", "-1.8", "down"], ["已消耗", `¥${tired.metrics ? tired.metrics.cost.toLocaleString() : "6,820"}`, null, null]],
          actions: ["暂停投放", "克隆并衍生新版本"],
        },
        {
          type: "success",
          icon: "Trend",
          title: `「${top.productName} · ${top.style} ${top.version}」表现优异,建议加大投放`,
          desc: "ROI 远超大盘均值,且仍有上升趋势。同类素材可复制脚本结构继续扩量。",
          metrics: [["ROI", top.metrics ? String(top.metrics.roi) : "4.62", "+0.4", "up"], ["CVR", `${top.metrics ? top.metrics.cvr : 4.2}%`, "+0.6%", "up"], ["建议预算", "¥18,000/天", null, null]],
          actions: ["一键放大投放", "克隆出 5 个相似版本"],
        },
        {
          type: "info",
          icon: "Sparkle",
          title: "同行新爆款发现:美妆品类「素人开箱款」7 日点赞 18w+",
          desc: "AI 发现竞品的弱滤镜开箱结构增速明显。建议参考脚本结构生成同类素材。",
          metrics: [["竞品 ROI 估算", "5.8+", null, null], ["已抓取参考", "12 条", null, null]],
          actions: ["查看竞品脚本", "一键生成同款"],
        },
        {
          type: "warning",
          icon: "Info",
          title: "「蓝牙耳机 · 种草款」整批 ROI 偏低",
          desc: "开头黄金 3 秒留存率低,建议调整钩子开头并重新 A/B 测试。",
          metrics: [["3 秒完播率", "18%", "-45%", "down"], ["整批 ROI", "2.10", null, null]],
          actions: ["AI 优化钩子", "整批重新生成"],
        },
      ]);
    },

    getCompareData() {
      const ranked = api.getCreativeRanking();
      const a = ranked[0];
      const b = ranked[1] || ranked[0];
      return clone([
        { side: "A", name: `${a.product} · ${a.style}`, color: a.color, winner: true, stats: [["曝光", a.exposure], ["CTR", `${a.ctr}%`], ["CVR", `${a.cvr}%`], ["ROI", String(a.roi)], ["消耗", `¥${a.cost.toLocaleString()}`], ["GMV", `¥${a.gmv.toLocaleString()}`]] },
        { side: "B", name: `${b.product} · ${b.style}`, color: b.color, winner: false, stats: [["曝光", b.exposure], ["CTR", `${b.ctr}%`], ["CVR", `${b.cvr}%`], ["ROI", String(b.roi)], ["消耗", `¥${b.cost.toLocaleString()}`], ["GMV", `¥${b.gmv.toLocaleString()}`]] },
      ]);
    },

    syncData() {
      save((draft) => {
        draft.lastSyncAt = iso();
      });
      return clone({ lastSyncAt: state.lastSyncAt });
    },

    exportAssets(assetIds) {
      const payload = state.assets.filter((asset) => assetIds.includes(asset.id));
      return JSON.stringify({ exportedAt: iso(), count: payload.length, assets: payload }, null, 2);
    },
  };

  window.AdShotBackend = api;
})();
