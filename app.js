const STORAGE_KEY = 'tasks';
let currentEditId = null;
let pendingDeleteId = null;
let draggedItem = null;

function getTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function statusText(task) {
  if (task.completed) return 'Completed';
  if (task.dueDate && task.dueDate < todayStr()) return 'Overdue';
  if (task.startDate && task.startDate > todayStr()) return 'To Do';
  return 'In Progress';
}

function statusBadgeClass(task) {
  if (task.completed) return 'completed';
  if (task.dueDate && task.dueDate < todayStr()) return 'overdue';
  if (task.startDate && task.startDate > todayStr()) return 'todo';
  return 'in-progress';
}

function showError(msg) {
  const el = document.getElementById('taskError');
  el.textContent = msg;
  el.classList.add('visible');
}

function clearError() {
  document.getElementById('taskError').classList.remove('visible');
}

function validateDates(startDate, dueDate) {
  if (!startDate) return 'Start date is required';
  if (!dueDate) return 'Due date is required';
  if (dueDate < startDate) return 'Due date must be on or after the start date';
  return '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function updateProgress() {
  const tasks = getTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressPercent').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
}

function updateCategories() {
  const tasks = getTasks();
  const office = tasks.filter(t => (t.category || 'general') === 'office').length;
  const personal = tasks.filter(t => (t.category || 'general') === 'personal').length;
  document.getElementById('officeCount').textContent = office + ' Tasks';
  document.getElementById('personalCount').textContent = personal + ' Tasks';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderTasks() {
  const tasks = getTasks();
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  document.getElementById('taskCount').textContent = tasks.length;

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = task.id;
    li.className = 'task-card' + (task.completed ? ' completed' : '');

    const time = formatDate(task.startDate) || formatDate(task.dueDate);

    const descHtml = task.description
      ? `<div class="task-desc">${escapeHtml(task.description)}</div>`
      : '';

    li.innerHTML = `
      <i class="bi bi-grip-vertical drag-handle"></i>
      <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
      <div class="task-content">
        <div class="task-title${task.completed ? ' completed' : ''}">${escapeHtml(task.title)}</div>
        ${descHtml}
      </div>
      <div class="task-time">${time || task.dueDate || ''}</div>
      <span class="task-badge ${statusBadgeClass(task)}">${statusText(task)}</span>
      <div class="task-actions">
        <button class="task-action-btn view-btn" data-id="${task.id}" title="View">
          <i class="bi bi-eye"></i>
        </button>
        <button class="task-action-btn edit-btn" data-id="${task.id}" title="Edit">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="task-action-btn danger delete-btn" data-id="${task.id}" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;

    list.appendChild(li);
  });

  updateProgress();
  updateCategories();
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function addTask(title, description, startDate, dueDate) {
  if (!title.trim()) return false;
  const err = validateDates(startDate, dueDate);
  if (err) { showError(err); return false; }
  clearError();
  const tasks = getTasks();
  tasks.push({
    id: Date.now(),
    title: title.trim(),
    description: description.trim(),
    startDate: startDate || todayStr(),
    dueDate: dueDate || '',
    completed: false,
    category: 'general'
  });
  saveTasks(tasks);
  renderTasks();
  return true;
}

function deleteTask(id) {
  pendingDeleteId = id;
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  const title = task ? task.title : '';
  document.getElementById('deleteTaskTitle').textContent =
    title.length > 50 ? title.slice(0, 50) + '...' : title;
  openModal('deleteModal');
}

function confirmDelete() {
  if (pendingDeleteId === null) return;
  const tasks = getTasks().filter(t => t.id !== pendingDeleteId);
  saveTasks(tasks);
  renderTasks();
  pendingDeleteId = null;
  closeModal('deleteModal');
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

function editTask(id, newTitle, description, startDate, dueDate) {
  const err = validateDates(startDate, dueDate);
  if (err) { showError(err); return false; }
  clearError();
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle;
    task.description = description.trim();
    task.startDate = startDate;
    task.dueDate = dueDate;
    saveTasks(tasks);
    renderTasks();
  }
  return true;
}

function showViewModal(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  document.getElementById('viewTaskTitle').textContent = task.title;
  document.getElementById('viewTaskDescription').textContent = task.description || 'Not set';
  document.getElementById('viewTaskStartDate').textContent = task.startDate || 'Not set';
  document.getElementById('viewTaskDueDate').textContent = task.dueDate || 'Not set';
  document.getElementById('viewTaskStatus').textContent = statusText(task);
  openModal('viewModal');
}

function showEditModal(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  currentEditId = id;
  document.getElementById('editTaskTitle').value = task.title;
  document.getElementById('editTaskDescription').value = task.description || '';
  document.getElementById('editTaskStartDate').value = task.startDate || todayStr();
  document.getElementById('editTaskDueDate').value = task.dueDate || '';
  openModal('editModal');
}

function initModals() {
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.custom-modal');
      if (modal) modal.classList.remove('open');
    });
  });

  document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
      const modal = overlay.closest('.custom-modal');
      modal.classList.remove('open');
      if (modal.id === 'deleteModal') pendingDeleteId = null;
    });
  });
}

function initBottomNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function initDragDrop() {
  document.getElementById('taskList').addEventListener('dragstart', (e) => {
    const li = e.target.closest('li');
    if (li) {
      draggedItem = li;
      li.style.opacity = '0.5';
    }
  });

  document.getElementById('taskList').addEventListener('dragend', (e) => {
    const li = e.target.closest('li');
    if (li) {
      li.style.opacity = '';
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
}

function initEventListeners() {
  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

  document.getElementById('addBtn').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    const desc = document.getElementById('taskDescription');
    const dateInput = document.getElementById('taskStartDate');
    const dueDateInput = document.getElementById('taskDueDate');
    if (addTask(input.value, desc.value, dateInput.value, dueDateInput.value)) {
      input.value = '';
      desc.value = '';
      dateInput.value = todayStr();
      dueDateInput.value = todayStr();
    }
  });

  document.getElementById('taskInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = document.getElementById('taskInput');
      const desc = document.getElementById('taskDescription');
      const dateInput = document.getElementById('taskStartDate');
      const dueDateInput = document.getElementById('taskDueDate');
      if (addTask(input.value, desc.value, dateInput.value, dueDateInput.value)) {
        input.value = '';
        desc.value = '';
        dateInput.value = todayStr();
        dueDateInput.value = todayStr();
      }
    }
  });

  document.getElementById('taskList').addEventListener('click', (e) => {
    const target = e.target.closest('[data-id]');
    if (!target) return;

    const id = Number(target.dataset.id);
    if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
      deleteTask(id);
    } else if (target.classList.contains('view-btn') || target.closest('.view-btn')) {
      showViewModal(id);
    } else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
      showEditModal(id);
    } else if (target.classList.contains('task-checkbox')) {
      e.stopPropagation();
      toggleCompleted(id);
    }
  });

  document.getElementById('saveEditBtn').addEventListener('click', () => {
    const titleInput = document.getElementById('editTaskTitle');
    const descInput = document.getElementById('editTaskDescription');
    const dateInput = document.getElementById('editTaskStartDate');
    const dueDateInput = document.getElementById('editTaskDueDate');
    if (editTask(currentEditId, titleInput.value, descInput.value, dateInput.value, dueDateInput.value)) {
      closeModal('editModal');
    }
  });

  document.getElementById('viewProgressBtn').addEventListener('click', () => {
    const tasks = getTasks();
    if (tasks.length > 0) {
      showViewModal(tasks[0].id);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('taskStartDate').value = todayStr();
  document.getElementById('taskDueDate').value = todayStr();

  initModals();
  initBottomNav();
  initDragDrop();
  initEventListeners();
  renderTasks();
});
