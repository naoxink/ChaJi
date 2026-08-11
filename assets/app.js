// Color de cada tipo de té, inspirado en el color real de su infusión.
const TYPE_COLORS = {
  "Oolong": "#c98a3c",
  "Té Amarillo": "#d9c15a",
  "Té Blanco": "#e8dfc0",
  "Yerba Mate": "#6b8f3d",
  "Té Negro": "#8a3f2e",
  "Shou Pu-erh": "#4a2f1c",
  "Sheng Pu-erh": "#8a7530",
};
const DEFAULT_COLOR = "#a8998a";

const state = {
  catas: [],
  stash: [],
  stashByName: new Map(), // nombre normalizado -> item de stash (para colorear catas)
  catasSearch: "",
  stashSearch: "",
  tipo: "",
  tienda: "",
  soloStock: false,
  openCata: null,
  openStash: null,
};

const els = {
  catasList: document.getElementById("catas-list"),
  catasSearch: document.getElementById("search-catas"),
  catasCount: document.getElementById("count-catas"),
  catasEmpty: document.getElementById("empty-catas"),

  stashList: document.getElementById("stash-list"),
  stashSearch: document.getElementById("search-stash"),
  filterTipo: document.getElementById("filter-tipo"),
  filterTienda: document.getElementById("filter-tienda"),
  filterStock: document.getElementById("filter-stock"),
  stashCount: document.getElementById("count-stash"),
  stashEmpty: document.getElementById("empty-stash"),
  legend: document.getElementById("legend"),
};

function normalize(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(str) {
  return (str || "").toString().replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function typeColorFor(tipo) {
  return TYPE_COLORS[tipo] || DEFAULT_COLOR;
}

// Deduce el color de una cata buscando su té correspondiente en la despensa.
function colorForCata(cata) {
  const match = state.stashByName.get(normalize(cata.nombre));
  return match ? typeColorFor(match.tipo) : DEFAULT_COLOR;
}

async function init() {
  showTab("catas");
  try {
    const [resCatas, resStash] = await Promise.all([
      fetch("data/catas.json"),
      fetch("data/stash.json"),
    ]);
    state.catas = await resCatas.json();
    state.stash = await resStash.json();
  } catch (err) {
    const msg = `<li class="empty-state">No se pudieron cargar los datos. Si has abierto el archivo directamente en el navegador, sírvelo con un servidor local (por ejemplo <code>python3 -m http.server</code>) y vuelve a intentarlo.</li>`;
    els.catasList.innerHTML = msg;
    els.stashList.innerHTML = msg;
    return;
  }

  state.stash.forEach((t) => state.stashByName.set(normalize(t.nombre), t));

  populateStashFilters();
  renderLegend();
  bindEvents();
  renderCatas();
  renderStash();
}

function showTab(tab) {
  document.getElementById("view-catas").hidden = tab !== "catas";
  document.getElementById("view-stash").hidden = tab !== "stash";
  document.getElementById("btn-catas").setAttribute("aria-selected", String(tab === "catas"));
  document.getElementById("btn-stash").setAttribute("aria-selected", String(tab === "stash"));
}
window.showTab = showTab;

function populateStashFilters() {
  const tipos = [...new Set(state.stash.map((t) => t.tipo))].sort((a, b) => a.localeCompare(b, "es"));
  const tiendas = [...new Set(state.stash.map((t) => t.tienda))].sort((a, b) => a.localeCompare(b, "es"));

  for (const tipo of tipos) {
    const opt = document.createElement("option");
    opt.value = tipo;
    opt.textContent = tipo;
    els.filterTipo.appendChild(opt);
  }
  for (const tienda of tiendas) {
    const opt = document.createElement("option");
    opt.value = tienda;
    opt.textContent = tienda;
    els.filterTienda.appendChild(opt);
  }
}

function renderLegend() {
  const tipos = [...new Set(state.stash.map((t) => t.tipo))].sort((a, b) => a.localeCompare(b, "es"));
  els.legend.innerHTML = tipos
    .map((tipo) => `<li><span class="swatch" style="background:${typeColorFor(tipo)}"></span>${escapeHtml(tipo)}</li>`)
    .join("");
}

function bindEvents() {
  els.catasSearch.addEventListener("input", (e) => { state.catasSearch = e.target.value; renderCatas(); });
  els.stashSearch.addEventListener("input", (e) => { state.stashSearch = e.target.value; renderStash(); });
  els.filterTipo.addEventListener("change", (e) => { state.tipo = e.target.value; renderStash(); });
  els.filterTienda.addEventListener("change", (e) => { state.tienda = e.target.value; renderStash(); });
  els.filterStock.addEventListener("click", () => {
    state.soloStock = !state.soloStock;
    els.filterStock.setAttribute("aria-pressed", String(state.soloStock));
    renderStash();
  });
}

/* ---------------- DIARIO (catas) ---------------- */

function getFilteredCatas() {
  const q = normalize(state.catasSearch);
  return [...state.catas]
    .filter((c) => {
      if (!q) return true;
      const haystack = normalize(
        [c.nombre, c.tienda, c.comentario, c.recipiente, ...(c.tags || [])].join(" ")
      );
      return haystack.includes(q);
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function renderCatas() {
  const filtered = getFilteredCatas();
  els.catasCount.textContent = `Mostrando ${filtered.length} de ${state.catas.length}`;
  els.catasEmpty.hidden = filtered.length !== 0 || state.catas.length === 0;
  els.catasList.hidden = filtered.length === 0;
  els.catasList.innerHTML = filtered.map((c) => renderCataRow(c)).join("");

  els.catasList.querySelectorAll(".row-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      state.openCata = state.openCata === id ? null : id;
      renderCatas();
    });
  });
}

function renderCataRow(c, i) {
  const id = c.fecha + "|" + c.nombre;
  const color = colorForCata(c);
  const isOpen = state.openCata === id;
  const tags = c.tags || [];

  return `
    <li class="stash-item ${isOpen ? "open" : ""}" style="--type-color:${color}">
      <button class="row-toggle" data-id="${escapeHtml(id)}" aria-expanded="${isOpen}">
        <span class="swatch" style="background:${color}"></span>
        <span class="row-main">
          <span class="row-name">${escapeHtml(c.nombre)}</span>
          <span class="row-meta">${escapeHtml(c.recipiente || "Gaiwan")} · ${escapeHtml(c.tienda || "N/A")}</span>
        </span>
        <span class="row-tags">
          ${tags.slice(0, 2).map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join("")}
        </span>
        <span class="row-status">
          <span class="date-chip">${escapeHtml(c.fecha)}</span>
          <span class="score">${escapeHtml(c.puntuacion)}<small>/5</small></span>
          <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
      </button>
      <div class="row-details">
        <div class="row-details-inner">
          ${c.comentario ? `<p class="detail-quote">"${escapeHtml(c.comentario)}"</p>` : ""}
          <div class="detail-row" style="margin-top:${c.comentario ? "10px" : "0"}">
            ${c.parametros ? `<span class="detail-label">Parámetros</span>${escapeHtml(c.parametros)}` : ""}
          </div>
          ${c.ingredientes ? `<div class="detail-row"><span class="detail-label">Ingredientes</span>${escapeHtml(c.ingredientes)}</div>` : ""}
          ${tags.length ? `<div class="detail-row"><span class="detail-label">Notas</span><div class="detail-tags">${tags.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join("")}</div></div>` : ""}
        </div>
      </div>
    </li>
  `;
}

/* ---------------- DESPENSA (stash) ---------------- */

function getFilteredStash() {
  const q = normalize(state.stashSearch);
  return [...state.stash]
    .filter((t) => {
      if (state.tipo && t.tipo !== state.tipo) return false;
      if (state.tienda && t.tienda !== state.tienda) return false;
      if (state.soloStock && !t.en_stock) return false;
      if (q) {
        const haystack = normalize([t.nombre, t.tipo, t.origen, t.tienda, ...(t.tags || [])].join(" "));
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

function renderStash() {
  const filtered = getFilteredStash();
  els.stashCount.textContent = `Mostrando ${filtered.length} de ${state.stash.length}`;
  els.stashEmpty.hidden = filtered.length !== 0;
  els.stashList.hidden = filtered.length === 0;
  els.stashList.innerHTML = filtered.map((t) => renderStashRow(t)).join("");

  els.stashList.querySelectorAll(".row-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      state.openStash = state.openStash === id ? null : id;
      renderStash();
    });
  });
}

function renderStashRow(t) {
  const color = typeColorFor(t.tipo);
  const isOpen = state.openStash === t.id;
  const hasYear = t.añada && t.añada !== "N/A";
  const tags = t.tags || [];
  const hasIngredients = !!t.ingredientes;

  return `
    <li class="stash-item ${isOpen ? "open" : ""}" style="--type-color:${color}">
      <button class="row-toggle" data-id="${t.id}" aria-expanded="${isOpen}">
        <span class="swatch" style="background:${color}" title="${escapeHtml(t.tipo)}"></span>
        <span class="row-main">
          <span class="row-name">${escapeHtml(t.nombre)}</span>
          <span class="row-meta"><span class="type-label">${escapeHtml(t.tipo)}</span> · ${escapeHtml(t.origen)} · ${escapeHtml(t.tienda)}</span>
        </span>
        <span class="row-tags">
          ${tags.slice(0, 2).map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
        </span>
        <span class="row-status">
          ${hasYear ? `<span class="year-chip">${escapeHtml(t.añada)}</span>` : ""}
          <span class="stock-dot ${t.en_stock ? "in" : "out"}" title="${t.en_stock ? "En stock" : "Agotado"}"></span>
          <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
      </button>
      <div class="row-details">
        <div class="row-details-inner">
          <div class="detail-row">
            <span class="detail-label">Estado</span>${t.en_stock ? "En stock" : "Agotado"}
            ${hasYear ? ` &nbsp;·&nbsp; <span class="detail-label">Añada</span>${escapeHtml(t.añada)}` : ""}
          </div>
          ${hasIngredients ? `<div class="detail-row"><span class="detail-label">Ingredientes</span>${escapeHtml(t.ingredientes)}</div>` : ""}
          ${tags.length ? `<div class="detail-row"><span class="detail-label">Notas</span><div class="detail-tags">${tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div></div>` : ""}
        </div>
      </div>
    </li>
  `;
}

init();
