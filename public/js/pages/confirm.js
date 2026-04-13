// confirm.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==============================
// Firebase設定
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyBlBC7PgW3aCvulWTJu3YMs9HPRydRdjY0",
  authDomain: "blue-harbor-takeout.firebaseapp.com",
  projectId: "blue-harbor-takeout",
  storageBucket: "blue-harbor-takeout.firebasestorage.app",
  messagingSenderId: "687997239074",
  appId: "1:687997239074:web:d29a92a47c69e2f67aaf7b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==============================
// 変数
// ==============================
let orderData = null;
let customerData = null;
let isSubmitting = false;

// ==============================
// 初期化
// ==============================
document.addEventListener("DOMContentLoaded", init);

function init() {
  // ★ EmailJS初期化（ここが超重要）
  if (typeof emailjs !== "undefined") {
    emailjs.init("wK3E-NyEcLx-5tbSL");
  } else {
    console.error("EmailJSが読み込まれていません");
  }

  loadStorage();
  renderOrder();
  renderCustomer();
}

// ==============================
// storage読み込み
// ==============================
function loadStorage() {
  const order = localStorage.getItem("orderData");
  const customer = localStorage.getItem("customerData");

  if (!order || !customer) {
    alert("注文情報が見つかりません");
    location.href = "takeout.html";
    return;
  }

  orderData = JSON.parse(order);
  customerData = JSON.parse(customer);
}

// ==============================
// 注文表示
// ==============================
function renderOrder() {
  const container = document.getElementById("orderItems");
  container.innerHTML = "";

  orderData.items.forEach(item => {
    const subtotal = item.price * item.qty;

    const row = document.createElement("div");
    row.className = "flex items-center gap-4 border-b py-3";

    row.innerHTML = `
      <img src="${item.image}" class="w-16 h-16 object-cover rounded-xl shadow-sm">
      <div class="flex-1">
        <div class="font-medium">${item.name}</div>
        <div class="text-sm text-gray-500">× ${item.qty}</div>
      </div>
      <div class="font-medium">
        ¥${subtotal.toLocaleString()}
      </div>
    `;

    container.appendChild(row);
  });

  // ==============================
  // 金額計算
  // ==============================
  const taxRate = 0.08;
  const subtotal = orderData.total;
  const tax = Math.round(subtotal * taxRate);
  const totalWithTax = subtotal + tax;

  // ==============================
  // 表示
  // ==============================
  document.getElementById("orderSubtotal").textContent =
    "¥" + subtotal.toLocaleString();

  document.getElementById("orderTax").textContent =
    "¥" + tax.toLocaleString();

  document.getElementById("orderTotal").textContent =
    "¥" + totalWithTax.toLocaleString();
}

// ==============================
// 顧客表示
// ==============================
function renderCustomer() {
  document.getElementById("c_name").textContent = customerData.name;
  document.getElementById("c_phone").textContent = customerData.phone;
  document.getElementById("c_email").textContent = customerData.email;
  document.getElementById("c_date").textContent = customerData.date;
  document.getElementById("c_time").textContent = customerData.time;
  document.getElementById("c_message").textContent = customerData.message || "";
}

// ==============================
// 戻る
// ==============================
window.backToCustomer = function () {
  location.href = "customer.html";
};

// ==============================
// 注文送信
// ==============================
window.submitOrder = async function () {
  if (isSubmitting) return;

  isSubmitting = true;

  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "送信中...";

  try {
    const taxRate = 0.08;
    const subtotal = orderData.total;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    const orderNumber = "BH-" + Date.now().toString().slice(-6);

    const today = new Date();
    const dayKey =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    // ==============================
    // Firestore保存
    // ==============================
    const orderRef = await addDoc(collection(db, "orders"), {
      store: "blueharbor",
      orderNumber: orderNumber,
      status: "new",
      createdAt: serverTimestamp(),
      dayKey: dayKey,
      items: orderData.items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      customer: {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email
      },
      pickup: {
        date: customerData.date,
        time: customerData.time
      },
      message: customerData.message || ""
    });

    // ==============================
    // 商品HTML生成
    // ==============================
    const itemsRows = orderData.items
      .map(item => {
        const sub = item.price * item.qty;

        return `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;">${item.name}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.qty}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">¥${sub.toLocaleString()}</td>
          </tr>
        `;
      })
      .join("");

    // ==============================
    // HTMLメール生成
    // ==============================
    const htmlContent = `
      <div style="font-family:Arial,sans-serif;background:#f7f7f7;padding:20px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;padding:24px;border-radius:12px;">
          
          <div style="text-align:center;margin-bottom:20px;">
            <img src="https://i.imgur.com/HUnjkKj.png" style="width:120px;">
          </div>

          <h2 style="text-align:center;">TAKEOUTのご予約ありがとうございます</h2>

          <h3>■ 注文番号</h3>
          <p>${orderRef.id}</p>

          <h3>■ お客様情報</h3>
          <p>
            お名前：${customerData.name}<br>
            電話番号：${customerData.phone}<br>
            メール：${customerData.email}
          </p>

          <h3>■ ご来店日時</h3>
          <p>${customerData.date} ${customerData.time}</p>

          <h3>■ ご注文内容</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr style="background:#f0f0f0;">
              <th style="padding:8px;border:1px solid #ddd;">商品</th>
              <th style="padding:8px;border:1px solid #ddd;">数量</th>
              <th style="padding:8px;border:1px solid #ddd;">小計</th>
            </tr>

            ${itemsRows}

            <tr>
              <td colspan="2" style="padding:8px;text-align:right;">小計</td>
              <td style="padding:8px;text-align:right;">¥${subtotal.toLocaleString()}</td>
            </tr>

            <tr>
              <td colspan="2" style="padding:8px;text-align:right;">消費税</td>
              <td style="padding:8px;text-align:right;">¥${tax.toLocaleString()}</td>
            </tr>

            <tr style="font-weight:bold;">
              <td colspan="2" style="padding:8px;text-align:right;">合計</td>
              <td style="padding:8px;text-align:right;">¥${total.toLocaleString()}</td>
            </tr>
          </table>

          <h3 style="margin-top:20px;">■ お問い合わせ</h3>
          <p>${customerData.message || ""}</p>

          <p style="text-align:center;margin-top:30px;">
            ご来店をお待ちしております。
          </p>
        </div>
      </div>
    `;

    // ==============================
    // メール送信
    // ==============================
    try {
      await emailjs.send(
        "service_l7e4fi8",
        "template_8fm7t8b",
        {
          html: htmlContent,
          to_email: customerData.email
        }
      );
    } catch (e) {
      console.warn("メール送信失敗:", e);
    }

    // ==============================
    // storage削除
    // ==============================
    localStorage.removeItem("orderData");
    localStorage.removeItem("customerData");
    localStorage.removeItem("cart");

    location.href = "complete.html";
  } catch (err) {
    console.error("🔥エラー詳細:", err);

    alert(err.message || "注文送信に失敗しました。");

    btn.disabled = false;
    btn.textContent = "注文確定";
    isSubmitting = false;
  }
};
