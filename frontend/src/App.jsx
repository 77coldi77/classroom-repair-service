
import React, { useMemo, useState } from "react";
import "./App.css";

const initialRequests = [
  {
    id: 1001,
    room: "301",
    equipment: "Проектор Epson",
    category: "Проекционное оборудование",
    priority: "Высокий",
    description: "Проектор не включается, индикатор питания мигает.",
    status: "Новая",
    author: "Иванов И.И.",
    assignee: "Не назначен",
    date: "2026-11-01",
  },
  {
    id: 1002,
    room: "205",
    equipment: "Компьютер",
    category: "Компьютерная техника",
    priority: "Средний",
    description: "Компьютер работает медленно, периодически зависает.",
    status: "В работе",
    author: "Петрова А.А.",
    assignee: "Алексей Смирнов",
    date: "2026-10-31",
  },
  {
    id: 1003,
    room: "112",
    equipment: "Интерактивная доска",
    category: "Интерактивное оборудование",
    priority: "Высокий",
    description: "Не реагирует на прикосновения.",
    status: "Ожидает запчасти",
    author: "Сидоров В.В.",
    assignee: "Алексей Смирнов",
    date: "2026-10-30",
  },
  {
    id: 1004,
    room: "407",
    equipment: "Монитор",
    category: "Компьютерная техника",
    priority: "Низкий",
    description: "Появляются полосы на экране.",
    status: "Выполнена",
    author: "Иванова Е.С.",
    assignee: "Дмитрий Волков",
    date: "2026-10-29",
  },
  {
    id: 1005,
    room: "208",
    equipment: "Акустическая система",
    category: "Аудиооборудование",
    priority: "Средний",
    description: "Отсутствует звук из правой колонки.",
    status: "Новая",
    author: "Кузнецов А.А.",
    assignee: "Не назначен",
    date: "2026-10-28",
  },
];

const statuses = [
  "Новая",
  "В работе",
  "Ожидает запчасти",
  "Выполнена",
];

const categories = [
  "Компьютерная техника",
  "Проекционное оборудование",
  "Интерактивное оборудование",
  "Аудиооборудование",
  "Сетевое оборудование",
  "Другое",
];

function App() {
  const [requests, setRequests] = useState(initialRequests);
  const [activePage, setActivePage] = useState("dashboard");
  const [role, setRole] = useState("user");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterPriority, setFilterPriority] = useState("Все");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notification, setNotification] = useState("");

  const [form, setForm] = useState({
    room: "",
    equipment: "",
    category: categories[0],
    priority: "Средний",
    description: "",
  });

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.equipment.toLowerCase().includes(search.toLowerCase()) ||
        request.room.toLowerCase().includes(search.toLowerCase()) ||
        String(request.id).includes(search) ||
        request.author.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "Все" || request.status === filterStatus;

      const matchesPriority =
        filterPriority === "Все" ||
        request.priority === filterPriority;

      const matchesPage =
        activePage !== "my" ||
        (role === "user"
          ? request.author === "Вы"
          : request.assignee === "Алексей Смирнов");

      return matchesSearch && matchesStatus && matchesPriority && matchesPage;
    });
  }, [requests, search, filterStatus, filterPriority, activePage, role]);

  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "Новая").length,
    progress: requests.filter((r) => r.status === "В работе").length,
    completed: requests.filter((r) => r.status === "Выполнена").length,
  };

  function showMessage(message) {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  }

  function handleCreateRequest(e) {
    e.preventDefault();

    if (
      !form.room.trim() ||
      !form.equipment.trim() ||
      !form.description.trim()
    ) {
      showMessage("Заполните все обязательные поля");
      return;
    }

    const newRequest = {
      id: Math.max(1000, ...requests.map((r) => r.id)) + 1,
      room: form.room,
      equipment: form.equipment,
      category: form.category,
      priority: form.priority,
      description: form.description,
      status: "Новая",
      author: "Вы",
      assignee: "Не назначен",
      date: new Date().toISOString().slice(0, 10),
    };

    setRequests((prev) => [newRequest, ...prev]);
    setForm({
      room: "",
      equipment: "",
      category: categories[0],
      priority: "Средний",
      description: "",
    });

    setShowForm(false);
    setActivePage("requests");
    showMessage("Заявка успешно создана!");
  }

  function changeStatus(id, newStatus) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id
          ? {
              ...request,
              status: newStatus,
              assignee:
                newStatus === "Новая"
                  ? "Не назначен"
                  : request.assignee === "Не назначен"
                    ? "Алексей Смирнов"
                    : request.assignee,
            }
          : request
      )
    );

    setSelectedRequest((prev) =>
      prev && prev.id === id
        ? { ...prev, status: newStatus }
        : prev
    );

    showMessage("Статус заявки обновлён");
  }

  function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("ru-RU");
  }

  function statusClass(status) {
    return {
      "Новая": "status-new",
      "В работе": "status-progress",
      "Ожидает запчасти": "status-waiting",
      "Выполнена": "status-done",
    }[status] || "";
  }

  function priorityClass(priority) {
    return {
      "Высокий": "priority-high",
      "Средний": "priority-medium",
      "Низкий": "priority-low",
    }[priority] || "";
  }

  const pageTitles = {
    dashboard: "Главная панель",
    requests: "Все заявки",
    my: "Мои заявки",
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">⚙</div>
          <div>
            <h2>FixRoom</h2>
            <span>Сервис технической поддержки</span>
          </div>
        </div>

        <div className="sidebar-label">МЕНЮ</div>

        <nav className="navigation">
          <button
            className={activePage === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActivePage("dashboard");
              setSelectedRequest(null);
            }}
          >
            <span>▦</span> Главная панель
          </button>

          <button
            className={activePage === "requests" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActivePage("requests");
              setSelectedRequest(null);
            }}
          >
            <span>▤</span> Все заявки
            <span className="nav-count">{stats.total}</span>
          </button>

          <button
            className={activePage === "my" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActivePage("my");
              setSelectedRequest(null);
            }}
          >
            <span>♧</span> Мои заявки
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon">✦</div>
            <strong>Нужна помощь?</strong>
            <p>Сообщите о неисправности оборудования, и мы поможем.</p>
            <button onClick={() => setShowForm(true)}>
              Создать заявку →
            </button>
          </div>

          <div className="profile">
            <div className="avatar">
              {role === "user" ? "И" : "Т"}
            </div>
            <div className="profile-info">
              <strong>
                {role === "user" ? "Иванов Иван" : "Алексей Смирнов"}
              </strong>
              <span>
                {role === "user" ? "Преподаватель" : "Тех. специалист"}
              </span>
            </div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>FixRoom</span>
            <span>/</span>
            <strong>
              {selectedRequest ? `Заявка №${selectedRequest.id}` : pageTitles[activePage]}
            </strong>
          </div>

          <div className="topbar-actions">
            <label className="role-select">
              <span>Роль:</span>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setSelectedRequest(null);
                }}
              >
                <option value="user">Преподаватель</option>
                <option value="technician">Технический специалист</option>
              </select>
            </label>

            <div className="notification-icon" title="Уведомления">
              ♧
              <span></span>
            </div>

            <div className="top-avatar">
              {role === "user" ? "И" : "А"}
            </div>
          </div>
        </header>

        <div className="content">
          {selectedRequest ? (
            <section className="detail-page">
              <button
                className="back-button"
                onClick={() => setSelectedRequest(null)}
              >
                ← Назад к заявкам
              </button>

              <div className="page-heading">
                <div>
                  <span className="eyebrow">ПОДРОБНАЯ ИНФОРМАЦИЯ</span>
                  <h1>Заявка №{selectedRequest.id}</h1>
                  <p>Информация о неисправности и ходе ремонта</p>
                </div>
                <span className={`status-badge ${statusClass(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>

              <div className="detail-grid">
                <div className="panel detail-main">
                  <h3>Описание неисправности</h3>
                  <p className="detail-description">
                    {selectedRequest.description}
                  </p>

                  <div className="detail-fields">
                    <div>
                      <span>Оборудование</span>
                      <strong>{selectedRequest.equipment}</strong>
                    </div>
                    <div>
                      <span>Аудитория</span>
                      <strong>№ {selectedRequest.room}</strong>
                    </div>
                    <div>
                      <span>Категория</span>
                      <strong>{selectedRequest.category}</strong>
                    </div>
                    <div>
                      <span>Приоритет</span>
                      <strong>{selectedRequest.priority}</strong>
                    </div>
                    <div>
                      <span>Дата создания</span>
                      <strong>{formatDate(selectedRequest.date)}</strong>
                    </div>
                    <div>
                      <span>Автор заявки</span>
                      <strong>{selectedRequest.author}</strong>
                    </div>
                    <div>
                      <span>Ответственный</span>
                      <strong>{selectedRequest.assignee}</strong>
                    </div>
                  </div>
                </div>

                <div className="panel detail-status">
                  <h3>Управление заявкой</h3>
                  <p>Текущий статус ремонта</p>
                  {role === "technician" ? (
                    <select
                      className="status-select"
                      value={selectedRequest.status}
                      onChange={(e) =>
                        changeStatus(selectedRequest.id, e.target.value)
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`status-badge ${statusClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  )}
                  <div className="timeline">
                    <div className="timeline-item completed">
                      <span>✓</span>
                      <div>
                        <strong>Заявка зарегистрирована</strong>
                        <small>{formatDate(selectedRequest.date)}</small>
                      </div>
                    </div>
                    <div className={`timeline-item ${selectedRequest.status !== "Новая" ? "completed" : ""}`}>
                      <span>2</span>
                      <div>
                        <strong>Обработка заявки</strong>
                        <small>
                          {selectedRequest.status === "Новая" ? "Ожидает обработки" : "В процессе"}
                        </small>
                      </div>
                    </div>
                    <div className={`timeline-item ${selectedRequest.status === "Выполнена" ? "completed" : ""}`}>
                      <span>3</span>
                      <div>
                        <strong>Ремонт завершён</strong>
                        <small>
                          {selectedRequest.status === "Выполнена" ? "Выполнено" : "Ожидает выполнения"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">УПРАВЛЕНИЕ ОБОРУДОВАНИЕМ</span>
                  <h1>{pageTitles[activePage]}</h1>
                  <p>
                    Контроль неисправностей и обслуживание учебных аудиторий
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowForm(true)}
                >
                  <span>＋</span> Создать заявку
                </button>
              </div>

              {activePage === "dashboard" && (
                <>
                  <div className="welcome-banner">
                    <div>
                      <span>СИСТЕМА ТЕХНИЧЕСКОЙ ПОДДЕРЖКИ</span>
                      <h2>Всё оборудование под контролем</h2>
                      <p>
                        Создавайте заявки на ремонт и следите за их выполнением
                        в режиме одного окна.
                      </p>
                      <button onClick={() => setShowForm(true)}>
                        Подать заявку <span>→</span>
                      </button>
                    </div>
                    <div className="banner-decoration">⚙</div>
                  </div>

                  <div className="section-title">
                    <div>
                      <h2>Общая статистика</h2>
                      <p>Состояние заявок на текущий момент</p>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-top">
                        <span>Всего заявок</span>
                        <div className="stat-icon blue">▤</div>
                      </div>
                      <strong>{stats.total}</strong>
                      <small>Зарегистрировано в системе</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span>Новые заявки</span>
                        <div className="stat-icon orange">◷</div>
                      </div>
                      <strong>{stats.new}</strong>
                      <small>Ожидают обработки</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span>В работе</span>
                        <div className="stat-icon purple">⚙</div>
                      </div>
                      <strong>{stats.progress}</strong>
                      <small>Находятся в ремонте</small>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span>Выполнено</span>
                        <div className="stat-icon green">✓</div>
                      </div>
                      <strong>{stats.completed}</strong>
                      <small>Успешно завершено</small>
                    </div>
                  </div>
                </>
              )}

              <div className="section-title requests-heading">
                <div>
                  <h2>
                    {activePage === "dashboard"
                      ? "Последние заявки"
                      : activePage === "my"
                        ? "Мои заявки"
                        : "Список заявок"}
                  </h2>
                  <p>Просмотр и контроль неисправностей оборудования</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setActivePage("requests");
                    setSelectedRequest(null);
                  }}
                >
                  Все заявки →
                </button>
              </div>

              <div className="panel requests-panel">
                <div className="filters">
                  <div className="search-box">
                    <span>⌕</span>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск по заявкам, аудитории..."
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="Все">Все статусы</option>
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="Все">Все приоритеты</option>
                    <option>Высокий</option>
                    <option>Средний</option>
                    <option>Низкий</option>
                  </select>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="empty-state">
                    <span>▤</span>
                    <h3>Заявки не найдены</h3>
                    <p>Измените параметры поиска или создайте новую заявку.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>НОМЕР</th>
                          <th>ОБОРУДОВАНИЕ</th>
                          <th>АУДИТОРИЯ</th>
                          <th>ПРИОРИТЕТ</th>
                          <th>СТАТУС</th>
                          <th>ДАТА</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activePage === "dashboard"
                          ? filteredRequests.slice(0, 5)
                          : filteredRequests
                        ).map((request) => (
                          <tr key={request.id}>
                            <td className="request-id">#{request.id}</td>
                            <td>
                              <div className="equipment-cell">
                                <div className="equipment-icon">▣</div>
                                <div>
                                  <strong>{request.equipment}</strong>
                                  <small>{request.category}</small>
                                </div>
                              </div>
                            </td>
                            <td>№ {request.room}</td>
                            <td>
                              <span className={`priority ${priorityClass(request.priority)}`}>
                                {request.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${statusClass(request.status)}`}>
                                {request.status}
                              </span>
                            </td>
                            <td>{formatDate(request.date)}</td>
                            <td>
                              <button
                                className="details-button"
                                onClick={() => setSelectedRequest(request)}
                              >
                                →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {role === "technician" && (
                <div className="technician-note">
                  <span>⚙</span>
                  <div>
                    <strong>Режим технического специалиста</strong>
                    <p>
                      Откройте любую заявку, чтобы изменить её статус и
                      контролировать процесс ремонта.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="footer">
          <span>© 2026 FixRoom. Сервис технической поддержки.</span>
          <span>Система учёта заявок на ремонт оборудования</span>
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">НОВАЯ НЕИСПРАВНОСТЬ</span>
                <h2>Создание заявки</h2>
                <p>Заполните информацию об оборудовании</p>
              </div>
              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRequest}>
              <label>
                Номер аудитории *
                <input
                  value={form.room}
                  onChange={(e) =>
                    setForm({ ...form, room: e.target.value })
                  }
                  placeholder="Например, 301"
                />
              </label>

              <label>
                Название оборудования *
                <input
                  value={form.equipment}
                  onChange={(e) =>
                    setForm({ ...form, equipment: e.target.value })
                  }
                  placeholder="Например, Проектор Epson"
                />
              </label>

              <label>
                Категория оборудования
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Приоритет неисправности
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option>Низкий</option>
                  <option>Средний</option>
                  <option>Высокий</option>
                </select>
              </label>

              <label>
                Описание неисправности *
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Подробно опишите возникшую проблему..."
                  rows="4"
                />
              </label>

              <div className="form-note">
                <span>ⓘ</span>
                После отправки заявка появится в общем списке со статусом «Новая».
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="primary-button">
                  Отправить заявку →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div className="toast">
          <span>✓</span> {notification}
        </div>
      )}
    </div>
  );
}

export default App;
