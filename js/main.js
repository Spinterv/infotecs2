// Находим элементы на странице
const form = document.querySelector('#form');
const taskTitle = document.querySelector('#taskTitle');
const taskText = document.querySelector('#taskText');
const taskDate = document.querySelector('#taskDate');
const tasksList = document.querySelector('#tasksList');
const emptyList = document.querySelector('#emptyList');

let tasks = [];

if (localStorage.getItem('tasks')) {
	tasks = JSON.parse(localStorage.getItem('tasks'));
	tasks.forEach((task) => renderTask(task));
}

checkEmptyList();

form.addEventListener('submit', addTask);
tasksList.addEventListener('click', deleteTask);
tasksList.addEventListener('click', doneTask);
tasksList.addEventListener('click', editTask);
//==========================================================================================
// Функция для фильтрации задач по статусу
function filterTasksByStatus(tasks, status) {
	if (status === 'all'){
		return tasks
	}
	
  return tasks.filter(t => t.done !== status);
}

// Функция для сортировки задач по дате завершения
function sortTasksByDateUP(tasks) {
  tasks.sort((a, b) => new Date(b.date) - new Date(a.date));
  return tasks;
}
function sortTasksByDateDWN(tasks) {
  tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
  return tasks;
}

// Обработчик событий для кнопок фильтрации
document.getElementById('all-tasks').addEventListener('click', function() {
  displayTasks(tasks, 'all');
});
document.getElementById('completed-tasks').addEventListener('click', function() {
  displayTasks(tasks, true);
});
document.getElementById('uncompleted-tasks').addEventListener('click', function() {
  displayTasks(tasks, false);
});
var sort = 'dwn';
// Обработчик событий для кнопок сортировки
const btn_sort = document.getElementById('sort-by-date');
btn_sort.addEventListener('click', function() {
  let sortNow = (sort === 'dwn') ? sortTasksByDateDWN : sortTasksByDateUP;
  sort = (sort === 'dwn') ? 'up' : 'dwn';
  btn_sort.textContent = (sort === 'dwn') ? '⇑   Сортировать по дате завершения   ⇑' : '⇓   Сортировать по дате завершения   ⇓';

  sortAndDisplayTasks(tasks, sortNow);
});

// Функция для отображения отфильтрованных/отсортированных задач
function displayTasks(tasks, status) {
  var filteredTasks = filterTasksByStatus(tasks, status);
  renderTasks(filteredTasks);
}

// Функция для отсортировки и отображения задач
function sortAndDisplayTasks(tasks, sorter) {
  var sortedTasks = sorter(tasks);
  renderTasks(sortedTasks);
}

// Функция для рендеринга задач в HTML
function renderTasks(tasks) {
  // Предполагаем, что у нас есть функция для создания элементов списка
  tasksList.innerHTML = '';

  // Очищаем текущий список задач
  if (tasks.length !== 0){
	for (let i = 0; i < tasks.length; i++){
	  listItems = renderTask(tasks[i]);
	}
  } else {
  	const emptyListHTML = `<li id="emptyList" class="list-group-item empty-list">
					<img src="./img/leaf.svg" alt="Empty" width="48" class="mt-3">
					<div class="empty-list__title">Задач с таким фильтром нет :)</div>
				</li>`;
	tasksList.insertAdjacentHTML('afterbegin', emptyListHTML);
	btn_sort.textContent = 'Сортировать по дате завершения';
  }
  
}


//==========================================================================================
// Функции
function addTask(event) {
	// Отменяем отправку формы
	event.preventDefault();

	// Достаем текст задачи из поля ввода
	const taskTitle1 = taskTitle.value;
	const taskText1 = taskText.value;
	const taskDate1 = taskDate.value;
	// Описываем задачу в виде объекта
	const newTask = {
		id: Date.now(),
		title: taskTitle1,
		text: taskText1,
		date: taskDate1,
		done: false,
	};

	// Добавляем задачу в массив с задачами
	tasks.push(newTask);

	// Сохраняем список задач в хранилище браузера localStorage
	saveToLocalStorage();

	// Рендерим задачу на странице
	renderTask(newTask);

	// Очищаем поле ввода и возвращаем на него фокус
	taskTitle.value = '';
	taskText.value = '';
	taskDate.value = '';
	taskTitle.focus();

	checkEmptyList();
}
function editTask(event) {
  // Проверяем если клик был НЕ по кнопке "редактировать задачу"
  if (event.target.dataset.action !== 'edit') return;

  const parentNode = event.target.closest('.list-group-item');

  // Определяем ID задачи
  const id = Number(parentNode.id);
  const updatedTasks = tasks.filter((task) => task.id !== id);
  const index = tasks.findIndex(task => task.id === id);

  // Получаем текст задачи из элемента списка
  const taskTitle = tasks[index].title;
  const taskText = tasks[index].text;
  const taskDate = tasks[index].date;

  // Создаем новую задачу с измененным текстом
  const newTask = {
    id: id,
    title: taskTitle,
	text: taskText,
	date: taskDate,
    done: false
  };

  // Добавляем новую задачу в конец массива
  updatedTasks.push(newTask);

  // Сохраняем список задач в хранилище браузера localStorage
  saveToLocalStorage();

  // Открываем модальное окно для редактирования задачи
  openModalForEditing(newTask.title, newTask.text, newTask.date, parentNode, id);
}

function openModalForEditing(taskTitle, taskText, taskDate, parentNode, id) {
  // Создаем модальное окно с формой для редактирования задачи
  // Здесь нужно будет создать HTML разметку для модального окна
  // и добавить ее на страницу
  const modalHTML = `
    <div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Редактирование задачи</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <input id="taskTitleModal" type="text" class="form-control" value="${taskTitle}" placeholder="Заголовок задачи">
            <textarea id="taskTextModal" type="text" class="form-control" placeholder="Текст задачи">${taskText}</textarea>
            <input id="taskDateModal" type="date" class="form-control" value="${taskDate}" placeholder="Дата окончания задачи">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Отмена</button>
            <button id="saveButton" type="button" class="btn btn-primary">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Добавляем модальное окно на страницу
  document.body.insertAdjacentHTML('beforeend', modalHTML);
	$('#editModal').modal('show');

  // Обрабатываем событие сохранения изменений
  document.getElementById('saveButton').addEventListener('click', function() {
    // Получаем новый текст задачи из поля ввода
    const newTaskTitle = document.getElementById('taskTitleModal').value;
    const newTaskText = document.getElementById('taskTextModal').value
	const newTaskDate = document.getElementById('taskDateModal').value

	// Находим индекс задачи, которая соответствует id
	const index = tasks.findIndex(task => task.id === id);

	// Обновляем задачу
	tasks[index].title = newTaskTitle;
	tasks[index].text = newTaskText;
	tasks[index].date = newTaskDate;
	
    // Обновляем текст задачи в элементе списка
    parentNode.querySelector('.task-title').textContent = `${newTaskTitle}, ${newTaskDate}`;

    // Сохраняем список задач в хранилище браузера localStorage
    saveToLocalStorage();

    // Закрываем модальное окно
    $('#editModal').modal('hide');
	$('#editModal').on('hidden.bs.modal', function () {
		$(this).remove();
	});
  });
}

// Добавляем обработчик события редактирования к списку задач
tasksList.addEventListener('click', editTask);


function deleteTask(event) {
	// Проверяем если клик был НЕ по кнопке "удалить задачу"
	if (event.target.dataset.action !== 'delete') return;

	const parenNode = event.target.closest('.list-group-item');

	// Определяем ID задачи
	const id = Number(parenNode.id);

	// Удаляем задчу через фильтрацию массива
	tasks = tasks.filter((task) => task.id !== id);

	// Сохраняем список задач в хранилище браузера localStorage
	saveToLocalStorage();

	// Удаляем задачу из разметки
	parenNode.animate(
		[
		    {
		      // from
		      offset: 0,
		      transform: "translateX(0)",
		    },
		    {
		      // to
		      offset: 1,
		      transform: "translateX(150%)",
		    },
  		], 
  		1000, 
  		);
  	setTimeout(function(){
		parenNode.remove();
	}, 1000);
	
	
	checkEmptyList();
}

function doneTask(event) {
	// Проверяем что клик был НЕ по кнопке "задача выполнена"
	if (event.target.dataset.action !== 'done') return;

	const parentNode = event.target.closest('.list-group-item');

	// Определяем ID задачи
	const id = Number(parentNode.id);
	const task = tasks.find((task) => task.id === id);
	task.done = !task.done;

	// Сохраняем список задач в хранилище браузера localStorage
	saveToLocalStorage();

	const taskTitle = parentNode.querySelector('.task-title');
	taskTitle.classList.toggle('task-title--done');
}

function checkEmptyList() {
	if (tasks.length === 0) {
		const emptyListHTML = `<li id="emptyList" class="list-group-item empty-list">
					<img src="./img/leaf.svg" alt="Empty" width="48" class="mt-3">
					<div class="empty-list__title">Список дел пуст</div>
				</li>`;
		tasksList.insertAdjacentHTML('afterbegin', emptyListHTML);
		document.getElementById('sort-by-date').textContent = 'Сортировать по дате завершения';
	}

	if (tasks.length > 0) {
		const emptyListEl = document.querySelector('#emptyList');
		emptyListEl ? emptyListEl.remove() : null;
	}
}

function saveToLocalStorage() {
	// Получаем текущий массив задач из локального хранилища
	localStorage.setItem('tasks', JSON.stringify(tasks))
}


function renderTask(task) {
	// Формируем CSS класс
	const cssClass = task.done ? 'task-title task-title--done' : 'task-title';

	// Формируем разметку для новой задачи
	const taskHTML = `
                <li id="${task.id}" class="list-group-item d-flex justify-content-between task-item">
					<span class="${cssClass}">${task.title}, ${task.date}</span>
					<div class="task-item__buttons">
						<button type="button" data-action="done" class="btn-action">
							<img src="./img/tick.svg" alt="Done" width="18" height="18">
						</button>
						<button type="button" data-action="delete" class="btn-action">
							<img src="./img/cross.svg" alt="Done" width="18" height="18">
						</button>
						<button type="button" data-action="edit" class="btn-action">
							<img src="./img/edit.svg" alt="Done" width="18" height="18">
						</button>
					</div>
				</li>`;

	// Добавляем задачу на страницу
	tasksList.insertAdjacentHTML('beforeend', taskHTML);
}
