// ==================================================
// GLOBAL STATE
// ==================================================
let menuItems = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedCategory = "all";

window.setLoginType = function (type) {
  localStorage.setItem("loginType", type);

  const studentBtn = document.getElementById("studentToggle");
  const adminBtn = document.getElementById("adminToggle");
  const loginLabel = document.getElementById("loginLabel");
  const demo = document.getElementById("demoCredentials");

  if (type === "admin") {
    adminBtn.classList.add("active");
    studentBtn.classList.remove("active");

    loginLabel.innerText = "Admin ";

    if (demo) {
      demo.innerHTML = "No Demo For Admin";
    }
  } else {
    studentBtn.classList.add("active");
    adminBtn.classList.remove("active");

    loginLabel.innerText = "Roll Number";

    if (demo) {
      demo.innerHTML = "Demo: College Roll.NO.";
    }
  }

  console.log("Login type:", type);
};


// ==================================================
// UTILS
// ==================================================
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ==================================================
// LOAD MENU FROM BACKEND
// ==================================================

async function loadMenu() {
  try {
    const res = await fetch("/api/menu");
    const data = await res.json();

    console.log("MENU DATA:", data); // 👈 ADD THIS

    menuItems = data;
    renderMenu();
  } catch (err) {
    console.error("Menu fetch error:", err);
  }
}






// ==================================================
// RENDER CATEGORIES
// ==================================================
function renderCategories() {
  const container = document.getElementById("categories");

  const categories = [
    "all",
    ...new Set(
      menuItems
        .filter(item => item.category) // 🔥 safety check
        .map(item => item.category.toLowerCase())
    )
  ];

  container.innerHTML = categories
    .map(
      cat => `
        <button class="category-btn ${cat === selectedCategory ? "active" : ""}"
          onclick="selectCategory('${cat}')">
          ${cat.toUpperCase()}
        </button>
      `
    )
    .join("");
}

function selectCategory(cat) {
  selectedCategory = cat;
  renderCategories();
  renderMenu();
}

// ==================================================
// RENDER MENU
// ==================================================
function renderMenu() {
  const grid = document.getElementById("menuGrid");
  grid.innerHTML = "";

  menuItems.forEach(item => {
    const cartItem = cart.find(c => c._id === item._id);
    const qty = cartItem ? cartItem.qty : 0;

    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/150'}" />
      <h3>${item.name}</h3>
      <p>${item.description}</p>

      <div class="menu-footer">
        <span class="price">₹${item.price}</span>

        <div class="qty-controls">
          <button class="qty-btn minus" onclick="decreaseItem('${item._id}', this)">−</button>
          <span class="qty">${qty}</span>
          <button class="qty-btn plus" onclick="increaseItem('${item._id}', this)">+</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}




// const activeOrders = orders.filter(
//   o => o.status === "pending" || o.status === "preparing"
// );

// ==================================================
// SEARCH
// ==================================================
document.getElementById("searchInput").addEventListener("input", renderMenu);

// ==================================================
// CART FUNCTIONS
// ==================================================
function addToCart(id, btn) {
  const item = menuItems.find(i => i._id === id);
  if (!item) return;

  const existing = cart.find(c => c._id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cartBadge").innerText =
    cart.reduce((s, i) => s + i.qty, 0);

  btn.classList.add("added");
  setTimeout(() => btn.classList.remove("added"), 300);

  showToast(`${item.name} added 🛒`);
}


document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
});



function animateAddButton(id) {
  const buttons = document.querySelectorAll(".plus");
  buttons.forEach(btn => {
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 200);
  });
}



function increaseItem(id, btn) {
  const item = menuItems.find(i => i._id === id);
  if (!item) return;

  const existing = cart.find(c => c._id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  animateBtn(btn);
  saveCart();
  updateCartUI();
  renderMenu();
}

function decreaseItem(id, btn) {
  const existing = cart.find(c => c._id === id);
  if (!existing) return;

  existing.qty--;

  if (existing.qty <= 0) {
    cart = cart.filter(c => c._id !== id);
  }

  animateBtn(btn);
  saveCart();
  updateCartUI();
  renderMenu();
}

function animateBtn(btn) {
  btn.classList.add("added");
  setTimeout(() => btn.classList.remove("added"), 300);
}



function removeFromCart(id) {
  cart = cart.filter(item => item._id !== id);
  saveCart();
  updateCartUI();
  renderMenu();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  const cartBody = document.getElementById("cartBody");
  const cartBadge = document.getElementById("cartBadge");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  const summary = document.getElementById("cartSummary");

  cartBadge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);

  if (cart.length === 0) {
    cartBody.innerHTML = "<p>Your cart is empty</p>";
    summary.style.display = "none";
    subtotalEl.textContent = "₹0";
    totalEl.textContent = "₹0";
    return;
  }

  summary.style.display = "block";

  let subtotal = 0;

  cartBody.innerHTML = cart
    .map(item => {
      subtotal += item.price * item.qty;
      return `
        <div class="cart-item">
          <span>${item.name} × ${item.qty}</span>
          <span>₹${item.price * item.qty}</span>
          <button onclick="removeFromCart('${item._id}')">❌</button>
        </div>
      `;
    })
    .join("");

  subtotalEl.textContent = "₹" + subtotal;
  totalEl.textContent = "₹" + subtotal;
}


function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}


// ==================================================
// CART MODAL
// ==================================================
function openCart() {
  document.getElementById("cartModal").classList.add("active");
  updateCartUI();
}


function closeCart() {
  document.getElementById("cartModal").classList.remove("active");
}

// ==================================================
// PLACE ORDER (TEMP – LOCAL)
// ==================================================
async function placeOrder() {
  if (cart.length === 0) {
    showToast("Cart is empty");
    return;
  }

  const pickupTime = document.getElementById("pickupTime").value;
  if (!pickupTime) {
    showToast("Select pickup time");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    showToast("Please login first");
    showPage("loginPage");
    return;
  }

  const res = await fetch("http://localhost:5000/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      items: cart.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.qty
      })),
      totalAmount: getCartTotal(),
      pickupTime
    })
  });

  const data = await res.json();
  if (!res.ok) return showToast(data.message);

  showToast("Order placed successfully 🎉");
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
}


async function loadMyOrders() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch("http://localhost:5000/api/orders/my", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const orders = await res.json();
  const list = document.getElementById("ordersList");

  if (orders.length === 0) {
    list.innerHTML = "<p>No orders yet</p>";
    return;
  }

  list.innerHTML = orders
    .map(o => `
      <div class="order-card">
        <p><b>Status:</b> ${o.status}</p>
        <p><b>Total:</b> ₹${o.totalAmount}</p>
        <p><b>Pickup:</b> ${o.pickupTime}</p>
      </div>
    `)
    .join("");
}



// ==================================================
// PAGE NAVIGATION (BASIC)
// ==================================================
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );

  document.getElementById(pageId).classList.add("active");

  if (pageId === "ordersPage") loadMyOrders();
  if (pageId === "adminPage") {
    loadAdminStats();
    setAdminTab("orders");
  }
}



async function loadAdminStats() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/orders/all", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const orders = await res.json();

  let pending = 0;
  let preparing = 0;
  let todayOrders = 0;
  let revenue = 0;

  const today = new Date().toDateString();

  orders.forEach(o => {
    if (o.status === "pending") pending++;
    if (o.status === "preparing") preparing++;

    if (new Date(o.createdAt).toDateString() === today) {
      todayOrders++;

      if (o.status === "completed") {
        revenue += o.totalAmount;
      }
    }
  });

  document.getElementById("adminStats").innerHTML = `
    <div class="stat-card">
      <h2>${pending}</h2>
      <p>Pending Orders</p>
    </div>

    <div class="stat-card">
      <h2>${preparing}</h2>
      <p>Preparing</p>
    </div>

    <div class="stat-card">
      <h2>${todayOrders}</h2>
      <p>Today's Orders</p>
    </div>

    <div class="stat-card">
      <h2>₹${revenue}</h2>
      <p>Today's Revenue</p>
    </div>
  `;
}
// Auto-refresh admin orders every 5 seconds

setInterval(() => {
  const adminPage = document.getElementById("adminPage");
  if (adminPage.classList.contains("active")) {
    loadAdminOrders();
    loadAdminStats();
  }
}, 5000);


let currentAdminTab = "orders";








function setAdminTab(tab) {
  currentAdminTab = tab;

  document.querySelectorAll(".admin-tab")
    .forEach(b => b.classList.remove("active"));

  if (tab === "orders") {
    document.querySelector(".admin-tab:nth-child(1)").classList.add("active");
    loadAdminOrders();
  } else {
    document.querySelector(".admin-tab:nth-child(2)").classList.add("active");
    loadAdminMenu();
  }
}






// ==================================================
// INIT
// ==================================================
document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  updateCartUI();
});

async function handleLogin(event) {
  event.preventDefault();

  const rollNumber = document.getElementById("loginId").value.trim();
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rollNumber, password })
  });

  const data = await res.json();

  if (!res.ok) {
    showToast(data.message || "Login failed");
    return;
  }

  // ✅ STORE EVERYTHING CLEANLY
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("userName", data.user.firstName);

  showToast("Login successful ✅");

  updateNavbar();

  // ✅ ROLE BASED PAGE
  if (data.user.role === "admin") {
    showPage("adminPage");
    loadAdminStats();
    setAdminTab("orders");
  } else {
    showPage("mainPage");
  }
}





async function handleRegister(e) {
  e.preventDefault();

  const firstName = document.getElementById("regFirstName").value;
  const lastName = document.getElementById("regLastName").value;
  const rollNumber = document.getElementById("regRollNumber").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      rollNumber,
      email,
      password
    })
  });

  const data = await res.json();

  if (!res.ok) {
    showToast(data.message || "Registration failed");
    return;
  }

  // ✅ SUCCESS
  showToast("Account created successfully ✅");

  // ⏳ Small delay for UX
  setTimeout(() => {
    document.getElementById("loginId").value = rollNumber;
    showPage("loginPage"); // 👈 REDIRECT TO LOGIN
  }, 1200);
}




function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  document.getElementById("loginBtnNav").style.display = "none";
  document.getElementById("logoutBtn").style.display = "inline-block";
  document.getElementById("myOrdersBtn").style.display = "inline-block";
  document.getElementById("userNameDisplay").innerText = user.firstName;

  if (user.role === "admin") {
    document.getElementById("adminBtn").style.display = "inline-block";
  } else {
    document.getElementById("adminBtn").style.display = "none";
  }
}



document.addEventListener("DOMContentLoaded", updateNavbar);


window.onload = updateNavbar;

function logout() {
  localStorage.clear();
  showPage("mainPage");
  location.reload();
}


function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}


document.addEventListener("DOMContentLoaded", () => {
  loadMenu();

  const userId = localStorage.getItem("userId");
  if (userId) {
    document.getElementById("loginBtnNav").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("myOrdersBtn").style.display = "inline-block";
  }
});
  updateCartUI();

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    document.getElementById("loginBtnNav").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("myOrdersBtn").style.display = "inline-block";
    document.getElementById("userNameDisplay").innerText = user.name;

    if (user.role === "admin") {
      document.getElementById("adminBtn").style.display = "inline-block";
    }
  }

  loadMenu();
});



setInterval(() => {
  const adminPage = document.getElementById("adminPage");

  if (adminPage.classList.contains("active") && currentAdminTab === "orders") {
    loadAdminOrders();
  }
}, 5000);



async function loadAdminOrders() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/orders/all", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const orders = await res.json();

  // ✅ FILTER OUT COMPLETED ORDERS
  const activeOrders = orders.filter(
    o => o.status === "pending" || o.status === "preparing"
  );

  document.getElementById("adminContent").innerHTML =
    activeOrders.length === 0
      ? "<p>No active orders</p>"
      : activeOrders.map(o => `
        <div class="order-card" id="order-${o._id}">
          <div class="order-header">
            <h3>ORD-${o._id.slice(-6)}</h3>
            <span class="order-status ${o.status}">
              ${o.status.toUpperCase()}
            </span>
          </div>

          <p><b>Student:</b> ${o.user?.firstName || "N/A"}</p>
          <p><b>Pickup:</b> ${o.pickupTime || "N/A"}</p>

          <hr/>

          ${o.items.map(i => `
            <p>${i.product} × ${i.quantity}</p>
          `).join("")}

          <h4>Total: ₹${o.totalAmount}</h4>

          ${renderAdminActionButton(o)}
        </div>
      `).join("");
}



function renderAdminActionButton(order) {
  if (order.status === "pending") {
    return `
      <button class="btn-primary"
        onclick="updateOrderStatus('${order._id}', 'preparing')">
        🔥 Start Preparing
      </button>
    `;
  }

  if (order.status === "preparing") {
    return `
      <button class="btn-success"
        onclick="updateOrderStatus('${order._id}', 'completed')">
        ✅ Mark Completed
      </button>
    `;
  }

  return ``; // completed orders NOT shown
}



async function updateOrderStatus(orderId, status) {
  const token = localStorage.getItem("token");
  const card = document.getElementById(`order-${orderId}`);

  if (!card) return;

  const btn = card.querySelector("button");

  // 🔄 UI → Loading
  card.classList.add("completing");
  btn.classList.add("loading");
  btn.innerText = "Completing...";

  // 🔥 API call
  await fetch(`/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status })
  });

  // ✅ Success animation
  btn.classList.remove("loading");
  btn.classList.add("completed", "pulse");
  btn.innerText = "Completed";

  card.classList.add("completed");

  // ❌ Remove card smoothly
  setTimeout(() => {
    card.remove();
    loadAdminStats(); // 🔄 Update revenue & stats
  }, 700);
}





function renderPendingOrder(o) {
  return `
    <div class="order-card animate-fade">
      <h3>ORD-${o._id.slice(-6)}</h3>
      <p>${new Date(o.createdAt).toLocaleString()}</p>

      <div class="order-user">
        <p><b>Student:</b> ${o.user?.firstName || "N/A"}</p>
        <p><b>Pickup:</b> ${o.pickupTime || "Not selected"}</p>
      </div>

      ${o.items.map(i => `
  <p>${i.product} × ${i.quantity}</p>
`).join("")}


      <h4>Total ₹${o.totalAmount}</h4>

      <button class="btn-primary"
        onclick="startPreparing('${o._id}')">
        🔥 Start Preparing
      </button>
    </div>
  `;
}



async function startPreparing(orderId) {
  const token = localStorage.getItem("token");

  await fetch(`/api/orders/${orderId}/preparing`, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token }
  });

  showToast("Order moved to preparing 👨‍🍳");

  loadAdminStats();     // update stats
  loadAdminOrders();   // refresh pending list
}


async function loadPreparingOrders() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/orders/all", {
    headers: { Authorization: "Bearer " + token }
  });

  const orders = await res.json();
  const preparing = orders.filter(o => o.status === "preparing");

  document.getElementById("adminContent").innerHTML =
    preparing.length === 0
      ? "<p>No orders in preparation</p>"
      : preparing.map(renderPreparingOrder).join("");
}



async function handleLogin(event) {
  event.preventDefault();

  const rollNumber = document.getElementById("loginId").value.trim();
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rollNumber, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Login failed");
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("userName", data.user.name);
  localStorage.setItem("role", data.user.role);

  updateNavbar();

  if (data.user.role === "admin") {
    showPage("adminPage");
    loadAdminOrders();
  } else {
    showPage("mainPage");
  }
}
  showToast("Login successful");



async function loadAdminMenu() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/menu/admin", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const items = await res.json();

  document.getElementById("adminContent").innerHTML = items.map(item => `
    <div class="admin-menu-card ${item.available ? "" : "disabled"}">
      <img src="${item.image}" />
      
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>

      <label class="switch">
        <input type="checkbox"
          ${item.available ? "checked" : ""}
          onchange="toggleMenuItem('${item._id}')">
        <span class="slider"></span>
      </label>

      <button onclick="deleteMenuItem('${item._id}')">🗑️</button>
    </div>
  `).join("");
}


loadAdminMenu(); // admin refresh
loadMenu();      // user refresh


async function toggleMenuItem(id) {
  await fetch(`/api/menu/${id}/toggle`, { method: "PUT" });
  loadAdminMenu();
  loadMenu();
}



async function deleteMenuItem(id) {
  await fetch(`/api/menu/${id}`, { method: "DELETE" });
  loadAdminMenu();
  loadMenu();
}


async function deleteItem(id) {
  await fetch(`/api/menu/${id}/delete`, { method: "PUT" });
  loadAdminMenu();
  loadMenu();
}

async function restoreItem(id) {
  await fetch(`/api/menu/${id}/restore`, { method: "PUT" });
  loadAdminMenu();
  loadMenu();
}

async function toggleAvailability(id) {
  await fetch(`/api/menu/${id}/toggle`, { method: "PUT" });
  loadAdminMenu();
  loadMenu();
}

async function loadMonthlyStats() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/admin/stats/monthly", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  document.getElementById("monthlyOrders").innerText =
    data.monthlyOrders;

  document.getElementById("monthlyRevenue").innerText =
    "₹" + data.monthlyRevenue;
}


if (pageId === "adminPage") {
  loadAdminStats();      // daily stats
  loadMonthlyStats();    // 🔥 monthly stats
  setAdminTab("orders");
}



function renderPreparingOrder(o) {
  return `
    <div class="order-card preparing">
      <h3>ORD-${o._id.slice(-6)}</h3>

      ${o.items.map(i => `
        <p>${i.product} × ${i.quantity}</p>
      `).join("")}

      <h4>Total ₹${o.totalAmount}</h4>

      <button class="btn-success"
        onclick="markCompleted('${o._id}')">
        ✅ Mark Completed
      </button>
    </div>
  `;
}




async function markCompleted(orderId) {
  const token = localStorage.getItem("token");

  await fetch(`/api/orders/${orderId}/completed`, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token }
  });

  showToast("Order completed 🎉");

  loadAdminStats();       // revenue updates
  loadPreparingOrders(); // refresh list
}


