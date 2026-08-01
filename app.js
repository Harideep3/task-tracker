/* ===========================================================
   Ledger — app.js
   A small vanilla-JS task tracker. No frameworks, no build step —
   just DOM APIs and localStorage, so it's easy to read top to bottom.
   =========================================================== */

// ---- State ----------------------------------------------------
// Every task looks like:
// { id, title, category, priority, due, completed, createdAt, completedAt }
let tasks = loadTasks();
let activeFilter = "all";   // all | active | completed
let activeCategory = "all"; // all | Work | School | Personal
let sortBy = "created";     // created | due | priority

// ---- Elements ---------------------------------------------------
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDue = document.getElementById("taskDue");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const openCount = document.getElementById("openCount");
const doneCount = document.getElementById("doneCount");
const todayDate = document.getElementById("todayDate");
const sortSelect = document.getElementById("sortBy");
const weekChart = document.getElementById("weekChart");

// ---- Persistence -------------------------------------------------
function loadTasks() {
  try {
    const raw = localStorage.getItem("ledger-tasks");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Couldn't read saved tasks:", err);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("ledger-tasks", JSON.stringify(tasks));
}

// ---- Helpers -------------------------------------------------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ---- Rendering -------------------------------------------------
function render() {
  // Filter
  let visible = tasks.filter(t => {
    if (activeFilter === "active" && t.completed) return false;
    if (activeFilter === "completed" && !t.completed) return false;
    if (activeCategory !== "all" && t.category !== activeCategory) return false;
    return true;
  });

  // Sort
  visible = visible.slice().sort((a, b) => {
    if (sortBy === "due") {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    }
    if (sortBy === "priority") {
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    }
    return a.createdAt - b.createdAt;
  });

  taskList.innerHTML = "";
  visible.forEach(task => taskList.appendChild(renderTaskItem(task)));

  emptyState.classList.toggle("visible", visible.length === 0);

  openCount.textContent = tasks.filter(t => !t.completed).length;
  doneCount.textContent = tasks.filter(t => t.completed).length;

  drawWeekChart();
}

function renderTaskItem(task) {
  const li = document.createElement("li");
  li.className = `task-item priority-${task.priority}${task.completed ? " completed" : ""}`;

  const check = document.createElement("button");
  check.className = `task-check${task.completed ? " checked" : ""}`;
  check.setAttribute("aria-label", "Toggle complete");
  check.addEventListener("click", () => toggleComplete(task.id));

  const main = document.createElement("div");
  main.className = "task-main";
  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;
  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = task.due ? `due ${formatDate(task.due)}` : "no due date";
  main.appendChild(title);
  main.appendChild(meta);

  const cat = document.createElement("span");
  cat.className = "task-cat";
  cat.textContent = task.category;

  const del = document.createElement("button");
  del.className = "task-delete";
  del.setAttribute("aria-label", "Delete task");
  del.textContent = "✕";
  del.addEventListener("click", () => deleteTask(task.id));

  li.appendChild(check);
  li.appendChild(main);
  li.appendChild(cat);
  li.appendChild(del);
  return li;
}

// ---- Actions -------------------------------------------------
function addTask(e) {
  e.preventDefault();
  const title = taskTitle.value.trim();
  if (!title) return;

  tasks.push({
    id: uid(),
    title,
    category: taskCategory.value,
    priority: taskPriority.value,
    due: taskDue.value || null,
    completed: false,
    createdAt: Date.now(),
    completedAt: null
  });

  saveTasks();
  taskForm.reset();
  taskPriority.value = "medium";
  render();
  taskTitle.focus();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.completedAt = task.completed ? Date.now() : null;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// ---- Weekly chart (plain canvas, no chart library needed) --------
function drawWeekChart() {
  const ctx = weekChart.getContext("2d");
  const w = weekChart.width;
  const h = weekChart.height;
  ctx.clearRect(0, 0, w, h);

  // Count completions for each of the last 7 days (oldest -> newest)
  const days = [];
  const labels = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = tasks.filter(t => t.completed && t.completedAt &&
      new Date(t.completedAt).toISOString().slice(0, 10) === key).length;
    days.push(count);
    labels.push("SMTWTFS"[d.getDay()]);
  }

  const max = Math.max(1, ...days);
  const barWidth = w / days.length;
  const chartHeight = h - 20;

  ctx.font = "10px monospace";
  ctx.fillStyle = "#8B9A93";
  ctx.textAlign = "center";

  days.forEach((count, i) => {
    const barHeight = (count / max) * (chartHeight - 10);
    const x = i * barWidth + barWidth * 0.2;
    const barW = barWidth * 0.6;
    const y = chartHeight - barHeight;

    ctx.fillStyle = count > 0 ? "#2F6F5E" : "#E4E0D6";
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barHeight || 2, 3);
    ctx.fill();

    ctx.fillStyle = "#8B9A93";
    ctx.fillText(labels[i], x + barW / 2, h - 6);
  });
}

// ---- Event wiring -------------------------------------------------
taskForm.addEventListener("submit", addTask);

sortSelect.addEventListener("change", () => {
  sortBy = sortSelect.value;
  render();
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.cat;
    render();
  });
});

// ---- Init -------------------------------------------------
todayDate.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long", month: "long", day: "numeric"
});

render();
