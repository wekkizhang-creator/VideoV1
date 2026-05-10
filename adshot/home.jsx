/* global React, I, AdShotBackend */
const { useState: useStateHome, useEffect: useEffectHome } = React;

function StatCard({ label, value, unit, delta, deltaDir, hint, accent }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>{label}</span>
        {accent && <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />}
      </div>
      <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: "var(--text-0)", letterSpacing: "-0.02em" }} className="text-mono">{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--text-3)" }}>{unit}</span>}
      </div>
      <div className="row" style={{ gap: 8, marginTop: 6 }}>
        {delta && <span className="delta" data-dir={deltaDir}>
          {deltaDir === "up" ? <I.ArrowUp size={11} /> : deltaDir === "down" ? <I.ArrowDown size={11} /> : null}
          {delta}
        </span>}
        {hint && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{hint}</span>}
      </div>
    </div>
  );
}

// 简易迷你折线图
function MiniSpark({ data, color = "var(--brand)", height = 40 }) {
  const w = 220, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`).join(" ");
  const area = `M0,${h} L${pts.split(" ").join(" L")} L${w},${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`g-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color})`} />
      <polyline fill="none" stroke={color} strokeWidth="1.6" points={pts} />
    </svg>
  );
}

function HomePage({ setRoute, onQuickGenerate }) {
  const [homeData, setHomeData] = useStateHome(() => AdShotBackend.getHomeData());
  const [quickInput, setQuickInput] = useStateHome("");

  useEffectHome(() => {
    const refresh = () => setHomeData(AdShotBackend.getHomeData());
    refresh();
    return AdShotBackend.subscribe(refresh);
  }, []);

  const recentProjects = homeData.recentProjects;
  const optimizeList = homeData.optimizeList;
  const statCards = homeData.stats;
  const trendRows = homeData.trendRows;
  const stylePerformance = homeData.stylePerformance;
  const reminders = homeData.reminders;

  const startGenerate = () => {
    const link = quickInput.trim() || "https://item.taobao.com/item.htm?id=demo_夏季防晒喷雾";
    if (onQuickGenerate) onQuickGenerate(link);
    else setRoute("generate");
  };

  return (
    <div className="page fade-in">
      {/* 数据 + 快捷生成 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* 快捷生成入口 */}
        <div className="card" style={{ padding: 24, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 100% 0%, var(--brand-soft) 0%, transparent 50%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div className="chip" data-tone="brand" style={{ marginBottom: 12 }}>
              <I.Zap size={11} /> 快速开始
            </div>
            <div className="h1" style={{ marginBottom: 6 }}>粘贴商品链接,30 秒批量出片</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
              支持淘宝、天猫、京东、拼多多、抖店 · 自动解析卖点 · 多模型并行生成
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <I.Link size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
                <input
                  className="input"
                  placeholder="https://item.taobao.com/item.htm?id=..."
                  style={{ paddingLeft: 36, height: 40, fontSize: 13 }}
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                />
              </div>
              <button className="btn" data-variant="primary" data-size="lg" onClick={startGenerate}>
                <I.Sparkle size={14} stroke="white" /> 解析并开始
              </button>
            </div>

            <div className="row" style={{ gap: 16, fontSize: 12, color: "var(--text-3)" }}>
              <span className="row gap-4"><I.Clock size={11} /> 平均 2 分钟出 20 条</span>
              <span className="row gap-4"><I.Coin size={11} /> 单条 ≈ 480 Credits</span>
              <span className="row gap-4"><I.Shield size={11} /> 自动合规检测</span>
            </div>
          </div>
        </div>

        {/* 今日提醒 */}
        <div className="card" style={{ padding: 18 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="card-title">待你处理</div>
              <div className="card-sub">3 项需要关注</div>
            </div>
            <button className="btn" data-variant="ghost" data-size="sm">全部 <I.ArrowRight size={11} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reminders.map((item) => {
              const Icon = I[item.icon];
              const tone = item.type === "brand" ? "brand" : item.type;
              return (
                <div key={item.title} className="row" style={{ gap: 10, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: `var(--${tone}-soft)`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon size={14} stroke={`var(--${tone})`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{item.desc}</div>
                  </div>
                  <button className="btn" data-size="sm">{item.action}</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 数据概览 */}
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div className="h2">投放数据概览</div>
        <div className="row" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 0, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: 2 }}>
            {["今日", "近 7 天", "近 30 天"].map((t, i) => (
              <button
                key={t}
                style={{
                  padding: "4px 12px",
                  fontSize: 12,
                  borderRadius: 4,
                  background: i === 1 ? "var(--bg-4)" : "transparent",
                  color: i === 1 ? "var(--text-0)" : "var(--text-3)",
                  fontWeight: i === 1 ? 500 : 400,
                }}
              >{t}</button>
            ))}
          </div>
          <button className="btn" data-size="sm">
            <I.Filter size={12} /> 全店铺
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 20 }}>
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* 趋势图 + 模型对比 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="card-title">7 日 ROI 走势</div>
              <div className="card-sub">按生成批次聚合 · Top 3 批次</div>
            </div>
            <button className="btn" data-variant="ghost" data-size="sm">
              详细分析 <I.ArrowRight size={11} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {trendRows.map((b, i) => (
              <div key={i} className="row" style={{ gap: 12 }}>
                <div style={{ width: 160, fontSize: 12, color: "var(--text-1)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                <div style={{ flex: 1, height: 40 }}>
                  <MiniSpark data={b.data} color={b.color} />
                </div>
                <div className="text-mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)", width: 50, textAlign: "right" }}>{b.roi}</div>
                <span className="delta" data-dir={b.dir} style={{ width: 50, justifyContent: "flex-end" }}>
                  {b.dir === "up" ? <I.ArrowUp size={11} /> : <I.ArrowDown size={11} />}
                  {b.delta}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div className="card-title">脚本风格表现</div>
              <div className="card-sub">本周 平均 CTR</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stylePerformance.map((s) => (
              <div key={s.name}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--text-1)" }}>{s.name}</span>
                  <span className="text-mono" style={{ fontSize: 12, color: "var(--text-2)" }}>
                    {s.ctr}% <span style={{ color: "var(--text-4)" }}>· {s.cnt} 条</span>
                  </span>
                </div>
                <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
          <hr className="hr" style={{ margin: "16px 0 12px" }} />
          <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.6 }}>
            <I.Info size={11} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            建议加大「痛点款」生成量,本周 ROI 表现最佳
          </div>
        </div>
      </div>

      {/* 最近项目 + 待优化 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="card-title">最近项目</div>
              <div className="card-sub">点击继续编辑或导出</div>
            </div>
            <button className="btn" data-variant="ghost" data-size="sm" onClick={() => setRoute("library")}>
              全部素材 <I.ArrowRight size={11} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentProjects.map((p) => (
              <div key={p.id} className="row" style={{ gap: 12, padding: "10px 12px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.12s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-2)"}
              >
                <div style={{ width: 44, height: 60, borderRadius: 6, background: p.thumb, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4))" }} />
                  <I.Play size={14} fill="white" stroke="white" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 500, marginBottom: 4 }}>{p.name}</div>
                  <div className="row" style={{ gap: 8, fontSize: 11, color: "var(--text-3)" }}>
                    <span>{p.time}</span>
                    <span>·</span>
                    <span>{p.count}</span>
                  </div>
                </div>
                {p.status === "生成中" ? (
                  <div style={{ width: 120 }}>
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 3 }}>
                      <span className="chip" data-tone="brand"><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", animation: "pulse 1.5s infinite" }} /> 生成中</span>
                      <span style={{ fontSize: 11, color: "var(--text-2)" }}>{p.progress}%</span>
                    </div>
                    <div style={{ height: 3, background: "var(--bg-4)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${p.progress}%`, background: "var(--brand)", borderRadius: 2 }} />
                    </div>
                  </div>
                ) : (
                  <span className="chip" data-tone="success"><I.Check size={10} /> {p.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="card-title">待优化素材</div>
              <div className="card-sub">基于回流数据自动诊断</div>
            </div>
            <span className="chip" data-tone="warning">{optimizeList.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {optimizeList.map((o) => (
              <div key={o.id} style={{ padding: "12px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border-subtle)", borderLeft: `2px solid var(--${o.severity})` }}>
                <div style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500, marginBottom: 4 }}>{o.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{o.reason}</div>
                <button className="btn" data-size="sm" data-variant={o.severity === "success" ? "primary" : "default"}>
                  <I.Wand size={11} /> {o.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomePage = HomePage;
