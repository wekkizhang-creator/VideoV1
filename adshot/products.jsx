/* global React, I, AdShotBackend */
const { useState: uP, useEffect: uEP } = React;

function ProductCard({ product, onUse, onRefresh }) {
  const riskCount = product.sellingPoints.filter((point) => point.risk !== "ok").length;
  const statusTone = product.status === "active" ? "success" : product.status === "watching" ? "warning" : undefined;
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ height: 118, background: product.color, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.56))" }} />
        <div style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
          <div style={{ fontSize: 16, color: "white", fontWeight: 800, lineHeight: 1.25, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>{product.shortName}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", marginTop: 4 }}>{product.platform} · {product.shop}</div>
        </div>
        <button
          className="icon-btn"
          style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, background: "rgba(0,0,0,0.35)", color: product.favorite ? "#fbbf24" : "white" }}
          onClick={() => onRefresh(AdShotBackend.toggleProductFavorite(product.id), product.favorite ? "已取消收藏" : "已收藏商品")}
        >
          <I.Star size={14} fill={product.favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div style={{ padding: 14 }}>
        <div className="row" style={{ gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span className="chip" data-tone="info">{product.category}</span>
          <span className="chip" data-tone={statusTone}>{product.status === "active" ? "可生成" : product.status === "watching" ? "观察中" : "已归档"}</span>
          {riskCount > 0 && <span className="chip" data-tone="warning"><I.Warning size={10} /> {riskCount} 个风险卖点</span>}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-0)", fontWeight: 600, lineHeight: 1.45, minHeight: 38 }}>{product.title}</div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "12px 0" }}>
          {[
            ["售价", `¥${product.price}`],
            ["佣金", `¥${product.commission}`],
            ["素材", product.assetCount || 0],
            ["生成", product.generatedCount || 0],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>{label}</div>
              <div className="text-mono" style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
          {product.sellingPoints.slice(0, 3).map((point) => (
            <div key={point.id} className="row" style={{ gap: 6, fontSize: 11, color: "var(--text-2)" }}>
              <I.Check size={10} stroke={point.risk === "ok" ? "var(--success)" : "var(--warning)"} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{point.text}</span>
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
          <button className="btn" data-variant="primary" data-size="sm" onClick={() => onUse(AdShotBackend.useProduct(product.id))}>
            <I.Sparkle size={11} stroke="white" /> 用此商品生成
          </button>
          <div className="row" style={{ gap: 4 }}>
            <button className="btn" data-size="sm" onClick={() => onRefresh(AdShotBackend.updateProductStatus(product.id, product.status === "archived" ? "active" : "archived"), product.status === "archived" ? "已恢复商品" : "已归档商品")}>
              {product.status === "archived" ? "恢复" : "归档"}
            </button>
            <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => onRefresh(AdShotBackend.deleteProduct(product.id), "已删除商品")}>
              <I.Trash size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ onUseProduct }) {
  const [query, setQuery] = uP("");
  const [status, setStatus] = uP("all");
  const [category, setCategory] = uP("all");
  const [favoriteOnly, setFavoriteOnly] = uP(false);
  const [data, setData] = uP(() => AdShotBackend.getProductLibraryData());
  const [link, setLink] = uP("");
  const [parsing, setParsing] = uP(false);
  const [notice, setNotice] = uP("");

  const filters = { query, status, category, favorite: favoriteOnly };

  uEP(() => {
    const refresh = () => setData(AdShotBackend.getProductLibraryData(filters));
    refresh();
    return AdShotBackend.subscribe(refresh);
  }, [query, status, category, favoriteOnly]);

  const refreshData = (next, message) => {
    setData(next);
    if (message) setNotice(message);
  };

  const parse = async () => {
    setParsing(true);
    setNotice("");
    try {
      const result = await AdShotBackend.parseProductToLibrary(link);
      setLink("");
      setData(result.library);
      setNotice(`已解析并入库: ${result.product.shortName}`);
    } catch (err) {
      setNotice(err.message || "解析失败");
    } finally {
      setParsing(false);
    }
  };

  const useProduct = (product) => {
    if (!product) return;
    onUseProduct(product);
  };

  return (
    <div className="page fade-in">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="h2" style={{ marginBottom: 4 }}>商品库</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>沉淀已解析商品、卖点、合规风险和历史生成记录</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {notice && <span style={{ fontSize: 11, color: notice.includes("失败") || notice.includes("请") ? "var(--warning)" : "var(--success)" }}>{notice}</span>}
          <button className="btn" data-size="sm" onClick={() => refreshData(AdShotBackend.getProductLibraryData(filters), "已刷新商品库")}><I.Refresh size={12} /> 刷新</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          ["商品总数", data.summary.total, "var(--text-0)"],
          ["可生成", data.summary.active, "var(--success)"],
          ["收藏", data.summary.favorite, "var(--brand-text)"],
          ["累计生成", data.summary.generated, "var(--warning)"],
        ].map(([label, value, color]) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</div>
            <div className="text-mono" style={{ fontSize: 24, color, fontWeight: 600, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px", position: "relative" }}>
            <I.Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input className="input" placeholder="搜索商品、店铺、类目..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 32, height: 32 }} />
          </div>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 140, height: 32, padding: "0 8px" }}>
            <option value="all">全部类目</option>
            {data.categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <div className="row" style={{ gap: 0, background: "var(--bg-2)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: 2 }}>
            {[["all", "全部"], ["active", "可生成"], ["watching", "观察中"], ["archived", "已归档"]].map(([id, label]) => (
              <button key={id} className="btn" data-size="sm" data-variant={status === id ? "primary" : "ghost"} onClick={() => setStatus(id)}>{label}</button>
            ))}
          </div>
          <button className="btn" data-size="sm" data-variant={favoriteOnly ? "primary" : "default"} onClick={() => setFavoriteOnly(!favoriteOnly)}>
            <I.Star size={11} /> 收藏
          </button>
        </div>
        <hr className="hr" style={{ margin: "12px 0" }} />
        <div className="row" style={{ gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <I.Link size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input className="input" placeholder="粘贴商品链接,解析后自动入库" value={link} onChange={(e) => setLink(e.target.value)} style={{ paddingLeft: 32, height: 34 }} />
          </div>
          <button className="btn" data-variant="primary" disabled={!link || parsing} onClick={parse}>
            {parsing ? <><I.Refresh size={12} stroke="white" className="spin" /> 解析中</> : <><I.Sparkle size={12} stroke="white" /> 解析入库</>}
          </button>
        </div>
      </div>

      {data.products.length ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} onUse={useProduct} onRefresh={refreshData} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-3)" }}>没有匹配的商品</div>
      )}
    </div>
  );
}

window.ProductsPage = ProductsPage;
