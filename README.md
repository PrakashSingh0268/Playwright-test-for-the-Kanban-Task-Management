# Kanban Task Management - Playwright Test
This project contains a Playwright test for the Kanban Task Management application hosted at https://kanban-566d8.firebaseapp.com/.

## Test Overview
This project contains two comprehensive Playwright tests for the Kanban application:

### Test 1: Move Task with Incomplete Subtasks
1. **Dynamic Column Discovery**: Automatically identifies all columns and their names
2. **Dynamic Card Selection**: Finds the first card with incomplete subtasks from non-first columns
3. **Subtask Interaction**: Completes one pending subtask by clicking its checkbox
4. **Status Change**: Moves the card to the first column via dropdown selection
5. **State Verification**: Confirms the card appears in the target column

### Test 2: Delete Complete Task
1. **Find Complete Task**: Locates the first task with all subtasks completed
2. **Open Task Modal**: Opens the task details
3. **Delete Task**: Clicks the menu button, selects "Delete Task", and confirms deletion
4. **Verify Deletion**: Confirms the task is removed from the board

## Features
-  **Dynamic Data Handling**: Adapts to changing board data without hardcoded values
-  **No Hardcoding**: Column names and card titles are discovered dynamically
-  **Robust Selectors**: Uses XPath locator strategies for complex DOM structures
-  **Comprehensive Logging**: Detailed console output for debugging and tracking test progress
-  **Well-Documented Code**: Inline comments explain each step and its purpose
-  **Modular Architecture**: Reusable utility functions, constants, and selectors
-  **Multiple Test Scenarios**: Task movement and deletion workflows

## Test Workflows

### Test 1: Move Task with Incomplete Subtasks
1. **Navigate** to the Kanban application
2. **Locate** the main board container and all column sections
3. **Extract** column names by removing task counts (e.g., "Todo (3)" → "Todo")
4. **Search** through columns (starting from the second) for incomplete tasks
5. **Identify** incomplete tasks by checking subtask status text
6. **Open** the task modal by clicking the card
7. **Complete** one pending subtask (identified by lack of line-through styling)
8. **Update** the task status via dropdown to move it to the first column
9. **Close** the modal and verify the task now appears in the first column

### Test 2: Delete Complete Task
1. **Navigate** to the Kanban application
2. **Locate** the main board container and all column sections
3. **Extract** column names from headers
4. **Search** through columns for tasks with all subtasks completed
5. **Open** the first complete task by clicking on it
6. **Click** the menu button in the task modal
7. **Select** "Delete Task" from the menu
8. **Confirm** deletion by clicking the "Delete" button
9. **Verify** the task is no longer present on the board

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

## Installation
1. Install dependencies:
npm install

2. Install Playwright browsers:
npx playwright install chromium


## Running Tests
### Run all tests
npm test

### Run tests in headed mode (see the browser)
npm run test:headed

### Run tests in debug mode
npm run test:debug

### Run tests with repetition (validate consistency)
npm run test:repeat
Or manually:
npx playwright test --repeat-each 5

## Test Strategy
### Dynamic Data Resilience
The test is designed to handle dynamic data by:
1. **Dynamic Column Discovery**: Automatically identifies column names and their order from h2 headers
2. **Smart Card Selection**: Searches for cards that meet criteria (incomplete subtasks, not in first column) by examining status text
3. **Flexible Locators**: Uses XPath expressions to navigate complex nested DOM structures

### Key Test Steps

#### Test 1: Move Task with Incomplete Subtasks
1. **Navigate and Load**: Opens the Kanban app and locates the main board container
2. **Identify Columns**: Dynamically discovers all column sections and extracts their names
3. **Find Suitable Card**: Iterates through columns (excluding the first) to find a card with incomplete subtasks
4. **Open Card Details**: Clicks the selected card to open the edit modal
5. **Complete Subtask**: Finds a pending subtask (without line-through class) and clicks to complete it
6. **Verify Completion**: Confirms the subtask now has line-through styling
7. **Move Card**: Changes the card's status to the first column via the "Current Status" dropdown
8. **Close Modal**: Closes the modal by clicking outside of it
9. **Verify Position**: Confirms the card now appears in the first column

#### Test 2: Delete Complete Task
1. **Navigate and Load**: Opens the Kanban app and locates the main board container
2. **Identify Columns**: Dynamically discovers all column sections and extracts their names
3. **Find Complete Task**: Uses `.then()` and `.catch()` pattern to search for tasks with all subtasks completed
4. **Open Task Modal**: Automatically opens when complete task is found
5. **Access Menu**: Clicks the menu button in the modal
6. **Initiate Deletion**: Clicks "Delete Task" option from the menu
7. **Confirm Deletion**: Clicks the "Delete" confirmation button
8. **Verify Removal**: Confirms the task no longer exists on the board

## Project Structure
KanbanTask/
├── tests/
│   ├── kanban.spec.ts           # Main test file with test scenarios
│   └── utils/
│       ├── commonUtils.ts       # Reusable utility functions
│       ├── constants.ts         # Application constants (URLs, timeouts)
│       └── selectors.ts         # Centralized element selectors
├── playwright.config.ts         # Playwright configuration
├── package.json                 # Node.js dependencies
├── TEST_SUMMARY.md             # Test execution summary
└── README.md                   # This file


### File Descriptions
- **`kanban.spec.ts`**: Contains the main test scenarios (move task, delete task)
- **`commonUtils.ts`**: Helper functions for:
  - Column name extraction
  - Finding tasks (incomplete/complete)
  - Completing subtasks
  - Moving tasks between columns
  - Deleting tasks
  - Verification functions
- **`constants.ts`**: Centralized constants for URLs, timeouts, and selectors
- **`selectors.ts`**: All XPath and CSS selectors used across tests


