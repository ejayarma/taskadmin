const STORAGE_KEY = 'tasks';

function getTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const tasks = getTasks();
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${task.title}</span>
      <button class="delete-btn" data-id="${task.id}">Delete</button>
    `;
    list.appendChild(li);
  });
}

function addTask(title) {
  if (!title.trim()) return;
  const tasks = getTasks();
  tasks.push({ id: Date.now(), title: title.trim() });
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('taskInput');
  addTask(input.value);
  input.value = '';
});

document.getElementById('taskInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const input = document.getElementById('taskInput');
    addTask(input.value);
    input.value = '';
  }
});

document.getElementById('taskList').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    deleteTask(Number(e.target.dataset.id));
  }
});

renderTasks();
