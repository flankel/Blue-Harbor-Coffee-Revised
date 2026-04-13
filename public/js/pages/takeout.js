/* =========================
   TAKEOUT 商品ページ
   Blue Harbor Coffee
========================= */

const MAX_PER_ITEM = 3;

let products = {};
let cart = {};


/* =========================
   初期化
========================= */

document.addEventListener("DOMContentLoaded", async () => {

  await loadProducts();
  loadCart();
  renderProducts();
  setupEvents();
  updateSummary();

});


/* =========================
   商品データ読み込み
========================= */

async function loadProducts(){

  const res = await fetch("data/takeout-products.json");
  products = await res.json();

}


/* =========================
   カート復元
========================= */

function loadCart(){

  const saved = localStorage.getItem("cart");

  if(saved){
    cart = JSON.parse(saved);
  }

}


/* =========================
   商品表示
========================= */

function renderProducts(){

  const area = document.getElementById("productArea");

  let html = "";


/* Coffee Beans */

if(products.beans){

html += `
<div>

<h2 class="text-3xl font-light tracking-wider mb-10">
Coffee Beans
</h2>

<div class="grid md:grid-cols-2 gap-14">
`;

products.beans.forEach(bean => {

html += `
<div class="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition">

${bean.tag ? `
<div class="badge ${mapTagClass(bean.tag)}">
  ${bean.tag}
</div>
` : ""}

<div class="aspect-[4/3] overflow-hidden">
<img src="${bean.image}" class="w-full h-full object-cover hover:scale-110 transition duration-700">
</div>

<div class="p-6 flex flex-col">

<!-- 上（高さ固定） -->
<div class="space-y-4 min-h-[120px]">

<h3 class="leading-tight">
<div class="text-lg font-light">${bean.name.jp}</div>
<div class="text-xs text-gray-500">${bean.name.en}</div>
</h3>

${bean.desc ? `
<p class="text-sm text-gray-500 leading-snug">
${bean.desc.jp}
</p>
` : ""}

</div>

<!-- 下 -->
<div class="pt-4">

`;

Object.keys(bean.sizes).forEach(size => {

const price = bean.sizes[size];

html += `
<div class="flex justify-between items-center py-2 border-b last:border-none">

<div>
<span>${size}g</span>
<span class="text-blue-600 font-semibold ml-2">
¥${price.toLocaleString()}
</span>
</div>

<div class="flex items-center gap-2">

<button class="qtyMinus px-3 py-1 bg-slate-100 rounded"
data-id="${bean.id}" data-size="${size}">−</button>

<span class="w-6 text-center" id="qty-${bean.id}-${size}">
${cart[`${bean.id}-${size}`] || 0}
</span>

<button class="qtyPlus px-3 py-1 bg-slate-100 rounded"
data-id="${bean.id}" data-size="${size}">＋</button>

</div>

</div>
`;

});

html += `</div></div></div>`;
});

html += `</div></div>`;
}


/* Sweets */

if(products.sweets){

html += `
<div>

<h2 class="text-3xl font-light tracking-wider mb-10">
Sweets
</h2>

<div class="grid md:grid-cols-2 gap-14">
`;

products.sweets.forEach(item => {

html += `
<div class="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition">

${item.tag ? `
<div class="badge ${mapTagClass(item.tag)}">
  ${item.tag}
</div>
` : ""}

<div class="aspect-[4/3] overflow-hidden">
<img src="${item.image}" class="w-full h-full object-cover hover:scale-110 transition duration-700">
</div>

<div class="p-6 flex flex-col">

<!-- 上（高さ固定） -->
<div class="space-y-3 min-h-[100px]">

<div class="leading-tight">
<div class="text-lg">${item.name.jp}</div>
<div class="text-xs text-gray-500">${item.name.en}</div>
</div>

${item.desc ? `
<p class="text-sm text-gray-500 leading-snug">
${item.desc.jp}
</p>
` : ""}

</div>

<!-- 下 -->
<div class="flex justify-between items-center pt-4">

<span class="text-blue-600 font-semibold">
¥${item.price.toLocaleString()}
</span>

<div class="flex items-center gap-2">

<button class="qtyMinus px-3 py-1 bg-slate-100 rounded"
data-id="${item.id}">−</button>

<span class="w-6 text-center" id="qty-${item.id}">
${cart[`${item.id}-`] || 0}
</span>

<button class="qtyPlus px-3 py-1 bg-slate-100 rounded"
data-id="${item.id}">＋</button>

</div>

</div>

</div>
</div>
`;

});

html += `</div></div>`;
}

area.innerHTML = html;

}


/* =========================
   イベント設定
========================= */

function setupEvents(){

document.addEventListener("click", e => {

if(e.target.classList.contains("qtyPlus")){
  increaseQty(e.target);
}

if(e.target.classList.contains("qtyMinus")){
  decreaseQty(e.target);
}

if(e.target.classList.contains("summaryPlus")){
  summaryIncrease(e.target);
}

if(e.target.classList.contains("summaryMinus")){
  summaryDecrease(e.target);
}

if(e.target.classList.contains("summaryDelete")){
  summaryDelete(e.target);
}

if(e.target.classList.contains("clearCart")){
  clearCartAll();
}

});

}


/* =========================
   数量増加
========================= */

function increaseQty(btn){

const id = btn.dataset.id;
const size = btn.dataset.size || "";
const key = `${id}-${size}`;

if(!cart[key]) cart[key] = 0;
if(cart[key] >= MAX_PER_ITEM) return;

cart[key]++;

btn.classList.add("scale-pop");
setTimeout(()=> btn.classList.remove("scale-pop"),150);

saveCart();
refreshAll();

}


/* =========================
   数量減少
========================= */

function decreaseQty(btn){

const id = btn.dataset.id;
const size = btn.dataset.size || "";
const key = `${id}-${size}`;

if(!cart[key]) return;

cart[key]--;

if(cart[key] <= 0){
  delete cart[key];
}

saveCart();
refreshAll();

}


/* =========================
   サマリー操作
========================= */

function summaryIncrease(btn){

const key = btn.dataset.key;

if(!cart[key]) cart[key] = 0;
if(cart[key] >= MAX_PER_ITEM) return;

cart[key]++;

saveCart();
refreshAll();

}

function summaryDecrease(btn){

const key = btn.dataset.key;

if(!cart[key]) return;

cart[key]--;

if(cart[key] <= 0){
  delete cart[key];
}

saveCart();
refreshAll();

}

function summaryDelete(btn){

const key = btn.dataset.key;
const row = btn.closest("div");

row.classList.add("fade-out");

setTimeout(() => {
  delete cart[key];
  saveCart();
  refreshAll();
}, 300);

}


/* =========================
   全削除
========================= */

function clearCartAll(){

if(!confirm("カートをすべて削除しますか？")) return;

cart = {};

saveCart();
refreshAll();

}


/* =========================
   共通更新
========================= */

function refreshAll(){

document.querySelectorAll('[id^="qty-"]').forEach(el => {
  el.textContent = 0;
});

Object.keys(cart).forEach(key => {
  const [id, size] = key.split("-");
  updateQtyDisplay(id, size);
});

updateSummary();

}


/* =========================
   カート保存
========================= */

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}


/* =========================
   数量表示更新
========================= */

function updateQtyDisplay(id, size){

const key = `${id}-${size}`;
const qty = cart[key] || 0;

const elementId = size ? `qty-${id}-${size}` : `qty-${id}`;
const el = document.getElementById(elementId);

if(el){
  el.textContent = qty;

  el.classList.add("scale-pop");
  setTimeout(() => {
    el.classList.remove("scale-pop");
  }, 150);
}

}


/* =========================
   注文サマリー更新
========================= */

function updateSummary(){

const summary = document.getElementById("orderSummary");
const totalEl = document.getElementById("totalPrice");
const mobileTotal = document.getElementById("mobileTotal");

let html = "";
let total = 0;

if(Object.keys(cart).length === 0){
  summary.innerHTML = "<p class='text-gray-400'>カートは空です</p>";
  totalEl.textContent = "¥0";
  if(mobileTotal) mobileTotal.textContent = "¥0";
  return;
}

Object.keys(cart).forEach(key => {

const qty = cart[key];

let label = "";
let price = 0;

/* Beans */
products.beans.forEach(bean => {
Object.keys(bean.sizes).forEach(size => {
if(key === `${bean.id}-${size}`){
label = `${bean.name.jp} ${size}g`;
price = bean.sizes[size];
}
});
});

/* Sweets */
products.sweets.forEach(sweet => {
if(key === `${sweet.id}-`){
label = sweet.name.jp;
price = sweet.price;
}
});

const subtotal = price * qty;
total += subtotal;

html += `
<div class="flex justify-between items-center py-2 border-b">

<div>${label}</div>

<div class="flex items-center gap-2">

<button class="summaryMinus px-2 py-1 bg-slate-100 rounded" data-key="${key}">−</button>

<span class="w-6 text-center">${qty}</span>

<button class="summaryPlus px-2 py-1 bg-slate-100 rounded" data-key="${key}">＋</button>

<button class="summaryDelete px-2 py-1 text-red-500" data-key="${key}">✕</button>

<span class="text-blue-600 font-semibold ml-3">
¥${subtotal.toLocaleString()}
</span>

</div>

</div>
`;

});

html += `
<div class="text-right mt-4">
<button class="clearCart px-4 py-2 text-sm text-red-500 border border-red-300 rounded hover:bg-red-50">
全てクリア
</button>
</div>
`;

summary.innerHTML = html;

totalEl.textContent = "¥" + total.toLocaleString();

if(mobileTotal){
  mobileTotal.textContent = "¥" + total.toLocaleString();
}

}


/* =========================
   注文データ作成
========================= */

function collectOrder(){

let items = [];

Object.keys(cart).forEach(key => {

const qty = cart[key];

products.beans.forEach(bean => {
Object.keys(bean.sizes).forEach(size => {
if(key === `${bean.id}-${size}`){
const price = bean.sizes[size];
items.push({
type: "bean",
id: bean.id,
name: `${bean.name.jp} ${size}g`,
size: size,
qty: qty,
price: price,
subtotal: price * qty,
image: bean.image
});
}
});
});

products.sweets.forEach(sweet => {
if(key === `${sweet.id}-`){
items.push({
type: "sweet",
id: sweet.id,
name: sweet.name.jp,
size: "",
qty: qty,
price: sweet.price,
subtotal: sweet.price * qty,
image: sweet.image
});
}
});

});

return items;

}

// tag
function mapTagClass(tag){

  const t = tag.toLowerCase();

  if(t.includes("no.1")) return "no1";
  if(t.includes("人気")) return "popular";
  if(t.includes("おすすめ")) return "recommend";
  if(t.includes("限定")) return "limited";
  if(t.includes("new") || t.includes("新")) return "new";

  return "";
}


/* =========================
   次ページへ
========================= */

function goCustomer(){

const items = collectOrder();

if(items.length === 0){
  alert("商品を選択してください");
  return;
}

let total = 0;

items.forEach(i => {
  total += i.subtotal;
});

const orderData = {
  items: items,
  total: total
};

localStorage.setItem("orderData", JSON.stringify(orderData));

location.href = "customer.html";

}

window.goCustomer = goCustomer;
