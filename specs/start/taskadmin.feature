Feature: Task Management
As a user
I want to manage my tasks
So that I can keep track of things I need to do

Scenario: Create a new task
Given the user has no tasks
When the user creates a task with title "Buy groceries"
Then the task "Buy groceries" should be added to the task list

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
When the user edits the task to change title to "Buy organic groceries" and set start date to "2026-07-20"
Then the task should have the updated title "Buy organic groceries"
And the task should have start date "2026-07-20"

