/* global React, I, AdShotBackend */
const { useState: useAdminState, useEffect: useAdminEffect } = React;

function StatusChip({ status }) {
  const tone = status === "active" || status === "paid" ? "success" : status === "pending" || status === "trial" ? "warning" : "danger";
  const label = {
    active: "活跃",
    trial: "试用",
    disabled: "禁用",
    suspended: "停用",
    paid: "已支付",
    pending: "待支付",
    cancelled: "已取消",
  }[status] || status;
  return <span className="chip" data-tone={tone}>{label}</span>;
}

function AdminConsole({ onExit, onLogout, lockAdmin = false }) {
  const [tab, setTab] = useAdminState("overview");
  const [data, setData] = useAdminState(() => AdShotBackend.getAdminDashboardData());
  const [notice, setNotice] = useAdminState("");

  useAdminEffect(() => {
    const refresh = () => setData(AdShotBackend.getAdminDashboardData());
    return AdShotBackend.subscribe(refresh);
  }, []);

  const refreshData = (next, message) => {
    setData(next);
    if (message) setNotice(message);
  };

  const tabs = [
    ["overview", "运营总览", "Chart"],
    ["tenants", "租户管理", "Box"],
    ["users", "用户管理", "User"],
    ["orders", "支付订单", "Coin"],
    ["audit", "审计事件", "Shield"],
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="sidebar-logo">管</div>
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-name">业务后台管理</div>
            <div className="sidebar-name-sub">AdShot Admin</div>
          </div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">运营后台</div>
          {tabs.map(([id, label, icon]) => {
            const Ico = I[icon];
            return (
              <div key={id} className="nav-item" data-active={tab === id} onClick={() => setTab(id)}>
                <Ico className="ico" size={15} />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
        <div className="sidebar-foot">
          {!lockAdmin && <button className="btn" style={{ width: "100%", marginBottom: 8 }} onClick={onExit}>返回用户侧</button>}
          <button className="btn" data-variant="danger" style={{ width: "100%" }} onClick={onLogout}>退出登录</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">业务后台管理</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>租户 / 用户 / 支付 / 审计</div>
          </div>
          <div className="topbar-actions">
            {notice && <span style={{ fontSize: 11, color: "var(--success)" }}>{notice}</span>}
            <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.getAdminDashboardData(), "已刷新后台数据")}>
              <I.Refresh size={12} /> 刷新
            </button>
          </div>
        </header>

        <div className="page fade-in">
          {tab === "overview" && (
            <>
              <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
                {data.stats.map((item) => (
                  <div key={item.label} className="card">
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{item.label}</div>
                    <div className="text-mono" style={{ fontSize: 25, color: "var(--text-0)", fontWeight: 650, marginTop: 6 }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>最新租户</div>
                  {data.tenants.slice(0, 5).map((tenant) => (
                    <div key={tenant.id} className="row" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "var(--text-0)", fontWeight: 600 }}>{tenant.company}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)" }}>{tenant.planName} · 席位 {tenant.seatsUsed}/{tenant.seatsTotal} · 店铺 {tenant.shops}</div>
                      </div>
                      <StatusChip status={tenant.status} />
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>支付方式</div>
                  {data.paymentMethods.map((method) => (
                    <div key={method.id} className="row" style={{ gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: method.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>{method.short.slice(0, 1)}</div>
                      <div>
                        <div style={{ color: "var(--text-0)", fontWeight: 600 }}>{method.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-3)" }}>扫码支付 · 订单回调模拟</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "tenants" && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>租户管理</div>
              {data.tenants.map((tenant) => (
                <div key={tenant.id} className="row" style={{ gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-0)", fontWeight: 600 }}>{tenant.company}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{tenant.owner?.name || "未绑定负责人"} · {tenant.planName} · 创建 {new Date(tenant.createdAt).toLocaleDateString("zh-CN")}</div>
                  </div>
                  <StatusChip status={tenant.status} />
                  <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.updateTenantStatus(tenant.id, tenant.status === "active" ? "suspended" : "active"), "租户状态已更新")}>
                    {tenant.status === "active" ? "停用" : "启用"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "users" && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>用户管理</div>
              {data.users.map((user) => (
                <div key={user.id} className="row" style={{ gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-4)", display: "grid", placeItems: "center", color: "var(--text-0)", fontWeight: 700 }}>{user.name.slice(0, 1)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-0)", fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{user.email} · {user.phone} · {user.role}</div>
                  </div>
                  <StatusChip status={user.status} />
                  {user.role !== "platform_admin" && (
                    <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.updateUserStatus(user.id, user.status === "disabled" ? "active" : "disabled"), "用户状态已更新")}>
                      {user.status === "disabled" ? "启用" : "禁用"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "orders" && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>支付订单</div>
              {data.paymentOrders.map((order) => (
                <div key={order.id} className="row" style={{ gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-0)", fontWeight: 600 }}>{order.subject}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{order.orderNo} · {order.methodName} · {new Date(order.createdAt).toLocaleString("zh-CN")}</div>
                  </div>
                  <div className="text-mono" style={{ color: "var(--text-0)", fontWeight: 600 }}>¥{order.amount}</div>
                  <StatusChip status={order.status} />
                </div>
              ))}
            </div>
          )}

          {tab === "audit" && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>审计事件</div>
              {data.securityEvents.map((event) => (
                <div key={event.id} className="row" style={{ gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span className="chip" data-tone={event.level === "warning" ? "warning" : "success"}>{event.level}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--text-0)", fontWeight: 600 }}>{event.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{event.ip} · {new Date(event.createdAt).toLocaleString("zh-CN")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.AdminConsole = AdminConsole;
