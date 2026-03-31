import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";
import {
  apiRegister, apiLogin, apiLogout, apiMe,
  apiFriendsSearch, apiFriendsAdd, apiFriendsList, apiFriendAccept,
  apiChats, apiMessages, apiSendMessage,
} from "@/api";

type Section = "chats" | "contacts" | "profile" | "settings";

const GRADIENTS = ["avatar-gradient-1", "avatar-gradient-2", "avatar-gradient-3", "avatar-gradient-4", "avatar-gradient-5"];

type AuthUser = { id: number; username: string; display_name: string; avatar_gradient: number; bio: string };
type FriendUser = { id: number; username: string; display_name: string; avatar_gradient: number; friendship_status?: string | null; online?: boolean };
type ChatItem = { id: number; username: string; display_name: string; avatar_gradient: number; online: boolean; last_text: string; last_time: string; unread: number };
type Message = { id: number; sender_id: number; text: string; time: string; out: boolean };

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: (user: AuthUser, token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await apiLogin(username, password)
        : await apiRegister(username, displayName, password);
      if (res.error) { setError(res.error); return; }
      localStorage.setItem("yg_token", res.token);
      onAuth(res.user, res.token);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background font-golos">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, hsl(263 90% 65%), transparent)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(185 90% 50%), transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl glow-purple mb-4 animate-float" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(185 90% 50%))" }}>
            Я
          </div>
          <h1 className="text-2xl font-black text-foreground">Яримплиграмм</h1>
          <p className="text-sm text-muted-foreground mt-1">Мессенджер с шифрованием</p>
        </div>

        <div className="bg-[hsl(var(--yg-surface))] border border-border rounded-3xl p-6 shadow-2xl">
          <div className="flex bg-[hsl(var(--yg-surface3))] rounded-2xl p-1 mb-6">
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${mode === m ? "text-white shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                style={mode === m ? { background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(285 80% 55%))" } : {}}
              >
                {m === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {mode === "register" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Имя и фамилия</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--yg-surface3))] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Юзернейм</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="username"
                  className="w-full pl-7 pr-4 py-3 rounded-xl bg-[hsl(var(--yg-surface3))] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                  onKeyDown={e => e.key === "Enter" && submit()}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--yg-surface3))] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                onKeyDown={e => e.key === "Enter" && submit()}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-fade-in">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || !username || !password || (mode === "register" && !displayName)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 mt-1"
              style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(285 80% 55%))" }}
            >
              {loading ? "..." : mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Friend Modal ─────────────────────────────────────────────────────────
function AddFriendModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await apiFriendsSearch(q);
    setResults(res.users || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  const addFriend = async (username: string, id: number) => {
    setAddingId(id);
    const res = await apiFriendsAdd(username);
    setAddingId(null);
    if (res.ok) {
      setMessage(`Запрос отправлен @${username}!`);
      setResults(prev => prev.map(u => u.id === id ? { ...u, friendship_status: "pending" } : u));
      onAdded();
    } else {
      setMessage(res.error || "Ошибка");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[hsl(var(--yg-surface))] border border-border rounded-3xl p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Добавить друга</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Найдите пользователя по юзернейму</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-white/8 transition-colors flex items-center justify-center text-muted-foreground">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="введите юзернейм..."
            className="w-full pl-7 pr-4 py-3 rounded-xl bg-[hsl(var(--yg-surface3))] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
          />
          {loading && <Icon name="Loader" size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
        </div>

        {message && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-3 animate-fade-in">
            <Icon name="CheckCircle" size={14} />
            {message}
          </div>
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {results.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className={`w-10 h-10 ${GRADIENTS[(u.avatar_gradient - 1) % GRADIENTS.length]} rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                  {u.display_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{u.display_name}</div>
                  <div className="text-xs text-violet-400">@{u.username}</div>
                </div>
                {u.friendship_status === "pending" ? (
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-lg bg-white/5">Отправлено</span>
                ) : u.friendship_status === "accepted" ? (
                  <span className="text-xs text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10">Друг</span>
                ) : (
                  <button
                    onClick={() => addFriend(u.username, u.id)}
                    disabled={addingId === u.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(285 80% 55%))" }}
                  >
                    <Icon name="UserPlus" size={12} />
                    {addingId === u.id ? "..." : "Добавить"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Пользователь @{query} не найден
          </div>
        )}
        {query.length < 2 && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            Введите минимум 2 символа для поиска
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendUser[]>([]);

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState<Section>("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [e2eEnabled, setE2eEnabled] = useState(true);
  const [notifs, setNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // Auth init
  useEffect(() => {
    const token = localStorage.getItem("yg_token");
    if (!token) { setAuthLoading(false); return; }
    apiMe().then(res => {
      if (res.user) setCurrentUser(res.user);
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));
  }, []);

  // Load friends
  const loadFriends = useCallback(async () => {
    const res = await apiFriendsList();
    if (res.friends) setFriends(res.friends);
    if (res.pending_requests) setPendingRequests(res.pending_requests);
  }, []);

  // Load chats
  const loadChats = useCallback(async () => {
    const res = await apiChats();
    if (res.chats) setChats(res.chats);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadFriends();
      loadChats();
    }
  }, [currentUser, loadFriends, loadChats]);

  // Poll chats every 5s
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [currentUser, loadChats]);

  // Load messages when chat changes
  useEffect(() => {
    if (!activeChat) return;
    setMessagesLoading(true);
    apiMessages(activeChat.id).then(res => {
      if (res.messages) setMessages(res.messages);
      setMessagesLoading(false);
    });
  }, [activeChat?.id]);

  // Poll messages every 3s
  useEffect(() => {
    if (!activeChat) return;
    const interval = setInterval(async () => {
      const res = await apiMessages(activeChat.id);
      if (res.messages) setMessages(res.messages);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChat?.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAuth = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setFriends([]);
    setPendingRequests([]);
    setChats([]);
    setActiveChat(null);
  };

  const acceptFriend = async (userId: number) => {
    await apiFriendAccept(userId);
    loadFriends();
    loadChats();
  };

  const openChat = (friend: FriendUser | ChatItem) => {
    const chat: ChatItem = {
      id: friend.id,
      username: friend.username,
      display_name: friend.display_name,
      avatar_gradient: friend.avatar_gradient,
      online: (friend as ChatItem).online ?? (friend as FriendUser).online ?? false,
      last_text: (friend as ChatItem).last_text ?? "",
      last_time: (friend as ChatItem).last_time ?? "",
      unread: (friend as ChatItem).unread ?? 0,
    };
    setActiveChat(chat);
    setActiveSection("chats");
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChat) return;
    const text = messageInput.trim();
    setMessageInput("");
    const res = await apiSendMessage(activeChat.id, text);
    if (res.ok && res.message) {
      setMessages(prev => [...prev, res.message]);
      loadChats();
    }
  };

  const filteredChats = chats.filter(c =>
    c.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFriends = friends.filter(f =>
    f.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-background font-golos">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white animate-float" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(185 90% 50%))" }}>Я</div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-violet-400 typing-dot" />
            <div className="w-2 h-2 rounded-full bg-violet-400 typing-dot" />
            <div className="w-2 h-2 rounded-full bg-violet-400 typing-dot" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const myGradient = GRADIENTS[(currentUser.avatar_gradient - 1) % GRADIENTS.length];

  const navItems: { id: Section; icon: string; label: string; badge?: number }[] = [
    { id: "chats", icon: "MessageCircle", label: "Чаты", badge: chats.reduce((s, c) => s + c.unread, 0) },
    { id: "contacts", icon: "Users", label: "Контакты", badge: pendingRequests.length || undefined },
    { id: "profile", icon: "CircleUser", label: "Профиль" },
    { id: "settings", icon: "Settings", label: "Настройки" },
  ];

  return (
    <>
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onAdded={() => { loadFriends(); loadChats(); }}
        />
      )}
      <div className="flex h-screen w-screen overflow-hidden bg-background font-golos">
        {/* Фон */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(263 90% 65%), transparent)" }} />
          <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-8" style={{ background: "radial-gradient(circle, hsl(185 90% 50%), transparent)" }} />
        </div>

        {/* Навигация */}
        <nav className="relative z-10 w-20 flex flex-col items-center py-5 gap-1 border-r border-border bg-[hsl(var(--yg-surface))] flex-shrink-0">
          <div className="mb-4 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg glow-purple" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(185 90% 50%))" }}>
            Я
          </div>

          <div className="flex flex-col gap-0.5 w-full px-2 flex-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all duration-200 w-full ${
                  activeSection === item.id ? "nav-item-active text-violet-400" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
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
            <div className={`w-10 h-10 ${myGradient} rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-lg hover:scale-105 transition-transform`}>
              {currentUser.display_name.charAt(0)}
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
                {activeSection === "profile" && "Профиль"}
                {activeSection === "settings" && "Настройки"}
              </h1>
              {(activeSection === "chats" || activeSection === "contacts") && (
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="w-8 h-8 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 transition-colors flex items-center justify-center text-violet-400"
                  title="Добавить друга"
                >
                  <Icon name="UserPlus" size={16} />
                </button>
              )}
            </div>

            {(activeSection === "chats" || activeSection === "contacts") && (
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
                {filteredChats.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                      <Icon name="MessageCircle" size={28} className="text-violet-400" />
                    </div>
                    <div className="text-sm text-foreground font-medium mb-1">Нет чатов</div>
                    <div className="text-xs text-muted-foreground mb-4">Добавьте друга и начните общаться</div>
                    <button
                      onClick={() => setShowAddFriend(true)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(285 80% 55%))" }}
                    >
                      Найти друга
                    </button>
                  </div>
                )}
                {filteredChats.map((chat, i) => (
                  <button
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left w-full animate-slide-in-left ${
                      activeChat?.id === chat.id ? "nav-item-active" : "hover:bg-white/5"
                    }`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="relative">
                      <Avatar gradient={GRADIENTS[(chat.avatar_gradient - 1) % GRADIENTS.length]} name={chat.display_name} size="md" />
                      {chat.online && <OnlineBadge />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground truncate flex items-center gap-1">
                          {chat.display_name}
                          <Icon name="Lock" size={9} className="text-emerald-400 flex-shrink-0" />
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">{chat.last_time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">{chat.last_text || "Нет сообщений"}</span>
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
                {pendingRequests.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-1">Входящие запросы</div>
                    {pendingRequests.map(u => (
                      <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 animate-fade-in">
                        <div className={`w-10 h-10 ${GRADIENTS[(u.avatar_gradient - 1) % GRADIENTS.length]} rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                          {u.display_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">{u.display_name}</div>
                          <div className="text-xs text-muted-foreground">@{u.username}</div>
                        </div>
                        <button
                          onClick={() => acceptFriend(u.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, hsl(145 70% 45%), hsl(185 90% 45%))" }}
                        >
                          <Icon name="Check" size={11} /> Принять
                        </button>
                      </div>
                    ))}
                    <div className="my-2 border-t border-border" />
                  </>
                )}

                {filteredFriends.filter(f => f.online).length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">В сети</div>
                    {filteredFriends.filter(f => f.online).map((f, i) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }} onClick={() => openChat(f)}>
                        <div className="relative">
                          <div className={`w-12 h-12 ${GRADIENTS[(f.avatar_gradient - 1) % GRADIENTS.length]} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg`}>
                            {f.display_name.charAt(0)}
                          </div>
                          <OnlineBadge />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">{f.display_name}</div>
                          <div className="text-xs text-violet-400">@{f.username}</div>
                        </div>
                        <button className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 hover:bg-violet-500/30 transition-colors flex-shrink-0">
                          <Icon name="MessageCircle" size={14} />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {filteredFriends.filter(f => !f.online).length > 0 && (
                  <>
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-2">Не в сети</div>
                    {filteredFriends.filter(f => !f.online).map((f, i) => (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }} onClick={() => openChat(f)}>
                        <div className={`w-12 h-12 ${GRADIENTS[(f.avatar_gradient - 1) % GRADIENTS.length]} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg`}>
                          {f.display_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground">{f.display_name}</div>
                          <div className="text-xs text-muted-foreground">@{f.username}</div>
                        </div>
                        <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-white/10 transition-colors flex-shrink-0">
                          <Icon name="MessageCircle" size={14} />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {friends.length === 0 && pendingRequests.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                      <Icon name="UserPlus" size={28} className="text-violet-400" />
                    </div>
                    <div className="text-sm text-foreground font-medium mb-1">Нет друзей</div>
                    <div className="text-xs text-muted-foreground mb-4">Добавьте первого друга по юзернейму</div>
                    <button
                      onClick={() => setShowAddFriend(true)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(285 80% 55%))" }}
                    >
                      Найти друга
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ПРОФИЛЬ */}
            {activeSection === "profile" && (
              <div className="flex flex-col items-center pt-4 gap-4 animate-fade-in">
                <div className={`w-20 h-20 ${myGradient} rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-2xl glow-purple`}>
                  {currentUser.display_name.charAt(0)}
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-foreground">{currentUser.display_name}</div>
                  <div className="text-sm text-violet-400">@{currentUser.username}</div>
                </div>
                <div className="w-full space-y-2">
                  {[
                    { icon: "Lock", label: "E2E шифрование", value: "Активно", color: "text-emerald-400" },
                    { icon: "Shield", label: "Защита данных", value: "Высокая", color: "text-violet-400" },
                    { icon: "Users", label: "Друзей", value: String(friends.length), color: "text-pink-400" },
                    { icon: "Clock", label: "Входящих запросов", value: String(pendingRequests.length), color: "text-orange-400" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 hover:bg-white/6 transition-colors cursor-pointer">
                      <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center ${item.color}`}>
                        <Icon name={item.icon} size={14} />
                      </div>
                      <span className="text-sm text-foreground flex-1">{item.label}</span>
                      <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(285 80% 55%))" }}
                >
                  Добавить друга
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20"
                >
                  Выйти из аккаунта
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
                      { icon: "Palette", label: "Тема оформления", isToggle: false, sub: "Тёмная" },
                      { icon: "Type", label: "Размер шрифта", isToggle: false, sub: "Стандартный" },
                    ]
                  },
                ].map(group => (
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
          {activeSection === "chats" && activeChat ? (
            <>
              {/* Шапка чата */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-border glass flex-shrink-0">
                <div className="relative">
                  <Avatar gradient={GRADIENTS[(activeChat.avatar_gradient - 1) % GRADIENTS.length]} name={activeChat.display_name} size="md" />
                  {activeChat.online && <OnlineBadge />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {activeChat.display_name}
                    <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      <Icon name="Lock" size={9} /> E2E
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {activeChat.online ? (
                      <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> в сети</>
                    ) : "не в сети"}
                  </div>
                </div>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                <div className="flex justify-center animate-fade-in">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    <Icon name="Lock" size={11} />
                    Сквозное шифрование активно
                  </div>
                </div>

                {messagesLoading && (
                  <div className="flex justify-center py-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-violet-400 typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-violet-400 typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-violet-400 typing-dot" />
                    </div>
                  </div>
                )}

                {messages.length === 0 && !messagesLoading && (
                  <div className="flex justify-center py-8 text-xs text-muted-foreground">
                    Начните диалог — напишите первое сообщение
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-message-in`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.out ? "msg-bubble-out text-white rounded-br-sm" : "msg-bubble-in text-foreground rounded-bl-sm"}`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${msg.out ? "justify-end" : "justify-start"}`}>
                        <span>{msg.time}</span>
                        {msg.out && <Icon name="Lock" size={9} className="text-emerald-400" />}
                        {msg.out && <Icon name="CheckCheck" size={11} className="text-violet-400" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <div className="px-6 py-4 border-t border-border glass flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Написать сообщение..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--yg-surface3))] text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                    />
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
            <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl glow-purple animate-float" style={{ background: "linear-gradient(135deg, hsl(263 90% 65%), hsl(185 90% 50%))" }}>
                Я
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Яримплиграмм</h2>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                  Выберите чат или найдите нового друга, чтобы начать общение
                </p>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                <Icon name="ShieldCheck" size={14} />
                Все сообщения защищены сквозным шифрованием
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {[
                  { icon: "MessageCircle", label: "Чатов", count: String(chats.length) },
                  { icon: "Users", label: "Друзей", count: String(friends.length) },
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
    </>
  );
}
