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

test('Create a new task with title and start date', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.fill('#taskStartDate', '2026-07-20');
  await page.click('#addBtn');

  const task = page.locator('#taskList li');
  await expect(task).toContainText('Buy groceries');
  await expect(task).toContainText('2026-07-20');
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
  await page.click('#saveEditBtn');

  const task = page.locator('#taskList li');
  await expect(task).toContainText('Buy organic groceries');
  await expect(task).toContainText('2026-07-20');
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

  page.once('dialog', dialog => dialog.accept());
  await page.click('.delete-btn');

  await expect(page.locator('#taskList li')).toHaveCount(0);
});

test('Cancel deletion when dialog is dismissed', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  page.once('dialog', dialog => dialog.dismiss());
  await page.click('.delete-btn');

  await expect(page.locator('#taskList li')).toHaveCount(1);
});

test('Task action buttons display icons', async ({ page }) => {
  await page.fill('#taskInput', 'Buy groceries');
  await page.click('#addBtn');

  await expect(page.locator('.edit-btn i')).toHaveClass(/bi-pencil/);
  await expect(page.locator('.delete-btn i')).toHaveClass(/bi-trash/);
});
