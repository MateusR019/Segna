import type { AppLanguage } from "@/store/settingsStore";

const translations = {
  pt: {
    // Nav
    dashboard:    "Dashboard",
    tasks:        "Tarefas",
    habits:       "Hábitos",
    finances:     "Finanças",
    defi:         "DeFi",
    notes:        "Notas",
    review:       "Revisão",
    corporal:     "Corporal",
    investments:  "Investimentos",
    settings:     "Configurações",
    help:         "Como funciona?",
    signOut:      "Sair da conta",
    more:         "Mais",
    moreSections: "Mais seções",
    profile:      "Perfil",
    offline:      "Sem conexão — dados salvos localmente",

    // Settings page
    settingsTitle:       "Configurações",
    settingsDesc:        "Perfil, aparência e dados",
    sectionProfile:      "Perfil",
    sectionAppearance:   "Aparência",
    sectionBody:         "Métricas Corporais",
    sectionWallet:       "DeFi / Wallet",
    sectionData:         "Importar / Exportar",
    sectionDanger:       "Zona de Perigo",

    labelName:           "Nome de exibição",
    hintName:            "Aparece no perfil e no sidebar",
    labelAvatarColor:    "Cor do avatar",
    labelTheme:          "Tema",
    hintTheme:           "Claro ainda em desenvolvimento",
    labelLanguage:       "Idioma",
    labelHeight:         "Altura",
    hintHeight:          "Usada para calcular o IMC",
    labelWalletAddress:  "Endereço EVM",
    hintWallet:          "Para sincronizar pools de liquidez",
    labelZerionKey:      "Zerion API Key",
    hintZerionKey:       "Necessária para sincronizar posições DeFi",
    labelResetSettings:  "Redefinir configurações",
    hintResetSettings:   "Apaga nome, avatar, altura e wallet",

    themeDark:    "Escuro",
    themeLight:   "Claro",
    themeAuto:    "Sistema",
    langPT:       "Português",
    langEN:       "English",

    namePlaceholder:   "Seu nome",
    walletPlaceholder: "0x...",
    heightPlaceholder: "cm",
    save:              "Salvar",
    cancel:            "Cancelar",
    reset:             "Redefinir",
    confirm:           "Confirmar?",
    yesReset:          "Sim, redefinir",
    saved:             "Salvo!",
    nameUpdated:       "Nome atualizado!",
    heightSaved:       "Altura salva!",
    walletSaved:       "Wallet atualizada!",
    settingsReset:     "Configurações redefinidas.",

    importCSV:         "Importar CSV",
    exportCSV:         "Exportar CSV",
    chooseFile:        "Clique para selecionar arquivo CSV",
    importBtn:         "Importar",
    exportBtn:         "Baixar CSV",
    valid:             "válidos",
    invalid:           "inválidos",
    periodMonth:       "Este mês",
    period3Months:     "3 meses",
    periodYear:        "Este ano",
    periodAll:         "Todos",

    // ── Page headings ──
    financasTitle:     "Finanças",
    financasDesc:      "Receitas, despesas e investimentos",
    finTabOverview:    "Visão Geral",
    finTabTransactions:"Transações",
    finTabInvestments: "Investimentos",
    finTabCalendar:    "Calendário",
    finTabRecurring:   "Fixos",
    finTabGoals:       "Metas",

    habitosTitle:      "Hábitos",
    habitosDesc:       "Rastreamento diário de hábitos",
    newHabit:          "Novo Hábito",

    notasTitle:        "Notas",
    notasDesc:         "Anote e vá embora",
    clearAll:          "Limpar tudo",
    noTag:             "Sem tag",
    newTag:            "Nova tag",
    saveNote:          "Salvar",
    searchNotes:       "Buscar nas notas...",
    allNotes:          "Todas",
    noNotesYet:        "Nenhuma nota ainda.",
    writeAbove:        "Escreva algo acima e salve.",
    noteInput:         "O que está na sua cabeça? (Ctrl+Enter para salvar, cole imagens)",

    tarefasTitle:      "Tarefas",
    addTask:           "Adicionar tarefa",
    totalDay:          "Total do dia",
    completed:         "Concluídas",
    pending:           "Pendentes",
    completion:        "Concluído",
    noTasksToday:      "Nenhuma tarefa para hoje",
    priorityHigh:      "Alta",
    priorityMedium:    "Média",
    priorityLow:       "Baixa",
    taskTitle:         "Título da tarefa",
    taskDesc:          "Descrição (opcional)",
    priority:          "Prioridade:",
    addBtn:            "Adicionar",
    cancelBtn:         "Cancelar",

    corporalTitle:     "Saúde Corporal",
    corporalDesc:      "Métricas e progresso corporal",
    newMeasurement:    "Nova medição",
    addMeasurement:    "Registrar medição",

    revisaoTitle:      "Revisão Semanal",
    revisaoDesc:       "Reflita sobre a semana",

    defiTitle:         "DeFi / Crypto",

    // ── Common ──
    monthBalance:      "Saldo do mês",
    netWorthTitle:     "Patrimônio total",
    financialBalance:  "Saldo financeiro",
    last7days:         "Últimos 7 dias",
    habitsToday:       "Hábitos hoje",
    viewAll:           "Ver todos",
    viewAllFem:        "Ver todas",
    topStreaks:        "Maiores streaks",
    recentNotes:       "Notas recentes",
    noHabitsYet:       "Nenhum hábito cadastrado",
    createFirstHabit:  "Criar meu primeiro hábito →",
    noNotesYetShort:   "Nenhuma nota ainda",
    createFirstNote:   "Criar primeira nota →",
    detailsLink:       "Detalhes",
    habitCompletions:  "conclusões de hábitos",
    bestHabit:         "melhor hábito",
    inExpenses:        "em despesas",
    todaysHabits:      "Hábitos de hoje",

    // ── Budget alerts ──
    budgetNearLimit:   "Perto do limite",
    budgetRemaining:   "restante",

    // ── Streak at risk ──
    streakAtRisk:      "em risco",

    // ── Recurring tasks ──
    repeat:            "Repetir",
    repeatNone:        "Não repetir",
    repeatDaily:       "Diário",
    repeatWeekly:      "Semanal",
    repeatMonthly:     "Mensal",
    recurring:         "Recorrente",

    // ── Weekly goal (habits) ──
    weeklyGoals:       "Metas semanais",
    setGoal:           "Definir meta",
    noWeeklyGoal:      "Sem meta",
    perWeekShort:      "x/sem",

    // ── PDF ──
    exportPDF:         "PDF",

    // ── Treino / Workout ──
    treinoTitle:       "Treino",
    treinoDesc:        "Exercícios e séries",
    newWorkout:        "Novo treino",
    startWorkout:      "Começar treino",
    addExerciseBtn:    "Exercício",
    exerciseName:      "Nome do exercício",
    sessionName:       "Nome do treino",
    repsLabel:         "Reps",
    weightLabel:       "Kg",
    noWorkoutsYet:     "Nenhum treino registrado",
    workoutHistory:    "Histórico",
    prsTitle:          "Recordes (PRs)",
    durationMin:       "min",

    // ── Task time ──
    taskTime:          "Horário",

    // ── Chart period ──
    chartPeriod1m:     "1 mês",
    chartPeriod3m:     "3 meses",
    chartPeriod6m:     "6 meses",
    chartPeriodAll:    "Tudo",

    // ── Extra body metrics ──
    metricChest:       "Peito",
    metricBicep:       "Bícep",
    metricThigh:       "Coxa",
    metricHip:         "Quadril",
    measurementHistory:"Histórico",
    evolutionChart:    "Evolução",
    statMin:           "Mínimo",
    statMax:           "Máximo",
    statAvg:           "Média",
    statDelta:         "Variação",

    // ── Task tags ──
    tagPessoal:        "Pessoal",
    tagTrabalho:       "Trabalho",
    tagEstudos:        "Estudos",
    tagNegocio:        "Negócio",
    tagSaude:          "Saúde",
    tagFinancas:       "Finanças",
    filterAll:         "Todos",
  },

  en: {
    // Nav
    dashboard:    "Dashboard",
    tasks:        "Tasks",
    habits:       "Habits",
    finances:     "Finances",
    defi:         "DeFi",
    notes:        "Notes",
    review:       "Review",
    corporal:     "Body",
    investments:  "Investments",
    settings:     "Settings",
    help:         "How it works?",
    signOut:      "Sign out",
    more:         "More",
    moreSections: "More sections",
    profile:      "Profile",
    offline:      "No connection — data saved locally",

    // Settings page
    settingsTitle:       "Settings",
    settingsDesc:        "Profile, appearance & data",
    sectionProfile:      "Profile",
    sectionAppearance:   "Appearance",
    sectionBody:         "Body Metrics",
    sectionWallet:       "DeFi / Wallet",
    sectionData:         "Import / Export",
    sectionDanger:       "Danger Zone",

    labelName:           "Display name",
    hintName:            "Shown in the profile and sidebar",
    labelAvatarColor:    "Avatar color",
    labelTheme:          "Theme",
    hintTheme:           "Light mode still in development",
    labelLanguage:       "Language",
    labelHeight:         "Height",
    hintHeight:          "Used to calculate BMI",
    labelWalletAddress:  "EVM Address",
    hintWallet:          "To sync liquidity pools",
    labelZerionKey:      "Zerion API Key",
    hintZerionKey:       "Required to sync DeFi positions",
    labelResetSettings:  "Reset settings",
    hintResetSettings:   "Clears name, avatar, height and wallet",

    themeDark:    "Dark",
    themeLight:   "Light",
    themeAuto:    "System",
    langPT:       "Português",
    langEN:       "English",

    namePlaceholder:   "Your name",
    walletPlaceholder: "0x...",
    heightPlaceholder: "cm",
    save:              "Save",
    cancel:            "Cancel",
    reset:             "Reset",
    confirm:           "Confirm?",
    yesReset:          "Yes, reset",
    saved:             "Saved!",
    nameUpdated:       "Name updated!",
    heightSaved:       "Height saved!",
    walletSaved:       "Wallet updated!",
    settingsReset:     "Settings reset.",

    importCSV:         "Import CSV",
    exportCSV:         "Export CSV",
    chooseFile:        "Click to select CSV file",
    importBtn:         "Import",
    exportBtn:         "Download CSV",
    valid:             "valid",
    invalid:           "invalid",
    periodMonth:       "This month",
    period3Months:     "3 months",
    periodYear:        "This year",
    periodAll:         "All time",

    // ── Page headings ──
    financasTitle:     "Finances",
    financasDesc:      "Income, expenses & investments",
    finTabOverview:    "Overview",
    finTabTransactions:"Transactions",
    finTabInvestments: "Investments",
    finTabCalendar:    "Calendar",
    finTabRecurring:   "Recurring",
    finTabGoals:       "Goals",

    habitosTitle:      "Habits",
    habitosDesc:       "Daily habit tracking",
    newHabit:          "New Habit",

    notasTitle:        "Notes",
    notasDesc:         "Write and go",
    clearAll:          "Clear all",
    noTag:             "No tag",
    newTag:            "New tag",
    saveNote:          "Save",
    searchNotes:       "Search notes...",
    allNotes:          "All",
    noNotesYet:        "No notes yet.",
    writeAbove:        "Write something above and save.",
    noteInput:         "What's on your mind? (Ctrl+Enter to save, paste images)",

    tarefasTitle:      "Tasks",
    addTask:           "Add task",
    totalDay:          "Today's total",
    completed:         "Completed",
    pending:           "Pending",
    completion:        "Completion",
    noTasksToday:      "No tasks for today",
    priorityHigh:      "High",
    priorityMedium:    "Medium",
    priorityLow:       "Low",
    taskTitle:         "Task title",
    taskDesc:          "Description (optional)",
    priority:          "Priority:",
    addBtn:            "Add",
    cancelBtn:         "Cancel",

    corporalTitle:     "Body Health",
    corporalDesc:      "Metrics and body progress",
    newMeasurement:    "New measurement",
    addMeasurement:    "Log measurement",

    revisaoTitle:      "Weekly Review",
    revisaoDesc:       "Reflect on the week",

    defiTitle:         "DeFi / Crypto",

    // ── Common ──
    monthBalance:      "Month balance",
    netWorthTitle:     "Net Worth",
    financialBalance:  "Financial balance",
    last7days:         "Last 7 days",
    habitsToday:       "Habits today",
    viewAll:           "View all",
    viewAllFem:        "View all",
    topStreaks:        "Top streaks",
    recentNotes:       "Recent notes",
    noHabitsYet:       "No habits yet",
    createFirstHabit:  "Create my first habit →",
    noNotesYetShort:   "No notes yet",
    createFirstNote:   "Create first note →",
    detailsLink:       "Details",
    habitCompletions:  "habit completions",
    bestHabit:         "best habit",
    inExpenses:        "in expenses",
    todaysHabits:      "Today's habits",

    // ── Budget alerts ──
    budgetNearLimit:   "Near limit",
    budgetRemaining:   "remaining",

    // ── Streak at risk ──
    streakAtRisk:      "at risk",

    // ── Recurring tasks ──
    repeat:            "Repeat",
    repeatNone:        "Don't repeat",
    repeatDaily:       "Daily",
    repeatWeekly:      "Weekly",
    repeatMonthly:     "Monthly",
    recurring:         "Recurring",

    // ── Weekly goal (habits) ──
    weeklyGoals:       "Weekly goals",
    setGoal:           "Set goal",
    noWeeklyGoal:      "No goal",
    perWeekShort:      "x/wk",

    // ── PDF ──
    exportPDF:         "PDF",

    // ── Treino / Workout ──
    treinoTitle:       "Workout",
    treinoDesc:        "Exercises & sets",
    newWorkout:        "New workout",
    startWorkout:      "Start workout",
    addExerciseBtn:    "Exercise",
    exerciseName:      "Exercise name",
    sessionName:       "Workout name",
    repsLabel:         "Reps",
    weightLabel:       "Kg",
    noWorkoutsYet:     "No workouts yet",
    workoutHistory:    "History",
    prsTitle:          "Personal Records",
    durationMin:       "min",

    // ── Task time ──
    taskTime:          "Time",

    // ── Chart period ──
    chartPeriod1m:     "1 month",
    chartPeriod3m:     "3 months",
    chartPeriod6m:     "6 months",
    chartPeriodAll:    "All",

    // ── Extra body metrics ──
    metricChest:       "Chest",
    metricBicep:       "Bicep",
    metricThigh:       "Thigh",
    metricHip:         "Hip",
    measurementHistory:"History",
    evolutionChart:    "Progress",
    statMin:           "Min",
    statMax:           "Max",
    statAvg:           "Average",
    statDelta:         "Change",

    // ── Task tags ──
    tagPessoal:        "Personal",
    tagTrabalho:       "Work",
    tagEstudos:        "Studies",
    tagNegocio:        "Business",
    tagSaude:          "Health",
    tagFinancas:       "Finance",
    filterAll:         "All",
  },
} as const;

export type TranslationKey = keyof typeof translations.pt;

export function useT(language: AppLanguage) {
  return (key: TranslationKey): string => {
    return (translations[language] as Record<string, string>)[key] ?? (translations.pt as Record<string, string>)[key] ?? key;
  };
}
