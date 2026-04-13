// renderHome.js (morning/night 画像サイズを daytime と同じに固定)

async function loadHome() {
  const res = await fetch("./data/text.json");
  const data = await res.json();

  renderHero(data.hero);
  renderConcept(data.concept);
  renderSections(data.sections);
}

/* HERO */
function renderHero(hero) {
  document.getElementById("hero-subtitle").textContent = hero.subtitle;
  document.getElementById("hero-title").textContent = hero.title;
  document.getElementById("hero-btn").textContent = hero.button;
}

/* CONCEPT */
function renderConcept(concept) {
  document.getElementById("concept-label").textContent = concept.label;
  document.getElementById("concept-title").textContent = concept.title;

  document.getElementById("concept-desc").innerHTML =
    concept.desc.replace(/\n/g, "<br>");
}

/* SECTIONS */
function renderSections(sections) {
  const container = document.getElementById("sections");

  sections.forEach(sec => {
    const bodyHTML = sec.body.map(line => `${line}<br>`).join("");

    const layout = sec.reverse
      ? "flex flex-col md:flex-row-reverse"
      : "flex flex-col md:flex-row"; // grid から flex に統一

    const textColor = sec.text || "text-gray-600";
    const titleColor = sec.titleColor || "";

    const html = `
      <div class="mb-24 ${layout} gap-10 items-stretch ${sec.bg} p-8 rounded-xl">
        <img src="${sec.image}" 
             class="w-full md:w-1/2 aspect-[4/3] object-cover rounded">
        <div class="w-full md:w-1/2 flex flex-col justify-center">
          <h3 class="text-2xl font-bold mb-2 ${titleColor}">${sec.title}</h3>
          <p class="text-sm text-blue-600 font-eng mb-4">${sec.subtitle}</p>
          <p class="${textColor} leading-loose">${bodyHTML}</p>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", html);
  });
}

loadHome();