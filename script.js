const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const alertMessage = document.getElementById('alert-message');
const filterButtons = document.querySelectorAll('.filter-button');
const themeToggle = document.getElementById('theme-toggle');

const STORAGE_KEY = 'task-manager-tasks';
const THEME_KEY = 'task-manager-theme';
let activeFilter = 'all';
let activeTheme = 'dark';

const getTasks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const filterTasks = (tasks) => {
  if (activeFilter === 'pending') {
    return tasks.filter((task) => !task.completed);
  }
  if (activeFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
};

const createTaskElement = (task) => {
  const listItem = document.createElement('li');
  listItem.className = 'task-item';
  listItem.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark task "${task.title}" as completed`);

  const content = document.createElement('div');
  content.className = 'task-content';

  const label = document.createElement('p');
  label.className = 'task-label';
  if (task.completed) {
    label.classList.add('task-label--completed');
  }
  label.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const status = document.createElement('span');
  status.textContent = task.completed ? 'Completed' : 'Pending';
  meta.appendChild(status);

  content.append(label, meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.setAttribute('aria-label', `Delete task "${task.title}"`);
  deleteButton.textContent = '✕';

  actions.appendChild(deleteButton);
  listItem.append(checkbox, content, actions);

  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    updateTask(task);
  });

  deleteButton.addEventListener('click', () => {
    removeTask(task.id);
  });

  return listItem;
};

const renderTasks = () => {
  const tasks = getTasks();
  const visibleTasks = filterTasks(tasks);
  taskList.innerHTML = '';

  if (visibleTasks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';

    if (tasks.length === 0) {
      emptyState.textContent = 'Your task list is empty. Add a new task to get started.';
    } else if (activeFilter === 'pending') {
      emptyState.textContent = 'No pending tasks. Try switching to All or Completed.';
    } else if (activeFilter === 'completed') {
      emptyState.textContent = 'No completed tasks yet. Mark a task complete to see it here.';
    } else {
      emptyState.textContent = 'No tasks available for this filter.';
    }

    taskList.appendChild(emptyState);
  } else {
    visibleTasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });
  }

  taskCount.textContent =
    tasks.length === visibleTasks.length
      ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`
      : `${visibleTasks.length} of ${tasks.length} tasks`;
};

const addTask = (title) => {
  const tasks = getTasks();
  const newTask = {
    id: Date.now().toString(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  renderTasks();
  showAlert('Task added successfully.');
};

const updateTask = (updatedTask) => {
  const tasks = getTasks().map((task) =>
    task.id === updatedTask.id ? updatedTask : task
  );
  saveTasks(tasks);
  renderTasks();
  showAlert(updatedTask.completed ? 'Task marked completed.' : 'Task marked pending.');
};

const removeTask = (taskId) => {
  const tasks = getTasks().filter((task) => task.id !== taskId);
  saveTasks(tasks);
  renderTasks();
  showAlert('Task deleted.');
};

const setFilter = (filter) => {
  activeFilter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle('filter-button--active', button.dataset.filter === filter);
  });
  renderTasks();
};

const showAlert = (message) => {
  alertMessage.textContent = message;
  alertMessage.classList.add('visible');
  setTimeout(() => {
    alertMessage.classList.remove('visible');
  }, 2600);
};

const applyTheme = (theme) => {
  activeTheme = theme;
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  themeToggle.textContent = isLight ? 'Dark mode' : 'Light mode';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  localStorage.setItem(THEME_KEY, theme);
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
};

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    showAlert('Please enter a task description.');
    taskInput.focus();
    return;
  }
  addTask(title);
  taskInput.value = '';
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

themeToggle.addEventListener('click', () => {
  applyTheme(activeTheme === 'dark' ? 'light' : 'dark');
});

window.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  renderTasks();
});
