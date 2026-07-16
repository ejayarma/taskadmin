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
    li.draggable = true;
    li.dataset.id = task.id;
    li.className = task.completed ? 'completed' : '';
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
      <span class="drag-handle">⠿</span>
      <span class="task-title">${task.title}</span>
      <span class="task-start-date">${task.startDate || ''}</span>
      <button class="edit-btn" data-id="${task.id}">✎</button>
      <button class="delete-btn" data-id="${task.id}">✕</button>
    `;
    list.appendChild(li);
  });
}

function addTask(title, startDate) {
  if (!title.trim()) return;
  const tasks = getTasks();
  tasks.push({ id: Date.now(), title: title.trim(), startDate: startDate || '' });
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function toggleCompleted(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks(tasks);
    renderTasks();
  }
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

function reorderTasks(fromId, toId) {
  const tasks = getTasks();
  const fromIndex = tasks.findIndex(t => t.id === fromId);
  const toIndex = tasks.findIndex(t => t.id === toId);
  if (fromIndex === -1 || toIndex === -1) return;
  
  const [movedTask] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, movedTask);
  saveTasks(tasks);
  renderTasks();
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
  const dateInput = document.getElementById('taskStartDate');
  addTask(input.value, dateInput.value);
  input.value = '';
  dateInput.value = '';
});

document.getElementById('taskInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('taskStartDate');
    addTask(input.value, dateInput.value);
    input.value = '';
    dateInput.value = '';
  }
});

document.getElementById('taskList').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    deleteTask(Number(e.target.dataset.id));
  } else if (e.target.classList.contains('edit-btn')) {
    showEditModal(Number(e.target.dataset.id));
  } else if (e.target.classList.contains('task-checkbox')) {
    toggleCompleted(Number(e.target.dataset.id));
  }
});

let draggedItem = null;

document.getElementById('taskList').addEventListener('dragstart', (e) => {
  if (e.target.tagName === 'LI') {
    draggedItem = e.target;
    e.target.classList.add('dragging');
  }
});

document.getElementById('taskList').addEventListener('dragend', (e) => {
  if (e.target.tagName === 'LI') {
    e.target.classList.remove('dragging');
    draggedItem = null;
  }
});

document.getElementById('taskList').addEventListener('dragover', (e) => {
  e.preventDefault();
  const target = e.target.closest('li');
  if (target && target !== draggedItem) {
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (e.clientY < midY) {
      target.parentNode.insertBefore(draggedItem, target);
    } else {
      target.parentNode.insertBefore(draggedItem, target.nextSibling);
    }
  }
});

document.getElementById('taskList').addEventListener('drop', (e) => {
  e.preventDefault();
  if (draggedItem) {
    const fromId = Number(draggedItem.dataset.id);
    const items = [...document.querySelectorAll('#taskList li')];
    const toIndex = items.indexOf(draggedItem);
    
    const tasks = getTasks();
    const movedTask = tasks.find(t => t.id === fromId);
    if (movedTask) {
      const newTasks = tasks.filter(t => t.id !== fromId);
      newTasks.splice(toIndex, 0, movedTask);
      saveTasks(newTasks);
      renderTasks();
    }
  }
});

renderTasks();
