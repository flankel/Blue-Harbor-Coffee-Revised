function syncMenuHeights() {
  const coffeeItems = document.querySelectorAll("#coffee .menu-item");
  const foodItems = document.querySelectorAll("#food .menu-item");
  const count = Math.min(coffeeItems.length, foodItems.length);

  if (window.innerWidth < 640) {
    for (let i = 0; i < count; i++) {
      coffeeItems[i].style.height = "auto";
      foodItems[i].style.height = "auto";
    }
    return;
  }

  for (let i = 0; i < count; i++) {
    coffeeItems[i].style.height = "auto";
    foodItems[i].style.height = "auto";

    const h = Math.max(
      coffeeItems[i].offsetHeight,
      foodItems[i].offsetHeight
    );

    coffeeItems[i].style.height = h + "px";
    foodItems[i].style.height = h + "px";
  }
}

async function loadMenu() {
  const res = await fetch("./data/menu.json");
  const data = await res.json();

  renderSetMenu(data.setmenu);
  renderList(data.coffee, "coffee", "COFFEE", "DRIP & ESPRESSO");
  renderList(data.food, "food", "SWEETS & FOOD", "HOMEMADE");

  syncMenuHeights();
}

function renderSetMenu(list) {
  const el = document.getElementById("setmenu");

  el.innerHTML = `
    <h3 class="font-eng text-2xl font-bold border-b border-white/20 pb-2 mb-12 text-center">
      <span>SET MENU</span>
      <span class="block text-[10px] text-gray-500 tracking-widest mt-1">
        TIME-BASED
      </span>
    </h3>
    <div class="space-y-20"></div>
  `;

  const container = el.querySelector(".space-y-20");

  let html = "";

  list.forEach(item => {
    const items = item.items
      .map(i => `<li>${i}</li>`)
      .join("");

    html += `
      <div class="max-w-2xl mx-auto px-4 text-center">
        <div class="overflow-hidden w-full rounded shadow-md mb-8">
          <img src="${item.img}" class="w-full h-[40vw] object-contain hover:scale-125 transition duration-500">
        </div>

        <h4 class="font-bold text-xl leading-snug">
          <span class="whitespace-nowrap">
            ${item.ja}
            <span class="font-eng text-blue-400">${item.price}</span>
          </span>
        </h4>

        <p class="text-sm text-gray-400 font-eng mt-1">${item.en}</p>
        <p class="text-sm text-gray-300 mt-3 tracking-wide">${item.time}</p>

        <ul class="text-base text-gray-200 space-y-2 mt-6 inline-block text-left leading-relaxed list-disc list-inside">
          ${items}
        </ul>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderList(list, id, titleMain, titleSub) {
  const el = document.getElementById(id);

  el.innerHTML = `
    <h3 class="font-eng text-2xl font-bold border-b border-white/20 pb-2 mb-10 flex justify-between items-center">
      <span>${titleMain}</span>
      <span class="text-[10px] text-gray-500 tracking-widest">
        ${titleSub}
      </span>
    </h3>
    <div class="menu-list"></div>
  `;

  const container = el.querySelector(".menu-list");

  let html = "";

  list.forEach(item => {
    html += `
      <div class="menu-item group flex items-center gap-4 mb-8">
        <div class="w-20 h-20 shrink-0 rounded shadow-md flex items-center justify-center overflow-hidden">
          <img src="${item.img}" class="max-w-full max-h-full object-contain hover:scale-125 transition duration-500">
        </div>

        <div class="flex-grow">
          <div class="flex justify-between items-baseline mb-1 gap-4">
            <h4 class="font-bold text-lg">
              ${item.ja}<br>
              <span class="text-xs text-gray-400 font-eng">${item.en}</span><br>
              <span class="font-eng text-blue-400 sm:hidden">${item.price}</span>
            </h4>

            <span class="font-eng text-blue-400 hidden sm:inline">
              ${item.price}
            </span>
          </div>

          <p class="text-xs text-gray-400 leading-relaxed">
            ${item.desc}
          </p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.addEventListener("DOMContentLoaded", loadMenu);

window.addEventListener("resize", () => {
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(syncMenuHeights, 150);
});