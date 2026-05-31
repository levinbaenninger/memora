import { completeTask } from "./procedures/complete-task";
import { createTask } from "./procedures/create-task";
import { deleteTask } from "./procedures/delete-task";
import { getTask } from "./procedures/get-task";
import { listTasks } from "./procedures/list-tasks";
import { searchTasks } from "./procedures/search-tasks";
import { updateTask } from "./procedures/update-task";

export const tasksRouter = {
  create: createTask,
  get: getTask,
  list: listTasks,
  search: searchTasks,
  update: updateTask,
  delete: deleteTask,
  complete: completeTask,
};
