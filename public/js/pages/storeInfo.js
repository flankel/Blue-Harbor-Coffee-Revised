document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("./data/storeInfo.json");
    const data = await res.json();

    renderHero(data.hero);
    renderGallery(data.gallery);
    renderMap(data.map);
    renderStoreInfo(data);

  } catch (err) {
    console.error("storeInfoの読み込みに失敗:", err);
  }
});

/* =========================
   HERO
========================= */
function renderHero(hero) {
  const img = document.getElementById("hero-image");
  const title = document.getElementById("hero-title");

  if (img) img.src = hero.image;
  if (title) title.textContent = hero.title;
}

/* =========================
   GALLERY
========================= */
function renderGallery(gallery) {
  const container = document.getElementById("gallery");
  if (!container) return;

  container.innerHTML = gallery.map(item => `
    <img src="${item.src}"
         alt="${item.alt}"
         class="rounded-xl shadow-md w-full h-64 object-cover">
  `).join("");
}

/* =========================
   MAP
========================= */
function renderMap(map) {
  const mapImg = document.getElementById("map-image");
  const iframe = document.getElementById("google-map");

  if (mapImg) mapImg.src = map.image;
  if (iframe) iframe.src = map.googleEmbed;
}

/* =========================
   STORE INFO
========================= */
function renderStoreInfo(data) {
  const container = document.getElementById("store-info");
  if (!container) return;

  const store = data.store;

  container.innerHTML = `
    <h3 class="text-2xl font-bold mb-4 tracking-wide">${store.name}</h3>

    <div class="text-base mb-6 border-b border-gray-300 pb-4">
      <p>${store.address}</p>
      <p class="mt-2">
        TEL: <a href="tel:${store.phone.replace(/-/g, "")}" class="text-blue-600 hover:underline">${store.phone}</a>
      </p>
    </div>

    <p class="text-sm text-gray-700 leading-relaxed mb-6">
      ${store.concept}
    </p>

    <div class="mb-6 text-sm text-gray-600">
      <p class="font-eng font-bold mb-2 tracking-wide">ACCESS</p>
      ${store.access.map(a => `<p>${a}</p>`).join("")}
    </div>

    ${renderHours(data.hours)}

    ${renderFacilities(data.facilities)}

    ${renderSNS(data.sns)}
  `;
}

/* =========================
   HOURS
========================= */
function renderHours(hours) {
  return `
    <div class="mb-6">
      <p class="font-eng font-bold mb-3 tracking-wide">OPENING HOURS</p>
      <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden table-fixed">
        <tbody class="divide-y divide-gray-200">
          ${hours.map(h => {

            if (h.closed) {
              return `
                <tr>
                  <th class="bg-white px-3 py-2 text-left font-medium w-16">${h.day}</th>
                  <td class="px-3 py-2 font-bold text-red-600">CLOSED</td>
                </tr>
              `;
            }

            let rowClass = "";
            let textClass = "";

            if (h.highlight === "blue") {
              rowClass = "bg-blue-50";
              textClass = "text-blue-700 font-bold";
            }

            if (h.highlight === "red") {
              rowClass = "bg-red-50";
              textClass = "text-red-700 font-bold";
            }

            return `
              <tr class="${rowClass}">
                <th class="px-3 py-2 text-left w-16 ${textClass}">${h.day}</th>
                <td class="px-3 py-2 ${textClass}">
                  ${h.open} — ${h.close}
                  ${h.note ? `<div class="text-xs mt-1">${h.note}</div>` : ""}
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/* =========================
   FACILITIES
========================= */
function renderFacilities(facilities) {
  return `
    <div class="grid grid-cols-2 gap-y-3 text-sm">
      ${facilities.map(f => `
        <div class="font-eng font-medium text-gray-600">${f.label}</div>
        <div>${f.value}</div>
      `).join("")}
    </div>
  `;
}

/* =========================
   SNS
========================= */
function renderSNS(sns) {
  return `
    <div class="mt-6 text-sm">
      <p class="font-eng font-medium text-gray-600 mb-2">SNS</p>
      <a href="${sns.instagram}" class="text-blue-600 hover:underline mr-4">Instagram</a>
      <a href="${sns.twitter}" class="text-blue-600 hover:underline">X (Twitter)</a>
    </div>
  `;
}