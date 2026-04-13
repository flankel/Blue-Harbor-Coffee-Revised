import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"


const firebaseConfig = {
  apiKey: "AIzaSyBlBC7PgW3aCvulWTJu3YMs9HPRydRdjY0",
  authDomain: "blue-harbor-takeout.firebaseapp.com",
  projectId: "blue-harbor-takeout"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

let orders = []
let currentTab = "today"

document.addEventListener("DOMContentLoaded", async () => {
  await normalizeAllStatuses()
  await loadOrders()
})

/* ======================
ステータス正規化
====================== */
function normalizeStatus(status){
  if(!status) return "new"
  status = status.toLowerCase()
  if(["new","preparing","ready","completed"].includes(status)) return status
  return "new"
}

/* ======================
既存データを一括正規化
====================== */
async function normalizeAllStatuses(){
  const q = query(
    collection(db,"orders"),
    orderBy("createdAt","desc")
  )
  const snapshot = await getDocs(q)
  let updateCount = 0

  for(const docSnap of snapshot.docs){
    const data = docSnap.data()
    const currentStatus = normalizeStatus(data.status)
    if(currentStatus !== data.status){
      await updateDoc(doc(db,"orders",docSnap.id), {status: currentStatus})
      updateCount++
    }
  }

  console.log(`ステータスを正規化しました: ${updateCount} 件`)
}

/* ======================
注文取得
====================== */
async function loadOrders(){
  const q = query(
    collection(db,"orders"),
    orderBy("createdAt","desc")
  )
  const snapshot = await getDocs(q)

  orders = []
  snapshot.forEach(docSnap=>{
    orders.push({
      id:docSnap.id,
      ...docSnap.data()
    })
  })

  renderOrders()
  updateDashboard()
}

/* ======================
注文表示
====================== */
function renderOrders(){
  const container = document.getElementById("orders")
  container.innerHTML=""
  const today = new Date().toISOString().slice(0,10)

  orders.forEach(order=>{
    const orderDate = order.pickup?.date || order.date
    if(!orderDate) return

    /* ===== タブ判定 ===== */
    if(currentTab==="past" && orderDate >= today) return
    if(currentTab==="today" && orderDate !== today) return
    if(currentTab==="future" && orderDate <= today) return

    let itemsHTML=""
    if(order.items){
      order.items.forEach(i=>{
        itemsHTML += `
        <div class="flex justify-between text-sm border-b py-1">
          <span>${i.name} ${i.size ? i.size+"g":""}</span>
          <span>${i.qty} × ¥${i.price}</span>
        </div>`
      })
    }

    const status = normalizeStatus(order.status)
    const name = order.customer?.name || order.name || ""
    const phone = order.customer?.phone || order.phone || ""
    const email = order.customer?.email || order.email || ""
    const date = order.pickup?.date || order.date || ""
    const time = order.pickup?.time || order.time || ""

    const card = document.createElement("div")
    card.className="bg-white p-6 rounded-xl shadow space-y-3"
    card.innerHTML=`
      <div class="flex justify-between items-center">
        <h2 class="font-semibold text-lg">${name}</h2>
        <span class="text-xs px-2 py-1 rounded ${statusColor(status)}">${status}</span>
      </div>

      <div class="text-sm text-slate-500 space-y-1">
        <p>📞 ${phone}</p>
        <p>📧 ${email}</p>
        <p>📅 ${date}</p>
        <p>⏰ ${time}</p>
      </div>

      <div class="pt-3 space-y-1">${itemsHTML}</div>

      <div class="text-right font-semibold pt-3 border-t">
        合計 ¥${Number(order.total).toLocaleString()}
      </div>

      <div class="flex gap-2 pt-4 flex-wrap">
        <button onclick="updateStatus('${order.id}','preparing')" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">準備中</button>
        <button onclick="updateStatus('${order.id}','ready')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">準備完了</button>
        <button onclick="updateStatus('${order.id}','completed')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">受渡済</button>
        <button onclick="deleteOrder('${order.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">削除</button>
      </div>
    `
    container.appendChild(card)
  })
}

/* ======================
ステータス色
====================== */
function statusColor(status){
  status = normalizeStatus(status)
  if(status==="new") return "bg-red-200 text-red-700"
  if(status==="preparing") return "bg-yellow-200 text-yellow-700"
  if(status==="ready") return "bg-green-200 text-green-700"
  if(status==="completed") return "bg-blue-200 text-blue-700"
  return "bg-gray-200"
}

/* ======================
ステータス更新
====================== */
window.updateStatus = async function(id,status){
  status = normalizeStatus(status)
  await updateDoc(doc(db,"orders",id), {status:status})
  await loadOrders()
}

/* ======================
削除
====================== */
window.deleteOrder = async function(id){
  if(!confirm("削除しますか？")) return
  await deleteDoc(doc(db,"orders",id))
  await loadOrders()
}

/* ======================
ダッシュボード
====================== */
function updateDashboard(){
  let todaySales = 0
  let preparing = 0
  let ready = 0
  const today = new Date().toISOString().slice(0,10)

  orders.forEach(o=>{
    const orderDate = o.pickup?.date || o.date
    const status = normalizeStatus(o.status)
    if(orderDate===today && status==="completed") todaySales += Number(o.total)
    if(status==="preparing") preparing++
    if(status==="ready") ready++
  })

  document.getElementById("orderCount").innerText = orders.length
  document.getElementById("todaySales").innerText = "¥"+todaySales.toLocaleString()
  document.getElementById("preparingCount").innerText = preparing
  document.getElementById("readyCount").innerText = ready
}

/* ======================
タブ切替
====================== */
window.switchTab = function(tab){
  currentTab = tab
  document.querySelectorAll(".tabBtn").forEach(btn=>{
    btn.classList.remove("bg-slate-800","text-white")
    btn.classList.add("bg-slate-200")
  })
  const activeBtn = document.querySelector(`[onclick="switchTab('${tab}')"]`)
  if(activeBtn){
    activeBtn.classList.remove("bg-slate-200")
    activeBtn.classList.add("bg-slate-800","text-white")
  }
  renderOrders()
}
