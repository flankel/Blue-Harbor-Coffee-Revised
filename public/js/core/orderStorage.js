// orderStorage.js
// ======================================
// 注文データ storage 管理モジュール
// ======================================

// 保存キー
const ORDER_KEY = "orderData";
const CUSTOMER_KEY = "customerData";


// ==============================
// 注文データ取得
// ==============================

export function getOrder(){

const data = sessionStorage.getItem(ORDER_KEY);

if(!data) return null;

try{

return JSON.parse(data);

}catch(e){

console.error("orderData parse error", e);
return null;

}

}


// ==============================
// 注文データ保存
// ==============================

export function saveOrder(order){

sessionStorage.setItem(
ORDER_KEY,
JSON.stringify(order)
);

}


// ==============================
// 顧客データ取得
// ==============================

export function getCustomer(){

const data = sessionStorage.getItem(CUSTOMER_KEY);

if(!data) return null;

try{

return JSON.parse(data);

}catch(e){

console.error("customerData parse error", e);
return null;

}

}


// ==============================
// 顧客データ保存
// ==============================

export function saveCustomer(customer){

sessionStorage.setItem(
CUSTOMER_KEY,
JSON.stringify(customer)
);

}


// ==============================
// 両方取得
// ==============================

export function getOrderBundle(){

const order = getOrder();
const customer = getCustomer();

if(!order || !customer) return null;

return {
order,
customer
};

}


// ==============================
// 削除
// ==============================

export function clearOrder(){

sessionStorage.removeItem(ORDER_KEY);
sessionStorage.removeItem(CUSTOMER_KEY);

}
