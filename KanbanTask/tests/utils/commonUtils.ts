import { Page, Locator, expect } from "@playwright/test";
import { TIMEOUTS, SELECTORS } from "./constants";
/**
 * Interface representing a task with incomplete subtasks
 */
export interface IncompleteTask {
    taskName: string;
    sourceColumnIndex: number;
    sourceColumnName: string;
}

/**
 * Extracts and returns the names of all columns from the Kanban board
 * @param board - The main board container locator
 * @returns Array of column names (without task count)
 */
export async function getColumnNames(board: Locator): Promise<string[]> {
    console.log("Extracting column names...");
    const columns = board.locator(SELECTORS.columnSection);
    const columnCount = await columns.count();
    const columnNames: string[] = [];
    for (let i = 0; i < columnCount; i++) {
        const rawName = await columns.nth(i).locator(SELECTORS.columnHeader).textContent({ timeout: TIMEOUTS.max });
        if (rawName) {
            // Clean the name by removing everything after "(" (task count)
            const cleanName = rawName.split("(")[0].trim();
            columnNames.push(cleanName);
        }
    }
    return columnNames;
}

/**
 * Finds the first task with incomplete subtasks across all columns
 * @param board - The main board container locator
 * @param columnNames - Array of column names
 * @param skipFirstColumn - Whether to skip the first column in search
 * @returns Information about the incomplete task or null if none found
 */
export async function findFirstIncompleteTask(
    board: Locator,
    columnNames: string[],
    skipFirstColumn: boolean = true
): Promise<IncompleteTask | null> {
    console.log("Searching for the first task with incomplete subtasks...");
    const columns = board.locator(SELECTORS.columnSection);
    const columnCount = await columns.count();
    const startIndex = skipFirstColumn ? 1 : 0;
    for (let i = startIndex; i < columnCount; i++) {
        const column = columns.nth(i);
        const taskCards = column.locator(SELECTORS.taskCard);
        const cardCount = await taskCards.count();
        console.log(`Column ${i + 1} (${columnNames[i]}): ${cardCount} tasks found`);
        if (cardCount === 0) {
            console.log(`No tasks in column "${columnNames[i]}". Skipping...`);
            continue;
        }
        // Check each card in the column to find one with incomplete subtasks
        for (let j = 0; j < cardCount; j++) {
            const statusText = (await taskCards.nth(j).locator(SELECTORS.taskStatus).textContent({ timeout: TIMEOUTS.max }))?.trim() || "";
            console.log("Status text:", statusText);
            const match = statusText.match(/(\d+) of (\d+)/);
            // If status doesn't show "n of n" (all complete), this task has incomplete subtasks
            if (match && match[1] !== match[2]) {
                const taskName = (await taskCards.nth(j).locator(SELECTORS.taskTitle).textContent({ timeout: TIMEOUTS.max }))?.trim() || "";
                console.log(`Found task "${taskName}" with incomplete subtasks in column "${columnNames[i]}"`);
                // Click to open the task modal
                await taskCards.nth(j).click({ timeout: TIMEOUTS.max });
                return {
                    taskName,
                    sourceColumnIndex: i,
                    sourceColumnName: columnNames[i],
                };
            }
        }
        console.log(`All tasks in column "${columnNames[i]}" are completed. Moving to next column...`);
    }
    return null;
}

/**
 * Finds the first task with all subtasks completed across all columns
 * @param board - The main board container locator
 * @param columnNames - Array of column names
 * @param skipFirstColumn - Whether to skip the first column in search
 * @returns Information about the complete task or null if none found
 */
export async function findFirstCompleteTask(
    board: Locator,
    columnNames: string[],
    skipFirstColumn: boolean = true
): Promise<IncompleteTask | null> {
    console.log("Searching for the first task with all subtasks completed...");
    const columns = board.locator(SELECTORS.columnSection);
    const columnCount = await columns.count();
    const startIndex = skipFirstColumn ? 1 : 0;
    for (let i = startIndex; i < columnCount; i++) {
        const column = columns.nth(i);
        const taskCards = column.locator(SELECTORS.taskCard);
        const cardCount = await taskCards.count();
        console.log(`Column ${i + 1} (${columnNames[i]}): ${cardCount} tasks found`);
        if (cardCount === 0) {
            console.log(`No tasks in column "${columnNames[i]}". Skipping...`);
            continue;
        }
        // Check each card in the column to find one with all subtasks completed
        for (let j = 0; j < cardCount; j++) {
            const statusText = (await taskCards.nth(j).locator(SELECTORS.taskStatus).textContent({ timeout: TIMEOUTS.max }))?.trim() || "";
            console.log("Status text:", statusText);
            const match = statusText.match(/(\d+) of (\d+)/);
            // If status shows "n of n" (all complete), this task has all subtasks completed
            if (match && match[1] === match[2]) {
                const taskName = (await taskCards.nth(j).locator(SELECTORS.taskTitle).textContent({ timeout: TIMEOUTS.max }))?.trim() || "";
                console.log(`Found task "${taskName}" with all subtasks completed in column "${columnNames[i]}"`);
                // Click to open the task modal
                await taskCards.nth(j).click({ timeout: TIMEOUTS.max });
                return {
                    taskName,
                    sourceColumnIndex: i,
                    sourceColumnName: columnNames[i],
                };
            }
        }
        console.log(`No completed tasks found in column "${columnNames[i]}". Moving to next column...`);
    }
    return null;
}

/**
 * Completes the first pending subtask in the opened modal
 * @param page - The Playwright page object
 */
export async function completeFirstPendingSubtask(page: Page): Promise<void> {
    console.log("Validating task modal is visible...");
    const modal = page.locator(SELECTORS.modal);
    await expect(modal.first(),`Modal not found`).toBeVisible({ timeout: TIMEOUTS.max });
    console.log("Completing one pending subtask inside the modal...");
    const pendingSubtask = modal.locator(SELECTORS.pendingSubtask);
    await expect(pendingSubtask.first(),`Pending subtask not found`).toBeVisible({ timeout: TIMEOUTS.max });
    await pendingSubtask.first().click({ timeout: TIMEOUTS.max });
    console.log("Verifying that subtask is now marked completed...");
    const completedSubtask = modal.locator(SELECTORS.completedSubtask);
    await expect(completedSubtask.first(),`Completed subtask not found`).toBeVisible({ timeout: TIMEOUTS.max });
}

/**
 * Moves the currently opened task to a specified column
 * @param page - The Playwright page object
 * @param targetColumnName - The name of the target column
 */
export async function moveTaskToColumn(page: Page, targetColumnName: string): Promise<void> {
    console.log(`Updating 'Current Status' to "${targetColumnName}"...`);
    const statusDropdown = page.locator(SELECTORS.statusDropdown);
    await statusDropdown.click({ timeout: TIMEOUTS.max });
    const targetStatusOption = page
        .locator(SELECTORS.modal)
        .getByText(new RegExp(targetColumnName, "i"));
    await expect(targetStatusOption,`Target status option not found`).toBeVisible({ timeout: TIMEOUTS.max });
    await targetStatusOption.click({ timeout: TIMEOUTS.max });
}

/**
 * Closes the modal by clicking outside of it
 * @param page - The Playwright page object
 */
export async function closeModal(page: Page): Promise<void> {
    console.log("Closing modal...");
    await page.mouse.click(50, 50);
}

/**
 * Verifies that a task is present in the first column
 * @param page - The Playwright page object
 * @param taskName - The name of the task to verify
 * @param firstColumnName - The name of the first column for logging
 */
export async function verifyTaskInFirstColumn(
    page: Page,
    taskName: string,
    firstColumnName: string
): Promise<void> {
    console.log("Verifying that task moved to first column...");
    const firstColumnTasks = page.locator(SELECTORS.firstColumnTasks);
    const allFirstColTasks = (await firstColumnTasks.allTextContents()).map((t) => t.trim());
    expect(allFirstColTasks.some((t) => t === taskName),`Expected "${taskName}" to appear in first column "${firstColumnName}"`).toBeTruthy();
}

/**
 * Deletes the currently opened task via the menu
 * @param page - The Playwright page object
 */
export async function deleteTask(page: Page): Promise<void> {
    console.log("Opening menu to delete task...");
    const menuButton = page.locator(SELECTORS.menuButton);
    await expect(menuButton, `Menu button not found`).toBeVisible({ timeout: TIMEOUTS.max });
    await menuButton.click({ timeout: TIMEOUTS.max });
    console.log("Clicking 'Delete Task' option...");
    const deleteTaskOption = page.locator(SELECTORS.deleteTaskOption);
    await expect(deleteTaskOption, `Delete Task option not found`).toBeVisible({ timeout: TIMEOUTS.max });
    await deleteTaskOption.click({ timeout: TIMEOUTS.max });
    console.log("Confirming deletion by clicking 'Delete' button...");
    const deleteButton = page.getByRole('button', { name: "Delete" });
    await expect(deleteButton, `Delete button not found`).toBeVisible({ timeout: TIMEOUTS.max });
    await deleteButton.click({ timeout: TIMEOUTS.max });
}

/**
 * Verifies that a task is not present anywhere on the board
 * @param board - The main board container locator
 * @param taskName - The name of the task to verify is deleted
 */
export async function verifyTaskNotOnBoard(board: Locator, taskName: string): Promise<void> {
    console.log(`Verifying that task "${taskName}" is no longer on the board...`);
    const allTaskTitles = board.locator(SELECTORS.taskCard).locator(SELECTORS.taskTitle);
    const allTaskNames = (await allTaskTitles.allTextContents()).map((t) => t.trim());
    expect(allTaskNames.includes(taskName), `Expected task "${taskName}" to be deleted from the board`).toBeFalsy();
    console.log(`Task "${taskName}" successfully deleted from the board.`);
}

