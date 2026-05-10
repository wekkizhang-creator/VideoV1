/* global React, I, AdShotBackend */
const { useState, useEffect } = React;

const NAV_PRIMARY = [
  { id: "home", label: "工作台", icon: "Home" },
  { id: "generate", label: "视频生成", icon: "Sparkle", badge: "Hot", badgeTone: "brand" },
  { id: "library", label: "我的素材", icon: "Folder", badge: "248" },
  { id: "data", label: "数据回流", icon: "Chart", badge: "12", badgeTone: "warning" },
];
const NAV_SECONDARY = [
  { id: "products", label: "商品库", icon: "Box" },
  { id: "templates", label: "爆款模板", icon: "Star" },
  { id: "account", label: "账户中心", icon: "User" },
];

function Sidebar({ activeRoute, setRoute, session }) {
  const [shellData, setShellData] = useState(() => AdShotBackend ? AdShotBackend.getShellData() : null);

  useEffect(() => {
    if (!AdShotBackend) return undefined;
    const refresh = () => setShellData(AdShotBackend.getShellData());
    refresh();
    return AdShotBackend.subscribe(refresh);
  }, []);

  const account = shellData?.account || { creditsBalance: 0, creditsTotal: 1, plan: "专业版", shops: 0, name: "小满电商" };
  const user = session?.currentUser || shellData?.session?.currentUser;
  const summary = shellData?.summary || { total: 248, needOptimize: 12 };
  const productSummary = shellData?.products || { total: 0 };
  const templateSummary = shellData?.templates || { active: 0 };
  const creditPct = Math.max(0, Math.min(100, (account.creditsBalance / account.creditsTotal) * 100));
  const navPrimary = NAV_PRIMARY.map((item) => {
    if (item.id === "library") return { ...item, badge: String(summary.total) };
    if (item.id === "data") return { ...item, badge: String(summary.needOptimize), badgeTone: summary.needOptimize > 0 ? "warning" : null };
    return item;
  });
  const navSecondary = NAV_SECONDARY.map((item) => {
    if (item.id === "products") return { ...item, badge: String(productSummary.total) };
    if (item.id === "templates") return { ...item, badge: String(templateSummary.active), badgeTone: "brand" };
    return item;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-logo">影</div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar-name">投流素材工厂</div>
          <div className="sidebar-name-sub">AdShot · v2.4</div>
        </div>
      </div>

      <div style={{ padding: "0 14px 12px" }}>
        <button
          className="btn"
          data-variant="primary"
          data-size="sm"
          style={{ width: "100%", justifyContent: "center", padding: "8px 12px" }}
          onClick={() => setRoute("generate")}
        >
          <I.Plus size={14} stroke="white" /> 新建批量生成
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">主流程</div>
        {navPrimary.map((item) => {
          const Ico = I[item.icon];
          const active = activeRoute === item.id;
          return (
            <div
              key={item.id}
              className="nav-item"
              data-active={active}
              onClick={() => setRoute(item.id)}
            >
              <Ico className="ico" size={15} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="nav-badge" data-tone={item.badgeTone}>{item.badge}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">资源</div>
        {navSecondary.map((item) => {
          const Ico = I[item.icon];
          const active = activeRoute === item.id;
          return (
            <div
              key={item.id}
              className="nav-item"
              data-active={active}
              onClick={() => setRoute(item.id)}
            >
              <Ico className="ico" size={15} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="nav-badge" data-tone={item.badgeTone}>{item.badge}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-foot">
        <div className="credits-card">
          <div className="credits-row">
            <span className="credits-label">Credits 余额</span>
            <span className="chip" data-tone="brand" style={{ fontSize: 10 }}>{account.plan}</span>
          </div>
          <div className="credits-value text-mono" style={{ marginBottom: 4 }}>
            {account.creditsBalance.toLocaleString()} <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}> / {account.creditsTotal.toLocaleString()}</span>
          </div>
          <div className="credits-bar">
            <div className="credits-bar-fill" style={{ width: `${creditPct}%` }} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 8 }}>
            预计可生成 ≈ {Math.floor(account.creditsBalance / 240)} 条 (15s / 高清模型)
          </div>
          <button className="credits-upgrade" onClick={() => setRoute("account")}>
            <I.Zap size={11} /> &nbsp;充值 / 升级套餐
          </button>
        </div>

        <div className="user-row">
          <div className="avatar">小</div>
          <div className="user-info">
            <div className="user-name">{user?.name || account.name}</div>
            <div className="user-plan">{account.shops} 个店铺已绑定 · {user?.role || "owner"}</div>
          </div>
          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setRoute("account")}>
            <I.Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ route, onSearch, session, onSwitchSystem, onLogout }) {
  const [syncedAt, setSyncedAt] = useState(() => AdShotBackend?.getShellData().lastSyncAt);
  const titles = {
    home: ["工作台", "今日数据 · 5 月 2 日 周六"],
    generate: ["视频生成", "5 步完成批量出片"],
    library: ["我的素材", "248 条素材 · 已分类 12 组"],
    data: ["数据回流", "巨量引擎 · 磁力金牛已授权"],
    products: ["商品库", null],
    templates: ["爆款模板", null],
    account: ["账户中心", "套餐 / Credits / 店铺授权"],
  };
  const [t, sub] = titles[route] || ["", ""];
  const sync = () => {
    if (!AdShotBackend) return;
    const result = AdShotBackend.syncData();
    setSyncedAt(result.lastSyncAt);
  };

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{t}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{sub}</div>}
      </div>
      <div className="topbar-actions">
        <div style={{ position: "relative" }}>
          <I.Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            className="input"
            placeholder="搜索素材、商品、模板..."
            style={{ width: 280, paddingLeft: 32, height: 32, padding: "0 12px 0 32px" }}
          />
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--text-4)", border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 3 }}>⌘K</span>
        </div>
        <button className="icon-btn">
          <I.Bell size={15} />
          <span className="dot" />
        </button>
        <button className="btn" data-size="sm" onClick={sync} title={syncedAt ? `上次同步: ${new Date(syncedAt).toLocaleString("zh-CN")}` : "同步数据"}>
          <I.Refresh size={12} /> 同步数据
        </button>
        {onSwitchSystem && (
          <button className="btn" data-size="sm" data-variant="primary" onClick={onSwitchSystem}>
            <I.Shield size={12} stroke="white" /> 业务后台
          </button>
        )}
        <button className="btn" data-size="sm" data-variant="ghost" onClick={onLogout} title={session?.currentUser?.email || "退出"}>
          退出
        </button>
      </div>
    </header>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
