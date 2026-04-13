/* =========================
   Blue Harbor Coffee
   customer.js（修正版）
========================= */


/* =========================
   設定
========================= */

let CONFIG = null;


/* =========================
   初期化（★一本化）
========================= */

document.addEventListener("DOMContentLoaded", async () => {

  checkOrderData();

  await loadConfig();

  console.log("CONFIG:", CONFIG); // ★デバッグ

  setupDate();

  renderCart();

  setupAgreementUI();

});


/* =========================
   config読み込み
========================= */

async function loadConfig(){

  try {

    const res = await fetch("./data/storeInfo.json");

    const data = await res.json();

    CONFIG = data.config; // ★ここが最重要

  } catch (err) {

    console.error("config読み込み失敗:", err);
    alert("設定の読み込みに失敗しました");

  }

}


/* =========================
   注文データ確認
========================= */

function checkOrderData(){

  const order = localStorage.getItem("orderData");

  if(!order){

    alert("商品を選択してください");

    location.href = "takeout.html";

  }

}


/* =========================
   カート取得（複数対応）
========================= */

function getCartItems(){

  const raw = localStorage.getItem("orderData");
  if(!raw) return [];

  const data = JSON.parse(raw);

  // ★ 配列 or 単体 両対応
  if(Array.isArray(data)){
    return data;
  }

  if(data.items){
    return data.items;
  }

  return [data];

}


/* =========================
   カート表示
========================= */

function renderCart(){

  const items = getCartItems();

  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("totalPrice");

  if(!container || !totalEl) return;

  container.innerHTML = "";

  let total = 0;

  items.forEach(item => {

    total += item.subtotal || 0;

    const div = document.createElement("div");
    div.className = "flex items-center gap-4 border-b py-3";

    div.innerHTML = `
      <img src="${item.image}" 
           class="w-16 h-16 object-cover rounded-xl shadow-sm">

      <div class="flex-1">
        <p class="font-semibold">
          ${item.name}
        </p>
        <p class="text-sm text-gray-500">
          ${item.size ? item.size + "g × " : "× "}${item.qty}
        </p>
      </div>

      <p class="font-bold">
        ¥${(item.subtotal || 0).toLocaleString()}
      </p>
    `;

    container.appendChild(div);

  });

  totalEl.textContent = `¥${total.toLocaleString()}`;

}


/* =========================
   日付設定
========================= */

function setupDate(){

  if(!CONFIG) return;

  const picker = document.getElementById("datePicker");

  const today = new Date();

  const max = new Date();

  max.setDate(today.getDate() + CONFIG.reserveLimitDays);

  picker.min = today.toISOString().split("T")[0];

  picker.max = max.toISOString().split("T")[0];

  picker.addEventListener("change", generateTimeSlots);

  const notice = document.getElementById("formNotice");

if (notice) {
  notice.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm
                p-4 sm:p-5 md:p-7 lg:p-8
                text-sm sm:text-base lg:text-lg leading-relaxed space-y-4 sm:space-y-5">

      <!-- タイトル -->
      <div class="border-b pb-2 sm:pb-3 border-slate-200">
        <span class="text-slate-800 font-semibold text-base sm:text-lg lg:text-xl">
          ご予約に関する注意事項
        </span>
      </div>

      <!-- 必須項目 -->
      <div class="relative pl-4 text-slate-700">
        <span class="absolute left-0 top-[0.55em] text-black text-[10px] sm:text-xs">●</span>
        <span><span class="text-red-500 font-medium">*</span> は必須項目です</span>
      </div>

      <!-- 予約期間（強調） -->
      <div class="relative pl-4 text-red-600 font-semibold">
        <span class="absolute left-0 top-[0.55em] text-red-600 text-[10px] sm:text-xs">●</span>
        <span>ご予約は本日から${CONFIG.reserveLimitDays}日後まで可能です</span>
      </div>

      <!-- 通常情報 -->
      <ul class="space-y-3 text-slate-600">
        <li class="relative pl-4">
          <span class="absolute left-0 top-[0.55em] text-black text-[10px] sm:text-xs">●</span>
          <span>お受け取り時間は1時間単位でご指定いただけます</span>
        </li>

        <li class="relative pl-4">
          <span class="absolute left-0 top-[0.55em] text-black text-[10px] sm:text-xs">●</span>
          <span>当日の受付は閉店時間の1時間前までとなります</span>
        </li>
      </ul>

    </div>
  `;
}
}


/* =========================
   時間生成
========================= */

function generateTimeSlots(){

  if(!CONFIG) return;

  const date = document.getElementById("datePicker").value;

  const select = document.getElementById("timePicker");

  select.innerHTML = "";

  if(!date) return;

  const selectedDate = new Date(date);

  const day = selectedDate.getDay();


  if(day === CONFIG.closedDay){

    select.innerHTML = `<option>定休日</option>`;

    return;

  }


  let closeHour = CONFIG.weekdayClose;

  if(day === 5 || day === 6){

    closeHour = CONFIG.weekendClose;

  }


  const now = new Date();

  const todayStr =
      now.getFullYear() + "-" +
      String(now.getMonth() + 1).padStart(2, "0") + "-" +
      String(now.getDate()).padStart(2, "0");

  const isToday = (todayStr === date);


  if(isToday && now.getHours() >= closeHour - 1){

    select.innerHTML = `<option>本日の受付は終了しました</option>`;

    return;

  }


  for(let h = CONFIG.openHour; h < closeHour; h++){

    if(isToday){

      if(h <= now.getHours()) continue;

    }

    select.innerHTML += `<option>${h}:00-${h+1}:00</option>`;

  }

}


/* =========================
   入力チェック
========================= */

function validateInput(data){

  if(!data.name){
    alert("お名前を入力してください");
    return false;
  }

  if(!data.phone){
    alert("電話番号を入力してください");
    return false;
  }

  if(!/^[0-9\-]+$/.test(data.phone)){
    alert("電話番号の形式が正しくありません");
    return false;
  }

  if(!data.email){
    alert("メールアドレスを入力してください");
    return false;
  }

  if(!/^\S+@\S+\.\S+$/.test(data.email)){
    alert("メールアドレス形式が正しくありません");
    return false;
  }

  if(!data.date){
    alert("来店日を選択してください");
    return false;
  }

  if(!data.time){
    alert("来店時間を選択してください");
    return false;
  }

  if(data.time === "定休日"){
    alert("この日は定休日です");
    return false;
  }

  return true;

}


/* =========================
   同意チェック
========================= */

function checkAgreement(){

  const agree = document.getElementById("agree");

  if(!agree || !agree.checked){
    alert("個人情報の取り扱いに同意してください");
    return false;
  }

  return true;

}


/* =========================
   サニタイズ
========================= */

function sanitize(text){

  if(!text) return "";

  return text.replace(/[<>]/g,"");

}


/* =========================
   同意UI制御
========================= */

function setupAgreementUI(){

  const agree = document.getElementById("agree");
  const btn = document.getElementById("confirmBtn");

  if(!agree || !btn) return;

  btn.disabled = true;
  btn.classList.add("bg-gray-300","cursor-not-allowed");
  btn.classList.remove("bg-blue-600","hover:bg-blue-700");

  agree.addEventListener("change", () => {

    if(agree.checked){

      btn.disabled = false;
      btn.classList.remove("bg-gray-300","cursor-not-allowed");
      btn.classList.add("bg-blue-600","hover:bg-blue-700");

    }else{

      btn.disabled = true;
      btn.classList.add("bg-gray-300","cursor-not-allowed");
      btn.classList.remove("bg-blue-600","hover:bg-blue-700");

    }

  });

}


/* =========================
   確認ページへ
========================= */

function goConfirm(){

  if(!checkAgreement()) return;

  const name = sanitize(document.getElementById("name").value.trim());
  const phone = sanitize(document.getElementById("phone").value.trim());
  const email = sanitize(document.getElementById("email").value.trim());
  const date = document.getElementById("datePicker").value;
  const time = document.getElementById("timePicker").value;
  const message = sanitize(document.getElementById("message").value.trim());

  const customerData = {
    name,
    phone,
    email,
    date,
    time,
    message
  };

  if(!validateInput(customerData)) return;

  localStorage.setItem(
    "customerData",
    JSON.stringify(customerData)
  );

  location.href = "confirm.html";

}


/* =========================
   商品ページへ戻る
========================= */

function backToMenu(){

  location.href = "takeout.html";

}


window.goConfirm = goConfirm;
window.backToMenu = backToMenu;