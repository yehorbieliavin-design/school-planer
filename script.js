
// Основные настройки

const dayNames = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница"
];

const shortDays = ["Пн", "Вт", "Ср", "Чт", "Пт"];

let weekOffset = 0;
let selectedDay = Math.min(
  4, (new Date().getDay() + 6) % 7
);

let schedule = [[], [], [], [], []];

try {
  const saved = localStorage.getItem("diary_schedule");
  if (saved) schedule = JSON.parse(saved);
} catch (error) {
  console.error(error);
}

// Работа с датами

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function getMonday() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  const day = (date.getDay() + 6) % 7;

  date.setDate(
    date.getDate() - day + weekOffset * 7
  );

  return date;
}

function getDate(index) {
  const date = getMonday();
  date.setDate(date.getDate() + index);
  return date;
}

function formatDate(date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long"
  });
}

// Создание элементов

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

// Отображение расписания

function renderSchedule() {
  const container = document.getElementById("schedule");
  container.replaceChildren();

  const today = new Date();

  document.getElementById("today").textContent =
    today.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

  document.getElementById("week-label").textContent =
    formatDate(getDate(0)) + " — " +
    formatDate(getDate(6));

  for (let i = 0; i < 5; i++) {
    const date = getDate(i);

    const column = createElement(
      "div", "day-column"
    );

    const header = createElement(
      "button", "day-header"
    );

    header.append(
      createElement("strong", "", shortDays[i]),
      createElement("span", "", date.getDate())
    );

    if (dateKey(date) === dateKey(today)) {
      header.classList.add("today");
    }

    if (selectedDay === i) {
      header.classList.add("selected");
    }

    header.onclick = () => {
      selectedDay = i;
      renderSchedule();
    };

    column.appendChild(header);

    schedule[i].forEach(subject => {
      const lesson = createElement(
        "button", "lesson gray", subject
      );

      lesson.onclick = () => {
        selectedDay = i;
        renderSchedule();
      };

      column.appendChild(lesson);
    });

    const plus = createElement(
      "button", "day-add", "+"
    );

    plus.onclick = () => {
      alert(
        "Добавление дедлайна на " +
        formatDate(date) +
        " появится на следующем этапе."
      );
    };

    column.appendChild(plus);
    container.appendChild(column);
  }

  renderDay();
  renderSubjects();
}

// Подробный просмотр дня

function renderDay() {
  const container =
    document.getElementById("day-details");

  container.replaceChildren();

  const heading = createElement(
    "h2", "",
    dayNames[selectedDay] + ", " +
    formatDate(getDate(selectedDay))
  );

  container.appendChild(heading);

  if (schedule[selectedDay].length === 0) {
    container.appendChild(
      createElement(
        "p", "", "Уроки пока не добавлены."
      )
    );
  }

  schedule[selectedDay].forEach((subject, index) => {
    const card = createElement("div", "detail-card");

    card.append(
      createElement(
        "h3", "", (index + 1) + ". " + subject
      ),
      createElement(
        "p", "", "Домашних заданий нет"
      )
    );

    container.appendChild(card);
  });
}

// Вкладка предметов

function renderSubjects() {
  const container =
    document.getElementById("subjects");

  container.replaceChildren();

  const subjects = [...new Set(schedule.flat())];

  subjects.forEach(subject => {
    const card = createElement(
      "div", "subject-card"
    );

    card.append(
      createElement("strong", "", subject),
      createElement(
        "div", "subject-bar gray"
      )
    );

    container.appendChild(card);
  });

  if (subjects.length === 0) {
    container.textContent =
      "Сначала добавь предметы в расписание.";
  }
}

// Редактор расписания

function editSchedule() {
  const container =
    document.getElementById("settings-page");

  const oldEditor =
    document.getElementById("schedule-editor");

  if (oldEditor) {
    oldEditor.remove();
    return;
  }

  const editor = createElement("div", "detail-card");
  editor.id = "schedule-editor";

  editor.appendChild(
    createElement("h3", "", "Редактор расписания")
  );

  editor.appendChild(
    createElement(
      "p", "",
      "Каждый предмет пиши с новой строки."
    )
  );

  const fields = [];

  dayNames.forEach((day, index) => {
    editor.appendChild(
      createElement("h4", "", day)
    );

    const field = document.createElement("textarea");

    field.value = schedule[index].join("\n");
    field.placeholder = "Mathematik\nDeutsch\nSport";
    field.rows = 5;

    field.style.cssText = `
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 10px;
      resize: vertical;
      font-size: 16px;
    `;

    fields.push(field);
    editor.appendChild(field);
  });

  const saveButton = createElement(
    "button", "", "Сохранить расписание"
  );

  saveButton.style.background = "#527b69";
  saveButton.style.color = "white";
  saveButton.style.marginTop = "15px";

  saveButton.onclick = () => {
    schedule = fields.map(field =>
      field.value
        .split("\n")
        .map(value => value.trim())
        .filter(Boolean)
    );

    try {
      localStorage.setItem(
        "diary_schedule",
        JSON.stringify(schedule)
      );

      alert("Расписание сохранено!");
    } catch (error) {
      alert(
        "Расписание создано, но сохранить данные " +
        "в браузере не удалось."
      );
    }

    editor.remove();
    renderSchedule();
    openPage("schedule");
  };

  editor.appendChild(saveButton);
  container.appendChild(editor);
}

// Переключение вкладок

function openPage(page) {
  ["schedule", "subjects", "settings"].forEach(name => {
    document.getElementById(name + "-page").hidden =
      name !== page;
  });

  document.querySelectorAll(".bottom-nav button")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === page
      );
    });
}

document.querySelectorAll(".bottom-nav button")
  .forEach(button => {
    button.onclick = () =>
      openPage(button.dataset.page);
  });

// Кнопки календаря

document.getElementById("prev-week").onclick = () => {
  weekOffset--;
  renderSchedule();
};

document.getElementById("next-week").onclick = () => {
  weekOffset++;
  renderSchedule();
};

document.getElementById("current-week").onclick = () => {
  weekOffset = 0;
  selectedDay = Math.min(
    4, (new Date().getDay() + 6) % 7
  );
  renderSchedule();
};

document.getElementById("edit-schedule").onclick =
  editSchedule;

document.getElementById("edit-holidays").onclick = () => {
  alert("Каникулы добавим позже.");
};

document.getElementById("add-task").onclick = () => {
  alert("Домашние задания добавим на следующем этапе.");
};

// Запуск приложения

renderSchedule();
