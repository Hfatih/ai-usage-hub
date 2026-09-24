const cardSelector = ".summary-strip, .provider-card, .glass-panel, .dashboard-account-row, .sidebar-status, .detected-app, .privacy-note, .ready-card";

function starField(width: number, height: number) {
  const stars: string[] = [];
  const columns = Math.ceil(width / 100);
  const rows = Math.ceil(height / 120);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      if (Math.random() > .68) continue;
      const x = Math.round((column + .2 + Math.random() * .6) * width / columns);
      const y = Math.round((row + .2 + Math.random() * .6) * height / rows);
      const size = Math.round(4 + Math.random() * 4);
      const opacity = (.14 + Math.random() * .16).toFixed(2);
      stars.push(`<path d="M${x} ${y - size}L${x + 1} ${y - 1} ${x + size} ${y} ${x + 1} ${y + 1} ${x} ${y + size} ${x - 1} ${y + 1} ${x - size} ${y} ${x - 1} ${y - 1}Z" opacity="${opacity}"/>`);
    }
  }
  const dots = Math.round(width * height * 35 / (1200 * 840));
  for (let dot = 0; dot < dots; dot++) {
    stars.push(`<circle cx="${Math.round(Math.random() * width)}" cy="${Math.round(Math.random() * height)}" r="${(1 + Math.random()).toFixed(1)}" opacity="${(.12 + Math.random() * .15).toFixed(2)}"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g fill="#ffc3d7">${stars.join("")}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function setStarFields() {
  const root = document.getElementById("root")!;
  const watched = new Set<HTMLElement>();
  const resize = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const card = entry.target as HTMLElement;
      const { width, height } = card.getBoundingClientRect();
      if (width && height) card.style.setProperty("--card-stars", starField(Math.ceil(width), Math.ceil(height)));
    }
  });
  const observeCards = () => {
    for (const card of watched) {
      if (root.contains(card)) continue;
      resize.unobserve(card);
      watched.delete(card);
    }
    root.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
      if (watched.has(card)) return;
      watched.add(card);
      resize.observe(card);
    });
  };
  new MutationObserver(observeCards).observe(root, { childList: true, subtree: true });
  observeCards();
}
