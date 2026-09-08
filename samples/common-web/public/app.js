// MiniTask フロントエンド。ビルド不要の素の JS。
"use strict";

const listEl = document.getElementById("task-list");
const formEl = document.getElementById("new-task-form");
const titleInput = document.getElementById("new-task-title");

async function fetchTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  listEl.innerHTML = "";
  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleDone(task));

    const label = document.createElement("span");
    label.textContent = task.title;

    li.append(checkbox, label);
    listEl.appendChild(li);
  }
}

async function toggleDone(task) {
  await fetch(`/api/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: !task.done }),
  });
  fetchTasks();
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  titleInput.value = "";
  fetchTasks();
});

fetchTasks();
