const STORAGE_KEY = 'tasks';
let editModal = null;
let deleteModal = null;
let currentEditId = null;
let pendingDeleteId = null;

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
    li.className = `list-group-item d-flex align-items-center ${task.completed ? 'list-group-item-secondary' : ''}`;
    li.innerHTML = `
      <input type="checkbox" class="form-check-input me-2 task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
      <i class="bi bi-grip-vertical text-muted me-2 drag-handle"></i>
      <span class="task-title flex-grow-1 ${task.completed ? 'text-decoration-line-through text-muted' : ''}">${task.title}</span>
      <span class="task-start-date text-muted me-2 small">${task.startDate || ''}</span>
      <span class="task-due-date text-muted me-3 small">${task.dueDate ? 'Due: ' + task.dueDate : ''}</span>
      <button class="btn btn-sm btn-outline-info me-1 view-btn" data-id="${task.id}" title="View task">
        <i class="bi bi-eye"></i>
      </button>
      <button class="btn btn-sm btn-outline-warning me-1 edit-btn" data-id="${task.id}">
        <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${task.id}">
        <i class="bi bi-trash"></i>
      </button>
    `;
    list.appendChild(li);
  });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function showError(msg) {
  const el = document.getElementById('taskError');
  el.textContent = msg;
  el.classList.remove('d-none');
}

function clearError() {
  document.getElementById('taskError').classList.add('d-none');
}

function validateDates(startDate, dueDate) {
  if (!startDate) return 'Start date is required';
  if (!dueDate) return 'Due date is required';
  if (dueDate < startDate) return 'Due date must be on or after the start date';
  return '';
}

function addTask(title, startDate, dueDate) {
  if (!title.trim()) return false;
  const err = validateDates(startDate, dueDate);
  if (err) { showError(err); return false; }
  clearError();
  const tasks = getTasks();
  tasks.push({
    id: Date.now(),
    title: title.trim(),
    startDate: startDate || todayStr(),
    dueDate: dueDate || ''
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
  deleteModal.show();
}

function confirmDelete() {
  if (pendingDeleteId === null) return;
  const tasks = getTasks().filter(t => t.id !== pendingDeleteId);
  saveTasks(tasks);
  renderTasks();
  pendingDeleteId = null;
  deleteModal.hide();
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

function editTask(id, newTitle, startDate, dueDate) {
  const err = validateDates(startDate, dueDate);
  if (err) { showError(err); return false; }
  clearError();
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle;
    task.startDate = startDate;
    task.dueDate = dueDate;
    saveTasks(tasks);
    renderTasks();
  }
  return true;
}

let viewModal = null;

function showViewModal(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  document.getElementById('viewTaskTitle').textContent = task.title;
  document.getElementById('viewTaskStartDate').textContent = task.startDate || 'Not set';
  document.getElementById('viewTaskDueDate').textContent = task.dueDate || 'Not set';
  document.getElementById('viewTaskStatus').textContent = task.completed ? 'Completed' : 'Pending';
  viewModal.show();
}

function showEditModal(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  currentEditId = id;
  const titleInput = document.getElementById('editTaskTitle');
  const dateInput = document.getElementById('editTaskStartDate');
  const dueDateInput = document.getElementById('editTaskDueDate');

  titleInput.value = task.title;
  dateInput.value = task.startDate || todayStr();
  dueDateInput.value = task.dueDate || '';

  editModal.show();
}

document.addEventListener('DOMContentLoaded', () => {
  editModal = new bootstrap.Modal(document.getElementById('editModal'));
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  viewModal = new bootstrap.Modal(document.getElementById('viewModal'));

  document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

  document.getElementById('deleteModal').addEventListener('hidden.bs.modal', () => {
    pendingDeleteId = null;
  });

  document.getElementById('taskStartDate').value = todayStr();
  document.getElementById('taskDueDate').value = todayStr();
  document.getElementById('editTaskStartDate').value = todayStr();
  document.getElementById('editTaskDueDate').value = todayStr();

  document.getElementById('addBtn').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('taskStartDate');
    const dueDateInput = document.getElementById('taskDueDate');
    if (addTask(input.value, dateInput.value, dueDateInput.value)) {
      input.value = '';
      dateInput.value = todayStr();
      dueDateInput.value = todayStr();
    }
  });

  document.getElementById('taskInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = document.getElementById('taskInput');
      const dateInput = document.getElementById('taskStartDate');
      const dueDateInput = document.getElementById('taskDueDate');
      if (addTask(input.value, dateInput.value, dueDateInput.value)) {
        input.value = '';
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
      toggleCompleted(id);
    }
  });

  document.getElementById('saveEditBtn').addEventListener('click', () => {
    const titleInput = document.getElementById('editTaskTitle');
    const dateInput = document.getElementById('editTaskStartDate');
    const dueDateInput = document.getElementById('editTaskDueDate');
    if (editTask(currentEditId, titleInput.value, dateInput.value, dueDateInput.value)) {
      editModal.hide();
    }
  });

  let draggedItem = null;

  document.getElementById('taskList').addEventListener('dragstart', (e) => {
    const li = e.target.closest('li');
    if (li) {
      draggedItem = li;
      li.classList.add('opacity-50');
    }
  });

  document.getElementById('taskList').addEventListener('dragend', (e) => {
    const li = e.target.closest('li');
    if (li) {
      li.classList.remove('opacity-50');
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
});
