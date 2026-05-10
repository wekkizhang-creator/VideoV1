/* global React, I, AdShotBackend */
const { useState: uS, useEffect: uE } = React;

const STAGE_LABELS = { queued: "排队中", scripting: "生成脚本", rendering: "AI 渲染", encoding: "合成导出", done: "已完成" };
const STAGE_COLORS = { queued: "var(--text-3)", scripting: "var(--info)", rendering: "var(--brand)", encoding: "var(--warning)", done: "var(--success)" };

function StepIndicator({ steps, current }) {
  return (
    <div className="row" style={{ gap: 0, justifyContent: "center", padding: "16px 0 28px" }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={s.label}>
            <div className="row" style={{ gap: 10 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 600,
                background: done ? "var(--brand)" : active ? "var(--brand-soft)" : "var(--bg-3)",
                color: done ? "white" : active ? "var(--brand-text)" : "var(--text-3)",
                border: active ? "1px solid var(--brand-border)" : "1px solid var(--border-subtle)",
                transition: "all 0.2s",
              }}>
                {done ? <I.Check size={12} stroke="white" strokeWidth={2.5} /> : i + 1}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: active ? "var(--text-0)" : done ? "var(--text-1)" : "var(--text-3)" }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-3)" }}>{s.sub}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 60, height: 1, background: done ? "var(--brand)" : "var(--border)", margin: "0 16px", marginTop: 13 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ProductThumbs({ product }) {
  return (
    <div style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", position: "relative", background: product.color }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "white", fontSize: 44, fontWeight: 700, letterSpacing: "-0.04em", opacity: 0.42 }}>
        {product.shortName.slice(0, 4)}
      </div>
      <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", gap: 6 }}>
        {Array.from({ length: Math.min(8, product.imageCount || 8) }, (_, i) => (
          <div key={i} style={{
            width: 30, height: 30, borderRadius: 4,
            background: `hsla(${(i + 1) * 38},70%,60%,0.5)`,
            border: i === 0 ? "1.5px solid white" : "1px solid rgba(255,255,255,0.3)",
          }} />
        ))}
      </div>
    </div>
  );
}

function Step1Link({ value, setValue, parsing, parsed, error, logs, onParse, onNext }) {
  const samples = [
    "https://item.taobao.com/item.htm?id=demo_夏季防晒喷雾",
    "https://item.jd.com/demo_SoundPro蓝牙耳机.html",
    "https://mobile.yangkeduo.com/goods.html?goods_id=demo_陶瓷不粘锅",
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="card" style={{ padding: 32 }}>
        <div className="h2" style={{ marginBottom: 6 }}>粘贴商品链接</div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>
          支持淘宝 / 天猫 / 京东 / 拼多多 / 抖店 / 1688,后端会解析商品、卖点、价格、图片和合规风险
        </div>

        <div style={{ position: "relative", marginBottom: 12 }}>
          <I.Link size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-3)" }} />
          <input
            className="input"
            placeholder="例如:https://item.taobao.com/item.htm?id=782394..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ paddingLeft: 40, height: 44, fontSize: 14 }}
            disabled={parsing || parsed}
          />
          {value && !parsing && !parsed && (
            <button onClick={() => setValue("")} style={{ position: "absolute", right: 12, top: 14, color: "var(--text-3)" }}>
              <I.X size={14} />
            </button>
          )}
        </div>

        <div className="row" style={{ gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>快速试用:</span>
          {samples.map((url, index) => (
            <button
              key={url}
              className="chip"
              style={{ cursor: "pointer" }}
              onClick={() => setValue(url)}
              disabled={parsing || parsed}
            >{["防晒喷雾", "蓝牙耳机", "不粘锅"][index]}</button>
          ))}
        </div>

        {!parsed && (
          <button
            className="btn"
            data-variant="primary"
            data-size="lg"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={!value || parsing}
            onClick={onParse}
          >
            {parsing ? (
              <>
                <I.Refresh size={14} stroke="white" className="spin" />
                正在解析商品信息...
              </>
            ) : (
              <>
                <I.Sparkle size={14} stroke="white" /> 解析商品
              </>
            )}
          </button>
        )}

        {(parsing || logs.length > 0) && (
          <div style={{ marginTop: 20, padding: 16, background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(logs.length ? logs : [
                { label: "连接电商平台", done: true },
                { label: "抓取商品图片", done: true },
                { label: "提取商品规格与卖点", done: false, active: true },
                { label: "AI 分析竞品爆款关键词", done: false },
                { label: "构建商品知识库", done: false },
              ]).map((s, i) => (
                <div key={i} className="row" style={{ gap: 10, fontSize: 12 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: s.done ? "var(--success-soft)" : s.active || parsing ? "var(--brand-soft)" : "var(--bg-3)",
                    display: "grid", placeItems: "center",
                  }}>
                    {s.done ? <I.Check size={10} stroke="var(--success)" strokeWidth={3} /> :
                     <I.Refresh size={10} stroke="var(--brand)" className="spin" />}
                  </div>
                  <span style={{ color: s.done ? "var(--text-1)" : "var(--text-0)" }}>{s.label}</span>
                  {s.time && <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-4)" }}>{s.time}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="row fade-in" style={{ gap: 8, marginTop: 14, padding: "10px 12px", background: "var(--danger-soft)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
            <I.Warning size={14} stroke="var(--danger)" />
            <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>
          </div>
        )}

        {parsed && (
          <div className="fade-in" style={{ marginTop: 16 }}>
            <div className="row" style={{ gap: 8, padding: "12px 14px", background: "var(--success-soft)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, marginBottom: 16 }}>
              <I.Check size={14} stroke="var(--success)" strokeWidth={2.5} />
              <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 500 }}>解析成功</span>
              <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>已写入商品库 · 0 Credits</span>
            </div>

            <button className="btn" data-variant="primary" data-size="lg" style={{ width: "100%", justifyContent: "center" }} onClick={onNext}>
              下一步:确认商品信息 <I.ArrowRight size={14} stroke="white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step2Product({ product, selectedPointIds, setSelectedPointIds, onNext, onBack }) {
  const toggle = (id) => {
    setSelectedPointIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };
  const selectedCount = selectedPointIds.length;

  return (
    <div className="fade-in" style={{ maxWidth: 980, margin: "0 auto" }}>
      <div className="card" style={{ padding: 28 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div className="h2" style={{ marginBottom: 4 }}>确认商品信息</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              已识别商品基础信息和 {product.sellingPoints.length} 条卖点,请勾选用于生成的核心卖点
            </div>
          </div>
          <span className="chip" data-tone="success"><I.Check size={11} /> 解析成功</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
          <div>
            <ProductThumbs product={product} />
            <div className="row" style={{ gap: 6, marginTop: 8, fontSize: 11, color: "var(--text-3)" }}>
              <I.Check size={11} stroke="var(--success)" /> 已采集 {product.imageCount} 张主图 · {product.detailImageCount} 张详情图
            </div>
          </div>

          <div>
            <div className="row" style={{ gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              {product.tags.map((tag, index) => <span key={tag} className="chip" data-tone={index === 0 ? "info" : undefined}>{tag}</span>)}
              <span className="chip">{product.platformShop}</span>
              <span className="chip"><I.Star size={10} /> {product.rating} · 月销 {product.monthlySales}</span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-0)", margin: "0 0 12px", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
              {product.title}
            </h3>

            <div className="row" style={{ gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                ["售价", `¥${product.price}`],
                ["佣金", `¥${product.commission} (${Math.round(product.commissionRate * 100)}%)`, "var(--success)"],
                ["库存", product.inventory],
                ["近 7 日 GMV", `¥${Math.round(product.gmv7d / 10000)}w`],
              ].map(([label, value, color]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div className="text-mono" style={{ fontSize: 18, fontWeight: 600, color: color || "var(--text-0)", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>

            <hr className="hr" style={{ margin: "16px 0" }} />

            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div className="h3">核心卖点</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>已选 {selectedCount} / {product.sellingPoints.length} 条 · 后端会基于这些卖点生成脚本</div>
              </div>
              <button className="btn" data-size="sm" onClick={() => setSelectedPointIds(product.sellingPoints.map((p) => p.id))}>
                <I.Check size={11} /> 全选
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {product.sellingPoints.map((point) => {
                const checked = selectedPointIds.includes(point.id);
                return (
                  <label
                    key={point.id}
                    className="row"
                    style={{
                      gap: 10, padding: "10px 12px",
                      background: checked ? "var(--brand-soft)" : "var(--bg-2)",
                      border: `1px solid ${checked ? "var(--brand-border)" : "var(--border-subtle)"}`,
                      borderRadius: 8, cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: checked ? "var(--brand)" : "transparent",
                      border: `1.5px solid ${checked ? "var(--brand)" : "var(--border-strong)"}`,
                      display: "grid", placeItems: "center", flexShrink: 0,
                    }}
                      onClick={() => toggle(point.id)}
                    >
                      {checked && <I.Check size={10} stroke="white" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: 13, color: checked ? "var(--text-0)" : "var(--text-1)", flex: 1 }}>{point.text}</span>
                    {point.risk !== "ok" && (
                      <span className="chip" data-tone={point.risk === "danger" ? "danger" : "warning"} title={point.riskMessage}>
                        <I.Warning size={10} /> {point.risk === "danger" ? "高风险" : "需确认"}
                      </span>
                    )}
                    <span className="chip" style={{ fontSize: 10 }}>{point.source}</span>
                  </label>
                );
              })}
            </div>

            {product.sellingPoints.some((point) => point.risk !== "ok") && (
              <div className="row" style={{ gap: 8, marginTop: 14, padding: "10px 12px", background: "var(--warning-soft)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8 }}>
                <I.Warning size={14} stroke="var(--warning)" />
                <span style={{ fontSize: 12, color: "var(--warning)" }}>
                  合规引擎发现风险表达,生成时会保留风险标记并建议改写
                </span>
              </div>
            )}
          </div>
        </div>

        <hr className="hr" style={{ margin: "24px 0 20px" }} />
        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="btn" onClick={onBack}>
            <I.ChevronLeft size={12} /> 上一步
          </button>
          <button className="btn" data-variant="primary" data-size="lg" onClick={onNext} disabled={selectedCount === 0}>
            下一步:选择脚本风格 <I.ArrowRight size={14} stroke="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step3Script({ product, selectedPoints, templatePreset, onNext, onBack }) {
  const constants = AdShotBackend.getConstants();
  const [selectedStyles, setSelectedStyles] = uS(() => templatePreset?.styleIds || ["pain", "seed", "direct"]);
  const [perStyle, setPerStyle] = uS(() => templatePreset?.perStyle || 4);
  const [modelId, setModelId] = uS(() => templatePreset?.modelId || "pro");
  const [duration, setDuration] = uS(() => templatePreset?.duration || 15);
  const [aspect, setAspect] = uS(() => templatePreset?.aspect || "9:16");
  const [error, setError] = uS("");

  const totalVideos = selectedStyles.length * perStyle;
  const totalCredits = AdShotBackend.calculateCost({ styles: selectedStyles, perStyle, modelId, duration });
  const account = AdShotBackend.getAccount();
  const model = constants.models.find((m) => m.id === modelId);
  const totalTime = Math.round(totalVideos * model.seconds / 4);
  const iconMap = { pain: I.Zap, seed: I.Star, direct: I.Coin, compare: I.Diff, story: I.Film, ugc: I.Box };

  const toggleStyle = (id) => {
    setSelectedStyles((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const start = () => {
    setError("");
    try {
      onNext({ styles: selectedStyles, perStyle, modelId, duration, aspect, totalCredits });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="h2" style={{ marginBottom: 4 }}>选择脚本风格 + 生成参数</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>
            当前商品: {product.shortName} · 已选 {selectedPoints.length} 条卖点{templatePreset ? ` · 已套用「${templatePreset.name}」` : ""} · 后端将创建批量任务并扣减 Credits
          </div>
        </div>

        <div className="h3" style={{ marginBottom: 12 }}>1. 脚本风格(可多选)</div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 28 }}>
          {constants.styles.map((style) => {
            const checked = selectedStyles.includes(style.id);
            const Icon = iconMap[style.id] || I.Sparkle;
            return (
              <div
                key={style.id}
                onClick={() => toggleStyle(style.id)}
                style={{
                  position: "relative",
                  padding: 14, borderRadius: 10,
                  background: checked ? "var(--bg-3)" : "var(--bg-2)",
                  border: `1px solid ${checked ? "var(--brand)" : "var(--border-subtle)"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  overflow: "hidden",
                }}
              >
                {style.id === "pain" && <span style={{ position: "absolute", top: 10, right: 10 }} className="chip" data-tone="warning">本周最佳</span>}
                <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: style.color, display: "grid", placeItems: "center" }}>
                    <Icon size={17} stroke="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>{style.name}</span>
                      {checked && <I.Check size={12} stroke="var(--brand)" strokeWidth={3} />}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-3)" }}>历史 CTR <span className="text-mono" style={{ color: "var(--text-2)" }}>{style.ctr}%</span></div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>
                  {style.id === "pain" ? "放大用户痛点,激发购买冲动" :
                   style.id === "seed" ? "真实使用场景 + 测评感口播" :
                   style.id === "direct" ? "卖点 + 价格 + 下单引导" :
                   style.id === "compare" ? "横向对比同类商品,突显优势" :
                   style.id === "story" ? "短剧前情后果,代入感强" :
                   "弱滤镜真实感,适合女性向"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h3" style={{ marginBottom: 12 }}>2. 每种风格生成数量</div>
        <div className="row" style={{ gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {[1, 2, 4, 6, 8, 10].map((n) => (
            <button key={n} onClick={() => setPerStyle(n)} className="btn" data-variant={perStyle === n ? "primary" : "default"} style={{ minWidth: 56 }}>
              {n} 条
            </button>
          ))}
          <span style={{ fontSize: 12, color: "var(--text-3)", marginLeft: 8 }}>
            × {selectedStyles.length} 种风格 = <span className="text-mono" style={{ color: "var(--text-0)", fontWeight: 600 }}>{totalVideos}</span> 条视频
          </span>
        </div>

        <div className="h3" style={{ marginBottom: 12 }}>3. 视频规格</div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 16, gap: 12 }}>
          {constants.models.map((m) => {
            const sel = modelId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setModelId(m.id)}
                style={{
                  padding: 14, borderRadius: 8,
                  background: sel ? "var(--brand-soft)" : "var(--bg-2)",
                  border: `1px solid ${sel ? "var(--brand)" : "var(--border-subtle)"}`,
                  cursor: "pointer", position: "relative",
                }}
              >
                {m.id === "pro" && <span className="chip" data-tone="success" style={{ position: "absolute", top: 10, right: 10 }}>推荐</span>}
                <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>{m.name}</span>
                  {sel && <I.Check size={12} stroke="var(--brand)" strokeWidth={3} />}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{m.quality} · {m.seconds}s/条</div>
                <div className="text-mono" style={{ fontSize: 16, fontWeight: 600, color: "var(--text-0)", marginTop: 8 }}>
                  {m.credit} <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 400 }}>Credits / 15s</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="row" style={{ gap: 32, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>视频时长</div>
            <div className="row" style={{ gap: 6 }}>
              {[8, 15, 30, 60].map((d) => (
                <button key={d} className="btn" data-size="sm" data-variant={duration === d ? "primary" : "default"} onClick={() => setDuration(d)}>{d}s</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>画面比例</div>
            <div className="row" style={{ gap: 6 }}>
              {["9:16", "1:1", "16:9"].map((a) => (
                <button key={a} className="btn" data-size="sm" data-variant={aspect === a ? "primary" : "default"} onClick={() => setAspect(a)}>{a}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: 16, background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border-subtle)", marginBottom: 20 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>本次消耗</div>
              <div className="row" style={{ gap: 12, marginTop: 6 }}>
                <div className="text-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--text-0)" }}>{totalCredits.toLocaleString()}</div>
                <span className="chip"><I.Coin size={11} /> Credits</span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>余额 {account.creditsBalance.toLocaleString()} → <span className="text-mono" style={{ color: totalCredits > account.creditsBalance ? "var(--danger)" : "var(--text-1)" }}>{(account.creditsBalance - totalCredits).toLocaleString()}</span></span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>预计耗时</div>
              <div className="text-mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-0)", marginTop: 4 }}>≈ {totalTime}s</div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>{totalVideos} 条 · 4 路并行</div>
            </div>
          </div>
          {totalCredits > account.creditsBalance && (
            <div className="row" style={{ gap: 8, padding: "8px 10px", background: "var(--danger-soft)", borderRadius: 6, marginTop: 10 }}>
              <I.Warning size={12} stroke="var(--danger)" />
              <span style={{ fontSize: 11, color: "var(--danger)" }}>余额不足,本次缺少 {(totalCredits - account.creditsBalance).toLocaleString()} Credits</span>
            </div>
          )}
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="btn" onClick={onBack}>
            <I.ChevronLeft size={12} /> 上一步
          </button>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={() => AdShotBackend.saveTemplate({ name: `${product.shortName} · 自定义模板`, category: product.category, description: `基于 ${product.shortName} 的生成参数保存`, styleIds: selectedStyles, perStyle, modelId, duration, aspect, tags: selectedStyles.map((id) => constants.styles.find((s) => s.id === id)?.short || id) })}>保存为模板</button>
            <button className="btn" data-variant="primary" data-size="lg" onClick={start} disabled={selectedStyles.length === 0 || totalCredits > account.creditsBalance}>
              <I.Sparkle size={14} stroke="white" /> 开始生成 {totalVideos} 条
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Generating({ jobId, onNext, onBack }) {
  const [job, setJob] = uS(() => AdShotBackend.getJob(jobId));

  uE(() => {
    const refresh = () => setJob(AdShotBackend.getJob(jobId));
    refresh();
    const tick = setInterval(refresh, 350);
    return () => clearInterval(tick);
  }, [jobId]);

  if (!job) {
    return (
      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="h2">任务不存在</div>
        <button className="btn" style={{ marginTop: 16 }} onClick={onBack}>返回修改</button>
      </div>
    );
  }

  const allDone = job.status === "done";
  const completed = job.completed || 0;
  const items = job.items || [];
  const pauseOrResume = () => {
    const next = job.status === "paused" ? AdShotBackend.resumeJob(job.id) : AdShotBackend.pauseJob(job.id);
    setJob(next);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="card" style={{ padding: 28 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="h2" style={{ marginBottom: 4 }}>{allDone ? "生成完成" : job.status === "paused" ? "任务已暂停" : "正在批量生成..."}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              {allDone ? `${items.length} 条视频已就绪,可以预览选片` : `${job.productName} · ${job.config.modelName} · ${items.length} 条任务`}
            </div>
          </div>
          {!allDone && job.status !== "cancelled" && (
            <div className="row" style={{ gap: 8 }}>
              <button className="btn" data-variant="ghost" onClick={pauseOrResume}>
                {job.status === "paused" ? <I.Play size={12} /> : <I.Pause size={12} />} {job.status === "paused" ? "继续" : "暂停"}
              </button>
              <button className="btn" data-variant="danger" onClick={() => setJob(AdShotBackend.cancelJob(job.id))}><I.X size={12} /> 取消任务</button>
            </div>
          )}
        </div>

        <div style={{ padding: 18, background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border-subtle)", marginBottom: 20 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ position: "relative", width: 56, height: 56 }}>
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="28" cy="28" r="24" fill="none" stroke="var(--bg-4)" strokeWidth="3" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="var(--brand)" strokeWidth="3"
                    strokeDasharray={`${(job.progress / 100) * 150.8} 150.8`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.3s" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, color: "var(--text-0)" }} className="text-mono">{job.progress}%</div>
              </div>
              <div>
                <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-0)" }} className="text-mono">{completed} / {items.length}</span>
                  <span className="chip" data-tone={allDone ? "success" : job.status === "paused" ? "warning" : "brand"}>
                    {allDone ? <><I.Check size={10} /> 已完成</> : job.status === "paused" ? "已暂停" : <><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", animation: "pulse 1.5s infinite" }} /> 进行中</>}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  已消耗 <span className="text-mono" style={{ color: "var(--text-2)" }}>{Math.round(job.config.totalCredits * job.progress / 100).toLocaleString()}</span> Credits
                  · 本次锁定 <span className="text-mono" style={{ color: "var(--text-2)" }}>{job.config.totalCredits.toLocaleString()}</span> Credits
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {["scripting", "rendering", "encoding", "done"].map((stage) => (
                <div key={stage} style={{ textAlign: "center", padding: "0 12px", borderLeft: stage === "scripting" ? "none" : "1px solid var(--border-subtle)" }}>
                  <div className="text-mono" style={{ fontSize: 16, fontWeight: 600, color: STAGE_COLORS[stage] }}>{items.filter((item) => item.stage === stage).length}</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)" }}>{STAGE_LABELS[stage]}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 6, background: "var(--bg-4)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${job.progress}%`, background: "linear-gradient(90deg, var(--brand), var(--brand-hover))", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {items.map((item, index) => {
            const done = item.stage === "done";
            return (
              <div key={item.id} style={{ padding: 12, background: "var(--bg-2)", border: `1px solid ${done ? "rgba(34,197,94,0.2)" : "var(--border-subtle)"}`, borderRadius: 8, position: "relative", overflow: "hidden" }}>
                <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 60, borderRadius: 6, flexShrink: 0, background: done ? job.product.color : "var(--bg-4)", position: "relative", overflow: "hidden" }}>
                    {done ? (
                      <I.Play size={14} fill="white" stroke="white" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                      <span className="chip" style={{ fontSize: 10 }}>{item.style}</span>
                      <span style={{ fontSize: 10, color: "var(--text-3)" }}>#{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      “{item.script}”
                    </div>
                  </div>
                </div>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: STAGE_COLORS[item.stage], fontWeight: 500 }}>
                    {done ? <I.Check size={11} style={{ verticalAlign: -1 }} /> : null} {STAGE_LABELS[item.stage]}
                  </span>
                  <span className="text-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{Math.round(item.progress)}%</span>
                </div>
                <div style={{ height: 3, background: "var(--bg-4)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.progress}%`, background: STAGE_COLORS[item.stage], borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>

        {allDone && (
          <div className="row fade-in" style={{ justifyContent: "space-between", marginTop: 24 }}>
            <button className="btn" onClick={onBack}>
              <I.ChevronLeft size={12} /> 返回修改
            </button>
            <button className="btn" data-variant="primary" data-size="lg" onClick={onNext}>
              下一步:预览选片 <I.ArrowRight size={14} stroke="white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step5Pick({ jobId, onBack, onComplete }) {
  const [items, setItems] = uS(() => AdShotBackend.getJobAssets(jobId));
  const [picks, setPicks] = uS([]);
  const [filterStyle, setFilterStyle] = uS("all");
  const [hoverId, setHoverId] = uS(null);
  const [notice, setNotice] = uS("");

  uE(() => {
    const loaded = AdShotBackend.getJobAssets(jobId);
    setItems(loaded);
    setPicks(loaded.slice(0, Math.min(4, loaded.length)).map((item) => item.id));
  }, [jobId]);

  const filtered = filterStyle === "all" ? items : items.filter((item) => item.style === filterStyle);
  const pickedItems = items.filter((item) => picks.includes(item.id));
  const togglePick = (id) => setPicks((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  const styles = Array.from(new Set(items.map((item) => item.style)));

  const download = () => {
    const data = AdShotBackend.exportAssets(picks);
    const blob = new Blob([data], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adshot-assets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`已导出 ${picks.length} 条素材元数据`);
  };

  const addToLibrary = () => {
    AdShotBackend.addAssetsToLibrary(picks);
    setNotice(`已加入素材库: ${picks.length} 条`);
  };

  const launch = () => {
    AdShotBackend.launchAssets(picks, "巨量引擎");
    onComplete();
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div className="card" style={{ padding: 24 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="h2" style={{ marginBottom: 4 }}>选片 + 导出</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              已生成 {items.length} 条 · 已选 <span style={{ color: "var(--brand-text)" }}>{picks.length}</span> 条 ·
              入库、下载、送审都会写回后端状态
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" data-size="sm">
              <I.Diff size={12} /> A/B 对比
            </button>
            <button className="btn" data-size="sm" onClick={() => setPicks(items.map((item) => item.id))}>全选</button>
            <button className="btn" data-size="sm" onClick={() => setPicks([])}>清空</button>
          </div>
        </div>

        <div className="row" style={{ gap: 8, marginBottom: 16, padding: "10px 14px", background: "var(--bg-2)", borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>风格</span>
          {["all", ...styles].map((style) => (
            <button key={style} className="btn" data-size="sm" data-variant={filterStyle === style ? "primary" : "ghost"} onClick={() => setFilterStyle(style)}>
              {style === "all" ? `全部 (${items.length})` : `${style} (${items.filter((item) => item.style === style).length})`}
            </button>
          ))}
          <div style={{ marginLeft: "auto" }} className="row gap-8">
            <button className="btn" data-size="sm" data-variant="ghost"><I.Sort size={11} /> AI 评分倒序</button>
            <button className="btn" data-size="sm" data-variant="ghost"><I.Filter size={11} /> 仅看合规</button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {filtered.map((item, index) => {
            const picked = picks.includes(item.id);
            const complianceTone = item.compliance === "danger" ? "danger" : item.compliance === "warning" ? "warning" : "success";
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoverId(item.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ borderRadius: 10, overflow: "hidden", border: `1.5px solid ${picked ? "var(--brand)" : "var(--border-subtle)"}`, background: "var(--bg-1)", cursor: "pointer", position: "relative", transition: "transform 0.15s, border-color 0.15s", transform: hoverId === item.id ? "translateY(-2px)" : "none" }}
                onClick={() => togglePick(item.id)}
              >
                <div style={{ aspectRatio: "9/16", background: item.color, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6))" }} />
                  <div style={{ position: "absolute", top: "20%", left: 12, right: 12, fontSize: 18, fontWeight: 800, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.5)", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                    “{item.script}”
                  </div>
                  <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, fontSize: 11, color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 3 }}>00:{String(item.duration).padStart(2, "0")}</span>
                    <span style={{ background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 3 }}>{item.aspect}</span>
                  </div>
                  {picked && (
                    <div style={{ position: "absolute", top: 8, left: 8, width: 22, height: 22, borderRadius: "50%", background: "var(--brand)", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                      <I.Check size={12} stroke="white" strokeWidth={3} />
                    </div>
                  )}
                  {hoverId === item.id && (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.3)" }}>
                      <button style={{ width: 44, height: 44, borderRadius: "50%", background: "white", display: "grid", placeItems: "center" }}>
                        <I.Play size={18} fill="black" stroke="black" />
                      </button>
                    </div>
                  )}
                  <div style={{ position: "absolute", top: 8, right: 8, padding: "3px 7px", background: "rgba(0,0,0,0.6)", borderRadius: 4, fontSize: 10, color: "white", fontWeight: 600, backdropFilter: "blur(4px)" }} className="text-mono">
                    AI {item.score}
                  </div>
                </div>

                <div style={{ padding: 10 }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="chip" style={{ fontSize: 10 }}>{item.style}</span>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }} className="text-mono">#{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="row" style={{ gap: 4, fontSize: 10, color: `var(--${complianceTone})`, marginBottom: 6 }}>
                    {item.compliance === "ok" ? <I.Shield size={11} /> : <I.Warning size={11} />}
                    {item.compliance === "ok" ? "合规通过" : item.complianceMsg}
                  </div>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn" data-size="sm" data-variant="ghost" style={{ padding: "3px 6px", flex: 1 }} onClick={(e) => e.stopPropagation()}><I.Edit size={10} /> 改写</button>
                    <button className="btn" data-size="sm" data-variant="ghost" style={{ padding: "3px 6px", flex: 1 }} onClick={(e) => e.stopPropagation()}><I.Copy size={10} /> 衍生</button>
                    <button className="btn" data-size="sm" data-variant="ghost" style={{ padding: "3px 6px" }} onClick={(e) => e.stopPropagation()}><I.More size={10} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 10, position: "sticky", bottom: 16, zIndex: 5, backdropFilter: "blur(12px)" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="row" style={{ gap: 14 }}>
              <button className="btn" onClick={onBack}>
                <I.ChevronLeft size={12} /> 返回
              </button>
              <div style={{ borderLeft: "1px solid var(--border)", height: 24 }} />
              <div>
                <div className="text-mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)" }}>已选 {picks.length} 条</div>
                <div style={{ fontSize: 10, color: "var(--text-3)" }}>合规 {pickedItems.filter((item) => item.compliance === "ok").length} · 风险 {pickedItems.filter((item) => item.compliance !== "ok").length}</div>
                {notice && <div style={{ fontSize: 10, color: "var(--success)", marginTop: 2 }}>{notice}</div>}
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn" disabled={picks.length === 0} onClick={addToLibrary}><I.Folder size={12} /> 加入素材库</button>
              <button className="btn" disabled={picks.length === 0} onClick={download}><I.Download size={12} /> 批量下载 ({picks.length})</button>
              <button className="btn" data-variant="primary" data-size="lg" disabled={picks.length === 0} onClick={launch}>
                <I.Upload size={14} stroke="white" /> 一键投放到巨量 ({picks.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneratePage({ setRoute, initialStep = 0, initialLink = "", initialProduct = null, initialTemplate = null, forceParsing = false }) {
  const [step, setStep] = uS(initialStep);
  const [link, setLink] = uS(initialLink || (forceParsing ? "https://item.taobao.com/item.htm?id=demo_夏季防晒喷雾" : ""));
  const [parsing, setParsing] = uS(false);
  const [parsed, setParsed] = uS(false);
  const [parseError, setParseError] = uS("");
  const [parseLogs, setParseLogs] = uS([]);
  const [product, setProduct] = uS(initialProduct);
  const [selectedPointIds, setSelectedPointIds] = uS(() => initialProduct ? initialProduct.sellingPoints.filter((point) => point.risk !== "danger").slice(0, 4).map((point) => point.id) : []);
  const [jobId, setJobId] = uS(null);
  const [templatePreset, setTemplatePreset] = uS(initialTemplate);

  const steps = [
    { label: "粘链接", sub: "解析商品" },
    { label: "确认商品", sub: "卖点采集" },
    { label: "选脚本", sub: "风格 + 模型" },
    { label: "生成中", sub: "批量出片" },
    { label: "选片导出", sub: "送审投放" },
  ];

  uE(() => {
    if (!initialLink) return;
    setLink(initialLink);
    setParsed(false);
    setProduct(null);
    setParseLogs([]);
    setParseError("");
    setStep(0);
  }, [initialLink]);

  uE(() => {
    if (!initialProduct) return;
    setProduct(initialProduct);
    setLink(initialProduct.link || "");
    setParsed(true);
    setParseLogs([]);
    setParseError("");
    setSelectedPointIds(initialProduct.sellingPoints.filter((point) => point.risk !== "danger").slice(0, 4).map((point) => point.id));
    setStep(initialTemplate ? 2 : 1);
  }, [initialProduct]);

  uE(() => {
    if (!initialTemplate) return;
    setTemplatePreset(initialTemplate);
    if (product) setStep(2);
  }, [initialTemplate]);

  uE(() => {
    if ((forceParsing || initialLink) && link && !parsed && !parsing && !product) {
      startParse(link);
    }
  }, []);

  async function startParse(explicitLink) {
    setParsing(true);
    setParseError("");
    setParseLogs([]);
    try {
      const result = await AdShotBackend.parseProduct(explicitLink || link);
      setProduct(result.product);
      setParseLogs(result.logs);
      setSelectedPointIds(result.product.sellingPoints.filter((point) => point.risk !== "danger").slice(0, 4).map((point) => point.id));
      setParsed(true);
    } catch (err) {
      setParseError(err.message || "解析失败,请检查链接");
      setParsed(false);
    } finally {
      setParsing(false);
    }
  }

  const selectedPoints = product ? product.sellingPoints.filter((point) => selectedPointIds.includes(point.id)) : [];

  const createJob = (config) => {
    const job = AdShotBackend.createGenerationJob({
      product,
      sellingPoints: selectedPoints,
      styles: config.styles,
      perStyle: config.perStyle,
      modelId: config.modelId,
      duration: config.duration,
      aspect: config.aspect,
    });
    setJobId(job.id);
    setStep(3);
  };

  return (
    <div className="page fade-in">
      <StepIndicator steps={steps} current={step} />
      {step === 0 && <Step1Link value={link} setValue={(v) => { setLink(v); setParsed(false); setProduct(null); setParseLogs([]); }} parsing={parsing} parsed={parsed} error={parseError} logs={parseLogs} onParse={() => startParse()} onNext={() => setStep(1)} />}
      {step === 1 && product && <Step2Product product={product} selectedPointIds={selectedPointIds} setSelectedPointIds={setSelectedPointIds} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
      {step === 2 && product && <Step3Script product={product} selectedPoints={selectedPoints} templatePreset={templatePreset} onBack={() => setStep(1)} onNext={createJob} />}
      {step === 3 && jobId && <Step4Generating jobId={jobId} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
      {step === 4 && jobId && <Step5Pick jobId={jobId} onBack={() => setStep(3)} onComplete={() => setRoute("library")} />}
    </div>
  );
}

window.GeneratePage = GeneratePage;
