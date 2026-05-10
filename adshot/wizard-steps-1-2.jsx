/* global React, I */
const { useState: useStateW, useEffect: useEffectW } = React;

const STEPS = [
  { id: 1, title: "粘链接", sub: "解析商品" },
  { id: 2, title: "商品确认", sub: "卖点提取" },
  { id: 3, title: "选脚本", sub: "模板 × 模型" },
  { id: 4, title: "生成中", sub: "多模型并行" },
  { id: 5, title: "选片导出", sub: "对比 / 下载" },
];

function StepIndicator({ current }) {
  return (
    <div className="row" style={{ gap: 0, padding: "20px 32px", background: "var(--bg-1)", borderBottom: "1px solid var(--border-subtle)" }}>
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div className="row" style={{ gap: 10, opacity: active || done ? 1 : 0.5 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: done ? "var(--brand)" : active ? "var(--brand-soft)" : "var(--bg-3)",
                border: active ? "1px solid var(--brand)" : "1px solid var(--border)",
                display: "grid", placeItems: "center",
                fontSize: 12, fontWeight: 600,
                color: done ? "white" : active ? "var(--brand-text)" : "var(--text-3)",
                transition: "all 0.2s",
              }}>
                {done ? <I.Check size={13} stroke="white" strokeWidth={2.4} /> : s.id}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: active ? "var(--text-0)" : done ? "var(--text-1)" : "var(--text-3)" }}>{s.title}</div>
                <div style={{ fontSize: 10, color: "var(--text-3)" }}>{s.sub}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? "var(--brand)" : "var(--border-subtle)", margin: "0 16px", transition: "background 0.2s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============= Step 1: 粘链接 =============
function Step1Link({ onNext, link, setLink }) {
  const [parsing, setParsing] = useStateW(false);
  const [parsed, setParsed] = useStateW(false);

  useEffectW(() => {
    if (link && !parsed && !parsing) {
      setParsing(true);
      const t = setTimeout(() => { setParsing(false); setParsed(true); }, 1800);
      return () => clearTimeout(t);
    }
  }, [link]);

  const presets = [
    { plat: "淘宝", url: "https://item.taobao.com/item.htm?id=738291", color: "#ff4d4d" },
    { plat: "抖店", url: "https://haohuo.jinritemai.com/views/product/...", color: "#000" },
    { plat: "京东", url: "https://item.jd.com/100023481.html", color: "#e1251b" },
    { plat: "拼多多", url: "https://mobile.yangkeduo.com/goods.html?goods_id=...", color: "#e02e24" },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <div className="chip" data-tone="brand" style={{ marginBottom: 16 }}>第 1 步</div>
      <div className="h1" style={{ marginBottom: 8 }}>粘贴你想要投流的商品链接</div>
      <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 32 }}>
        我们会自动解析商品图、标题、详情页和评论,提取核心卖点,你不需要手动输入任何信息
      </div>

      <div className="card" style={{ padding: 6, marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
          <I.Link size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            className="input"
            placeholder="支持淘宝、天猫、京东、拼多多、抖店商品链接"
            style={{ paddingLeft: 44, paddingRight: 120, height: 52, fontSize: 14, background: "var(--bg-1)", border: "none" }}
            value={link}
            onChange={(e) => { setLink(e.target.value); setParsed(false); }}
          />
          <button
            className="btn"
            data-variant="primary"
            disabled={!link || parsing}
            style={{ position: "absolute", right: 6, top: 6, height: 40, padding: "0 16px" }}
            onClick={() => { if (parsed) onNext(); }}
          >
            {parsing ? <><div style={{ width: 12, height: 12, border: "1.5px solid white", borderRadius: "50%", borderTopColor: "transparent" }} className="spin" /> 解析中</>
              : parsed ? <>下一步 <I.ArrowRight size={13} stroke="white" /></>
              : <>解析商品 <I.ArrowRight size={13} stroke="white" /></>}
          </button>
        </div>
      </div>

      {/* 解析进度 */}
      {(parsing || parsed) && (
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <div className="card-title">正在解析商品信息</div>
            {parsed && <span className="chip" data-tone="success"><I.Check size={10} /> 完成</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "抓取商品页面", time: "0.4s" },
              { label: "提取主图与详情图", time: "0.6s" },
              { label: "解析标题、价格、规格", time: "0.3s" },
              { label: "抓取 200 条评论关键词", time: "0.5s" },
              { label: "AI 提取核心卖点", time: parsing ? null : "0.8s" },
            ].map((task, i) => {
              const taskDone = parsed || (parsing && i < 3);
              return (
                <div key={i} className="row" style={{ gap: 10, fontSize: 12 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: taskDone ? "var(--success-soft)" : "var(--bg-3)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {taskDone ? <I.Check size={10} stroke="var(--success)" strokeWidth={2.5} /> : (i === 3 || i === 4) && parsing ? <div style={{ width: 8, height: 8, border: "1.2px solid var(--brand)", borderRadius: "50%", borderTopColor: "transparent" }} className="spin" /> : null}
                  </div>
                  <span style={{ color: taskDone ? "var(--text-1)" : "var(--text-3)" }}>{task.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-4)" }} className="text-mono">{task.time || "..."}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 快捷示例 */}
      {!link && (
        <>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>试试示例链接</div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {presets.map((p) => (
              <button
                key={p.plat}
                className="row"
                onClick={() => setLink(p.url)}
                style={{ gap: 10, padding: "10px 12px", background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 6, color: "var(--text-2)", fontSize: 12, transition: "all 0.12s", textAlign: "left" }}
              >
                <div style={{ width: 22, height: 22, borderRadius: 4, background: p.color, color: "white", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>{p.plat[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--text-1)", fontWeight: 500, marginBottom: 1 }}>{p.plat}</div>
                  <div style={{ fontSize: 10, color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.url}</div>
                </div>
                <I.ArrowRight size={12} />
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 32, padding: 14, background: "var(--bg-1)", borderRadius: 8, border: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text-3)", display: "flex", gap: 8 }}>
        <I.Info size={14} stroke="var(--text-3)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          已经解析过的商品可在 <span style={{ color: "var(--brand-text)", cursor: "pointer" }}>商品库</span> 直接复用,不再消耗解析次数 · 单链接解析免费,批量上传需消耗 50 Credits/100 个
        </div>
      </div>
    </div>
  );
}

// ============= Step 2: 商品确认 =============
function Step2Product({ onNext, onPrev }) {
  const [selling, setSelling] = useStateW(["军训晒不黑", "敏感肌可用", "防水不脱妆", "学生党性价比"]);
  const [target, setTarget] = useStateW("18-24 岁学生 / 职场新人女性");
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="chip" data-tone="brand" style={{ marginBottom: 12 }}>第 2 步</div>
          <div className="h1" style={{ marginBottom: 4 }}>确认商品信息和卖点</div>
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>检查 AI 提取的内容,删掉不准的,补充独家卖点</div>
        </div>
        <span className="chip" data-tone="success"><I.Check size={11} /> 解析成功</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* 左:商品卡 */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ aspectRatio: "1/1", borderRadius: 8, background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)", position: "relative", marginBottom: 12, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "white", fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>SPF50</div>
            <div style={{ position: "absolute", bottom: 8, left: 8, fontSize: 10, color: "rgba(255,255,255,0.9)", background: "rgba(0,0,0,0.4)", padding: "3px 7px", borderRadius: 4, backdropFilter: "blur(4px)" }}>主图 1/8</div>
          </div>
          <div className="row gap-4" style={{ marginBottom: 10, overflowX: "auto" }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 4, background: `hsl(${i * 40}, 60%, 55%)`, border: i === 1 ? "1.5px solid var(--brand)" : "1px solid var(--border-subtle)", flexShrink: 0, opacity: i === 1 ? 1 : 0.6 }} />
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)", lineHeight: 1.4, marginBottom: 8 }}>
            清透防晒喷雾 SPF50+ 持久防水 学生军训女敏感肌专用
          </div>
          <div className="row" style={{ gap: 8, marginBottom: 12, alignItems: "baseline" }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#ff4d4d" }} className="text-mono">¥39.9</span>
            <span style={{ fontSize: 11, color: "var(--text-4)", textDecoration: "line-through" }} className="text-mono">¥69</span>
            <span className="chip" data-tone="danger" style={{ marginLeft: "auto" }}>立减 30</span>
          </div>
          <hr className="hr" style={{ margin: "12px 0" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11 }}>
            <div><div style={{ color: "var(--text-3)" }}>已售</div><div className="text-mono" style={{ color: "var(--text-1)", fontWeight: 500 }}>12.4 万件</div></div>
            <div><div style={{ color: "var(--text-3)" }}>评价</div><div className="text-mono" style={{ color: "var(--text-1)", fontWeight: 500 }}>4.86 · 8923 条</div></div>
            <div><div style={{ color: "var(--text-3)" }}>店铺</div><div style={{ color: "var(--text-1)", fontWeight: 500 }}>夏沐旗舰店</div></div>
            <div><div style={{ color: "var(--text-3)" }}>类目</div><div style={{ color: "var(--text-1)", fontWeight: 500 }}>美妆 / 防晒</div></div>
          </div>
        </div>

        {/* 右:卖点编辑 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div className="card-title">AI 提取的核心卖点</div>
                <div className="card-sub">基于商品详情 + 200 条好评 提取 · 可点击删除或拖拽排序</div>
              </div>
              <span className="chip"><I.Sparkle size={10} /> AI 重新提取</span>
            </div>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {selling.map((s, i) => (
                <div key={i} className="chip" data-tone="brand" style={{ fontSize: 12, padding: "6px 10px", gap: 6 }}>
                  <span style={{ fontSize: 9, color: "var(--text-4)" }}>#{i + 1}</span>
                  {s}
                  <button onClick={() => setSelling(selling.filter((_, x) => x !== i))} style={{ marginLeft: 4, color: "var(--text-3)" }}><I.X size={11} /></button>
                </div>
              ))}
              <button className="chip" style={{ fontSize: 12, padding: "6px 10px", background: "transparent", borderStyle: "dashed", color: "var(--text-3)" }}>
                <I.Plus size={11} /> 补充独家卖点
              </button>
            </div>

            <hr className="hr" style={{ margin: "16px 0 12px" }} />

            <div className="row" style={{ gap: 8, alignItems: "flex-start", padding: 10, background: "var(--warning-soft)", borderRadius: 6, border: "1px solid rgba(245, 158, 11, 0.2)" }}>
              <I.Warning size={14} stroke="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 11, color: "var(--text-1)" }}>
                <span style={{ fontWeight: 600, color: "var(--warning)" }}>合规检查 · 中风险</span>
                <span style={{ color: "var(--text-2)" }}> · 检测到 1 个疑似极限词:「敏感肌<u>可用</u>」可能涉及功效宣称</span>
                <button style={{ marginLeft: 6, color: "var(--brand-text)", fontSize: 11 }}>查看建议改写 →</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>目标人群与场景</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, display: "block" }}>目标人群</label>
                <input className="input" value={target} onChange={(e) => setTarget(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, display: "block" }}>使用场景</label>
                <select className="input" defaultValue="军训">
                  <option>军训 / 户外</option>
                  <option>日常通勤</option>
                  <option>海边度假</option>
                  <option>多场景通用</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6, display: "block" }}>投放平台</label>
              <div className="row gap-8">
                {["抖音", "快手", "视频号", "小红书"].map((p, i) => (
                  <label key={p} className="row gap-6" style={{ padding: "6px 10px", background: i < 2 ? "var(--brand-soft)" : "var(--bg-2)", border: i < 2 ? "1px solid var(--brand-border)" : "1px solid var(--border-subtle)", borderRadius: 6, fontSize: 12, color: i < 2 ? "var(--brand-text)" : "var(--text-2)", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked={i < 2} style={{ accentColor: "var(--brand)" }} /> {p}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 24 }}>
        <button className="btn" onClick={onPrev}><I.ChevronLeft size={13} /> 上一步</button>
        <div className="row gap-12">
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>本步骤不消耗 Credits</span>
          <button className="btn" data-variant="primary" data-size="lg" onClick={onNext}>
            选择脚本风格 <I.ArrowRight size={13} stroke="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

window.WizardStep1 = Step1Link;
window.WizardStep2 = Step2Product;
window.WizardStepIndicator = StepIndicator;
window.WIZARD_STEPS = STEPS;
