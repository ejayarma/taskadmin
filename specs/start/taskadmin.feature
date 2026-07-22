Feature: Task Management
As a user
I want to manage my tasks
So that I can keep track of things I need to do

Scenario: Create a new task with start date and due date
Given the user has no tasks
When the user creates a task with title "Buy groceries", start date "2026-07-20" and due date "2026-07-25"
Then the task "Buy groceries" should be added to the task list with start date "2026-07-20" and due date "2026-07-25"

Scenario: Create a new task with auto-filled start date
Given the user has no tasks
When the user creates a task with title "Buy groceries"
Then the task "Buy groceries" should appear with today's date as start date

Scenario: List all tasks
Given the user has the following tasks:
title
| Buy groceries
| Read a book
When the user requests the list of tasks
Then the user should see 2 tasks
And the tasks should include "Buy groceries" and "Read a book"

Scenario: Edit a task
Given the user has a task "Buy groceries"
When the user edits the task to change title to "Buy organic groceries", start date to "2026-07-20" and due date to "2026-07-25"
Then the task should have the updated title "Buy organic groceries"
And the task should have start date "2026-07-20"
And the task should have due date "2026-07-25"

Scenario: Reorder tasks by dragging
Given the user has the following tasks:
title
| Buy groceries
| Read a book
| Walk the dog
When the user drags "Read a book" to the first position
Then the tasks should be in the order:
title
| Read a book
| Buy groceries
| Walk the dog

Scenario: Complete a task
Given the user has a task "Buy groceries"
When the user marks "Buy groceries" as completed
Then the task "Buy groceries" should be struck through and greyed out

Scenario: Delete a task with confirmation
Given the user has a task "Buy groceries"
When the user clicks delete on task "Buy groceries"
Then a confirmation dialog should be shown
When the user confirms the deletion
Then the task "Buy groceries" should not appear in the task list

Scenario: Cancel deletion of a task
Given the user has a task "Buy groceries"
When the user clicks delete on task "Buy groceries"
Then a confirmation dialog should be shown
When the user cancels the deletion
Then the task "Buy groceries" should still appear in the task list

Scenario: Task action buttons display icons
Given the user has a task "Buy groceries"
Then the task "Buy groceries" should display an edit icon button
And the task "Buy groceries" should display a delete icon button

