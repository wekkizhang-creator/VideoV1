/* global React */
// 轻量 SVG 图标库 - 风格统一(线性 1.5px stroke)
const Icon = ({ d, size = 16, fill = "none", stroke = "currentColor", strokeWidth = 1.6, viewBox = "0 0 24 24", children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const I = {
  Home: (p) => <Icon {...p}><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z"/></Icon>,
  Sparkle: (p) => <Icon {...p}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 14l.9 2.5L21 17.4l-2.1.9L18 21l-.9-2.7-2.1-.9 2.1-.9L18 14z"/></Icon>,
  Folder: (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></Icon>,
  Chart: (p) => <Icon {...p}><path d="M3 21h18M7 17V10M12 17V5M17 17v-7"/></Icon>,
  Box: (p) => <Icon {...p}><path d="M21 8.4 12 13 3 8.4M12 13v9M21 8.4V17l-9 4.6L3 17V8.4M21 8.4 12 3.8 3 8.4"/></Icon>,
  User: (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>,
  Bell: (p) => <Icon {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16zM10 20a2 2 0 0 0 4 0"/></Icon>,
  Settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>,
  ArrowRight: (p) => <Icon {...p}><path d="M5 12h14m-6-6 6 6-6 6"/></Icon>,
  ArrowUp: (p) => <Icon {...p}><path d="M12 19V5m-6 6 6-6 6 6"/></Icon>,
  ArrowDown: (p) => <Icon {...p}><path d="M12 5v14m6-6-6 6-6-6"/></Icon>,
  Check: (p) => <Icon {...p}><path d="m20 6-11 11-5-5"/></Icon>,
  X: (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Link: (p) => <Icon {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></Icon>,
  Zap: (p) => <Icon {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></Icon>,
  Coin: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M9 9.5a3 3 0 0 1 6 0c0 1.5-1.5 2-3 2.5s-3 1-3 2.5a3 3 0 0 0 6 0M12 7v10"/></Icon>,
  Play: (p) => <Icon {...p}><path d="M7 5v14l12-7-12-7z"/></Icon>,
  Pause: (p) => <Icon {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></Icon>,
  Download: (p) => <Icon {...p}><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></Icon>,
  Upload: (p) => <Icon {...p}><path d="M12 21V9m-5 5 5-5 5 5M5 3h14"/></Icon>,
  Filter: (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></Icon>,
  Sort: (p) => <Icon {...p}><path d="M3 6h18M6 12h12M10 18h4"/></Icon>,
  Grid: (p) => <Icon {...p}><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></Icon>,
  List: (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>,
  Eye: (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>,
  More: (p) => <Icon {...p}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></Icon>,
  Copy: (p) => <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>,
  Edit: (p) => <Icon {...p}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></Icon>,
  Trash: (p) => <Icon {...p}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Icon>,
  Star: (p) => <Icon {...p}><path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z"/></Icon>,
  Warning: (p) => <Icon {...p}><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.7 3h16.96a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></Icon>,
  Info: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></Icon>,
  Shield: (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>,
  ChevronLeft: (p) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>,
  ChevronRight: (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>,
  ChevronDown: (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  Refresh: (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/></Icon>,
  Tag: (p) => <Icon {...p}><path d="M20.59 13.41 13 21l-9-9V4h8l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="8" cy="8" r="1"/></Icon>,
  Wand: (p) => <Icon {...p}><path d="m15 4-2 2 5 5 2-2-5-5zM12 7 4 15v4h4l8-8M9 10l5 5"/></Icon>,
  Film: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M3 16h18M8 3v18M16 3v18"/></Icon>,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Tiktok: (p) => <Icon {...p}><path d="M9 3h3v12a3 3 0 1 1-3-3"/><path d="M12 3c.5 2.5 2.5 4.5 5 5"/></Icon>,
  Layers: (p) => <Icon {...p}><path d="m12 2 10 6-10 6L2 8l10-6zM2 16l10 6 10-6M2 12l10 6 10-6"/></Icon>,
  Trend: (p) => <Icon {...p}><path d="m3 17 6-6 4 4 8-8M14 7h7v7"/></Icon>,
  Diff: (p) => <Icon {...p}><path d="M12 3v18M3 7.5h6M3 16.5h6M15 7.5h6M15 16.5h6"/></Icon>,
};

window.I = I;
window.Icon = Icon;
