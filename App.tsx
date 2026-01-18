
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDoc, 
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { auth, db } from './firebaseService';
import { UserProfile, Workspace, Task, UserRole } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ListView from './components/ListView';
import BoardView from './components/BoardView';
import DailyTaskView from './components/DailyTaskView';
import StockView from './components/StockView';
import AdminView from './components/AdminView';
import LoginGate from './components/LoginGate';
import { useStockData } from './hooks/useStockData';

type ViewType = 'dashboard' | 'agendas' | 'campaigns' | 'daily' | 'stock' | 'admin' | 'board';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  
  const { stock, specKeys, stockTasks } = useStockData(user, profile);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile({ uid: firebaseUser.uid, ...userDoc.data() } as UserProfile);
        } else {
          setProfile({ 
            uid: firebaseUser.uid, 
            name: firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            role: 'member',
            active: true 
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snap) => {
      const uList: UserProfile[] = [];
      snap.forEach(d => uList.push({ uid: d.id, ...d.data() } as UserProfile));
      setUsers(uList);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "workspaces"), where("active", "==", true));
    return onSnapshot(q, (snap) => {
      const wList: Workspace[] = [];
      snap.forEach(d => wList.push({ id: d.id, ...d.data() } as Workspace));
      setWorkspaces(wList);
    });
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return <LoginGate onLogin={async (e, p) => signInWithEmailAndPassword(auth, e, p)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar 
        profile={profile} 
        currentView={currentView} 
        onViewChange={(v) => { setCurrentView(v); setSelectedWorkspace(null); }}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-cream overflow-auto p-4 md:p-6 lg:p-8 no-scrollbar">
        <Header 
          currentView={currentView} 
          selectedWorkspace={selectedWorkspace}
          onOpenMenu={() => setIsOpenMobile(true)}
          onBack={() => { 
            if (currentView === 'board') {
              setCurrentView(selectedWorkspace?.type === 'agenda' ? 'agendas' : 'campaigns');
            } else {
              setCurrentView('dashboard');
            }
          }}
        />

        <div className="flex-1">
          {currentView === 'dashboard' && <Dashboard workspaces={workspaces} />}
          {currentView === 'agendas' && (
            <ListView 
              type="agenda" 
              workspaces={workspaces.filter(w => w.type === 'agenda')} 
              onOpen={(w) => { setSelectedWorkspace(w); setCurrentView('board'); }}
            />
          )}
          {currentView === 'campaigns' && (
            <ListView 
              type="campaign" 
              workspaces={workspaces.filter(w => w.type === 'campaign')} 
              onOpen={(w) => { setSelectedWorkspace(w); setCurrentView('board'); }}
            />
          )}
          {currentView === 'board' && selectedWorkspace && (
            <BoardView 
              workspace={selectedWorkspace} 
              users={users} 
              specKeys={specKeys}
              stock={stock}
            />
          )}
          {currentView === 'daily' && <DailyTaskView />}
          {currentView === 'stock' && (
            <StockView 
              stock={stock} 
              stockTasks={stockTasks} 
            />
          )}
          {currentView === 'admin' && profile?.role === 'admin' && (
            <AdminView users={users} />
          )}
        </div>
      </main>
    </div>
  );
};

const Header: React.FC<{ 
  currentView: ViewType; 
  selectedWorkspace: Workspace | null;
  onBack: () => void;
  onOpenMenu: () => void;
}> = ({ currentView, selectedWorkspace, onBack, onOpenMenu }) => {
  const getTitle = () => {
    if (currentView === 'board') return selectedWorkspace?.name || 'Workspace';
    if (currentView === 'agendas') return 'الأجندات';
    if (currentView === 'campaigns') return 'الحملات';
    if (currentView === 'daily') return 'تاسكاتي';
    if (currentView === 'stock') return 'stock';
    if (currentView === 'admin') return 'Admin';
    return 'الداش بورد';
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6 sticky top-0 bg-cream/90 backdrop-blur-md z-40 py-2">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu}
          className="p-2 bg-white border border-brown/10 rounded-xl text-brown md:hidden hover:bg-brown/5 transition-colors"
        >
          ☰
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brown">{getTitle()}</h1>
        </div>
      </div>
      <div className="flex gap-2">
        {currentView !== 'dashboard' && (
          <button onClick={onBack} className="bg-white border border-brown text-brown px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-sm hover:translate-y-[-1px] transition-transform">
            ⬅ رجوع
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
