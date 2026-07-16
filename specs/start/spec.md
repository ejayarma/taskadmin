# Technical Specification: Task Management App by John Ayarma

## 1. Overview

A simple client-side task management application built with vanilla HTML, CSS, and JavaScript. No backend required - tasks stored in localStorage.

## 2. Files

- `index.html` - Main HTML structure
- `styles.css` - Styling
- `app.js` - Application logic

## 3. HTML Structure

```
- Page title: "Task Manager - John Ayarma"
- Header with app title "Task Manager" and subtitle "by John Ayarma"
- Input field for task title
- Date picker for start date
- Add button
- Task list (ul)
  - Each task item (li) contains:
    - Checkbox for completion
    - Drag handle for reordering
    - Task title text
    - Start date (if set)
    - Edit button (icon)
    - Delete button (icon)
```

## 4. Features

### 4.1 Create Task
- User enters title in input field
- User optionally selects start date
- Click "Add" button or press Enter
- Task appears in the list
- Input field and date picker clear

### 4.2 List Tasks
- All tasks display in a list
- Tasks persist in localStorage
- Tasks load on page refresh

### 4.3 Delete Task
- Each task has a delete icon button
- Clicking removes the task from list and localStorage

### 4.4 Edit Task
- Each task has an edit icon button
- Clicking opens a modal to update title and start date

### 4.5 Complete Task
- Each task has a checkbox
- Checking marks task as completed with strikethrough and greyed out style

### 4.6 Reorder Tasks
- Each task has a drag handle
- Tasks can be dragged and dropped to reorder

## 5. Data Storage

- Use `localStorage` key: `tasks`
- Store as JSON array
- Each task object:
  ```js
  {
    id: Date.now(),
    title: "Task name",
    startDate: "2026-07-20",
    completed: false
  }
  ```

## 6. Styling

- Clean, minimal design
- Responsive layout
- Visual feedback on hover/interaction
