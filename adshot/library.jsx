/* global React, I, AdShotBackend */
const { useState: uSL, useEffect: uEL } = React;

const STATUS_MAP = {
  live: { label: "投放中", tone: "success", dot: "var(--success)" },
  draft: { label: "草稿", tone: "default", dot: "var(--text-3)" },
  tired: { label: "已疲劳", tone: "warning", dot: "var(--warning)" },
  review: { label: "审核中", tone: "info", dot: "var(--info)" },
};

function downloadJson(filename, content) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function LibraryPage({ tweaks }) {
  const [view, setView] = uSL(tweaks.libraryView || "grid");
  const [filterStyle, setFilterStyle] = uSL("all");
  const [filterStatus, setFilterStatus] = uSL("all");
  const [selected, setSelected] = uSL([]);
  const [notice, setNotice] = uSL("");
  const [items, setItems] = uSL(() => AdShotBackend.listAssets());
  const [summary, setSummary] = uSL(() => AdShotBackend.getLibrarySummary());

  React.useEffect(() => { setView(tweaks.libraryView || "grid"); }, [tweaks.libraryView]);

  uEL(() => {
    const refresh = () => {
      setItems(AdShotBackend.listAssets());
      setSummary(AdShotBackend.getLibrarySummary());
    };
    refresh();
    return AdShotBackend.subscribe(refresh);
  }, []);

  const styles = Array.from(new Set(items.map((item) => item.style)));
  const filtered = items.filter((it) => (filterStyle === "all" || it.style === filterStyle) && (filterStatus === "all" || it.status === filterStatus));
  const selectedItems = items.filter((item) => selected.includes(item.id));
  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const clearSelection = () => setSelected([]);

  const cloneSelected = () => {
    const created = AdShotBackend.cloneAssets(selected);
    setNotice(`已衍生 ${created.length} 条新版本`);
    clearSelection();
  };
  const launchSelected = () => {
    AdShotBackend.launchAssets(selected, "巨量引擎");
    setNotice(`已送审 ${selected.length} 条素材`);
    clearSelection();
  };
  const deleteSelected = () => {
    AdShotBackend.deleteAssets(selected);
    setNotice(`已删除 ${selected.length} 条素材`);
    clearSelection();
  };
  const downloadSelected = () => {
    downloadJson(`adshot-library-${Date.now()}.json`, AdShotBackend.exportAssets(selected));
    setNotice(`已导出 ${selected.length} 条素材元数据`);
  };

  return (
    <div className="page fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div className="row" style={{ gap: 24 }}>
          {[
            ["素材总数", summary.total, "var(--text-0)"],
            ["投放中", summary.live, "var(--success)"],
            ["爆款 (ROI > 3)", summary.hot, "var(--brand-text)"],
            ["需优化", summary.needOptimize, "var(--warning)"],
          ].map(([label, value, color], index) => (
            <div key={label} style={index > 0 ? { borderLeft: "1px solid var(--border-subtle)", paddingLeft: 24 } : null}>
              <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
              <div className="text-mono" style={{ fontSize: 22, fontWeight: 600, color, marginTop: 4 }}>{value}</div>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 8 }}>
          {notice && <span style={{ fontSize: 11, color: "var(--success)", marginRight: 6 }}>{notice}</span>}
          <button className="btn" data-size="sm"><I.Upload size={12} /> 导入</button>
          <button className="btn" data-variant="primary" data-size="sm"><I.Plus size={12} stroke="white" /> 新建项目</button>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 12 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>风格</span>
          {["all", ...styles].map((style) => (
            <button key={style} className="btn" data-size="sm" data-variant={filterStyle === style ? "primary" : "ghost"} onClick={() => setFilterStyle(style)}>
              {style === "all" ? "全部" : style}
            </button>
          ))}
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>状态</span>
          {[["all", "全部"], ["live", "投放中"], ["tired", "已疲劳"], ["draft", "草稿"], ["review", "审核中"]].map(([k, l]) => (
            <button key={k} className="btn" data-size="sm" data-variant={filterStatus === k ? "primary" : "ghost"} onClick={() => setFilterStatus(k)}>{l}</button>
          ))}
          <div style={{ marginLeft: "auto" }} className="row gap-8">
            <button className="btn" data-size="sm" data-variant="ghost"><I.Filter size={12} /> 高级筛选</button>
            <div style={{ width: 1, height: 18, background: "var(--border)" }} />
            <div className="row" style={{ background: "var(--bg-3)", borderRadius: 6, padding: 2 }}>
              <button onClick={() => setView("grid")} className="icon-btn" style={{ width: 28, height: 24, background: view === "grid" ? "var(--bg-5)" : "transparent" }}>
                <I.Grid size={13} />
              </button>
              <button onClick={() => setView("list")} className="icon-btn" style={{ width: 28, height: 24, background: view === "list" ? "var(--bg-5)" : "transparent" }}>
                <I.List size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="row fade-in" style={{ gap: 8, padding: "10px 14px", background: "var(--brand-soft)", border: "1px solid var(--brand-border)", borderRadius: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "var(--brand-text)" }}>已选中 <span className="text-mono" style={{ fontWeight: 600 }}>{selected.length}</span> 条</span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>{selectedItems.map((item) => item.productName).slice(0, 2).join("、")}</span>
          <div className="row" style={{ gap: 6, marginLeft: "auto" }}>
            <button className="btn" data-size="sm" onClick={cloneSelected}><I.Copy size={11} /> 衍生新版本</button>
            <button className="btn" data-size="sm"><I.Tag size={11} /> 打标签</button>
            <button className="btn" data-size="sm" onClick={downloadSelected}><I.Download size={11} /> 下载</button>
            <button className="btn" data-size="sm" data-variant="primary" onClick={launchSelected}><I.Upload size={11} stroke="white" /> 批量送审</button>
            <button className="btn" data-size="sm" data-variant="danger" onClick={deleteSelected}><I.Trash size={11} /></button>
          </div>
        </div>
      )}

      {view === "grid" ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {filtered.map((it) => {
            const sel = selected.includes(it.id);
            const st = STATUS_MAP[it.status] || STATUS_MAP.draft;
            const roiColor = it.metrics && it.metrics.roi > 3 ? "var(--success)" : it.metrics && it.metrics.roi < 2 ? "var(--down)" : "var(--text-1)";
            return (
              <div key={it.id} style={{ borderRadius: 10, overflow: "hidden", background: "var(--bg-1)", border: `1.5px solid ${sel ? "var(--brand)" : "var(--border-subtle)"}`, transition: "all 0.15s", position: "relative" }}>
                <div style={{ aspectRatio: "9/16", background: it.color, position: "relative", cursor: "pointer" }} onClick={() => toggle(it.id)}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6))" }} />
                  <div style={{ position: "absolute", top: "22%", left: 12, right: 12, fontSize: 16, fontWeight: 800, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.5)", lineHeight: 1.25 }}>
                    {it.productName}
                  </div>
                  <div style={{ position: "absolute", top: 10, left: 10, padding: "3px 8px", background: "rgba(0,0,0,0.55)", borderRadius: 12, backdropFilter: "blur(6px)", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot, animation: it.status === "live" ? "pulse 2s infinite" : "none" }} />
                    <span style={{ fontSize: 10, color: "white", fontWeight: 500 }}>{st.label}</span>
                  </div>
                  {sel && (
                    <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", background: "var(--brand)", display: "grid", placeItems: "center" }}>
                      <I.Check size={12} stroke="white" strokeWidth={3} />
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: 8, left: 12, right: 12, display: "flex", justifyContent: "space-between", color: "white", fontSize: 10 }}>
                    <span style={{ background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 3 }}>00:{String(it.duration).padStart(2, "0")}</span>
                    <span style={{ background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 3 }}>{it.version}</span>
                  </div>
                </div>
                <div style={{ padding: 10 }}>
                  <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                    <span className="chip" style={{ fontSize: 10 }}>{it.style}</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: "auto" }}>{new Date(it.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}</span>
                  </div>
                  {it.metrics ? (
                    <div className="row" style={{ gap: 8, fontSize: 11 }}>
                      <div><span style={{ color: "var(--text-3)" }}>CTR </span><span className="text-mono" style={{ color: "var(--text-1)" }}>{it.metrics.ctr}%</span></div>
                      <div><span style={{ color: "var(--text-3)" }}>ROI </span><span className="text-mono" style={{ color: roiColor, fontWeight: 600 }}>{it.metrics.roi}</span></div>
                    </div>
                  ) : (
                    <div className="row" style={{ gap: 4, fontSize: 10, color: "var(--text-3)" }}><I.Clock size={10} /> 暂无投放数据</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "32px 80px 1fr 90px 80px 80px 80px 80px 80px 60px", padding: "10px 14px", background: "var(--bg-2)", fontSize: 10, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid var(--border-subtle)" }}>
            <span></span><span>预览</span><span>素材 / 商品</span><span>风格</span><span>状态</span><span style={{ textAlign: "right" }}>CTR</span><span style={{ textAlign: "right" }}>CVR</span><span style={{ textAlign: "right" }}>ROI</span><span style={{ textAlign: "right" }}>消耗</span><span></span>
          </div>
          {filtered.map((it) => {
            const sel = selected.includes(it.id);
            const st = STATUS_MAP[it.status] || STATUS_MAP.draft;
            const muted = !it.metrics;
            return (
              <div key={it.id} style={{ display: "grid", gridTemplateColumns: "32px 80px 1fr 90px 80px 80px 80px 80px 80px 60px", padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", alignItems: "center", background: sel ? "var(--brand-soft)" : "transparent", transition: "background 0.12s", cursor: "pointer" }} onClick={() => toggle(it.id)}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: sel ? "var(--brand)" : "transparent", border: `1.5px solid ${sel ? "var(--brand)" : "var(--border-strong)"}`, display: "grid", placeItems: "center" }}>
                  {sel && <I.Check size={10} stroke="white" strokeWidth={3} />}
                </div>
                <div style={{ width: 44, height: 60, borderRadius: 5, background: it.color, position: "relative" }}>
                  <I.Play size={12} fill="white" stroke="white" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 500, marginBottom: 2 }}>{it.productName}</div>
                  <div className="row" style={{ gap: 8, fontSize: 11, color: "var(--text-3)" }}><span>{it.version}</span><span>·</span><span>{it.duration}s</span><span>·</span><span>{new Date(it.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
                </div>
                <span className="chip" style={{ fontSize: 10, justifySelf: "start" }}>{it.style}</span>
                <div className="row" style={{ gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} /><span style={{ fontSize: 11, color: "var(--text-1)" }}>{st.label}</span></div>
                <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: muted ? "var(--text-4)" : "var(--text-1)" }}>{muted ? "—" : `${it.metrics.ctr}%`}</span>
                <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: muted ? "var(--text-4)" : "var(--text-1)" }}>{muted ? "—" : `${it.metrics.cvr}%`}</span>
                <span className="text-mono" style={{ textAlign: "right", fontSize: 12, fontWeight: 600, color: muted ? "var(--text-4)" : it.metrics.roi > 3 ? "var(--success)" : it.metrics.roi < 2 ? "var(--down)" : "var(--text-1)" }}>{muted ? "—" : it.metrics.roi}</span>
                <span className="text-mono" style={{ textAlign: "right", fontSize: 12, color: muted ? "var(--text-4)" : "var(--text-1)" }}>{muted ? "—" : `¥${it.metrics.cost}`}</span>
                <button className="icon-btn" style={{ width: 24, height: 24, marginLeft: "auto" }} onClick={(e) => e.stopPropagation()}><I.More size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

window.LibraryPage = LibraryPage;
