/* global React, I, AdShotBackend */
const { useState: uT, useEffect: uET } = React;

function TemplatePreview({ template }) {
  const constants = AdShotBackend.getConstants();
  const styles = template.styleIds.map((id) => constants.styles.find((style) => style.id === id)).filter(Boolean);
  return (
    <div style={{ height: 110, background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border-subtle)", padding: 10, display: "flex", gap: 8 }}>
      {styles.map((style, index) => (
        <div key={style.id} style={{ flex: 1, borderRadius: 6, background: style.color, position: "relative", overflow: "hidden", minWidth: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.55))" }} />
          <div style={{ position: "absolute", left: 8, right: 8, bottom: 8, color: "white", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{style.name}</div>
          <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", color: "white", fontSize: 10 }}>{index + 1}</div>
        </div>
      ))}
    </div>
  );
}

function TemplateCard({ template, onUse, onRefresh }) {
  const active = template.status === "active";
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div className="row" style={{ gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 14, color: "var(--text-0)", fontWeight: 600 }}>{template.name}</span>
            <span className="chip" data-tone={active ? "success" : "warning"}>{active ? "启用" : "暂停"}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>{template.category} · {template.source === "system" ? "系统模板" : "自定义"}</div>
        </div>
        <button className="icon-btn" style={{ width: 28, height: 28 }}><I.More size={14} /></button>
      </div>

      <TemplatePreview template={template} />

      <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "12px 0", minHeight: 38 }}>{template.description}</div>
      <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {template.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
        {[
          ["ROI", template.roi],
          ["CTR", `${template.ctr}%`],
          ["次数", template.used],
          ["数量", template.styleIds.length * template.perStyle],
          ["时长", `${template.duration}s`],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: "var(--text-3)" }}>{label}</div>
            <div className="text-mono" style={{ fontSize: 13, color: label === "ROI" && template.roi > 3 ? "var(--success)" : "var(--text-1)", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
        <button className="btn" data-variant="primary" data-size="sm" disabled={!active} onClick={() => onUse(AdShotBackend.useTemplate(template.id))}>
          <I.Sparkle size={11} stroke="white" /> 套用生成
        </button>
        <div className="row" style={{ gap: 4 }}>
          <button className="btn" data-size="sm" onClick={() => {
            const next = AdShotBackend.duplicateTemplate(template.id);
            onRefresh(AdShotBackend.getTemplateLibraryData(), next ? "已复制模板" : "复制失败");
          }}><I.Copy size={11} /> 复制</button>
          <button className="btn" data-size="sm" onClick={() => onRefresh(AdShotBackend.toggleTemplateStatus(template.id), active ? "模板已暂停" : "模板已启用")}>{active ? "暂停" : "启用"}</button>
          <button className="icon-btn" style={{ width: 28, height: 28 }} disabled={template.source === "system"} onClick={() => onRefresh(AdShotBackend.deleteTemplate(template.id), template.source === "system" ? "系统模板不可删除" : "模板已删除")}><I.Trash size={13} /></button>
        </div>
      </div>
    </div>
  );
}

function TemplatesPage({ onUseTemplate }) {
  const constants = AdShotBackend.getConstants();
  const [query, setQuery] = uT("");
  const [status, setStatus] = uT("all");
  const [category, setCategory] = uT("all");
  const [data, setData] = uT(() => AdShotBackend.getTemplateLibraryData());
  const [notice, setNotice] = uT("");
  const [draft, setDraft] = uT({
    name: "新品冷启动模板",
    category: "自定义模板",
    description: "适合新品前 3 天测试多风格素材。",
    styleIds: ["pain", "seed"],
    perStyle: 3,
    modelId: "pro",
    duration: 15,
    aspect: "9:16",
  });

  const filters = { query, status, category };

  uET(() => {
    const refresh = () => setData(AdShotBackend.getTemplateLibraryData(filters));
    refresh();
    return AdShotBackend.subscribe(refresh);
  }, [query, status, category]);

  const refreshData = (next, message) => {
    setData(next);
    if (message) setNotice(message);
  };

  const saveDraft = () => {
    refreshData(AdShotBackend.saveTemplate(draft), "模板已保存");
  };

  const toggleStyle = (id) => {
    setDraft((prev) => ({
      ...prev,
      styleIds: prev.styleIds.includes(id) ? prev.styleIds.filter((item) => item !== id) : [...prev.styleIds, id],
    }));
  };

  const useTemplate = (template) => {
    if (!template) return;
    onUseTemplate(template);
  };

  return (
    <div className="page fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="h2" style={{ marginBottom: 4 }}>爆款模板</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>保存高 ROI 生成参数,按品类复用脚本风格、模型和出片数量</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {notice && <span style={{ fontSize: 11, color: notice.includes("失败") ? "var(--warning)" : "var(--success)" }}>{notice}</span>}
          <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.getTemplateLibraryData(filters), "已刷新模板库")}><I.Refresh size={12} /> 刷新</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          ["模板总数", data.summary.total, "var(--text-0)"],
          ["启用中", data.summary.active, "var(--success)"],
          ["系统模板", data.summary.system, "var(--brand-text)"],
          ["平均 ROI", data.summary.avgRoi, "var(--warning)"],
        ].map(([label, value, color]) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</div>
            <div className="text-mono" style={{ fontSize: 24, color, fontWeight: 600, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        <div className="card" style={{ alignSelf: "start" }}>
          <div className="card-title" style={{ marginBottom: 12 }}>新建模板</div>
          <label style={{ display: "block", marginBottom: 10 }}>
            <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>模板名称</span>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label style={{ display: "block", marginBottom: 10 }}>
            <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>品类</span>
            <input className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          </label>
          <label style={{ display: "block", marginBottom: 10 }}>
            <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>说明</span>
            <textarea className="input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ minHeight: 74, resize: "vertical" }} />
          </label>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>脚本风格</div>
          <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {constants.styles.map((style) => (
              <button key={style.id} className="btn" data-size="sm" data-variant={draft.styleIds.includes(style.id) ? "primary" : "default"} onClick={() => toggleStyle(style.id)}>{style.name}</button>
            ))}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>每风格数量</span>
              <select className="input" value={draft.perStyle} onChange={(e) => setDraft({ ...draft, perStyle: Number(e.target.value) })}>
                {[1, 2, 3, 4, 6, 8, 10].map((n) => <option key={n} value={n}>{n} 条</option>)}
              </select>
            </label>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>视频时长</span>
              <select className="input" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}>
                {[8, 15, 30, 60].map((n) => <option key={n} value={n}>{n}s</option>)}
              </select>
            </label>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>模型</span>
              <select className="input" value={draft.modelId} onChange={(e) => setDraft({ ...draft, modelId: e.target.value })}>
                {constants.models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
            </label>
            <label>
              <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>比例</span>
              <select className="input" value={draft.aspect} onChange={(e) => setDraft({ ...draft, aspect: e.target.value })}>
                {["9:16", "1:1", "16:9"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <button className="btn" data-variant="primary" style={{ width: "100%" }} disabled={!draft.name || draft.styleIds.length === 0} onClick={saveDraft}>
            <I.Check size={12} stroke="white" /> 保存模板
          </button>
        </div>

        <div>
          <div className="card" style={{ padding: 14, marginBottom: 14 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 280px", position: "relative" }}>
                <I.Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
                <input className="input" placeholder="搜索模板、标签、品类..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 32, height: 32 }} />
              </div>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 140, height: 32, padding: "0 8px" }}>
                <option value="all">全部品类</option>
                {data.categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <div className="row" style={{ gap: 0, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: 2 }}>
                {[["all", "全部"], ["active", "启用"], ["paused", "暂停"]].map(([id, label]) => (
                  <button key={id} className="btn" data-size="sm" data-variant={status === id ? "primary" : "ghost"} onClick={() => setStatus(id)}>{label}</button>
                ))}
              </div>
            </div>
          </div>

          {data.templates.length ? (
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {data.templates.map((template) => (
                <TemplateCard key={template.id} template={template} onUse={useTemplate} onRefresh={refreshData} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-3)" }}>没有匹配的模板</div>
          )}
        </div>
      </div>
    </div>
  );
}

window.TemplatesPage = TemplatesPage;
