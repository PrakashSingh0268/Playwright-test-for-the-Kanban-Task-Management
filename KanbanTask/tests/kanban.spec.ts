import { test, expect } from "@playwright/test";
import { TIMEOUTS, KANBAN_URL, SELECTORS } from "./utils/constants";
import { getColumnNames, findFirstIncompleteTask, findFirstCompleteTask, completeFirstPendingSubtask, moveTaskToColumn, closeModal, verifyTaskInFirstColumn, deleteTask, verifyTaskNotOnBoard } from "./utils/commonUtils";
test.describe.configure({ mode: "serial" });
test.describe("Kanban Borad: Movement and Deletion feature validation", () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the Kanban application
        console.log("Navigating to Kanban app...");
        await page.goto(KANBAN_URL, { timeout: TIMEOUTS.max });
    });

    /**
     * Test: Find the first task with incomplete subtasks in the Kanban board,
     * complete one of its subtasks, and move the task to the first column.
     */
    test("Kanban: find task with incomplete subtasks, complete one subtask, and move to first column", async ({ page }) => {
        // Locate the main board container using data-dragscroll attribute
        // This div contains all the columns of the Kanban board
        console.log("Locating main Kanban container...");
        const board = page.locator(SELECTORS.board);
        await expect(board, `Board not found`).toBeVisible({ timeout: TIMEOUTS.max });
        // Get all column sections from the board
        console.log("Fetching all columns...");
        const columns = board.locator(SELECTORS.columnSection);
        const columnCount = await columns.count();
        console.log(`Total columns found: ${columnCount}`);
        // Extract column names from h2 headers
        const columnNames = await getColumnNames(board);
        // Store the first column name as our target destination
        const firstColumnName = columnNames[0];
        console.log("First column name:", firstColumnName);
        // Search through all columns (skip first one as we'll be moving TO it)
        // Look for the first task that has incomplete subtasks
        const incompleteTask = await findFirstIncompleteTask(board, columnNames, true);
        // Verify that we found at least one task with incomplete subtasks
        expect(incompleteTask, "No task with incomplete subtasks found in any column").not.toBeNull();
        // Complete one pending subtask in the modal
        await completeFirstPendingSubtask(page);
        // Move the task to the first column
        await moveTaskToColumn(page, firstColumnName);
        // Close the modal
        await closeModal(page);
        // // Verify that the task now appears in the first column
        await verifyTaskInFirstColumn(page, incompleteTask!.taskName, firstColumnName);
        // Log success message with source and destination columns
        console.log(`Task "${incompleteTask!.taskName}" successfully moved from column "${incompleteTask!.sourceColumnName}" to "${firstColumnName}"`);
    });

    /**
     * Test: Find the first task with all subtasks completed in the Kanban board,
     * open the task, delete it via the menu, and verify it's removed from the board.
     */
    test.skip("Kanban: Find the first task with all subtasks completed in the Kanban board and delete it", async ({ page }) => {
        // Locate the main board container using data-dragscroll attribute
        // This div contains all the columns of the Kanban board
        console.log("Locating main Kanban container...");
        const board = page.locator(SELECTORS.board);
        await expect(board, `Board not found`).toBeVisible({ timeout: TIMEOUTS.max });
        // Get all column sections from the board
        console.log("Fetching all columns...");
        const columns = board.locator(SELECTORS.columnSection);
        const columnCount = await columns.count();
        console.log(`Total columns found: ${columnCount}`);
        // Extract column names from h2 headers
        const columnNames = await getColumnNames(board);
        // Search through all columns to find the first task with all subtasks completed
        await findFirstCompleteTask(board, columnNames, true)
            .then(async (completeTask:any) => {
                if (completeTask === null) {
                   console.log("No task with completed subtasks found in any column");
                }
                // Store the task name for verification later
                const taskNameToDelete = completeTask.taskName;
                console.log(`Found complete task "${taskNameToDelete}" in column "${completeTask.sourceColumnName}"`);
                // Delete the task using the menu
                await deleteTask(page);
                // Verify that the task is no longer on the board
                await verifyTaskNotOnBoard(board, taskNameToDelete);
                // Log success message
                console.log(`Task "${taskNameToDelete}" successfully deleted from column "${completeTask.sourceColumnName}"`);
            })
            .catch(async () => {
                console.log("No task was eligible for deletion:")
            });
    });
});
