export const SELECTORS = {
  board: "//div[@data-dragscroll and @class=\"flex\"]",
  columnSection: "section",
  columnHeader: "h2",
  taskCard: "xpath=div[contains(@class,\"flex-col\")]/article",
  taskTitle: "h3",
  taskStatus: "p",
  modal: "//div[contains(@class,\"absolute\")]//div[@tabindex=\"1\" and contains(@class,\"group cursor-pointer relative\")]/parent::div/parent::div[contains(@class,\"flex-col\")]",
  pendingSubtask: "xpath=//label/span[not(contains(@class,\"line-through\"))]",
  completedSubtask: "xpath=//label/span[contains(@class,\"line-through\")]",
  statusDropdown: "//p[normalize-space(text())=\"Current Status\"]/parent::div/div[@tabindex=\"1\"]",
  firstColumnTasks: "(//div[@data-dragscroll and @class=\"flex\"]//section)[1]/div[contains(@class,\"flex-col\")]/article/h3",
  menuButton: "//div[contains(@class,\"absolute\")]//div[@tabindex=\"1\" and contains(@class,\"group cursor-pointer relative\")]",
  deleteTaskOption: "//p[contains(text(),\"Delete Task\")]",
  deleteButton: "//button[normalize-space(text())=\"Delete\"]"
} as const;

