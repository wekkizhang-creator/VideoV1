/* global React, I, AdShotBackend */
const { useState: useAuthState } = React;

function AuthPage({ onAuthenticated, targetSystem = "portal" }) {
  const isAdminTarget = targetSystem === "admin";
  const isUserTarget = targetSystem === "user";
  const [tab, setTab] = useAuthState("password");
  const [method, setMethod] = useAuthState("wechat");
  const [notice, setNotice] = useAuthState("");
  const [login, setLogin] = useAuthState(() => ({
    identifier: isAdminTarget ? "admin@adshot.example" : "ops@xiaoman.example",
    password: isAdminTarget ? "admin123456" : "demo123456",
    target: isAdminTarget ? "13500001111" : "13800002678",
    code: "",
  }));
  const [register, setRegister] = useAuthState({ company: "", name: "", email: "", phone: "", password: "", code: "", agree: true });
  const [reset, setReset] = useAuthState({ target: "", code: "", password: "" });

  const submit = (fn, success) => {
    try {
      const result = fn();
      setNotice(success || "操作成功");
      if (result && result.authenticated) {
        if (isAdminTarget && !result.isAdmin) {
          AdShotBackend.logout();
          setNotice("此地址仅限业务后台管理员登录");
          return null;
        }
        if (isUserTarget && result.isAdmin) {
          AdShotBackend.logout();
          setNotice("管理员账号请使用业务后台地址登录");
          return null;
        }
        onAuthenticated(result, isAdminTarget ? "admin" : isUserTarget ? "user" : result.system);
      }
      return result;
    } catch (err) {
      setNotice(err.message || "操作失败");
      return null;
    }
  };

  const requestCode = (target, scene, setter) => {
    try {
      const result = AdShotBackend.requestAuthCode(target, scene);
      setter((prev) => ({ ...prev, code: result.code }));
      setNotice(`验证码已发送，演示码 ${result.code}`);
    } catch (err) {
      setNotice(err.message || "验证码发送失败");
    }
  };

  const tabs = isAdminTarget ? [
    ["password", "管理员登录"],
    ["code", "验证码登录"],
    ["reset", "找回密码"],
  ] : [
    ["password", "密码登录"],
    ["code", "验证码登录"],
    ["register", "企业注册"],
    ["reset", "找回密码"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "grid", gridTemplateColumns: "minmax(340px, 420px) 1fr" }}>
      <div style={{ padding: "40px 44px", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-1)" }}>
        <div className="row" style={{ gap: 10, marginBottom: 34 }}>
          <div className="sidebar-logo">投</div>
          <div>
            <div className="h2">{isAdminTarget ? "业务后台管理" : "投流素材工厂"}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{isAdminTarget ? "SaaS 运营后台登录" : "SaaS 用户侧登录"}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 18 }}>
          {tabs.map(([id, label]) => (
            <button key={id} className="btn" data-size="sm" data-variant={tab === id ? "primary" : "ghost"} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === "password" && (
          <div className="grid" style={{ gap: 12 }}>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>手机号 / 邮箱</span>
              <input className="input" value={login.identifier} onChange={(e) => setLogin({ ...login, identifier: e.target.value })} />
            </label>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>密码</span>
              <input className="input" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            </label>
            <button className="btn" data-variant="primary" onClick={() => submit(() => AdShotBackend.loginWithPassword(login), "登录成功")}>
              <I.Check size={12} stroke="white" /> 登录用户侧
            </button>
          </div>
        )}

        {tab === "code" && (
          <div className="grid" style={{ gap: 12 }}>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>手机号 / 邮箱</span>
              <input className="input" value={login.target} onChange={(e) => setLogin({ ...login, target: e.target.value })} />
            </label>
            <div className="row" style={{ gap: 8 }}>
              <input className="input" placeholder="验证码" value={login.code} onChange={(e) => setLogin({ ...login, code: e.target.value })} />
              <button className="btn" onClick={() => requestCode(login.target, "login", setLogin)}>发送</button>
            </div>
            <button className="btn" data-variant="primary" onClick={() => submit(() => AdShotBackend.loginWithCode(login), "登录成功")}>
              <I.Check size={12} stroke="white" /> 验证码登录
            </button>
          </div>
        )}

        {tab === "register" && (
          <div className="grid" style={{ gap: 10 }}>
            <input className="input" placeholder="企业 / 团队名称" value={register.company} onChange={(e) => setRegister({ ...register, company: e.target.value })} />
            <input className="input" placeholder="联系人姓名" value={register.name} onChange={(e) => setRegister({ ...register, name: e.target.value })} />
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input className="input" placeholder="邮箱" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value })} />
              <input className="input" placeholder="手机号" value={register.phone} onChange={(e) => setRegister({ ...register, phone: e.target.value })} />
            </div>
            <input className="input" type="password" placeholder="设置密码，至少 8 位" value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} />
            <div className="row" style={{ gap: 8 }}>
              <input className="input" placeholder="验证码" value={register.code} onChange={(e) => setRegister({ ...register, code: e.target.value })} />
              <button className="btn" onClick={() => requestCode(register.phone || register.email, "register", setRegister)}>发送</button>
            </div>
            <label className="row" style={{ gap: 8, fontSize: 11, color: "var(--text-3)" }}>
              <input type="checkbox" checked={register.agree} onChange={(e) => setRegister({ ...register, agree: e.target.checked })} />
              已阅读并同意 SaaS 服务协议、隐私政策和投放数据授权条款
            </label>
            <button className="btn" data-variant="primary" onClick={() => submit(() => AdShotBackend.registerAccount(register), "注册成功")}>
              <I.Plus size={12} stroke="white" /> 创建企业账号
            </button>
          </div>
        )}

        {tab === "reset" && (
          <div className="grid" style={{ gap: 12 }}>
            <input className="input" placeholder="手机号 / 邮箱" value={reset.target} onChange={(e) => setReset({ ...reset, target: e.target.value })} />
            <div className="row" style={{ gap: 8 }}>
              <input className="input" placeholder="验证码" value={reset.code} onChange={(e) => setReset({ ...reset, code: e.target.value })} />
              <button className="btn" onClick={() => requestCode(reset.target, "reset", setReset)}>发送</button>
            </div>
            <input className="input" type="password" placeholder="新密码，至少 8 位" value={reset.password} onChange={(e) => setReset({ ...reset, password: e.target.value })} />
            <button className="btn" data-variant="primary" onClick={() => submit(() => AdShotBackend.resetPassword(reset), "密码已重置，请重新登录")}>
              <I.Check size={12} stroke="white" /> 重置密码
            </button>
          </div>
        )}

        {notice && (
          <div style={{ marginTop: 16, padding: 10, borderRadius: 8, background: notice.includes("失败") || notice.includes("错误") || notice.includes("请输入") ? "var(--warning-soft)" : "var(--brand-soft)", color: notice.includes("失败") || notice.includes("错误") ? "var(--warning)" : "var(--brand-text)", fontSize: 12 }}>
            {notice}
          </div>
        )}

        <div className="grid" style={{ gap: 8, marginTop: 20 }}>
          {!isAdminTarget && <button className="btn" onClick={() => submit(() => AdShotBackend.loginWithDemo("user"), "已进入用户侧演示账号")}>用户侧演示登录</button>}
          {!isUserTarget && <button className="btn" data-variant="primary" onClick={() => submit(() => AdShotBackend.loginWithDemo("admin"), "已进入业务后台管理")}>业务后台管理员登录</button>}
        </div>
      </div>

      <div className="page" style={{ maxWidth: "none", display: "grid", alignContent: "center", padding: "48px 64px" }}>
        <div style={{ maxWidth: 860 }}>
          <div className="h1" style={{ marginBottom: 10 }}>{isAdminTarget ? "业务后台独立部署入口" : "用户侧独立部署入口"}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 28 }}>
            {isAdminTarget ? "该 URL 只允许平台管理员进入，用于租户、用户、订单、支付和运营审计。" : "该 URL 只服务 SaaS 用户侧，用于注册登录、视频生成、商品库、模板和套餐支付。"}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              ["注册登录", "密码、验证码、企业注册、找回密码、演示账号"],
              ["支付闭环", "微信支付、支付宝、待支付订单、确认到账、账单记录"],
              ["后台运营", "租户管理、用户状态、套餐订单、审计事件"],
            ].map(([title, desc]) => (
              <div key={title} className="card">
                <div className="card-title">{title}</div>
                <div className="card-sub" style={{ lineHeight: 1.7, marginTop: 8 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 14 }}>
              <div>
                <div className="card-title">支付方式预设</div>
                <div className="card-sub">套餐购买和 Credits 充值均会先生成订单，再选择微信或支付宝扫码确认。</div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {AdShotBackend.getConstants().paymentMethods.map((item) => (
                  <button key={item.id} className="btn" data-variant={method === item.id ? "primary" : "ghost"} onClick={() => setMethod(item.id)}>{item.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.AuthPage = AuthPage;
