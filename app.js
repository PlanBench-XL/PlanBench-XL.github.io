const DATA_URL = "./assets/data/site-data.json?v=20260621-03";
const ASSET_VERSION = "20260621-03";

const TOOL_FAMILY_LABELS = {
  gold: "Golden Tool",
  noisy: "Noisy Tool",
  blocker: "Blocker Tool",
};

const TOOL_SUBTYPE_LABELS = {
  condition_limited: "Condition-Limited",
  deprecated: "Deprecated",
  irrelevant: "Semantic Misleading",
  miswired_or_unreliable: "Unreliable",
  non_authoritative_value: "Non-Authoritative Value",
  return_counterfactual: "Implicit Failure",
  return_error: "Explicit Failure",
  stale: "Stale",
};

const UI_ICONS = {
  signalQuery: `
    <svg viewBox="0 0 24 24" class="signal-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 7.25H18V15.75H10.25L7 18.75V15.75H6V7.25Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M9 10.75H15M9 13.5H13.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  signalTools: `
    <svg viewBox="0 0 24 24" class="signal-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 6.5H18.5V17.5H5.5V6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M9 6.5V17.5M14.75 10H18.5M14.75 14H18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  signalDatatype: `
    <svg viewBox="0 0 24 24" class="signal-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="17" cy="7" r="2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="12" cy="17" r="2" stroke="currentColor" stroke-width="1.8" />
      <path d="M8.8 8.2L10.9 15M15.2 8.2L13.1 15M9 7H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  statQuery: `
    <svg viewBox="0 0 24 24" class="stat-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 7.25H18V15.75H10.25L7 18.75V15.75H6V7.25Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M9 10.75H15M9 13.5H13.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  statTools: `
    <svg viewBox="0 0 24 24" class="stat-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 7H10.5V12H5.5V7ZM13.5 7H18.5V12H13.5V7ZM5.5 14H10.5V19H5.5V14ZM13.5 14H18.5V19H13.5V14Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
    </svg>
  `,
  statDatatypes: `
    <svg viewBox="0 0 24 24" class="stat-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="17" cy="7" r="2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="12" cy="17" r="2" stroke="currentColor" stroke-width="1.8" />
      <path d="M8.8 8.2L10.9 15M15.2 8.2L13.1 15M9 7H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  `,
  statArity: `
    <svg viewBox="0 0 24 24" class="stat-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 8.5H17.5M6.5 15.5H17.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="6.5" cy="8.5" r="1.75" fill="currentColor" />
      <circle cx="12" cy="8.5" r="1.75" fill="currentColor" opacity="0.72" />
      <circle cx="17.5" cy="8.5" r="1.75" fill="currentColor" opacity="0.44" />
      <circle cx="9.25" cy="15.5" r="1.75" fill="currentColor" />
      <circle cx="14.75" cy="15.5" r="1.75" fill="currentColor" opacity="0.62" />
    </svg>
  `,
  statTurns: `
    <svg viewBox="0 0 24 24" class="stat-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6.75" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 8.75V12.25L14.75 14.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
};

function byId(id) {
  return document.getElementById(id);
}

async function loadData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load ${DATA_URL}: ${response.status}`);
  }
  return response.json();
}

function renderSignals(stats) {
  const entries = [
    {
      label: "Query count",
      value: `${stats.total_queries} retail queries`,
      icon: UI_ICONS.signalQuery,
    },
    {
      label: "Tool inventory",
      value: `${stats.total_tools} total tools`,
      icon: UI_ICONS.signalTools,
    },
    {
      label: "Datatype space",
      value: `${stats.total_datatypes} typed information states`,
      icon: UI_ICONS.signalDatatype,
    },
  ];

  const root = byId("signal-grid");
  if (!root) return;
  root.innerHTML = entries
    .map(
      (entry) => `
        <div class="signal-card">
          <div class="signal-card-head">
            <span class="signal-icon" aria-hidden="true">${entry.icon}</span>
            <strong>${entry.label}</strong>
          </div>
          <span>${entry.value}</span>
        </div>
      `,
    )
    .join("");
}

function renderStats(stats) {
  const cards = [
    {
      value: stats.total_queries,
      label: "Queries",
      icon: UI_ICONS.statQuery,
    },
    {
      value: 1665,
      label: "Tools",
      icon: UI_ICONS.statTools,
    },
    {
      value: stats.total_datatypes,
      label: "Datatypes",
      icon: UI_ICONS.statDatatypes,
    },
    {
      value: `${stats.min_input_arity}-${stats.max_input_arity}`,
      label: "Input arity range",
      icon: UI_ICONS.statArity,
    },
    {
      value: 100,
      label: "Maximum turns",
      icon: UI_ICONS.statTurns,
    },
  ];

  const root = byId("stats-grid");
  if (!root) return;
  root.innerHTML = cards
    .map(
      (card) => `
        <article class="stat-card">
          <div class="stat-card-head">
            <span class="stat-icon" aria-hidden="true">${card.icon}</span>
            <div class="stat-label">${card.label}</div>
          </div>
          <div class="stat-num">${card.value}</div>
        </article>
      `,
    )
    .join("");
}

function renderResultTable(rows, targetId) {
  const root = byId(targetId);
  if (!root) return;

  const columnDefs = [
    {
      key: "accuracy",
      label: "Accuracy (%)",
      decimals: 2,
      better: "high",
      color: { start: [255, 252, 245], end: [196, 213, 188] },
    },
    {
      key: "egt_precision",
      label: "EGT Prec. (%)",
      decimals: 2,
      better: "high",
      color: { start: [248, 251, 253], end: [174, 195, 225] },
    },
    {
      key: "turns",
      label: "Avg. Turns",
      decimals: 2,
      better: "low",
      color: { start: [252, 250, 247], end: [209, 212, 217] },
    },
    {
      key: "mean_edt",
      label: "Mean EDT",
      decimals: 2,
      better: "high",
      color: { start: [255, 252, 246], end: [236, 214, 186] },
    },
    {
      key: "search_call_ratio",
      label: "S/C",
      decimals: 2,
      better: "low",
      color: { start: [250, 252, 248], end: [199, 220, 212] },
    },
    {
      key: "itcr",
      label: "ITCR",
      decimals: 2,
      better: "low",
      color: { start: [255, 251, 248], end: [229, 198, 201] },
    },
    {
      key: "uirr",
      label: "UIRR (%)",
      decimals: 2,
      better: "low",
      color: { start: [251, 249, 253], end: [212, 205, 225] },
    },
  ];

  const ranges = Object.fromEntries(
    columnDefs.map((column) => {
      const values = rows
        .map((row) => row[column.key])
        .filter((value) => Number.isFinite(value));
      return [
        column.key,
        {
          min: Math.min(...values),
          max: Math.max(...values),
        },
      ];
    }),
  );

  const mixChannel = (start, end, ratio) => Math.round(start + (end - start) * ratio);
  const isNumeric = (value) => Number.isFinite(value);

  const formatHeatColor = (value, column) => {
    const { min, max } = ranges[column.key];
    const span = max - min || 1;
    let ratio = (value - min) / span;
    if (column.better === "low") {
      ratio = 1 - ratio;
    }
    ratio = Math.max(0, Math.min(1, ratio));
    const eased = Math.pow(ratio, 0.92);
    const red = mixChannel(column.color.start[0], column.color.end[0], eased);
    const green = mixChannel(column.color.start[1], column.color.end[1], eased);
    const blue = mixChannel(column.color.start[2], column.color.end[2], eased);
    return `rgba(${red}, ${green}, ${blue}, 0.96)`;
  };

  const sortedRows = [...rows].sort((left, right) => {
    const leftAcc = isNumeric(left.accuracy) ? left.accuracy : -Infinity;
    const rightAcc = isNumeric(right.accuracy) ? right.accuracy : -Infinity;
    if (rightAcc !== leftAcc) return rightAcc - leftAcc;
    return String(left.model).localeCompare(String(right.model));
  });

  let rankCounter = 0;
  root.innerHTML = sortedRows
    .map((row) => {
      const rank = isNumeric(row.accuracy) ? ++rankCounter : "-";
      const rankClass =
        rank === 1
          ? " rank-badge-top-1"
          : rank === 2
            ? " rank-badge-top-2"
            : rank === 3
              ? " rank-badge-top-3"
              : "";
      const metricCells = columnDefs
        .map((column) => {
          const value = row[column.key];
          if (!isNumeric(value)) {
            return `
              <td class="metric-value-cell">
                <span class="metric-chip metric-chip-empty">-</span>
              </td>
            `;
          }

          return `
            <td class="metric-value-cell">
              <span class="metric-chip metric-chip-${column.key}" style="--metric-fill: ${formatHeatColor(value, column)};">
                ${value.toFixed(column.decimals)}
              </span>
            </td>
          `;
        })
        .join("");

      return `
        <tr class="leaderboard-row">
          <td class="rank-cell">
            <span class="rank-badge${rankClass}">${rank}</span>
          </td>
          <td class="model-cell" data-label="Model">
            <div class="model-entry">
              <div class="model-topline">
                <strong class="model-name">${row.model}</strong>
              </div>
            </div>
          </td>
          ${metricCells}
        </tr>
      `;
    })
    .join("");
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      const tabs = button.parentElement.querySelectorAll(".tab-btn");
      tabs.forEach((tab) => tab.classList.toggle("active", tab === button));

      const section = button.closest("section, .results-shell");
      if (!section) return;
      section.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === target);
      });
    });
  });
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-999px";
  textarea.style.left = "-999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Copy command was not available.");
  }
}

function setupCitationCopy() {
  const button = byId("copy-citation");
  const citation = byId("citation-bibtex");
  if (!button || !citation) return;

  const label = button.querySelector("span");
  const initialLabel = label?.textContent || "Copy";
  let resetTimer;

  button.addEventListener("click", async () => {
    const text = citation.textContent.trim();
    if (!text) return;

    button.disabled = true;
    try {
      await copyTextToClipboard(text);
      button.classList.add("copied");
      if (label) label.textContent = "Copied";
    } catch (error) {
      if (label) label.textContent = "Failed";
      console.error(error);
    } finally {
      button.disabled = false;
      clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        button.classList.remove("copied");
        if (label) label.textContent = initialLabel;
      }, 1800);
    }
  });
}

function renderDatatypePanel(data) {
  const categories = new Map();
  data.datatypes.forEach((dtype) => {
    categories.set(dtype.category, (categories.get(dtype.category) || 0) + 1);
  });

  const filterRoot = byId("datatype-category-filter");
  const countRoot = byId("datatype-count");
  const gridRoot = byId("datatype-grid");
  if (!filterRoot || !countRoot || !gridRoot) return;

  const categoryOptions = [...categories.keys()].sort((a, b) => a.localeCompare(b));
  filterRoot.innerHTML = [
    `<option value="">All categories</option>`,
    ...categoryOptions.map((name) => `<option value="${name}">${name}</option>`),
  ].join("");

  const renderGrid = (activeCategory = "") => {
    const rows = activeCategory
      ? data.datatypes.filter((dtype) => dtype.category === activeCategory)
      : data.datatypes;

    countRoot.textContent = `${rows.length} datatypes`;

    gridRoot.innerHTML = rows
      .map(
        (dtype) => `
          <article class="datatype-card">
            <div class="datatype-head">
              <h3>${dtype.name}</h3>
              <span class="meta-pill">${dtype.category}</span>
            </div>
            <p>${dtype.description}</p>
            <div class="datatype-meta">
              <div class="datatype-meta-row"><strong>Type:</strong> ${dtype.value_type}</div>
              ${dtype.example != null ? `<div class="datatype-meta-row"><strong>Example:</strong> <code>${String(dtype.example)}</code></div>` : ""}
            </div>
            ${dtype.aliases?.length
            ? `
                  <div class="alias-block">
                    <strong>Alias</strong>
                    <div class="alias-row">${dtype.aliases.slice(0, 5).map((alias) => `<span class="soft-pill">${alias}</span>`).join("")}</div>
                  </div>
                `
            : ""
          }
          </article>
        `,
      )
      .join("");
  };

  filterRoot.addEventListener("change", () => {
    renderGrid(filterRoot.value);
  });

  renderGrid();
}

function renderQueries(samples) {
  const root = byId("query-grid");
  if (!root) return;
  root.innerHTML = samples
    .map(
      (sample) => `
        <article class="query-card">
          <div class="query-header">
            <h3>${sample.query_id}</h3>
          </div>
          <p class="query-text">${sample.query_text}</p>
          <div class="label-block">
            <strong>Input datatypes</strong>
            <div class="pill-row">
              ${sample.input_datatypes?.length
          ? sample.input_datatypes.map((dtype) => `<span class="soft-pill">${dtype}</span>`).join("")
          : `<span class="soft-pill">none</span>`
        }
            </div>
          </div>
          <div class="label-block">
            <strong>Target datatype</strong>
            <div class="pill-row"><span class="meta-pill">${sample.target_datatype || "none"}</span></div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderPaths(samples) {
  const root = byId("path-grid");
  if (!root) return;
  root.innerHTML = samples
    .map(
      (sample) => {
        const stepCount = Number(sample.steps) || sample.path?.length || 0;
        const stepLabel = `${stepCount} tool call${stepCount === 1 ? "" : "s"}`;
        const inputDatatypes = sample.input_datatypes?.length
          ? sample.input_datatypes.map((dtype) => `<span class="meta-pill">${dtype}</span>`).join("")
          : `<span class="meta-pill">none</span>`;
        const targetDatatype = sample.target_datatype
          ? `<span class="meta-pill">${sample.target_datatype}</span>`
          : `<span class="meta-pill">none</span>`;
        const queryIdLabel = sample.query_id
          ? ` <span class="path-query-id">(${sample.query_id})</span>`
          : "";
        const shortestPath = sample.path?.length
          ? sample.path.map((tool) => `<span class="path-pill">${tool}</span>`).join("")
          : `<span class="soft-pill">none</span>`;

        return `
        <article class="path-card">
          <div class="label-block">
            <strong>Query${queryIdLabel}</strong>
            <p class="path-query">${sample.query_text}</p>
          </div>
          <div class="label-block">
            <strong>Input datatypes</strong>
            <div class="pill-row">${inputDatatypes}</div>
          </div>
          <div class="label-block">
            <strong>Target datatypes</strong>
            <div class="pill-row">${targetDatatype}</div>
          </div>
          <div class="label-block">
            <strong>Shortest path length</strong>
            <div class="pill-row"><span class="meta-pill path-length-pill">${stepLabel}</span></div>
          </div>
          <div class="label-block">
            <strong>One of the shortest path</strong>
            <div class="path-chain">${shortestPath}</div>
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function setupTakeawayCarousel(takeaways, idPrefix, emptyLabel) {
  const stage = byId(`takeaway-${idPrefix}-stage`);
  const prevButton = byId(`takeaway-${idPrefix}-prev`);
  const nextButton = byId(`takeaway-${idPrefix}-next`);
  const counter = byId(`takeaway-${idPrefix}-counter`);
  const dots = byId(`takeaway-${idPrefix}-dots`);

  if (!stage || !prevButton || !nextButton || !counter || !dots) return;

  if (!takeaways?.length) {
    stage.innerHTML = `<div class="empty-state">${emptyLabel}</div>`;
    prevButton.disabled = true;
    nextButton.disabled = true;
    counter.textContent = "0 / 0";
    dots.innerHTML = "";
    return;
  }

  let index = 0;

  function update() {
    const item = takeaways[index];
    const pageLabel = String(index + 1).padStart(2, "0");
    const support = renderTakeawaySupport(item);

    stage.innerHTML = `
      <article class="takeaway-card">
        <div class="takeaway-card-head">
          <span class="takeaway-page">${pageLabel}</span>
        </div>
        <p class="takeaway-statement">${item.text}</p>
        ${support}
      </article>
    `;

    counter.textContent = `${index + 1} / ${takeaways.length}`;
    prevButton.disabled = index === 0;
    nextButton.disabled = index === takeaways.length - 1;

    dots.innerHTML = takeaways
      .map(
        (_, dotIndex) => `
          <button
            type="button"
            class="takeaway-dot${dotIndex === index ? " active" : ""}"
            data-index="${dotIndex}"
            aria-label="Go to takeaway ${dotIndex + 1}"
            aria-pressed="${dotIndex === index ? "true" : "false"}"
          ></button>
        `,
      )
      .join("");

    dots.querySelectorAll(".takeaway-dot").forEach((button) => {
      button.addEventListener("click", () => {
        index = Number(button.dataset.index);
        update();
      });
    });
  }

  prevButton.addEventListener("click", () => {
    if (index === 0) return;
    index -= 1;
    update();
  });

  nextButton.addEventListener("click", () => {
    if (index >= takeaways.length - 1) return;
    index += 1;
    update();
  });

  update();
}

function renderTakeaways(takeaways) {
  const groups = {
    experiment: takeaways.filter((item) => item.source === "Experiment Results"),
    analysis: takeaways.filter((item) => item.source === "Further Analysis"),
    error: takeaways.filter((item) => item.source === "Error Analysis"),
  };

  setupTakeawayCarousel(groups.experiment, "experiment", "Experiment result takeaways will appear here once available.");
  setupTakeawayCarousel(groups.analysis, "analysis", "Further analysis takeaways will appear here once available.");
  setupTakeawayCarousel(groups.error, "error", "Error analysis takeaways will appear here once available.");
}

function buildFilterPills(state) {
  const pills = [];
  if (state.query) pills.push(`keyword: ${state.query}`);
  if (state.input) pills.push(`input: ${state.input}`);
  if (state.output) pills.push(`output: ${state.output}`);
  if (state.arity) pills.push(`arity: ${state.arity}`);
  if (state.family) pills.push(`type: ${displayToolFamilyLabel(state.family)}`);
  if (state.strict) pills.push("strict only");
  return pills;
}

function titleCaseToken(value) {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function displayToolFamilyLabel(value) {
  return TOOL_FAMILY_LABELS[value] || titleCaseToken(value);
}

function displayToolSubtypeLabel(value) {
  return TOOL_SUBTYPE_LABELS[value] || titleCaseToken(value);
}

function renderTakeawayBullets(bullets) {
  if (!Array.isArray(bullets) || !bullets.length) return "";
  return `
    <ul class="takeaway-bullets">
      ${bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
    </ul>
  `;
}

function versionedAssetUrl(src) {
  if (!src) return "";
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}v=${ASSET_VERSION}`;
}

function renderTakeawayFigure(figure, index, item) {
  const layoutClass = figure.layout === "split" ? " takeaway-figure-split" : "";
  const imageStyle = figure.scale ? ` style="--figure-image-scale: ${figure.scale};"` : "";
  const imageAlt = figure.alt || figure.caption || item.source || `Takeaway figure ${index + 1}`;
  const media = figure.src
    ? figure.scale
      ? `<div class="takeaway-image-frame"${imageStyle}><img src="${versionedAssetUrl(figure.src)}" alt="${imageAlt}" /></div>`
      : `<img src="${versionedAssetUrl(figure.src)}" alt="${imageAlt}" />`
    : `<div class="takeaway-figure-placeholder">${figure.placeholder || `Figure ${index + 1} placeholder`}</div>`;
  return `
    <figure class="takeaway-figure${layoutClass}">
      ${media}
      ${figure.caption ? `<figcaption>${figure.caption}</figcaption>` : ""}
    </figure>
  `;
}

function renderTakeawayFigureGroup(figures, item) {
  if (!Array.isArray(figures) || !figures.length) return "";
  return `
    <div class="takeaway-figure-group">
      ${figures.map((figure, index) => renderTakeawayFigure(figure, index, item)).join("")}
    </div>
  `;
}

function renderTakeawaySupport(item) {
  const parts = [];

  if (Array.isArray(item.support) && item.support.length) {
    item.support.forEach((entry, index) => {
      if (entry.type === "detail" && entry.text) {
        parts.push(`<p class="takeaway-detail">${entry.text}</p>`);
      } else if (entry.type === "bullets") {
        parts.push(renderTakeawayBullets(entry.items || entry.bullets));
      } else if (entry.type === "image" || entry.type === "figure") {
        parts.push(renderTakeawayFigure(entry, index, item));
      } else if (entry.type === "figureGroup" || entry.type === "imageGroup") {
        parts.push(renderTakeawayFigureGroup(entry.items || entry.images || entry.figures, item));
      }
    });

    return parts.length ? `<div class="takeaway-support">${parts.join("")}</div>` : "";
  }

  if (item.detail) {
    parts.push(`<p class="takeaway-detail">${item.detail}</p>`);
  }

  if (Array.isArray(item.bullets) && item.bullets.length) {
    parts.push(renderTakeawayBullets(item.bullets));
  }

  const figures = Array.isArray(item.images)
    ? item.images
    : item.image
      ? [
        {
          src: item.image,
          alt: item.image_alt,
          caption: item.image_caption,
        },
      ]
      : [];

  if (figures.length) {
    parts.push(
      figures
        .map((figure, index) => renderTakeawayFigure(figure, index, item))
        .join(""),
    );
  }

  if (!parts.length) return "";
  return `<div class="takeaway-support">${parts.join("")}</div>`;
}

function renderToolCard(tool) {
  const inputs = tool.input_datatypes.length
    ? tool.input_datatypes.map((dt) => `<span class="soft-pill">${dt}</span>`).join("")
    : `<span class="soft-pill">none</span>`;
  const params = tool.parameter_names.length
    ? tool.parameter_names.map((name) => `<span class="soft-pill">${name}</span>`).join("")
    : `<span class="soft-pill">none</span>`;
  const familyBadges = [
    `<span class="meta-pill tool-family-pill tool-family-${tool.tool_family}">${displayToolFamilyLabel(tool.tool_family)}</span>`,
    tool.noise_type ? `<span class="soft-pill tool-subtype-pill">${displayToolSubtypeLabel(tool.noise_type)}</span>` : "",
  ]
    .filter(Boolean)
    .join("");
  const goldenToolBlock =
    tool.tool_family !== "gold" && tool.baseline_tool_name
      ? `
      <div class="label-block">
        <strong>Golden tool</strong>
        <div class="pill-row"><span class="meta-pill">${tool.baseline_tool_name}</span></div>
      </div>
    `
      : "";

  return `
    <article class="tool-card">
      <div class="tool-header">
        <div>
          <h3>${tool.name}</h3>
        </div>
        <span class="meta-pill">${tool.input_arity} inputs</span>
      </div>
      <p class="tool-description">${tool.description}</p>
      <div class="label-block">
        <strong>Tool family</strong>
        <div class="pill-row">${familyBadges}</div>
      </div>
      ${goldenToolBlock}
      <div class="label-block">
        <strong>Input datatypes</strong>
        <div class="pill-row">${inputs}</div>
      </div>
      <div class="label-block">
        <strong>Output datatype</strong>
        <div class="pill-row"><span class="meta-pill">${tool.output_datatype || "none"}</span></div>
      </div>
      <div class="label-block">
        <strong>Parameters</strong>
        <div class="pill-row">${params}</div>
      </div>
      <details>
        <summary>Raw parameter schema</summary>
        <pre>${JSON.stringify(tool.parameters, null, 2)}</pre>
      </details>
    </article>
  `;
}

function setupToolExplorer(data) {
  const state = {
    query: "",
    input: "",
    output: "",
    arity: "",
    family: "",
    strict: false,
  };

  const searchInput = byId("search-input");
  const inputFilter = byId("input-filter");
  const outputFilter = byId("output-filter");
  const arityFilter = byId("arity-filter");
  const familyFilter = byId("family-filter");
  const strictFilter = byId("strict-filter");
  const clearButton = byId("clear-filters");
  const summaryRoot = byId("filter-summary");
  const countRoot = byId("tool-count");
  const resultsRoot = byId("tool-results");

  if (
    !searchInput ||
    !inputFilter ||
    !outputFilter ||
    !arityFilter ||
    !familyFilter ||
    !strictFilter ||
    !clearButton ||
    !summaryRoot ||
    !countRoot ||
    !resultsRoot
  ) {
    return;
  }

  data.datatype_names.forEach((name) => {
    inputFilter.insertAdjacentHTML("beforeend", `<option value="${name}">${name}</option>`);
    outputFilter.insertAdjacentHTML("beforeend", `<option value="${name}">${name}</option>`);
  });

  function applyFilters() {
    let rows = [...data.tools];
    const query = state.query.trim().toLowerCase();
    if (query) rows = rows.filter((tool) => tool.search_blob.includes(query));
    if (state.input) rows = rows.filter((tool) => tool.input_datatypes.includes(state.input));
    if (state.output) rows = rows.filter((tool) => tool.output_datatype === state.output);
    if (state.arity) {
      rows = rows.filter((tool) => (state.arity === "5+" ? tool.input_arity >= 5 : tool.input_arity === Number(state.arity)));
    }
    if (state.family) rows = rows.filter((tool) => tool.tool_family === state.family);
    if (state.strict) rows = rows.filter((tool) => tool.strict);

    const pills = buildFilterPills(state);
    summaryRoot.innerHTML = pills.length
      ? pills.map((label) => `<span class="meta-pill">${label}</span>`).join("")
      : `<span class="soft-pill">No active filters</span>`;
    countRoot.textContent = `${rows.length} / ${data.tools.length} tools`;
    resultsRoot.innerHTML = rows.length
      ? rows.slice(0, 24).map(renderToolCard).join("")
      : `<div class="empty-state">No tools match the current filter combination.</div>`;
  }

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    applyFilters();
  });
  inputFilter.addEventListener("change", (event) => {
    state.input = event.target.value;
    applyFilters();
  });
  outputFilter.addEventListener("change", (event) => {
    state.output = event.target.value;
    applyFilters();
  });
  arityFilter.addEventListener("change", (event) => {
    state.arity = event.target.value;
    applyFilters();
  });
  familyFilter.addEventListener("change", (event) => {
    state.family = event.target.value;
    applyFilters();
  });
  strictFilter.addEventListener("change", (event) => {
    state.strict = event.target.checked;
    applyFilters();
  });
  clearButton.addEventListener("click", () => {
    state.query = "";
    state.input = "";
    state.output = "";
    state.arity = "";
    state.family = "";
    state.strict = false;
    searchInput.value = "";
    inputFilter.value = "";
    outputFilter.value = "";
    arityFilter.value = "";
    familyFilter.value = "";
    strictFilter.checked = false;
    applyFilters();
  });

  applyFilters();
}

function renderError(error) {
  document.body.innerHTML = `
    <main class="container" style="padding: 4rem 0;">
      <div class="empty-state">
        <h1>Could not load site data</h1>
        <p>${error.message}</p>
        <p>Run <code>python3 website_new/scripts/build_data.py</code> to regenerate the static data bundle.</p>
      </div>
    </main>
  `;
}

loadData()
  .then((data) => {
    renderStats(data.stats);
    renderResultTable(data.results.default || [], "default-results-table");
    renderTakeaways(data.takeaways || []);
    renderDatatypePanel(data);
    renderQueries(data.sample_queries || []);
    renderPaths(data.sample_paths || []);
    setupToolExplorer(data);
    setupTabs();
    setupCitationCopy();
  })
  .catch(renderError);
