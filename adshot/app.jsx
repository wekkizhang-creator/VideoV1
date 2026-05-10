/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, AuthPage, AdminConsole, HomePage, GeneratePage, LibraryPage, DataPage, ProductsPage, TemplatesPage, AccountPage, Sidebar, Topbar, AdShotBackend */
const { useState: uSA } = React;

function App() {
  const __qs = new URLSearchParams(location.search);
  const deployTarget = window.__ADSHOT_DEPLOY_TARGET || __qs.get("deploy") || "portal";
  const lockedSystem = ["user", "admin"].includes(deployTarget) ? deployTarget : null;
  const initialSession = AdShotBackend.getSession();
  const resolveSystem = (nextSession) => lockedSystem || __qs.get("system") || nextSession.system || "user";
  const [route, setRoute] = uSA(__qs.get("route") || "home");
  const [session, setSession] = uSA(initialSession);
  const [system, setSystem] = uSA(() => resolveSystem(initialSession));
  const [quickLink, setQuickLink] = uSA(__qs.get("link") || "");
  const [quickProduct, setQuickProduct] = uSA(null);
  const [quickTemplate, setQuickTemplate] = uSA(null);
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "theme": "blue",
    "libraryView": "grid"
  }/*EDITMODE-END*/);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
  }, [tweaks.theme]);

  React.useEffect(() => {
    const refresh = () => {
      const next = AdShotBackend.getSession();
      setSession(next);
      setSystem(resolveSystem(next));
    };
    return AdShotBackend.subscribe(refresh);
  }, [lockedSystem]);

  const handleAuthenticated = (next, nextSystem) => {
    setSession(next);
    setSystem(lockedSystem || nextSystem || next.system || "user");
  };

  const logout = () => {
    const next = AdShotBackend.logout();
    setSession(next);
    setSystem(lockedSystem || "user");
    setRoute("home");
  };

  const switchToAdmin = () => {
    if (lockedSystem) return;
    const next = AdShotBackend.switchSystem("admin");
    setSession(next);
    setSystem("admin");
  };

  const switchToUser = () => {
    if (lockedSystem === "admin") return;
    const next = AdShotBackend.switchSystem("user");
    setSession(next);
    setSystem("user");
    setRoute("home");
  };

  const startQuickGenerate = (link) => {
    setQuickLink(link || "");
    setQuickProduct(null);
    setQuickTemplate(null);
    setRoute("generate");
  };

  const startGenerateWithProduct = (product, template = null) => {
    setQuickLink(product?.link || "");
    setQuickProduct(product || null);
    setQuickTemplate(template || null);
    setRoute("generate");
  };

  const startGenerateWithTemplate = (template) => {
    setQuickLink("");
    setQuickTemplate(template || null);
    setQuickProduct(null);
    setRoute("generate");
  };

  const renderPage = () => {
    switch (route) {
      case "home": return <HomePage setRoute={setRoute} onQuickGenerate={startQuickGenerate} />;
      case "generate": return <GeneratePage setRoute={setRoute} initialStep={parseInt(__qs.get("step") || "0", 10)} initialLink={quickLink} initialProduct={quickProduct} initialTemplate={quickTemplate} forceParsing={__qs.get("parsing") === "1"} />;
      case "library": return <LibraryPage tweaks={{ ...tweaks, libraryView: __qs.get("view") || tweaks.libraryView }} />;
      case "data": return <DataPage initialTab={__qs.get("tab") || "overview"} />;
      case "products": return <ProductsPage onUseProduct={startGenerateWithProduct} />;
      case "templates": return <TemplatesPage onUseTemplate={startGenerateWithTemplate} />;
      case "account": return <AccountPage />;
      default:
        return (
          <div className="page fade-in" style={{ display: "grid", placeItems: "center", minHeight: 400 }}>
            <div style={{ textAlign: "center", color: "var(--text-3)" }}>
              <div style={{ fontSize: 14, color: "var(--text-1)", marginBottom: 8 }}>该页面待开发</div>
              <div style={{ fontSize: 12 }}>当前演示聚焦工作台 / 生成 / 素材库 / 数据回流四个核心页</div>
            </div>
          </div>
        );
    }
  };

  if (!session.authenticated) {
    return <AuthPage onAuthenticated={handleAuthenticated} targetSystem={lockedSystem || "portal"} />;
  }

  if (lockedSystem === "admin" && !session.isAdmin) {
    return <AuthPage onAuthenticated={handleAuthenticated} targetSystem="admin" />;
  }

  if (lockedSystem === "user" && session.isAdmin) {
    return <AuthPage onAuthenticated={handleAuthenticated} targetSystem="user" />;
  }

  if (system === "admin" && session.isAdmin) {
    return <AdminConsole onExit={switchToUser} onLogout={logout} lockAdmin={lockedSystem === "admin"} />;
  }

  return (
    <>
      <div className="app">
        <Sidebar activeRoute={route} setRoute={setRoute} session={session} />
        <div className="main">
          <Topbar route={route} session={session} onSwitchSystem={!lockedSystem && session.isAdmin ? switchToAdmin : null} onLogout={logout} />
          {renderPage()}
        </div>
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection title="主题色">
          <TweakRadio
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[
              { value: "blue", label: "中性蓝" },
              { value: "green", label: "商务绿" },
              { value: "violet", label: "紫色" },
            ]}
          />
        </TweakSection>
        <TweakSection title="素材库视图">
          <TweakRadio
            value={tweaks.libraryView}
            onChange={(v) => setTweak("libraryView", v)}
            options={[
              { value: "grid", label: "卡片视图" },
              { value: "list", label: "列表视图" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
