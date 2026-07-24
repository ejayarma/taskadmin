---
name: new-feature-workflow
description: End-to-end workflow for creating new features including branch creation, Gherkin user stories, technical specs, build, run, and test generation
---

## Steps

When the user asks to create a new feature or add functionality, follow these steps in order:

### Step 1: Create a branch
Create a descriptive git branch for the feature using the naming convention `feature/<short-description>`.

### Step 2: Review existing user stories
Read all `.feature` files in the `/specs` folder (recursively). List the existing features and scenarios to understand what already exists.

### Step 3: Create or modify Gherkin user story
- If the feature is entirely new, generate a new `.feature` file in `/specs` with Gherkin syntax.
- If the feature extends an existing one, modify the relevant `.feature` file.
- Use standard Gherkin format: `Feature`, `As a`, `I want`, `So that`, `Scenario`, `Given`, `When`, `Then`, `And`.
- Save with `.feature` extension under `/specs`.

### Step 4: Write technical specification
Based on the user story, generate a detailed technical specification and save it at `/specs/spec.md`. Include:
- Overview
- Architecture / components
- Data model

- API or storage details
- Implementation notes

### Step 5: User review
Present the user story and technical specification to the user. Ask explicitly: "Please review the user story and specification before I proceed to implementation." Wait for their approval or changes.

### Step 6: Build
Implement the feature according to the specification.

### Step 7: Run
Start the dev server or run the application so the user can verify.

### Step 8: Create tests
Generate automated tests from the Gherkin user story scenarios. Save tests in the `/tests` folder following the project's existing test patterns (Playwright).
