import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section = "chats" | "contacts" | "channels" | "groups" | "media" | "search" | "profile" | "settings";

const mockChats = [
  { id: 1, name: "Алина Морозова", msg: "Привет! Как дела? 😊", time: "12:34", unread: 3, online: true, gradient: "avatar-gradient-1", encrypted: true },
  { id: 2, name: "Дима Волков", msg: "Отправил файл тебе", time: "11:20", unread: 0, online: false, gradient: "avatar-gradient-2", encrypted: true },
  { id: 3, name: "Команда Яримпли", msg: "Новый дизайн готов!", time: "10:05", unread: 12, online: true, gradient: "avatar-gradient-3", encrypted: false },
  { id: 4, name: "Карина Лебедь", msg: "Спасибо за помощь 🙏", time: "09:40", unread: 1, online: true, gradient: "avatar-gradient-4", encrypted: true },
  { id: 5, name: "Максим Петров", msg: "Созвонимся вечером?", time: "Вчера", unread: 0, online: false, gradient: "avatar-gradient-5", encrypted: false },
  { id: 6, name: "Вика Смирнова", msg: "Посмотри фото!", time: "Вчера", unread: 0, online: false, gradient: "avatar-gradient-1", encrypted: true },
];

const mockMessages: Record<number, { id: number; text: string; out: boolean; time: string; encrypted?: boolean }[]> = {
  1: [
    { id: 1, text: "Привет, как твои дела? 👋", out: false, time: "12:30" },
    { id: 2, text: "Всё отлично, спасибо! Работаю над новым проектом", out: true, time: "12:31", encrypted: true },
    { id: 3, text: "Звучит интересно! Расскажи подробнее", out: false, time: "12:32" },
    { id: 4, text: "Делаю мессенджер с шифрованием 🔐 Почти готово!", out: true, time: "12:33", encrypted: true },
    { id: 5, text: "Привет! Как дела? 😊", out: false, time: "12:34" },
  ],
  2: [
    { id: 1, text: "Отправил тебе файл с презентацией", out: false, time: "11:19" },
    { id: 2, text: "Получил, смотрю 👀", out: true, time: "11:20", encrypted: true },
  ],
  3: [
    { id: 1, text: "Новый дизайн готов! Смотрите в канале", out: false, time: "10:04" },
    { id: 2, text: "Огонь! 🔥", out: true, time: "10:05" },
  ],
};

const mockContacts = [
  { id: 1, name: "Алина Морозова", username: "@alina_m", online: true, gradient: "avatar-gradient-1" },
  { id: 2, name: "Дима Волков", username: "@dvolkov", online: false, gradient: "avatar-gradient-2" },
  { id: 3, name: "Карина Лебедь", username: "@karina_l", online: true, gradient: "avatar-gradient-4" },
  { id: 4, name: "Максим Петров", username: "@max_p", online: false, gradient: "avatar-gradient-5" },
  { id: 5, name: "Вика Смирнова", username: "@vika_s", online: false, gradient: "avatar-gradient-1" },
];

const mockChannels = [
  { id: 1, name: "Технологии будущего", subs: "128K", msg: "Новый GPT-5 уже в тесте!", gradient: "avatar-gradient-2" },
  { id: 2, name: "Яримпли Новости", subs: "45K", msg: "Запущена функция шифрования", gradient: "avatar-gradient-1" },
  { id: 3, name: "Дизайн & Тренды", subs: "89K", msg: "Топ-10 UI трендов 2026", gradient: "avatar-gradient-3" },
  { id: 4, name: "Крипто Сигналы", subs: "200K", msg: "BTC +5% за сутки", gradient: "avatar-gradient-4" },
];

const mockGroups = [
  { id: 1, name: "Команда Яримпли", members: 24, msg: "Митинг в 15:00", gradient: "avatar-gradient-3" },
  { id: 2, name: "Друзья 🎉", members: 8, msg: "Алина: Все идут на вечеринку?", gradient: "avatar-gradient-1" },
  { id: 3, name: "Работа 💼", members: 15, msg: "Максим: Отчёт готов", gradient: "avatar-gradient-5" },
];

const mockMedia = [
  { id: 1, url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop" },
  { id: 2, url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop" },
  { id: 3, url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=300&fit=crop" },
  { id: 4, url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=300&fit=crop" },
  { id: 5, url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&h=300&fit=crop" },
  { id: 6, url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=300&h=300&fit=crop" },
  { id: 7, url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop" },
  { id: 8, url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=300&h=300&fit=crop" },
  { id: 9, url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=300&h=300&fit=crop" },
];

function Avatar({ gradient, name, size = "md" }: { gradient: string; name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-9 h-9 text-sm", md: "w-12 h-12 text-base", lg: "w-16 h-16 text-xl" };
  return (
    <div className={`${sizes[size]} ${gradient} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg`}>
      {name.charAt(0)}
    </div>
  );
}

function OnlineBadge() {
  return <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-[hsl(var(--background))] absolute -bottom-0.5 -right-0.5 shadow-md" />;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 typing-dot" />
      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 typing-dot" />
      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 typing-dot" />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 transition-all duration-300"
      style={{ width: 40, height: 22 }}
    >
      <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${value ? "bg-violet-500" : "bg-white/15"}`} />
      <div
        className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-300"
        style={{ left: value ? 20 : 2 }}
      />
    </button>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [e2eEnabled, setE2eEnabled] = useState(true);
  const [notifs, setNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const navItems: { id: Section; icon: string; label: string; badge?: number }[] = [
    { id: "chats", icon: "MessageCircle", label: "Чаты", badge: mockChats.reduce((s, c) => s + c.unread, 0) },
    { id: "contacts", icon: "Users", label: "Контакты" },
    { id: "channels", icon: "Radio", label: "Каналы" },
    { id: "groups", icon: "UsersRound", label: "Группы" },
    { id: "media", icon: "Image", label: "Медиа" },
    { id: "search", icon: "Search", label: "Поиск" },
    { id: "profile", icon: "CircleUser", label: "Профиль" },
    { id: "settings", icon: "Settings", label: "Настройки" },
  ];

  const currentChat = mockChats.find(c => c.id === activeChat);
  const currentMessages = activeChat ? (messages[activeChat] || []) : [];

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;
    const newMsg = {
      id: Date.now(),
      text: messageInput,
      out: true,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      encrypted: e2eEnabled,
    };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setMessageInput("");
  };

  const allSearch = [...mockChats, ...mockContacts.map(c => ({ ...c, msg: c.username, time: "", unread: 0, encrypted: false }))];
  const filteredChats = mockChats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.msg.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSearch = allSearch.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-golos">
      {/* Фон с блобами */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(263 90% 65%), transparent)" }} />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-8" style={{ background: "radial-gradient(circle, hsl(185 90% 50%), transparent)" }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-6" style={{ background: "radial-gradient(circle, hsl(320 85% 60%), transparent)" }} />
      </div>

      {/* Боковая навигация */}
      <nav className="relative z-10 w-20 flex flex-col items-center py-5 gap-1 border-r border-border bg-[hsl(var(--yg-surface))] flex-shrink-0">
        <div className="mb-4 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg glow-purple cursor-pointer" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(185 90% 50%))" }}>
          Я
        </div>

        <div className="flex flex-col gap-0.5 w-full px-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all duration-200 w-full ${
                activeSection === item.id
                  ? "nav-item-active text-violet-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <div className="relative">
                <Icon name={item.icon} size={20} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(320 85% 60%))" }}>
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>

        <button onClick={() => setActiveSection("profile")} className="mt-2">
          <div className="w-10 h-10 avatar-gradient-5 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-lg hover:scale-105 transition-transform">
            М
          </div>
        </button>
      </nav>

      {/* Список */}
      <aside className="relative z-10 w-80 flex flex-col border-r border-border bg-[hsl(var(--yg-surface))] flex-shrink-0">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-foreground">
              {activeSection === "chats" && "Чаты"}
              {activeSection === "contacts" && "Контакты"}
              {activeSection === "channels" && "Каналы"}
              {activeSection === "groups" && "Группы"}
              {activeSection === "media" && "Медиа"}
              {activeSection === "search" && "Поиск"}
              {activeSection === "profile" && "Профиль"}
              {activeSection === "settings" && "Настройки"}
            </h1>
            {activeSection === "chats" && (
              <button className="w-8 h-8 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 transition-colors flex items-center justify-center text-violet-400">
                <Icon name="Plus" size={16} />
              </button>
            )}
          </div>

          {activeSection !== "profile" && activeSection !== "settings" && activeSection !== "media" && (
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[hsl(var(--yg-surface3))] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {/* ЧАТЫ */}
          {activeSection === "chats" && (
            <div className="flex flex-col gap-0.5">
              {filteredChats.map((chat, i) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left w-full animate-slide-in-left ${
                    activeChat === chat.id ? "nav-item-active" : "hover:bg-white/5"
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="relative">
                    <Avatar gradient={chat.gradient} name={chat.name} size="md" />
                    {chat.online && <OnlineBadge />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground truncate flex items-center gap-1">
                        {chat.name}
                        {chat.encrypted && <Icon name="Lock" size={9} className="text-emerald-400 flex-shrink-0" />}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1 flex-shrink-0">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">{chat.msg}</span>
                      {chat.unread > 0 && (
                        <span className="ml-1 flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(320 85% 60%))" }}>
                          {chat.unread > 9 ? "9+" : chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* КОНТАКТЫ */}
          {activeSection === "contacts" && (
            <div className="flex flex-col gap-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">В сети</div>
              {mockContacts.filter(c => c.online).map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="relative">
                    <Avatar gradient={c.gradient} name={c.name} size="md" />
                    <OnlineBadge />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{c.name}</div>
                    <div className="text-xs text-violet-400">{c.username}</div>
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 hover:bg-violet-500/30 transition-colors flex-shrink-0">
                    <Icon name="MessageCircle" size={14} />
                  </button>
                </div>
              ))}
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-3">Не в сети</div>
              {mockContacts.filter(c => !c.online).map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${(i + 2) * 50}ms` }}>
                  <Avatar gradient={c.gradient} name={c.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.username}</div>
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-white/10 transition-colors flex-shrink-0">
                    <Icon name="MessageCircle" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* КАНАЛЫ */}
          {activeSection === "channels" && (
            <div className="flex flex-col gap-0.5">
              {mockChannels.map((ch, i) => (
                <div key={ch.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <Avatar gradient={ch.gradient} name={ch.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{ch.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{ch.msg}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] text-cyan-400 font-semibold">{ch.subs}</div>
                    <div className="text-[9px] text-muted-foreground">подписчиков</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ГРУППЫ */}
          {activeSection === "groups" && (
            <div className="flex flex-col gap-0.5">
              {mockGroups.map((g, i) => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <Avatar gradient={g.gradient} name={g.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{g.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{g.msg}</div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Icon name="Users" size={10} />
                    {g.members}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ПОИСК */}
          {activeSection === "search" && (
            <div className="flex flex-col gap-2 pt-1">
              {searchQuery ? (
                <>
                  <div className="text-xs text-muted-foreground px-2 mb-1">Результаты для «{searchQuery}»</div>
                  {filteredSearch.map((item) => (
                    <div key={item.id + item.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in">
                      <Avatar gradient={item.gradient} name={item.name} size="md" />
                      <div>
                        <div className="font-semibold text-sm text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.msg}</div>
                      </div>
                    </div>
                  ))}
                  {filteredSearch.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">Ничего не найдено</div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                    <Icon name="Search" size={28} className="text-violet-400" />
                  </div>
                  <div className="text-sm text-muted-foreground">Введите имя или ключевое слово</div>
                </div>
              )}
            </div>
          )}

          {/* МЕДИА */}
          {activeSection === "media" && (
            <div className="pt-1">
              <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                {mockMedia.map((m, i) => (
                  <div key={m.id} className="aspect-square relative overflow-hidden cursor-pointer group animate-scale-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <img src={m.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Icon name="ZoomIn" size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ПРОФИЛЬ */}
          {activeSection === "profile" && (
            <div className="flex flex-col items-center pt-4 gap-4 animate-fade-in">
              <div className="w-20 h-20 avatar-gradient-5 rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-2xl glow-purple">
                М
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-foreground">Михаил Яримпли</div>
                <div className="text-sm text-violet-400">@mikhail_y</div>
                <div className="text-xs text-muted-foreground mt-1">+7 999 123-45-67</div>
              </div>
              <div className="w-full space-y-2">
                {[
                  { icon: "Lock", label: "E2E шифрование", value: "Активно", color: "text-emerald-400" },
                  { icon: "Shield", label: "Защита данных", value: "Высокая", color: "text-violet-400" },
                  { icon: "MessageCircle", label: "Сообщений", value: "1 234", color: "text-cyan-400" },
                  { icon: "Users", label: "Контактов", value: "5", color: "text-pink-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 hover:bg-white/6 transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                      <Icon name={item.icon} size={14} />
                    </div>
                    <span className="text-sm text-foreground flex-1">{item.label}</span>
                    <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-white/8 transition-colors border border-border">
                Редактировать профиль
              </button>
            </div>
          )}

          {/* НАСТРОЙКИ */}
          {activeSection === "settings" && (
            <div className="flex flex-col gap-3 pt-1 animate-fade-in">
              {[
                {
                  group: "Безопасность",
                  items: [
                    { icon: "Lock", label: "Сквозное шифрование", isToggle: true, value: e2eEnabled, onChange: setE2eEnabled },
                    { icon: "ShieldCheck", label: "Двухфакторная аутентификация", isToggle: true, value: twoFactor, onChange: setTwoFactor },
                    { icon: "Eye", label: "Кто видит мой профиль", isToggle: false, sub: "Все контакты" },
                  ]
                },
                {
                  group: "Уведомления",
                  items: [
                    { icon: "Bell", label: "Push-уведомления", isToggle: true, value: notifs, onChange: setNotifs },
                    { icon: "Volume2", label: "Звуки", isToggle: false, sub: "Системные" },
                  ]
                },
                {
                  group: "Внешний вид",
                  items: [
                    { icon: "Palette", label: "Тема оформления", isToggle: false, sub: "Тёмная Яримпли" },
                    { icon: "Type", label: "Размер шрифта", isToggle: false, sub: "Стандартный" },
                  ]
                },
              ].map((group) => (
                <div key={group.group}>
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{group.group}</div>
                  <div className="bg-white/3 rounded-xl overflow-hidden">
                    {group.items.map((item, i) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer ${i < group.items.length - 1 ? "border-b border-border/40" : ""}`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400">
                          <Icon name={item.icon} size={13} />
                        </div>
                        <span className="text-sm text-foreground flex-1">{item.label}</span>
                        {item.isToggle && item.onChange ? (
                          <Toggle value={item.value as boolean} onChange={item.onChange} />
                        ) : (
                          <span className="text-xs text-muted-foreground">{item.sub}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Главная область */}
      <main className="relative z-10 flex-1 flex flex-col bg-background overflow-hidden">
        {activeSection === "chats" && currentChat ? (
          <>
            {/* Шапка чата */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border glass flex-shrink-0">
              <div className="relative">
                <Avatar gradient={currentChat.gradient} name={currentChat.name} size="md" />
                {currentChat.online && <OnlineBadge />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  {currentChat.name}
                  {currentChat.encrypted && (
                    <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      <Icon name="Lock" size={9} /> E2E
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {currentChat.online ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> в сети</>
                  ) : "не в сети"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { icon: "Phone" },
                  { icon: "Video" },
                  { icon: "MoreVertical" },
                ].map(btn => (
                  <button key={btn.icon} className="w-9 h-9 rounded-xl hover:bg-white/8 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <Icon name={btn.icon} size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
              {currentChat.encrypted && (
                <div className="flex justify-center animate-fade-in">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    <Icon name="Lock" size={11} />
                    Сквозное шифрование активно — только вы видите эти сообщения
                  </div>
                </div>
              )}

              {currentMessages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-message-in`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.out ? "msg-bubble-out text-white rounded-br-sm" : "msg-bubble-in text-foreground rounded-bl-sm"}`}>
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${msg.out ? "justify-end" : "justify-start"}`}>
                      <span>{msg.time}</span>
                      {msg.out && msg.encrypted && <Icon name="Lock" size={9} className="text-emerald-400" />}
                      {msg.out && <Icon name="CheckCheck" size={11} className="text-violet-400" />}
                    </div>
                  </div>
                </div>
              ))}

              {currentChat.online && (
                <div className="flex justify-start animate-fade-in">
                  <div className="msg-bubble-in rounded-2xl rounded-bl-sm shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>

            {/* Поле ввода */}
            <div className="px-6 py-4 border-t border-border glass flex-shrink-0">
              <div className="flex items-center gap-3">
                <button className="w-9 h-9 rounded-xl hover:bg-white/8 transition-colors flex items-center justify-center text-muted-foreground hover:text-violet-400">
                  <Icon name="Paperclip" size={18} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Написать сообщение..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--yg-surface3))] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-violet-500/50 transition-all pr-10"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-violet-400 transition-colors">
                    <Icon name="Smile" size={18} />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(285 80% 55%))" }}
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Пустой стейт */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl glow-purple animate-float" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(185 90% 50%))" }}>
              Я
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Яримплиграмм</h2>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Выберите чат или найдите контакт, чтобы начать общение
              </p>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
              <Icon name="ShieldCheck" size={14} />
              Все чаты защищены сквозным шифрованием
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { icon: "MessageCircle", label: "Чатов", count: "6" },
                { icon: "Users", label: "Контактов", count: "5" },
                { icon: "Radio", label: "Каналов", count: "4" },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/4 hover:bg-white/6 transition-colors cursor-pointer border border-border/50">
                  <Icon name={item.icon} size={22} className="text-violet-400" />
                  <span className="text-lg font-bold text-foreground">{item.count}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
