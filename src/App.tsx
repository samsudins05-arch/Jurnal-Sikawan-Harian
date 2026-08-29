/**
 * SIJUNAWAN - Sistem Informasi Jurnal Sikawan Harian
 * Aplikasi Jurnal Kerja Harian Guru & Pegawai
 * Sinkronisasi Real-Time Firebase Firestore & Otentikasi Pengguna
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Download, AlertCircle, X, Sparkles } from 'lucide-react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp,
  User 
} from './lib/firebase';
import { 
  ActivityItem, 
  UserProfile, 
  SchoolSettings, 
  JournalDay, 
  ActiveTab 
} from './types/journal';
import { 
  DEFAULT_USER_PROFILE, 
  DEFAULT_SCHOOL_SETTINGS, 
  DEFAULT_SHIFTS, 
  INITIAL_ACTIVITIES 
} from './data/initialData';
import { parseDateStrToIndonesian } from './utils/dateFormat';
import { exportElementToPdf } from './utils/pdfExport';

// Subcomponents
import { Header } from './components/Header';
import { NavbarTabs } from './components/NavbarTabs';
import { DailyJournalForm } from './components/DailyJournalForm';
import { DocumentPreview } from './components/DocumentPreview';
import { MonthlyRecap } from './components/MonthlyRecap';
import { SettingsView } from './components/SettingsView';
import { ShiftModal } from './components/ShiftModal';
import { QuickTemplateModal } from './components/QuickTemplateModal';
import { AuthModal } from './components/AuthModal';
import { SavePdfModal } from './components/SavePdfModal';

export default function App() {
  // Current user state from Firebase Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Tab & View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('jurnal');
  const [activeViewMobile, setActiveViewMobile] = useState<'form' | 'preview'>('form');

  // Selected Date for Daily Journal (Defaults to 2026-08-28 matching reference image, or current date)
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-28');
  const [currentShift, setCurrentShift] = useState<string>('Guru : Shift Pagi (06.30 - 15.00)');
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // Profile & School Settings States
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sijunawan_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'EKO PRASETYO NUGROHO, S.Kom') {
          return {
            ...DEFAULT_USER_PROFILE,
            ...parsed,
            name: '',
            nip: '',
            schoolHeadName: '',
            schoolHeadNip: '',
          };
        }
        return { ...DEFAULT_USER_PROFILE, ...parsed };
      } catch (e) {
        return DEFAULT_USER_PROFILE;
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('sijunawan_school');
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_SETTINGS;
  });

  // All Journals List for Monthly Recap & History
  const [allJournals, setAllJournals] = useState<JournalDay[]>([]);

  // Sync & Export status
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{
    show: boolean;
    title: string;
    description: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showNotification = (title: string, description: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ show: true, title, description, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev ? { ...prev, show: false } : null));
    }, 4500);
  };

  // Modal dialog states
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [targetTemplateIndex, setTargetTemplateIndex] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSavePdfModalOpen, setIsSavePdfModalOpen] = useState<boolean>(false);

  // Refs for debouncing auto-sync
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // 1. Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthReady(true);
        setSyncStatus('synced');
      } else {
        // Active in local mode; user can log in via AuthModal to sync to cloud
        setCurrentUser(null);
        setIsAuthReady(true);
        setSyncStatus('synced');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Listener for User Profile & Settings from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubUser = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profile) {
            setProfile((prev) => ({ ...prev, ...data.profile }));
            localStorage.setItem('sijunawan_profile', JSON.stringify(data.profile));
          }
          if (data.schoolSettings) {
            setSchoolSettings((prev) => ({ ...prev, ...data.schoolSettings }));
            localStorage.setItem('sijunawan_school', JSON.stringify(data.schoolSettings));
          }
        }
      },
      (err) => {
        console.warn('Firestore profile sync offline:', err);
      }
    );

    return () => unsubUser();
  }, [currentUser]);

  // 3. Real-time Listener for all user's journals (for Monthly Recap)
  useEffect(() => {
    if (!currentUser) return;

    const journalsRef = collection(db, 'journals');
    const q = query(journalsRef, where('userId', '==', currentUser.uid));

    const unsubJournals = onSnapshot(
      q,
      (snapshot) => {
        const loaded: JournalDay[] = [];
        snapshot.forEach((docItem) => {
          loaded.push({ id: docItem.id, ...(docItem.data() as any) });
        });
        setAllJournals(loaded);
      },
      (err) => {
        console.warn('Firestore journals sync warning:', err);
      }
    );

    return () => unsubJournals();
  }, [currentUser]);

  // 4. Load or Listen to the Selected Date Journal
  useEffect(() => {
    if (!currentUser || !selectedDate) return;

    // Check if we have this date in loaded journals first
    const existing = allJournals.find((j) => j.dateStr === selectedDate);
    if (existing) {
      setActivities(existing.activities || []);
      if (existing.shift) setCurrentShift(existing.shift);
      return;
    }

    // Direct fetch from Firestore for this specific date doc
    const docId = `${currentUser.uid}_${selectedDate}`;
    const journalDocRef = doc(db, 'journals', docId);

    getDoc(journalDocRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as JournalDay;
        setActivities(data.activities || []);
        if (data.shift) setCurrentShift(data.shift);
      } else {
        // If it's the initial reference date 2026-08-28, keep initial activities; otherwise start clean with 1 row
        if (selectedDate === '2026-08-28') {
          setActivities(INITIAL_ACTIVITIES);
        } else {
          setActivities([
            {
              id: 'act_' + Date.now(),
              startHour: '07',
              startMinute: '00',
              endHour: '08',
              endMinute: '00',
              activity: '',
              notes: '',
              photoUrl: '',
            },
          ]);
        }
      }
    }).catch((err) => {
      console.warn('Could not load specific date journal:', err);
    });
  }, [selectedDate, currentUser]);

  // 5. Debounced Real-time Save of Current Day's Journal to Firestore
  const saveCurrentJournalToCloud = useCallback(async () => {
    if (!currentUser || !selectedDate) return;

    setSyncStatus('syncing');
    try {
      const docId = `${currentUser.uid}_${selectedDate}`;
      const journalDocRef = doc(db, 'journals', docId);

      const payload: JournalDay = {
        userId: currentUser.uid,
        dateStr: selectedDate,
        formattedDate: parseDateStrToIndonesian(selectedDate),
        shift: currentShift,
        activities: activities,
        updatedAt: Date.now(),
      };

      await setDoc(journalDocRef, payload, { merge: true });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error syncing journal to Firebase:', err);
      setSyncStatus('offline');
    }
  }, [currentUser, selectedDate, currentShift, activities]);

  // Trigger auto-save debounce on activity or shift change
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSyncStatus('syncing');
    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentJournalToCloud();
    }, 900);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [activities, currentShift, selectedDate, saveCurrentJournalToCloud]);

  // Save Settings (Profile & Kop Surat) to Cloud
  const handleSaveSettingsToCloud = async () => {
    if (!currentUser) return;
    setIsSavingSettings(true);
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        profile,
        schoolSettings,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      localStorage.setItem('sijunawan_profile', JSON.stringify(profile));
      localStorage.setItem('sijunawan_school', JSON.stringify(schoolSettings));
      setIsSavingSettings(false);
      showNotification(
        'SIMPAN BERHASIL',
        'Data Pengaturan, Kop Sekolah & Tanda Tangan berhasil disimpan ke Perangkat & Cloud!',
        'success'
      );
    } catch (err: any) {
      console.error('Error saving settings:', err);
      // Even if offline, save locally
      localStorage.setItem('sijunawan_profile', JSON.stringify(profile));
      localStorage.setItem('sijunawan_school', JSON.stringify(schoolSettings));
      setIsSavingSettings(false);
      showNotification(
        'SIMPAN BERHASIL (LOKAL)',
        'Data Pengaturan berhasil disimpan di perangkat Anda!',
        'success'
      );
    }
  };

  // Delete a journal entry
  const handleDeleteJournal = async (journalId: string, dateStr: string) => {
    if (!currentUser) return;
    try {
      const docId = `${currentUser.uid}_${dateStr}`;
      await deleteDoc(doc(db, 'journals', docId));
      if (selectedDate === dateStr) {
        setActivities([]);
      }
      showNotification('Jurnal Dihapus', `Jurnal tanggal ${dateStr} berhasil dihapus.`, 'info');
    } catch (err) {
      console.error('Error deleting journal:', err);
    }
  };

  // Export A4 PDF action - Opens interactive Save PDF Dialog Modal
  const handleExportPdf = () => {
    if (activeTab !== 'jurnal') {
      setActiveTab('jurnal');
    }
    setIsSavePdfModalOpen(true);
  };

  // Handle Quick Template Insertion
  const handleApplyTemplate = (activityText: string, notesText: string) => {
    setActivities((prev) => {
      const updated = [...prev];
      if (updated[targetTemplateIndex]) {
        updated[targetTemplateIndex] = {
          ...updated[targetTemplateIndex],
          activity: activityText,
          notes: notesText || updated[targetTemplateIndex].notes,
        };
      }
      return updated;
    });
  };

  const handleOpenTemplateModal = (index: number) => {
    setTargetTemplateIndex(index);
    setIsTemplateModalOpen(true);
  };

  const handleResetDefaults = () => {
    setProfile(DEFAULT_USER_PROFILE);
    setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
    localStorage.removeItem('sijunawan_profile');
    localStorage.removeItem('sijunawan_school');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* 1. Header with exact branding, authors, and export button */}
      <Header
        onExportPdf={handleExportPdf}
        isExporting={isExportingPdf}
        syncStatus={syncStatus}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeViewMobile={activeViewMobile}
        setActiveViewMobile={setActiveViewMobile}
      />

      {/* 2. Navigation Tabs (Jurnal Harian | Rekap Bulanan | Pengaturan) */}
      <NavbarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-5 md:p-6">
        {/* TAB 1: JURNAL HARIAN (Form on Left + Live Document on Right) */}
        {activeTab === 'jurnal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            {/* Left Side: Form Panel (Col 1-5 on desktop) */}
            <div
              className={`lg:col-span-5 space-y-4 ${
                activeViewMobile === 'preview' ? 'hidden lg:block' : 'block'
              }`}
            >
              <DailyJournalForm
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                currentShift={currentShift}
                onOpenShiftModal={() => setIsShiftModalOpen(true)}
                activities={activities}
                setActivities={setActivities}
                onOpenTemplateModal={handleOpenTemplateModal}
              />
            </div>

            {/* Right Side: Live A4 Printable Sheet (Col 6-12 on desktop) */}
            <div
              className={`lg:col-span-7 sticky top-20 ${
                activeViewMobile === 'form' ? 'hidden lg:block' : 'block'
              }`}
            >
              <DocumentPreview
                selectedDate={selectedDate}
                activities={activities}
                profile={profile}
                schoolSettings={schoolSettings}
                onExportPdf={handleExportPdf}
                isExporting={isExportingPdf}
              />
            </div>
          </div>
        )}

        {/* TAB 2: REKAP BULANAN */}
        {activeTab === 'rekap' && (
          <MonthlyRecap
            journals={allJournals}
            onSelectDateToEdit={(dateStr) => {
              setSelectedDate(dateStr);
              setActiveTab('jurnal');
              setActiveViewMobile('form');
            }}
            onDeleteJournal={handleDeleteJournal}
            profile={profile}
            schoolSettings={schoolSettings}
          />
        )}

        {/* TAB 3: PENGATURAN */}
        {activeTab === 'pengaturan' && (
          <SettingsView
            profile={profile}
            setProfile={setProfile}
            schoolSettings={schoolSettings}
            setSchoolSettings={setSchoolSettings}
            onSaveToCloud={handleSaveSettingsToCloud}
            isSaving={isSavingSettings}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* Global Modern Notification Toast */}
      {toastMessage && toastMessage.show && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-[92vw] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-500/50 shadow-emerald-950/40'
                : toastMessage.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-500/50 shadow-rose-950/40'
                : 'bg-slate-900/95 text-white border-slate-600 shadow-slate-950/40'
            }`}
          >
            <div className="p-1 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : toastMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-sm font-bold tracking-wide flex items-center gap-2">
                <span>{toastMessage.title}</span>
                {toastMessage.title.includes('BERHASIL') && (
                  <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 text-[10px] uppercase font-mono rounded-full border border-emerald-400/30">
                    SUKSES
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {toastMessage.description}
              </p>
            </div>
            <button
              onClick={() => setToastMessage((prev) => (prev ? { ...prev, show: false } : null))}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dialog Modals */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        currentShift={currentShift}
        onSelectShift={(shiftTitle) => setCurrentShift(shiftTitle)}
      />

      <QuickTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      <SavePdfModal
        isOpen={isSavePdfModalOpen}
        onClose={() => setIsSavePdfModalOpen(false)}
        selectedDate={selectedDate}
        activities={activities}
        profile={profile}
        onSuccessNotification={showNotification}
      />
    </div>
  );
}
