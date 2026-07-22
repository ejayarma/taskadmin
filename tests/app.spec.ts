import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('page loads with title', async ({ page }) => {
  await expect(page).toHaveTitle(/Task Manager/);
});

test('can add a task', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');
  await expect(page.locator('#taskList li')).toContainText('Buy groceries');
});

test('Create a new task with title, start date and due date', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.fill('#taskStartDate', '2026-07-20');
  await page.fill('#taskDueDate', '2026-07-25');
  await page.click('#addBtn');

  const task = page.locator('#taskList li');
  await expect(task).toContainText('Buy groceries');
  await expect(task).toContainText('2026-07-20');
  await expect(task).toContainText('Due: 2026-07-25');
});

test('Create a task auto-fills start date with today', async ({ page }) => {
  const today = new Date().toISOString().split('T')[0];
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  const task = page.locator('#taskList li');
  await expect(task).toContainText('Buy groceries');
  await expect(task).toContainText(today);
});

test('Requires start date when creating a task', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.fill('#taskStartDate', '');
  await page.fill('#taskDueDate', '2026-07-25');
  await page.click('#addBtn');

  await expect(page.locator('#taskError')).not.toHaveClass(/d-none/);
  await expect(page.locator('#taskError')).toContainText('Start date is required');
  await expect(page.locator('#taskList li')).toHaveCount(0);
});

test('Requires due date when creating a task', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.fill('#taskStartDate', '2026-07-20');
  await page.fill('#taskDueDate', '');
  await page.click('#addBtn');

  await expect(page.locator('#taskError')).not.toHaveClass(/d-none/);
  await expect(page.locator('#taskError')).toContainText('Due date is required');
  await expect(page.locator('#taskList li')).toHaveCount(0);
});

test('Requires due date to be on or after start date', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.fill('#taskStartDate', '2026-07-25');
  await page.fill('#taskDueDate', '2026-07-20');
  await page.click('#addBtn');

  await expect(page.locator('#taskError')).not.toHaveClass(/d-none/);
  await expect(page.locator('#taskError')).toContainText('Due date must be on or after the start date');
  await expect(page.locator('#taskList li')).toHaveCount(0);
});

test('List all tasks', async ({ page }) => {
  await page.evaluate(() => {
    const tasks = [
      { id: 1, title: 'Buy groceries', startDate: '' },
      { id: 2, title: 'Read a book', startDate: '' },
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  });
  await page.reload();

  const items = page.locator('#taskList li');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('Buy groceries');
  await expect(items.nth(1)).toContainText('Read a book');
});

test('Edit a task', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await page.click('.edit-btn');

  await page.fill('#editTaskTitle', 'Buy organic groceries');
  await page.fill('#editTaskStartDate', '2026-07-20');
  await page.fill('#editTaskDueDate', '2026-07-25');
  await page.click('#saveEditBtn');

  const task = page.locator('#taskList li');
  await expect(task).toContainText('Buy organic groceries');
  await expect(task).toContainText('2026-07-20');
  await expect(task).toContainText('Due: 2026-07-25');
});

test('Reorder tasks by dragging', async ({ page }) => {
  await page.evaluate(() => {
    const tasks = [
      { id: 1, title: 'Buy groceries', startDate: '' },
      { id: 2, title: 'Read a book', startDate: '' },
      { id: 3, title: 'Walk the dog', startDate: '' },
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  });
  await page.reload();

  const items = page.locator('#taskList li');
  const source = items.nth(1);
  const target = items.nth(0);

  const sourceBBox = await source.boundingBox();
  const targetBBox = await target.boundingBox();

  await page.mouse.move(
    sourceBBox.x + sourceBBox.width / 2,
    sourceBBox.y + sourceBBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBBox.x + targetBBox.width / 2,
    targetBBox.y + targetBBox.height / 2,
    { steps: 5 }
  );
  await page.mouse.up();

  await expect(items.nth(0)).toContainText('Read a book');
  await expect(items.nth(1)).toContainText('Buy groceries');
  await expect(items.nth(2)).toContainText('Walk the dog');
});

test('New task shows In Progress badge', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await expect(page.locator('#taskList li .badge')).toHaveText('In Progress');
  await expect(page.locator('#taskList li .badge')).toHaveClass(/bg-primary/);
});

test('Completed task shows Completed badge', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await page.check('.task-checkbox');

  await expect(page.locator('#taskList li .badge')).toHaveText('Completed');
  await expect(page.locator('#taskList li .badge')).toHaveClass(/bg-success/);
});

test('Overdue task shows Overdue badge', async ({ page }) => {
  await page.evaluate(() => {
    const tasks = [
      { id: 1, title: 'Old task', startDate: '2020-01-01', dueDate: '2020-01-02' },
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  });
  await page.reload();

  await expect(page.locator('#taskList li .badge')).toHaveText('Overdue');
  await expect(page.locator('#taskList li .badge')).toHaveClass(/bg-danger/);
});

test('Future task shows To Do badge', async ({ page }) => {
  const future = '2099-12-31';
  await page.fill('#taskInput', 'Future task');
  await page.fill('#taskStartDate', future);
  await page.fill('#taskDueDate', future);
  await page.click('#addBtn');

  await expect(page.locator('#taskList li .badge')).toHaveText('To Do');
  await expect(page.locator('#taskList li .badge')).toHaveClass(/bg-secondary/);
});

test('Complete a task', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await page.check('.task-checkbox');

  const taskTitle = page.locator('.task-title');
  await expect(taskTitle).toHaveClass(/text-decoration-line-through/);
  await expect(taskTitle).toHaveClass(/text-muted/);
  await expect(page.locator('#taskList li')).toHaveClass(/list-group-item-secondary/);
});

test('Delete a task with confirmation', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await page.click('.delete-btn');
  await page.click('#confirmDeleteBtn');

  await expect(page.locator('#taskList li')).toHaveCount(0);
});

test('Cancel deletion when dialog is dismissed', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await page.click('.delete-btn');
  await page.keyboard.press('Escape');

  await expect(page.locator('#taskList li')).toHaveCount(1);
});

test('Task action buttons display icons', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await expect(page.locator('.edit-btn i')).toHaveClass(/bi-pencil/);
  await expect(page.locator('.delete-btn i')).toHaveClass(/bi-trash/);
});
