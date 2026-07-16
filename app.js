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
      <span class="task-title">${task.title}</span>
      <span class="task-start-date">${task.startDate || ''}</span>
      <button class="edit-btn" data-id="${task.id}">Edit</button>
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

function editTask(id, newTitle, startDate) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle;
    task.startDate = startDate;
    saveTasks(tasks);
    renderTasks();
  }
}

function showEditModal(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const modal = document.getElementById('editModal');
  const titleInput = document.getElementById('editTaskTitle');
  const dateInput = document.getElementById('editTaskStartDate');
  const saveBtn = document.getElementById('saveEditBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');

  titleInput.value = task.title;
  dateInput.value = task.startDate || '';
  modal.style.display = 'flex';

  const handleSave = () => {
    editTask(id, titleInput.value, dateInput.value);
    modal.style.display = 'none';
    cleanup();
  };

  const handleCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };

  const cleanup = () => {
    saveBtn.removeEventListener('click', handleSave);
    cancelBtn.removeEventListener('click', handleCancel);
  };

  saveBtn.addEventListener('click', handleSave);
  cancelBtn.addEventListener('click', handleCancel);
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
  } else if (e.target.classList.contains('edit-btn')) {
    showEditModal(Number(e.target.dataset.id));
  }
});

renderTasks();
