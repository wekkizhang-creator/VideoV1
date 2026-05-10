/* global React, I, AdShotBackend */
const { useState: uAC, useEffect: uEA } = React;

function ToggleRow({ label, desc, checked, onToggle }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{desc}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: checked ? "var(--brand)" : "var(--bg-4)",
          border: `1px solid ${checked ? "var(--brand)" : "var(--border)"}`,
          position: "relative",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
        aria-pressed={checked}
      >
        <span style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.15s" }} />
      </button>
    </div>
  );
}

function AccountPage() {
  const [data, setData] = uAC(() => AdShotBackend.getAccountCenterData());
  const [profile, setProfile] = uAC(() => ({
    name: data.account.name,
    company: data.account.company,
    email: data.account.email,
    phone: data.account.phone,
  }));
  const [newShop, setNewShop] = uAC({ name: "", platform: "天猫" });
  const [notice, setNotice] = uAC("");
  const [paymentMethod, setPaymentMethod] = uAC("wechat");
  const [paymentOrder, setPaymentOrder] = uAC(null);

  uEA(() => {
    const refresh = () => {
      const next = AdShotBackend.getAccountCenterData();
      setData(next);
      setProfile((prev) => ({ ...prev, name: next.account.name, company: next.account.company, email: next.account.email, phone: next.account.phone }));
    };
    refresh();
    return AdShotBackend.subscribe(refresh);
  }, []);

  const refreshData = (next, message) => {
    setData(next);
    if (message) setNotice(message);
  };

  const saveProfile = () => {
    refreshData(AdShotBackend.updateAccountProfile(profile), "账户资料已保存");
  };

  const openPayment = (payload, message) => {
    try {
      const result = AdShotBackend.createPaymentOrder({ ...payload, method: paymentMethod });
      refreshData(result.accountCenter, message || "支付订单已创建");
      setPaymentOrder(result.order);
    } catch (err) {
      setNotice(err.message);
    }
  };

  const recharge = (pack) => {
    openPayment({ type: "credits", packageId: pack.id }, `已创建 ${pack.name} 支付订单`);
  };

  const switchPlan = (plan) => {
    openPayment({ type: "plan", planId: plan.id }, `已创建 ${plan.name} 套餐订单`);
  };

  const confirmPayment = () => {
    if (!paymentOrder) return;
    refreshData(AdShotBackend.payPaymentOrder(paymentOrder.id), `${paymentOrder.methodName} 支付成功，权益已到账`);
    setPaymentOrder(null);
  };

  const cancelPayment = () => {
    if (paymentOrder) refreshData(AdShotBackend.cancelPaymentOrder(paymentOrder.id), "支付订单已取消");
    setPaymentOrder(null);
  };

  const addShop = () => {
    try {
      refreshData(AdShotBackend.addShop(newShop), "店铺已绑定");
      setNewShop({ name: "", platform: "天猫" });
    } catch (err) {
      setNotice(err.message);
    }
  };

  const account = data.account;
  const usage = data.usage;
  const creditPct = Math.max(0, Math.min(100, (account.creditsBalance / Math.max(1, account.creditsTotal)) * 100));
  const plan = data.currentPlan;

  return (
    <div className="page fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="h2" style={{ marginBottom: 4 }}>账户中心</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>管理账户资料、套餐 Credits、投放平台授权和店铺绑定</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {notice && <span style={{ fontSize: 11, color: notice.includes("请输入") ? "var(--warning)" : "var(--success)" }}>{notice}</span>}
          <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.getAccountCenterData(), "已刷新账户状态")}>
            <I.Refresh size={12} /> 刷新
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="row" style={{ gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "grid", placeItems: "center", color: "white", fontSize: 18, fontWeight: 700 }}>{account.name.slice(0, 1)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, color: "var(--text-0)", fontWeight: 600 }}>{account.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{account.company} · {account.role}</div>
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                <span className="chip" data-tone="brand">{account.plan}</span>
                <span className="chip" data-tone={account.mfaEnabled ? "success" : "warning"}><I.Shield size={10} /> {account.mfaEnabled ? "MFA 已开启" : "MFA 未开启"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Credits 余额</span>
            <span className="chip"><I.Coin size={11} /> {plan.name}</span>
          </div>
          <div className="text-mono" style={{ fontSize: 26, fontWeight: 600, color: "var(--text-0)" }}>{account.creditsBalance.toLocaleString()}</div>
          <div style={{ height: 6, background: "var(--bg-4)", borderRadius: 3, overflow: "hidden", margin: "10px 0 6px" }}>
            <div style={{ height: "100%", width: `${creditPct}%`, background: "linear-gradient(90deg,var(--brand),var(--brand-hover))" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>额度 {account.creditsTotal.toLocaleString()} · 本月已消耗 {usage.consumedCredits.toLocaleString()}</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              ["活跃店铺", usage.activeShops, "家"],
              ["平台授权", usage.connectedPlatforms, "个"],
              ["投放素材", usage.liveAssets, "条"],
            ].map(([label, value, unit]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</div>
                <div className="text-mono" style={{ fontSize: 22, color: "var(--text-0)", fontWeight: 600 }}>{value}<span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 2 }}>{unit}</span></div>
              </div>
            ))}
          </div>
          <hr className="hr" style={{ margin: "14px 0" }} />
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>席位 {account.seatsUsed}/{account.seatsTotal} · 每月 {account.billingDay} 日续费</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>账户资料</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["name", "账户名称"],
              ["company", "公司/团队"],
              ["email", "登录邮箱"],
              ["phone", "联系电话"],
            ].map(([key, label]) => (
              <label key={key}>
                <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{label}</span>
                <input className="input" value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
              </label>
            ))}
          </div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>保存后会写入本地后端状态,侧边栏账号同步更新</span>
            <button className="btn" data-variant="primary" onClick={saveProfile}><I.Check size={12} stroke="white" /> 保存资料</button>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div className="card-title">通知与安全</div>
              <div className="card-sub">任务、余额、异常数据和周报提醒</div>
            </div>
            <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.toggleMfa(), "安全设置已更新")}>
              <I.Shield size={12} /> {account.mfaEnabled ? "关闭 MFA" : "开启 MFA"}
            </button>
          </div>
          <ToggleRow label="生成完成通知" desc="批量任务完成后提醒你选片或送审" checked={account.notifications.jobDone} onToggle={() => refreshData(AdShotBackend.toggleNotification("jobDone"))} />
          <ToggleRow label="Credits 低余额提醒" desc="余额低于 20% 时提醒充值" checked={account.notifications.lowCredits} onToggle={() => refreshData(AdShotBackend.toggleNotification("lowCredits"))} />
          <ToggleRow label="投放异常提醒" desc="CTR/ROI 连续异常时推送诊断" checked={account.notifications.dataAnomaly} onToggle={() => refreshData(AdShotBackend.toggleNotification("dataAnomaly"))} />
          <ToggleRow label="周报邮件" desc="每周一发送素材表现和消耗摘要" checked={account.notifications.weeklyReport} onToggle={() => refreshData(AdShotBackend.toggleNotification("weeklyReport"))} />
          <ToggleRow label="套餐自动续费" desc="到期前自动续费当前套餐" checked={account.autoRenew} onToggle={() => refreshData(AdShotBackend.setAutoRenew(!account.autoRenew))} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>套餐与 Credits</div>
          <div className="row" style={{ justifyContent: "space-between", gap: 10, marginBottom: 14, padding: 10, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>支付方式</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>套餐购买与 Credits 充值均生成待支付订单</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {data.paymentMethods.map((method) => (
                <button key={method.id} className="btn" data-size="sm" data-variant={paymentMethod === method.id ? "primary" : "ghost"} onClick={() => setPaymentMethod(method.id)}>
                  {method.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {data.plans.map((p) => {
              const active = p.id === account.planId;
              return (
                <div key={p.id} style={{ padding: 12, borderRadius: 8, background: active ? "var(--brand-soft)" : "var(--bg-2)", border: `1px solid ${active ? "var(--brand-border)" : "var(--border-subtle)"}` }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 600 }}>{p.name}</span>
                    {active && <span className="chip" data-tone="brand">当前</span>}
                  </div>
                  <div className="text-mono" style={{ fontSize: 18, color: "var(--text-0)", fontWeight: 600 }}>¥{p.price}<span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 400 }}>/月</span></div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", margin: "6px 0 10px" }}>{p.creditsTotal.toLocaleString()} Credits · {p.shops} 店铺</div>
                  <button className="btn" data-size="sm" data-variant={active ? "ghost" : "primary"} disabled={active} onClick={() => switchPlan(p)} style={{ width: "100%" }}>{active ? "使用中" : "切换套餐"}</button>
                </div>
              );
            })}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {data.creditPackages.map((pack) => (
              <button key={pack.id} className="btn" onClick={() => recharge(pack)} style={{ justifyContent: "space-between", padding: 12, height: "auto" }}>
                <span style={{ textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-1)" }}>{pack.name}</span>
                  <span style={{ display: "block", fontSize: 10, color: "var(--text-3)" }}>{pack.tag}</span>
                </span>
                <span className="text-mono" style={{ color: "var(--brand-text)" }}>¥{pack.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div className="card-title">投放平台授权</div>
              <div className="card-sub">连接后可同步计划、素材和回流数据</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.platforms.map((platform) => (
              <div key={platform.id} className="row" style={{ gap: 12, padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 7, background: platform.color, color: "white", display: "grid", placeItems: "center", fontWeight: 700 }}>{platform.short}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 500 }}>{platform.name}</span>
                    <span className="chip" data-tone={platform.connected ? "success" : undefined}>{platform.connected ? "已授权" : "未连接"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                    {platform.connected ? `余额 ¥${platform.balance.toLocaleString()} · ${platform.scopes.join(" / ")}` : platform.scopes.join(" / ")}
                  </div>
                </div>
                {platform.connected ? (
                  <>
                    <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.syncPlatform(platform.id), `${platform.name} 已同步`)}><I.Refresh size={11} /> 同步</button>
                    <button className="btn" data-size="sm" data-variant="danger" onClick={() => refreshData(AdShotBackend.disconnectPlatform(platform.id), `${platform.name} 已解除授权`)}>解绑</button>
                  </>
                ) : (
                  <button className="btn" data-size="sm" data-variant="primary" onClick={() => refreshData(AdShotBackend.connectPlatform(platform.id), `${platform.name} 已授权`)}><I.Link size={11} stroke="white" /> 授权</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div className="card-title">店铺绑定</div>
              <div className="card-sub">绑定店铺后商品解析和数据回流可复用授权</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <input className="input" placeholder="店铺名称" value={newShop.name} onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} style={{ width: 160, height: 30 }} />
              <select className="input" value={newShop.platform} onChange={(e) => setNewShop({ ...newShop, platform: e.target.value })} style={{ width: 92, height: 30, padding: "0 8px" }}>
                {["天猫", "京东", "抖店", "拼多多", "视频号"].map((name) => <option key={name}>{name}</option>)}
              </select>
              <button className="btn" data-size="sm" data-variant="primary" onClick={addShop}><I.Plus size={11} stroke="white" /> 绑定</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.shops.map((shop) => (
              <div key={shop.id} className="row" style={{ gap: 10, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                <div style={{ width: 30, height: 30, borderRadius: 6, background: shop.status === "active" ? "var(--success-soft)" : "var(--warning-soft)", display: "grid", placeItems: "center" }}>
                  {shop.status === "active" ? <I.Check size={14} stroke="var(--success)" /> : <I.Warning size={14} stroke="var(--warning)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 500 }}>{shop.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{shop.platform} · {shop.products} 个商品 · 最近同步 {new Date(shop.lastSyncAt).toLocaleDateString("zh-CN")}</div>
                </div>
                <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => refreshData(AdShotBackend.removeShop(shop.id), "店铺已移除")}><I.Trash size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>账单与安全日志</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>Credits 流水</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.billingRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="row" style={{ justifyContent: "space-between", gap: 8, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.title}</div>
                      <div style={{ fontSize: 10, color: "var(--text-3)" }}>{new Date(record.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <span className="text-mono" style={{ fontSize: 12, color: record.amount >= 0 ? "var(--success)" : "var(--warning)", fontWeight: 600 }}>{record.amount >= 0 ? "+" : ""}{record.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>安全日志</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="row" style={{ gap: 8, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: event.level === "warning" ? "var(--warning)" : "var(--success)", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--text-1)" }}>{event.title}</div>
                      <div style={{ fontSize: 10, color: "var(--text-3)" }}>{event.ip} · {new Date(event.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {paymentOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 50, display: "grid", placeItems: "center", padding: 24 }}>
          <div className="card" style={{ width: 420, boxShadow: "var(--shadow-lg)" }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div className="card-title">确认支付</div>
                <div className="card-sub">{paymentOrder.orderNo}</div>
              </div>
              <span className="chip" data-tone="warning">待支付</span>
            </div>
            <div style={{ padding: 14, borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", marginBottom: 14 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>商品</span>
                <span style={{ color: "var(--text-0)", fontWeight: 600 }}>{paymentOrder.subject}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>支付方式</span>
                <span className="chip" data-tone="brand">{paymentOrder.methodName}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>应付金额</span>
                <span className="text-mono" style={{ fontSize: 22, color: "var(--text-0)", fontWeight: 700 }}>¥{paymentOrder.amount}</span>
              </div>
            </div>
            <div style={{ height: 150, borderRadius: 8, background: "repeating-linear-gradient(45deg,var(--bg-2),var(--bg-2) 8px,var(--bg-3) 8px,var(--bg-3) 16px)", border: "1px solid var(--border)", display: "grid", placeItems: "center", marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}>
                <I.Coin size={32} stroke="var(--brand)" />
                <div className="text-mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 8, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{paymentOrder.qrPayload}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 14 }}>
              演示环境不会真的拉起微信或支付宝。点击“模拟支付成功”后，后端会把订单置为已支付，并自动发放 Credits 或切换套餐。
            </div>
            <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
              <button className="btn" onClick={cancelPayment}>取消订单</button>
              <button className="btn" data-variant="primary" onClick={confirmPayment}>
                <I.Check size={12} stroke="white" /> 模拟支付成功
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.AccountPage = AccountPage;
