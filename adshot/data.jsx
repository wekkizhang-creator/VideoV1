/* global React, I, AdShotBackend */
const { useState: uSD, useEffect: uED } = React;

function BarChart({ data, height = 160 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${(d.value / max) * 100}%`, background: d.highlight ? "var(--brand)" : "var(--bg-4)", borderRadius: "3px 3px 0 0", transition: "all 0.3s", minHeight: 2, position: "relative" }}>
              {d.highlight && <span className="text-mono" style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--brand-text)", fontWeight: 600, whiteSpace: "nowrap" }}>{d.value}</span>}
            </div>
          </div>
          <span style={{ fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Funnel({ stages }) {
  const max = Math.max(1, stages[0]?.value || 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {stages.map((s, i) => {
        const w = Math.max(8, (s.value / max) * 100);
        return (
          <div key={s.label} style={{ position: "relative" }}>
            <div style={{ height: 36, background: s.color, borderRadius: 4, width: `${w}%`, padding: "0 12px", display: "flex", alignItems: "center", color: "white", fontSize: 12, fontWeight: 500, minWidth: 80 }}>
              {s.label}
            </div>
            <div style={{ position: "absolute", right: -8, top: "50%", transform: "translate(100%, -50%)", display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span className="text-mono" style={{ fontWeight: 600, color: "var(--text-0)" }}>{s.value.toLocaleString()}</span>
              {i > 0 && <span style={{ fontSize: 10, color: "var(--text-3)" }}>{((s.value / Math.max(1, stages[i - 1].value)) * 100).toFixed(1)}%</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DataPage({ initialTab = "overview" }) {
  const [tab, setTab] = uSD(initialTab);
  const [period, setPeriod] = uSD(7);
  const [overview, setOverview] = uSD(() => AdShotBackend.getDataOverview(7));
  const [ranking, setRanking] = uSD(() => AdShotBackend.getCreativeRanking());
  const [diagnostics, setDiagnostics] = uSD(() => AdShotBackend.getDiagnostics());
  const [compare, setCompare] = uSD(() => AdShotBackend.getCompareData());
  const [syncedAt, setSyncedAt] = uSD(() => AdShotBackend.getShellData().lastSyncAt);

  uED(() => {
    const refresh = () => {
      setOverview(AdShotBackend.getDataOverview(period));
      setRanking(AdShotBackend.getCreativeRanking());
      setDiagnostics(AdShotBackend.getDiagnostics());
      setCompare(AdShotBackend.getCompareData());
      setSyncedAt(AdShotBackend.getShellData().lastSyncAt);
    };
    refresh();
    return AdShotBackend.subscribe(refresh);
  }, [period]);

  const platforms = [
    { name: "巨量引擎", logo: "巨", color: "#ff5e5e", connected: true, balance: "¥24,180" },
    { name: "磁力金牛", logo: "磁", color: "#ffb820", connected: true, balance: "¥8,420" },
    { name: "千川", logo: "千", color: "#00d4aa", connected: false },
    { name: "视频号", logo: "视", color: "#1aad19", connected: false },
  ];

  const sync = () => {
    const result = AdShotBackend.syncData();
    setSyncedAt(result.lastSyncAt);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ overview, ranking, diagnostics, compare }, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adshot-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page fade-in">
      <div className="row" style={{ gap: 12, marginBottom: 20 }}>
        {platforms.map((p) => (
          <div key={p.name} className="card" style={{ padding: 12, flex: 1, opacity: p.connected ? 1 : 0.6 }}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: p.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{p.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row" style={{ gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-0)" }}>{p.name}</span>
                  {p.connected && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", animation: "pulse 2s infinite" }} />}
                </div>
                {p.connected ? (
                  <div style={{ fontSize: 10, color: "var(--text-3)" }}>余额 <span className="text-mono" style={{ color: "var(--text-1)" }}>{p.balance}</span></div>
                ) : (
                  <button style={{ fontSize: 10, color: "var(--brand-text)" }}>+ 授权连接</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <div className="row" style={{ gap: 0, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: 3 }}>
          {[
            { id: "overview", label: "投放总览" },
            { id: "creative", label: "素材排行榜" },
            { id: "diagnose", label: "AI 诊断" },
            { id: "compare", label: "A/B 对比" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "6px 14px", fontSize: 12, borderRadius: 5, fontWeight: tab === t.id ? 500 : 400, background: tab === t.id ? "var(--bg-4)" : "transparent", color: tab === t.id ? "var(--text-0)" : "var(--text-3)" }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 0, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: 2 }}>
            {[1, 7, 30].map((d) => (
              <button key={d} onClick={() => setPeriod(d)} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 4, background: period === d ? "var(--bg-4)" : "transparent", color: period === d ? "var(--text-0)" : "var(--text-3)" }}>
                {d === 1 ? "今日" : `近 ${d} 天`}
              </button>
            ))}
          </div>
          <button className="btn" data-size="sm" onClick={sync} title={syncedAt ? new Date(syncedAt).toLocaleString("zh-CN") : "同步"}>
            <I.Refresh size={11} /> 同步
          </button>
          <button className="btn" data-size="sm" onClick={exportData}><I.Download size={11} /> 导出</button>
        </div>
      </div>

      {tab === "overview" && (
        <div className="fade-in">
          <div className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 20 }}>
            {overview.stats.map((s) => (
              <div key={s.label} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</div>
                <div className="text-mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-0)", margin: "6px 0 4px" }}>{s.value}</div>
                <div className="row" style={{ gap: 6 }}>
                  <span className="delta" data-dir={s.dir}>{s.dir === "up" ? <I.ArrowUp size={10} /> : <I.ArrowDown size={10} />}{s.delta}</span>
                  <span style={{ fontSize: 10, color: "var(--text-4)" }}>{s.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div className="card-title">消耗趋势</div>
                <div className="card-sub">按投放平台和生成素材聚合</div>
              </div>
              <div className="row" style={{ gap: 12, fontSize: 11 }}>
                <span className="row gap-4"><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--brand)" }} /> 消耗</span>
              </div>
            </div>
            <BarChart data={overview.trend} height={140} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>转化漏斗</div>
              <div className="card-sub" style={{ marginBottom: 24 }}>从曝光到下单的完整链路</div>
              <div style={{ paddingRight: 90 }}><Funnel stages={overview.funnel} /></div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>各风格表现对比</div>
              <div className="card-sub" style={{ marginBottom: 16 }}>基于当前素材库和投放数据</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {overview.styles.map((s) => (
                  <div key={s.name}>
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{s.name}</span>
                        <span style={{ fontSize: 10, color: "var(--text-4)" }}>{s.count} 条</span>
                      </div>
                      <div className="row" style={{ gap: 14 }}>
                        <span className="text-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>CTR <span style={{ color: "var(--text-1)" }}>{s.ctr}%</span></span>
                        <span className="text-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>ROI <span style={{ color: s.roi > 3 ? "var(--success)" : "var(--text-1)", fontWeight: 600 }}>{s.roi}</span></span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.top}%`, background: "linear-gradient(90deg, var(--brand) 0%, var(--brand-hover) 100%)", borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "creative" && (
        <div className="card fade-in" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 56px 1fr 100px 80px 80px 80px 80px 80px 100px 60px", padding: "12px 16px", background: "var(--bg-2)", fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--border-subtle)" }}>
            <span>排名</span><span></span><span>素材 / 商品</span><span>风格</span><span style={{ textAlign: "right" }}>曝光</span><span style={{ textAlign: "right" }}>CTR</span><span style={{ textAlign: "right" }}>CVR</span><span style={{ textAlign: "right" }}>消耗</span><span style={{ textAlign: "right" }}>GMV</span><span style={{ textAlign: "right" }}>ROI</span><span></span>
          </div>
          {ranking.map((row) => (
            <div key={row.id} style={{ display: "grid", gridTemplateColumns: "40px 56px 1fr 100px 80px 80px 80px 80px 80px 100px 60px", padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", alignItems: "center", background: row.top ? "rgba(34,197,94,0.04)" : row.bad ? "rgba(239,68,68,0.04)" : "transparent" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: row.top ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : "var(--bg-4)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: row.top ? "white" : "var(--text-2)" }}>{row.rank}</div>
              <div style={{ width: 36, height: 50, borderRadius: 4, background: row.color, position: "relative" }}><I.Play size={11} fill="white" stroke="white" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} /></div>
              <div><div style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 500 }}>{row.product}</div><div style={{ fontSize: 11, color: "var(--text-3)" }}>已投放 · 后端聚合</div></div>
              <span className="chip" style={{ fontSize: 10, justifySelf: "start" }}>{row.style}</span>
              <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: "var(--text-1)" }}>{row.exposure}</span>
              <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: "var(--text-1)" }}>{row.ctr}%</span>
              <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: "var(--text-1)" }}>{row.cvr}%</span>
              <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: "var(--text-1)" }}>¥{row.cost.toLocaleString()}</span>
              <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>¥{row.gmv.toLocaleString()}</span>
              <div style={{ textAlign: "right" }}><span className="text-mono" style={{ fontSize: 13, fontWeight: 700, color: row.roi > 3 ? "var(--success)" : row.roi < 2 ? "var(--down)" : "var(--text-1)" }}>{row.roi}</span></div>
              <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
                {row.top && <button className="icon-btn" style={{ width: 24, height: 24 }} title="克隆爆款"><I.Copy size={12} /></button>}
                {row.bad && <button className="icon-btn" style={{ width: 24, height: 24 }} title="衍生新版本"><I.Wand size={12} /></button>}
                <button className="icon-btn" style={{ width: 24, height: 24 }}><I.More size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "diagnose" && (
        <div className="fade-in" style={{ display: "grid", gap: 16 }}>
          {diagnostics.map((card) => {
            const Icon = I[card.icon];
            const tone = card.type === "info" ? "info" : card.type;
            return (
              <div key={card.title} className="card" style={{ padding: 18, borderLeft: `3px solid var(--${tone})` }}>
                <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `var(--${tone}-soft)`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} stroke={`var(--${tone})`} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>{card.title}</span>
                      <span className="chip" data-tone={tone}>{card.type === "danger" ? "高优先级" : card.type === "success" ? "建议加投" : card.type === "warning" ? "需要优化" : "新发现"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 12 }}>{card.desc}</div>
                    <div className="row" style={{ gap: 24, marginBottom: 14 }}>
                      {card.metrics.map(([label, value, delta, dir]) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, color: "var(--text-3)" }}>{label}</div>
                          <div className="row" style={{ gap: 6 }}>
                            <span className="text-mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--text-0)" }}>{value}</span>
                            {delta && <span className="delta" data-dir={dir}>{dir === "up" ? <I.ArrowUp size={10} /> : <I.ArrowDown size={10} />}{delta}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      {card.actions.map((action, index) => (
                        <button key={action} className="btn" data-size="sm" data-variant={index === 0 ? "primary" : "default"}><I.Wand size={11} stroke={index === 0 ? "white" : "currentColor"} /> {action}</button>
                      ))}
                      <button className="btn" data-size="sm" data-variant="ghost">忽略</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "compare" && (
        <div className="fade-in card" style={{ padding: 24 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>A/B 对比 · 后端聚合</div>
          <div className="card-sub" style={{ marginBottom: 20 }}>同商品或同风格素材的真实投放数据</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 16, alignItems: "stretch" }}>
            {compare.map((side, idx) => (
              <React.Fragment key={side.side}>
                <div style={{ background: "var(--bg-2)", borderRadius: 10, padding: 16, border: side.winner ? "1px solid rgba(34,197,94,0.4)" : "1px solid var(--border-subtle)", position: "relative" }}>
                  {side.winner && <div style={{ position: "absolute", top: 12, right: 12 }} className="chip" data-tone="success"><I.Check size={11} /> 胜出</div>}
                  <div className="row" style={{ gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 6, background: "var(--bg-4)", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700, color: side.winner ? "var(--success)" : "var(--text-2)" }}>{side.side}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>{side.name}</div><div style={{ fontSize: 11, color: "var(--text-3)" }}>已投放 7 天</div></div>
                  </div>
                  <div style={{ aspectRatio: "9/16", background: side.color, borderRadius: 8, marginBottom: 14, position: "relative", maxHeight: 220 }}><I.Play size={26} fill="white" stroke="white" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} /></div>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    {side.stats.map(([label, value]) => (
                      <div key={label} style={{ padding: "8px 10px", background: "var(--bg-3)", borderRadius: 6 }}>
                        <div style={{ fontSize: 10, color: "var(--text-3)" }}>{label}</div>
                        <div className="text-mono" style={{ fontSize: 14, fontWeight: 600, color: side.winner && ["ROI", "CTR", "CVR", "GMV"].includes(label) ? "var(--success)" : "var(--text-0)", marginTop: 2 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {idx === 0 && <div style={{ display: "grid", placeItems: "center", color: "var(--text-3)", fontSize: 11 }}><span style={{ padding: "6px 10px", background: "var(--bg-3)", borderRadius: 12, fontWeight: 500 }}>VS</span></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

window.DataPage = DataPage;
