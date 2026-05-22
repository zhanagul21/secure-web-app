export const LANGUAGES = [
  { code: "kk", label: "Қазақша" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

const EXACT = {
  "Қауіпсіз құжат платформасы": {
    ru: "Платформа безопасных документов",
    en: "Secure document platform",
  },
  "Құжаттарды шифрлап сақтау, қауіпсіз бөлісу және қолжетімділікті басқаруға арналған жүйе.": {
    ru: "Система для зашифрованного хранения, безопасного обмена и управления доступом к документам.",
    en: "A system for encrypted storage, secure sharing, and access control for documents.",
  },
  "Қорғалған құжат айналым жүйесі": {
    ru: "Защищенная система документооборота",
    en: "Protected document management system",
  },
  "Мұнда құжаттарыңызды сақтап, керек кезде қарап, жүктеп немесе уақытша сілтеме арқылы бөлісе аласыз. Әр қолданушы тек өз құжаттарын көреді.": {
    ru: "Здесь можно хранить документы, просматривать, скачивать и делиться ими по временной ссылке. Каждый пользователь видит только свои документы.",
    en: "Store documents here, view or download them when needed, and share them through a temporary link. Each user sees only their own documents.",
  },
  "Кіру": { ru: "Войти", en: "Sign in" },
  "Кіріп жатыр...": { ru: "Выполняется вход...", en: "Signing in..." },
  "Тіркелу": { ru: "Регистрация", en: "Register" },
  "Құпия сөз": { ru: "Пароль", en: "Password" },
  "Құпия сөзді ұмыттыңыз ба?": { ru: "Забыли пароль?", en: "Forgot password?" },
  "Email енгізіңіз": { ru: "Введите email", en: "Enter email" },
  "Қалпына келтіру коды": { ru: "Код восстановления", en: "Recovery code" },
  "Жаңа құпия сөз": { ru: "Новый пароль", en: "New password" },
  "Код жіберу": { ru: "Отправить код", en: "Send code" },
  "Құпия сөзді жаңарту": { ru: "Обновить пароль", en: "Update password" },
  "Артқа": { ru: "Назад", en: "Back" },
  "Жабу": { ru: "Закрыть", en: "Close" },
  "Басты бет": { ru: "Главная", en: "Home" },
  "Құжаттар": { ru: "Документы", en: "Documents" },
  "Құжат қосу": { ru: "Добавить документ", en: "Add document" },
  "Әрекет тарихы": { ru: "История действий", en: "Activity history" },
  "Профиль": { ru: "Профиль", en: "Profile" },
  "2FA баптау": { ru: "Настройка 2FA", en: "2FA settings" },
  "Крипто модуль": { ru: "Крипто модуль", en: "Crypto module" },
  "Шығу": { ru: "Выйти", en: "Sign out" },
  "Құжатты қарау": { ru: "Просмотр документа", en: "Document viewer" },
  "Құжат серверден уақытша ашылып көрсетіледі.": {
    ru: "Документ временно открывается с сервера для просмотра.",
    en: "The document is temporarily opened from the server for viewing.",
  },
  "Құжат туралы ақпарат": { ru: "Информация о документе", en: "Document information" },
  "Атауы": { ru: "Название", en: "Title" },
  "Категория": { ru: "Категория", en: "Category" },
  "Файл": { ru: "Файл", en: "File" },
  "Файл түрі": { ru: "Тип файла", en: "File type" },
  "Көлем": { ru: "Размер", en: "Size" },
  "Жүктелген күні": { ru: "Дата загрузки", en: "Upload date" },
  "Жүктеу": { ru: "Скачать", en: "Download" },
  "Уақытша сілтеме": { ru: "Временная ссылка", en: "Temporary link" },
  "Құжат жүктелуде...": { ru: "Документ загружается...", en: "Loading document..." },
  "Құжат туралы ақпарат жүктелуде...": {
    ru: "Информация о документе загружается...",
    en: "Loading document information...",
  },
  "Бұл файлды сайт ішінде көрсету мүмкін емес. Оны жүктеп ашуға болады.": {
    ru: "Этот файл нельзя показать внутри сайта. Его можно скачать и открыть.",
    en: "This file cannot be displayed inside the site. You can download and open it.",
  },
  "Менің құжаттарым": { ru: "Мои документы", en: "My documents" },
  "Мұнда сақталған файлдарыңызды көріп, іздеп, жүктей аласыз.": {
    ru: "Здесь можно просматривать, искать и скачивать сохраненные файлы.",
    en: "View, search, and download your saved files here.",
  },
  "Жаңа құжат": { ru: "Новый документ", en: "New document" },
  "Корзина": { ru: "Корзина", en: "Trash" },
  "Барлық файл": { ru: "Все файлы", en: "All files" },
  "Жалпы көлем": { ru: "Общий размер", en: "Total size" },
  "PDF саны": { ru: "Количество PDF", en: "PDF files" },
  "Қарау немесе жүктеу кезінде ғана ашылады": {
    ru: "Открывается только при просмотре или скачивании",
    en: "Opens only when viewed or downloaded",
  },
  "Барлығы": { ru: "Все", en: "All" },
  "Суреттер": { ru: "Изображения", en: "Images" },
  "Құжаттар табылмады": { ru: "Документы не найдены", en: "No documents found" },
  "Сипаттама берілмеген.": { ru: "Описание не указано.", en: "No description provided." },
  "Файлды сақтау": { ru: "Сохранить файл", en: "Save file" },
  "Тазалау": { ru: "Очистить", en: "Clear" },
  "Жүктеу формасы": { ru: "Форма загрузки", en: "Upload form" },
  "Файл туралы ақпаратты толтырып, сақтауға жіберіңіз.": {
    ru: "Заполните данные о файле и отправьте его на сохранение.",
    en: "Fill in the file details and save it.",
  },
  "Құжат атауы": { ru: "Название документа", en: "Document title" },
  "Сипаттама": { ru: "Описание", en: "Description" },
  "Қысқаша түсініктеме": { ru: "Краткое описание", en: "Short description" },
  "Файлды осы жерге тастаңыз": { ru: "Перетащите файл сюда", en: "Drop the file here" },
  "немесе басып файл таңдаңыз": { ru: "или нажмите, чтобы выбрать файл", en: "or click to choose a file" },
  "Таңдалған файл": { ru: "Выбранный файл", en: "Selected file" },
  "Алып тастау": { ru: "Убрать", en: "Remove" },
  "Сақталу күйі": { ru: "Состояние хранения", en: "Storage status" },
  "Алдын ала көру": { ru: "Предпросмотр", en: "Preview" },
  "Сурет немесе видео таңдасаңыз, осы жерде көрінеді. Басқа файлдар жай ғана сақталады.": {
    ru: "Если выбрать изображение или видео, оно появится здесь. Остальные файлы просто сохраняются.",
    en: "Images or videos appear here. Other files are simply saved.",
  },
  "Соңғы құжаттар": { ru: "Последние документы", en: "Recent documents" },
  "Жақында қосылған файлдар": { ru: "Недавно добавленные файлы", en: "Recently added files" },
  "Барлығын көру": { ru: "Посмотреть все", en: "View all" },
  "Соңғы әрекеттер": { ru: "Последние действия", en: "Recent activity" },
  "Аккаунттағы соңғы журнал жазбалары": {
    ru: "Последние записи журнала аккаунта",
    en: "Latest account log entries",
  },
  "Толық журнал": { ru: "Полный журнал", en: "Full log" },
  "Барлық құжаттар": { ru: "Все документы", en: "All documents" },
  "Қаралған құжаттар": { ru: "Просмотренные документы", en: "Viewed documents" },
  "Жүктелген құжаттар": { ru: "Скачанные документы", en: "Downloaded documents" },
  "Маған келген құжаттар": { ru: "Полученные документы", en: "Received documents" },
  "Басқа қолданушылар жіберген файлдар": {
    ru: "Файлы, отправленные другими пользователями",
    en: "Files sent by other users",
  },
  "Қолданушыларды басқару, жүйе күйін бақылау және соңғы әрекеттерді қадағалау.": {
    ru: "Управление пользователями, контроль состояния системы и просмотр последних действий.",
    en: "Manage users, monitor system status, and review recent activity.",
  },
  "Қолданушы қосу": { ru: "Добавить пользователя", en: "Add user" },
  "Рөлді admin/user қылып өзгерту": { ru: "Изменить роль admin/user", en: "Change admin/user role" },
  "2FA баптауын тазарту": { ru: "Сбросить 2FA", en: "Reset 2FA" },
  "Қолданушыны жүйеден өшіру": { ru: "Удалить пользователя", en: "Delete user" },
  "Қауіпті әрекеттерді бақылау": { ru: "Проверка подозрительных действий", en: "Suspicious activity review" },
  "Бұл бөлім соңғы әрекеттерді қарап, қайсысына назар аудару керекін көрсетеді. Ұпай көп болған сайын әрекет күмәндірек саналады.": {
    ru: "Этот раздел показывает последние действия и помогает понять, на что обратить внимание. Чем выше балл, тем подозрительнее действие.",
    en: "This section reviews recent actions and highlights what needs attention. A higher score means the action looks more suspicious.",
  },
  "Жоғары қауіп": { ru: "Высокий риск", en: "High risk" },
  "Орташа қауіп": { ru: "Средний риск", en: "Medium risk" },
  "Тұрақты әрекет": { ru: "Обычное действие", en: "Normal activity" },
  "Жалпы статус": { ru: "Общий статус", en: "Overall status" },
  "Тұрақты": { ru: "Стабильно", en: "Stable" },
  "Әрекет тарихы": { ru: "История действий", en: "Activity history" },
  "Кіру, құжат көру, жүктеу және қауіпсіздік әрекеттерінің толық журналы.": {
    ru: "Полный журнал входов, просмотров, скачиваний и действий безопасности.",
    en: "Full log of sign-ins, document views, downloads, and security actions.",
  },
  "Іздеу...": { ru: "Поиск...", en: "Search..." },
  "IP audit қайда көрінеді?": { ru: "Где виден IP-аудит?", en: "Where is IP audit shown?" },
  "Кіру, қате пароль, 2FA және пароль жаңарту логтарында IP мен браузер бөлек көрсетіледі. Іздеу жолына IP адресін жазсаңыз, сол әрекеттер бірден табылады.": {
    ru: "IP и браузер отдельно показываются в журналах входа, неверного пароля, 2FA и обновления пароля. Введите IP в поиск, чтобы сразу найти эти действия.",
    en: "IP and browser are shown separately in login, failed password, 2FA, and password update logs. Enter an IP in search to find those actions.",
  },
  "Сақталуын тексеру": { ru: "Проверка хранения", en: "Storage check" },
  "Бұл тексеру өзіңіз жүктеген немесе сізге жіберілген құжатқа ғана ашылады.": {
    ru: "Эта проверка доступна только для документов, которые вы загрузили или которые вам отправили.",
    en: "This check is available only for documents you uploaded or received.",
  },
  "Басқа қолданушыға жіберу": { ru: "Отправить другому пользователю", en: "Send to another user" },
  "Құжатты тек жүйеде тіркелген email-ге жібере аласыз. Алушы оны өз аккаунтынан ашады.": {
    ru: "Документ можно отправить только на email зарегистрированного пользователя. Получатель откроет его в своем аккаунте.",
    en: "You can send the document only to a registered user's email. The recipient opens it from their account.",
  },
  "Алушының email-і": { ru: "Email получателя", en: "Recipient email" },
  "Құжатты жіберу": { ru: "Отправить документ", en: "Send document" },
  "Құжатты өшіру": { ru: "Удалить документ", en: "Delete document" },
  "Қалпына келтіру": { ru: "Восстановить", en: "Restore" },
  "Біржола өшіру": { ru: "Удалить навсегда", en: "Delete permanently" },
  "Құжат ашылды": { ru: "Документ открыт", en: "Document opened" },
  "Құжат уақытша сілтеме арқылы ашылды. Уақыты біткенше көре аласыз.": {
    ru: "Документ открыт по временной ссылке. Его можно просматривать до истечения срока.",
    en: "The document was opened through a temporary link. You can view it until it expires.",
  },
};

const DYNAMIC = [
  {
    test: /^Қайырлы таң(, .+)?$/,
    ru: (match) => `Доброе утро${match[1] || ""}`,
    en: (match) => `Good morning${match[1] || ""}`,
  },
  {
    test: /^Қайырлы күн(, .+)?$/,
    ru: (match) => `Добрый день${match[1] || ""}`,
    en: (match) => `Good afternoon${match[1] || ""}`,
  },
  {
    test: /^Қайырлы кеш(, .+)?$/,
    ru: (match) => `Добрый вечер${match[1] || ""}`,
    en: (match) => `Good evening${match[1] || ""}`,
  },
  {
    test: /^Маған келген \((\d+)\)$/,
    ru: (match) => `Полученные (${match[1]})`,
    en: (match) => `Received (${match[1]})`,
  },
  {
    test: /^Корзина \((\d+)\)$/,
    ru: (match) => `Корзина (${match[1]})`,
    en: (match) => `Trash (${match[1]})`,
  },
];

const PHRASES = [
  ["Жүйеге кірді", { ru: "Вход в систему", en: "Signed in" }],
  ["Жүйеден шықты", { ru: "Выход из системы", en: "Signed out" }],
  ["Құжат қосылды", { ru: "Документ добавлен", en: "Document added" }],
  ["Құжат ашылды", { ru: "Документ открыт", en: "Document opened" }],
  ["Құжат жүктелді", { ru: "Документ скачан", en: "Document downloaded" }],
  ["Құжат өшірілді", { ru: "Документ удален", en: "Document deleted" }],
  ["Құжат қалпына келтірілді", { ru: "Документ восстановлен", en: "Document restored" }],
  ["Құжат жіберілді", { ru: "Документ отправлен", en: "Document sent" }],
  ["LOGIN", { ru: "Вход", en: "Login" }],
  ["LOGOUT", { ru: "Выход", en: "Logout" }],
  ["DOCUMENT_VIEW", { ru: "Просмотр документа", en: "Document view" }],
  ["DOCUMENT_DOWNLOAD", { ru: "Скачивание документа", en: "Document download" }],
  ["DOCUMENT_DELETE", { ru: "Удаление документа", en: "Document delete" }],
  ["DOCUMENT_SEND", { ru: "Отправка документа", en: "Document send" }],
];

const shouldSkipText = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^[\d\s.,:/\\()[\]{}+\-_%#@]+$/.test(trimmed)) return true;
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(trimmed)) return true;
  return false;
};

export function translateText(value, language) {
  if (!value || shouldSkipText(value)) return value;

  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const lead = match?.[1] || "";
  const core = match?.[2] || value;
  const trail = match?.[3] || "";

  if (!core.trim() || language === "kk") return value;

  const exact = EXACT[core];
  if (exact?.[language]) {
    return `${lead}${exact[language]}${trail}`;
  }

  for (const item of DYNAMIC) {
    const found = core.match(item.test);
    if (found) {
      return `${lead}${item[language](found)}${trail}`;
    }
  }

  let translated = core;
  for (const [source, targets] of PHRASES) {
    if (targets[language]) {
      translated = translated.replaceAll(source, targets[language]);
    }
  }

  return `${lead}${translated}${trail}`;
}
