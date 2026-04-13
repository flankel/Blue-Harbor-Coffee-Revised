document.addEventListener("DOMContentLoaded", async () => {
  injectCoffeeMugs();
  loadContent();
});

// ==============================
// JSON読み込み
// ==============================
async function loadContent() {
  const res = await fetch("./data/aboutUs.json");
  const data = await res.json();

  // PHILOSOPHY
  setText("philosophy-lead", data.philosophy.lead);
  setText("philosophy-text1", data.philosophy.text1);
  setText("philosophy-text2", data.philosophy.text2);

  // OWNER
  setText("owner-name", data.owner.name);
  setText("owner-text1", data.owner.text1);
  setText("owner-text2", data.owner.text2);

  // BEANS
  setText("beans-title", data.beans.title);
  setText("beans-text", data.beans.text);
  setBeansList("beans-list", data.beans.list);

  // FRUITS（★同じ関数に統一）
  setText("fruits-text", data.fruits.text);
  setBeansList("fruits-list", data.fruits.list);
}

// ==============================
// 汎用関数
// ==============================
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ==============================
// BEANS & FRUITS 共通リスト
// ==============================
function setBeansList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;

  const template = document.getElementById("coffee-beans");
  el.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");

    // ★ 中央揃えに修正
    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center gap-3";

    // =========================
    // 豆SVG
    // =========================
    if (template) {
      const clone = template.content.cloneNode(true);

      // ★ サイズ調整（JS側でも軽く制御）
      const svg = clone.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", "26");
        svg.setAttribute("height", "auto");
      }

      // ★ ID衝突回避
      const gradient = clone.querySelector("#beanMain");
      if (gradient) {
        const uniqueId =
          "beanMain-" + index + "-" + Math.random().toString(36).substr(2, 5);
        gradient.id = uniqueId;

        const ellipse = clone.querySelector("ellipse");
        if (ellipse) {
          ellipse.setAttribute("fill", `url(#${uniqueId})`);
        }
      }

      wrapper.appendChild(clone);
    }

    // =========================
    // テキスト
    // =========================
    const textWrap = document.createElement("div");

    // BEANS（オブジェクト形式）対応
    if (typeof item === "object") {
      const en = document.createElement("span");
      en.className = "name-en block text-lg font-semibold mb-1";
      en.textContent = item.name.en;

      const jp = document.createElement("span");
      jp.className = "name-jp block text-base mb-1";
      jp.textContent = item.name.jp;

      const descJp = document.createElement("span");
      descJp.className = "desc-jp block text-sm text-gray-700 mb-2";
      descJp.textContent = item.desc.jp;

      textWrap.appendChild(en);
      textWrap.appendChild(jp);
      textWrap.appendChild(descJp);
    } else {
      // FRUITS（文字列配列）対応
      const text = document.createElement("span");
      text.className = "text-base";
      text.textContent = item;
      textWrap.appendChild(text);
    }

    wrapper.appendChild(textWrap);
    li.appendChild(wrapper);
    el.appendChild(li);
  });
}

// ==============================
// マグ装飾
// ==============================
function injectCoffeeMugs() {
  const template = document.getElementById("coffee-mug");
  if (!template) return;

  document.querySelectorAll(".mug-row").forEach((container) => {
    container.innerHTML = "";

    for (let i = 0; i < 5; i++) {
      const clone = template.content.cloneNode(true);
      const wrapper = document.createElement("div");

      // ★ 傾き削除（今回の要望）
      wrapper.style.transform = `translateY(${Math.abs(i - 2) * 3}px)`;

      wrapper.appendChild(clone);
      container.appendChild(wrapper);
    }
  });
}