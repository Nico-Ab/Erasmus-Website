import type { AppLocale } from "@/lib/i18n/config";

const messages = {
  en: {
    language: {
      label: "Language"
    },
    languageToggle: {
      english: "English",
      bulgarian: "Bulgarian"
    },
    brand: {
      university: 'South-West University "Neofit Rilski"',
      portal: "Erasmus Staff Mobility Portal",
      description: "Internal portal for staff mobility cases, review, and administration."
    },
    common: {
      dashboard: "Dashboard",
      navigation: "Navigation",
      home: "Home",
      status: "Status",
      login: "Login",
      register: "Register",
      protectedWorkspace: "Protected workspace",
      signedIn: "Protected session",
      signedOut: "Staff mobility access",
      signedInAs: "Signed in as",
      signOut: "Sign out",
      returnHome: "Return home",
      notSet: "Not set",
      notAssigned: "Not assigned",
      noDepartmentAssigned: "No department assigned",
      noAcademicYear: "No academic year",
      systemStatus: "System status",
      openReports: "Open reports",
      item: "item",
      items: "items"
    },
    layout: {
      topBarLeft: "South-West University internal portal",
      footer: "Internal South-West University portal for Erasmus staff mobility administration.",
      footerLink: "System status"
    },
    navigation: {
      public: {
        home: { title: "Home", description: "Portal entry" },
        status: { title: "Status", description: "Local checks" },
        login: { title: "Login", description: "Secure access" },
        register: { title: "Register", description: "Staff account request" },
        dashboard: { title: "Dashboard", description: "Protected workspace" }
      },
      dashboard: {
        overview: { title: "Overview", description: "Start page" },
        profile: { title: "My profile", description: "Personal details" },
        staff: { title: "Staff workspace", description: "Cases and documents" },
        newCase: { title: "New case", description: "Start a case" },
        officer: { title: "Review dashboard", description: "Review overview" },
        reviewCases: { title: "Review cases", description: "Review register" },
        reports: { title: "Reports", description: "Reports and export" },
        admin: { title: "Admin dashboard", description: "Administration overview" },
        users: { title: "User management", description: "Accounts and roles" },
        masterData: { title: "Master data", description: "Faculties and settings" },
        auditLog: { title: "Audit log", description: "Protected history" }
      }
    },
    homePage: {
      badge: "Internal university administration",
      title: "SWU Erasmus staff mobility portal",
      description:
        "Use this portal to register, sign in, manage staff mobility cases, review documents, and complete protected administration tasks.",
      openDashboard: "Open dashboard",
      openLogin: "Open login",
      registerStaff: "Register staff account",
      approvalNote:
        "Staff registrations require approval before access to the protected workspace is enabled.",
      signedInAs: "Signed in as",
      accessRoutesTitle: "Access routes",
      accessRoutesDescription: "Choose the route that matches your role.",
      accessPanels: {
        staff: {
          title: "Staff",
          description: "Create and manage mobility cases, documents, and profile data."
        },
        officer: {
          title: "Officer",
          description: "Review submitted cases, documents, comments, and status changes."
        },
        admin: {
          title: "Admin",
          description: "Manage access, master data, reporting settings, and audit history."
        }
      }
    },
    auth: {
      publicLoginPage: {
        title: "Access the portal",
        description: "Sign in with an approved account to enter the protected mobility workspace.",
        accessControlTitle: "Access control",
        accessControlDescription:
          "Pending, rejected, and deactivated accounts are stopped before they reach protected routes.",
        roleSeparationTitle: "Role separation",
        roleSeparationDescription:
          "Staff, officer, and admin areas remain separated through server-side authorization checks."
      },
      publicRegisterPage: {
        title: "Register a staff account",
        description:
          "Submit a staff account request so your mobility cases can enter the approval and review workflow.",
        beforeAccessTitle: "Before access is granted",
        beforeAccessDescription:
          "New registrations are stored as pending staff accounts. The protected workspace remains unavailable until an administrator approves the request.",
        whatNextTitle: "What happens next",
        whatNextDescription:
          "After registration you will be redirected to the pending-approval page, where the submitted email and the next review step are shown clearly.",
        centralAccounts: "Officer and admin accounts continue to be managed centrally for the local environment."
      },
      login: {
        title: "Secure login",
        description: "Use your university portal credentials to continue.",
        submit: "Sign in",
        submitting: "Signing in...",
        preparing: "Preparing form...",
        demoAccounts: "Demo accounts",
        needAccount: "Need a staff account first?",
        registerLink: "Register for approval",
        needEntry: "Need the entry page first?",
        homeLink: "Return to the home page"
      },
      register: {
        title: "Staff registration",
        description:
          "New staff accounts are reviewed by an administrator before full access is granted.",
        submit: "Submit registration",
        submitting: "Submitting...",
        preparing: "Preparing form...",
        approvalProcess: "Approval process",
        approvalLineOne: "After submission, your account enters a pending review state.",
        approvalLineTwo: "An administrator must approve the account before dashboard access is enabled.",
        approvedPrompt: "Already approved?",
        approvedLink: "Go to login"
      },
      pending: {
        submitted: "Registration submitted",
        approvalRequired: "Approval required",
        title: "Account pending approval",
        description:
          "Your account has been recorded, but access to the protected workspace stays disabled until an administrator approves the registration.",
        registrationStatus: "Registration status",
        currentState: "Current state: Pending administrative review",
        submittedEmail: "Submitted email",
        nextStep: "Next step",
        nextStepDescription:
          "An administrator reviews the request in the user management area. Once approved, you can sign in and open the protected workspace.",
        returnLogin: "Return to login",
        returnHome: "Return home"
      },
      fields: {
        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm password"
      },
      errors: {
        genericLogin: "Sign in could not be completed right now. Please try again.",
        invalidCredentials:
          "Sign in could not be completed. Check your email, password, and account approval status.",
        pendingApproval: "Your account is waiting for admin approval.",
        rejected: "Your registration was rejected. Please contact the Erasmus office.",
        deactivated: "Your account is deactivated. Please contact an administrator.",
        genericRegister: "Registration failed. Please review the form and try again.",
        requestFailed: "The registration request could not be completed. Please try again."
      }
    },
    dashboardShell: {
      signedInAccount: "Signed-in account",
      navigationDescription: "Open the area that matches your current task.",
      title: "University mobility administration",
      description: "Open the next task in your assigned area."
    },
    profile: {
      pageTitle: "My institutional profile",
      pageDescription:
        "Review and update the institutional identity details used in case ownership, review, and reporting.",
      eyebrow: "Profile administration",
      statusTitle: "Profile status",
      statusValue: "Editable",
      statusDescription: "Your own institutional profile can be updated directly from this page.",
      facultyTitle: "Faculty",
      facultyDescription: "Staff users choose from the official SWU faculty list used by reports and filters.",
      departmentTitle: "Department",
      departmentDescription: "Departments remain admin-managed and can stay blank when no verified assignment is needed.",
      guidanceTitle: "Profile guidance",
      guidanceDescription: "These details support mobility case ownership, search filters, and reporting outputs.",
      guidancePoints: [
        "Keep your name and email aligned with university records.",
        "Staff profiles use the official SWU faculty list rather than older local placeholder values.",
        "Departments remain admin-managed and can stay blank until a verified assignment is needed.",
        "Central officer and admin accounts can remain outside a faculty and department assignment.",
        "Profile changes are validated on the server before they are stored."
      ],
      formTitle: "Profile details",
      formDescription:
        "Maintain the identity and assignment details used throughout case management, review, and reporting.",
      legacyTitle: "Profile update needed",
      legacyDescription:
        "Your current assignment includes an older master-data value. Review the faculty and department fields before saving.",
      identitySection: "Identity",
      identityDescription: "Keep your official name and contact email aligned with university records.",
      assignmentSection: "Institutional assignment",
      assignmentDescription: "These fields support search, reporting, and assignment context.",
      academicTitle: "Academic title",
      faculty: "Faculty",
      department: "Department",
      selectAcademicTitle: "Select academic title",
      selectFaculty: "Select faculty",
      noFacultyAssigned: "No faculty assigned",
      selectFacultyFirst: "Select faculty first",
      noDepartmentsAvailable: "No departments available",
      selectDepartment: "Select department",
      facultyHelperStaff: "Required for staff accounts and limited to the official SWU faculty list.",
      facultyHelperCentral: "Optional for central officer and admin roles.",
      departmentHelperStaff:
        "Optional in this version. Departments stay admin-managed and scoped to the selected faculty.",
      departmentHelperCentral: "Optional. Leave blank if your role is not tied to a department.",
      save: "Save profile",
      saving: "Saving...",
      preparing: "Preparing form...",
      updateFailed: "Profile update failed. Please review the form and try again.",
      updated: "Profile updated successfully."
    },
    statusPage: {
      eyebrow: "Local observability",
      title: "System status",
      description: "Check the local application, database, and storage status before continuing.",
      localStatus: "Local status",
      localStatusDescription: "Application, database, and storage readiness.",
      application: "Application",
      database: "Database",
      storage: "Storage",
      environmentTitle: "Configured environment",
      environmentDescription: "Values shown here are non-secret operational settings.",
      checksTitle: "Checks",
      checksDescription: "Safe-to-display local checks for the current environment.",
      appUrl: "APP_URL",
      storageDriver: "Storage driver",
      localStorageRoot: "Local storage root",
      defaultLocale: "Default locale",
      maxUploadSize: "Max upload size",
      allowedUploadExtensions: "Allowed upload extensions",
      portalHome: "Portal home"
    }
  },
  bg: {
    language: {
      label: "Език"
    },
    languageToggle: {
      english: "Английски",
      bulgarian: "Български"
    },
    brand: {
      university: 'Югозападен университет "Неофит Рилски"',
      portal: "Портал за мобилност на персонала по Еразъм",
      description: "Вътрешен портал за мобилни случаи на персонала, преглед и администрация."
    },
    common: {
      dashboard: "Табло",
      navigation: "Навигация",
      home: "Начало",
      status: "Статус",
      login: "Вход",
      register: "Регистрация",
      protectedWorkspace: "Защитено работно пространство",
      signedIn: "Защитена сесия",
      signedOut: "Достъп за мобилност на персонала",
      signedInAs: "Влезли сте като",
      signOut: "Изход",
      returnHome: "Назад към началото",
      notSet: "Не е зададено",
      notAssigned: "Не е зададено",
      noDepartmentAssigned: "Няма зададена катедра",
      noAcademicYear: "Няма учебна година",
      systemStatus: "Статус на системата",
      openReports: "Отвори справките",
      item: "елемент",
      items: "елемента"
    },
    layout: {
      topBarLeft: "Вътрешен портал на Югозападен университет",
      footer: "Вътрешен портал на Югозападен университет за администрация на мобилност на персонала по Еразъм.",
      footerLink: "Статус на системата"
    },
    navigation: {
      public: {
        home: { title: "Начало", description: "Вход към портала" },
        status: { title: "Статус", description: "Локални проверки" },
        login: { title: "Вход", description: "Сигурен достъп" },
        register: { title: "Регистрация", description: "Заявка за staff акаунт" },
        dashboard: { title: "Табло", description: "Защитено работно пространство" }
      },
      dashboard: {
        overview: { title: "Преглед", description: "Начална страница" },
        profile: { title: "Моят профил", description: "Лични данни" },
        staff: { title: "Работно пространство", description: "Случаи и документи" },
        newCase: { title: "Нов случай", description: "Създай случай" },
        officer: { title: "Табло за преглед", description: "Преглед на опашката" },
        reviewCases: { title: "Случаи за преглед", description: "Регистър за преглед" },
        reports: { title: "Справки", description: "Справки и експорт" },
        admin: { title: "Админ табло", description: "Административен преглед" },
        users: { title: "Управление на потребители", description: "Акаунти и роли" },
        masterData: { title: "Основни данни", description: "Факултети и настройки" },
        auditLog: { title: "Одитен журнал", description: "Защитена история" }
      }
    },
    homePage: {
      badge: "Вътрешна университетска администрация",
      title: "SWU портал за мобилност на персонала по Еразъм",
      description:
        "Използвайте този портал, за да се регистрирате, да влезете, да управлявате случаи за мобилност на персонала, да преглеждате документи и да изпълнявате защитени административни задачи.",
      openDashboard: "Отвори таблото",
      openLogin: "Отвори вход",
      registerStaff: "Регистрация на staff акаунт",
      approvalNote:
        "Регистрациите на staff изискват одобрение, преди защитеното работно пространство да стане достъпно.",
      signedInAs: "Влезли сте като",
      accessRoutesTitle: "Пътища за достъп",
      accessRoutesDescription: "Изберете пътя, който отговаря на вашата роля.",
      accessPanels: {
        staff: {
          title: "Staff",
          description: "Създавайте и управлявайте случаи за мобилност, документи и профилни данни."
        },
        officer: {
          title: "Officer",
          description: "Преглеждайте подадени случаи, документи, коментари и промени в статуса."
        },
        admin: {
          title: "Admin",
          description: "Управлявайте достъпа, основните данни, настройките за справки и одитната история."
        }
      }
    },
    auth: {
      publicLoginPage: {
        title: "Достъп до портала",
        description: "Влезте с одобрен акаунт, за да отворите защитеното пространство за мобилност.",
        accessControlTitle: "Контрол на достъпа",
        accessControlDescription:
          "Изчакващи, отхвърлени и деактивирани акаунти се спират, преди да достигнат защитените маршрути.",
        roleSeparationTitle: "Разделение по роли",
        roleSeparationDescription:
          "Зоните за staff, officer и admin остават разделени чрез проверки за авторизация от страна на сървъра."
      },
      publicRegisterPage: {
        title: "Регистрация на staff акаунт",
        description:
          "Изпратете заявка за staff акаунт, за да могат вашите случаи за мобилност да влязат в процеса на одобрение и преглед.",
        beforeAccessTitle: "Преди да бъде даден достъп",
        beforeAccessDescription:
          "Новите регистрации се записват като изчакващи staff акаунти. Защитеното работно пространство остава недостъпно, докато администратор не одобри заявката.",
        whatNextTitle: "Какво следва",
        whatNextDescription:
          "След регистрация ще бъдете пренасочени към страницата за изчакващо одобрение, където ясно се показват подаденият имейл и следващата стъпка.",
        centralAccounts: "Officer и admin акаунтите продължават да се управляват централно в локалната среда."
      },
      login: {
        title: "Сигурен вход",
        description: "Използвайте университетските си данни за достъп, за да продължите.",
        submit: "Вход",
        submitting: "Влизане...",
        preparing: "Подготвяне на формата...",
        demoAccounts: "Демо акаунти",
        needAccount: "Нужен ли ви е staff акаунт?",
        registerLink: "Регистрация за одобрение",
        needEntry: "Искате първо началната страница?",
        homeLink: "Назад към началната страница"
      },
      register: {
        title: "Регистрация на staff",
        description: "Новите staff акаунти се преглеждат от администратор преди да бъде даден пълен достъп.",
        submit: "Изпрати регистрация",
        submitting: "Изпращане...",
        preparing: "Подготвяне на формата...",
        approvalProcess: "Процес на одобрение",
        approvalLineOne: "След изпращане вашият акаунт влиза в състояние на изчакващ преглед.",
        approvalLineTwo: "Администратор трябва да одобри акаунта, преди достъпът до таблото да бъде активиран.",
        approvedPrompt: "Вече сте одобрени?",
        approvedLink: "Към вход"
      },
      pending: {
        submitted: "Регистрацията е изпратена",
        approvalRequired: "Необходимо е одобрение",
        title: "Акаунтът очаква одобрение",
        description:
          "Вашият акаунт е записан, но достъпът до защитеното работно пространство остава изключен, докато администратор не одобри регистрацията.",
        registrationStatus: "Статус на регистрацията",
        currentState: "Текущо състояние: Изчаква административен преглед",
        submittedEmail: "Изпратен имейл",
        nextStep: "Следваща стъпка",
        nextStepDescription:
          "Администратор преглежда заявката в секцията за управление на потребители. След одобрение можете да влезете и да отворите защитеното работно пространство.",
        returnLogin: "Назад към вход",
        returnHome: "Назад към началото"
      },
      fields: {
        firstName: "Име",
        lastName: "Фамилия",
        email: "Имейл",
        password: "Парола",
        confirmPassword: "Потвърдете паролата"
      },
      errors: {
        genericLogin: "Входът не може да бъде завършен в момента. Опитайте отново.",
        invalidCredentials:
          "Входът не може да бъде завършен. Проверете имейла, паролата и статуса на одобрение на акаунта.",
        pendingApproval: "Вашият акаунт очаква административно одобрение.",
        rejected: "Вашата регистрация е отхвърлена. Свържете се с офиса по Еразъм.",
        deactivated: "Вашият акаунт е деактивиран. Свържете се с администратор.",
        genericRegister: "Регистрацията е неуспешна. Проверете формата и опитайте отново.",
        requestFailed: "Заявката за регистрация не можа да бъде изпълнена. Опитайте отново."
      }
    },
    dashboardShell: {
      signedInAccount: "Вписан акаунт",
      navigationDescription: "Отворете зоната, която отговаря на текущата ви задача.",
      title: "Университетска администрация на мобилност",
      description: "Отворете следващата задача в определената ви зона."
    },
    profile: {
      pageTitle: "Моят институционален профил",
      pageDescription:
        "Прегледайте и обновете институционалните идентификационни данни, използвани при собствеността на случаите, прегледа и справките.",
      eyebrow: "Администриране на профил",
      statusTitle: "Статус на профила",
      statusValue: "Редактируем",
      statusDescription: "Собственият ви институционален профил може да бъде обновен директно от тази страница.",
      facultyTitle: "Факултет",
      facultyDescription: "Staff потребителите избират от официалния списък на SWU, използван в справките и филтрите.",
      departmentTitle: "Катедра",
      departmentDescription: "Катедрите остават администрирани и могат да останат празни, когато не е нужна потвърдена принадлежност.",
      guidanceTitle: "Насоки за профила",
      guidanceDescription: "Тези данни подпомагат собствеността върху случаите, филтрите за търсене и резултатите от справките.",
      guidancePoints: [
        "Поддържайте името и имейла си в съответствие с университетските записи.",
        "Staff профилите използват официалния списък с факултети на SWU, а не стари локални примерни стойности.",
        "Катедрите остават администрирани и могат да останат празни, докато не е нужна потвърдена принадлежност.",
        "Централните officer и admin акаунти могат да останат без факултет и катедра.",
        "Промените в профила се валидират на сървъра, преди да бъдат записани."
      ],
      formTitle: "Данни за профила",
      formDescription:
        "Поддържайте данните за идентичност и принадлежност, използвани в управлението на случаи, прегледа и справките.",
      legacyTitle: "Нужна е актуализация на профила",
      legacyDescription:
        "Текущата ви принадлежност съдържа по-стара стойност от основните данни. Прегледайте полетата за факултет и катедра преди запазване.",
      identitySection: "Идентичност",
      identityDescription: "Поддържайте официалното си име и служебния имейл в съответствие с университетските записи.",
      assignmentSection: "Институционална принадлежност",
      assignmentDescription: "Тези полета подпомагат търсенето, справките и контекста на принадлежност.",
      academicTitle: "Академична титла",
      faculty: "Факултет",
      department: "Катедра",
      selectAcademicTitle: "Изберете академична титла",
      selectFaculty: "Изберете факултет",
      noFacultyAssigned: "Без зададен факултет",
      selectFacultyFirst: "Първо изберете факултет",
      noDepartmentsAvailable: "Няма налични катедри",
      selectDepartment: "Изберете катедра",
      facultyHelperStaff: "Задължително за staff акаунти и ограничено до официалния списък с факултети на SWU.",
      facultyHelperCentral: "По избор за централните officer и admin роли.",
      departmentHelperStaff:
        "По избор в тази версия. Катедрите остават администрирани и са обвързани с избрания факултет.",
      departmentHelperCentral: "По избор. Оставете празно, ако ролята ви не е свързана с катедра.",
      save: "Запази профила",
      saving: "Запазване...",
      preparing: "Подготвяне на формата...",
      updateFailed: "Профилът не можа да бъде обновен. Проверете формата и опитайте отново.",
      updated: "Профилът е обновен успешно."
    },
    statusPage: {
      eyebrow: "Локална наблюдаемост",
      title: "Статус на системата",
      description: "Проверете локалното състояние на приложението, базата данни и хранилището, преди да продължите.",
      localStatus: "Локален статус",
      localStatusDescription: "Готовност на приложението, базата данни и хранилището.",
      application: "Приложение",
      database: "База данни",
      storage: "Хранилище",
      environmentTitle: "Конфигурирана среда",
      environmentDescription: "Показаните тук стойности са не-секретни оперативни настройки.",
      checksTitle: "Проверки",
      checksDescription: "Безопасни за показване локални проверки за текущата среда.",
      appUrl: "APP_URL",
      storageDriver: "Драйвер за хранилище",
      localStorageRoot: "Локален път за хранилище",
      defaultLocale: "Стандартен език",
      maxUploadSize: "Максимален размер за качване",
      allowedUploadExtensions: "Разрешени разширения",
      portalHome: "Начало на портала"
    }
  }
} as const;

export function getMessages(locale: AppLocale) {
  return messages[locale];
}

export type AppMessages = ReturnType<typeof getMessages>;
