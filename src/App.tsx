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
  signInAnonymously,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp,
  getDocFromServer,
  User 
} from './lib/firebase';
import { handleFirestoreError, OperationType } from './lib/firebaseErrors';
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
  INITIAL_ACTIVITIES,
  DEFAULT_STAFF_LIST,
  normalizeActivities
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

// Helper to recursively remove or nullify undefined fields for Firebase Firestore compatibility
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === 'object' && item !== null ? cleanForFirestore(item) : item)) as any;
  }
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      cleaned[key] = null;
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      cleaned[key] = cleanForFirestore(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Generate unique, collision-free slug per teacher
function getTeacherSlug(nip?: string, name?: string): string {
  const rawNip = (nip || '').replace(/[^0-9]/g, '').trim();
  if (rawNip.length >= 6) return rawNip;
  const rawName = (name || '').trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return rawName || 'guru';
}

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

  // Data Pegawai Staff List (synchronizes with ExcelStaffTable & MonthlyRecap)
  const [staffList, setStaffList] = useState<Partial<UserProfile>[]>(() => {
    const saved = localStorage.getItem('sijunawan_staff_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isLegacyDummy = parsed.length === 7 && parsed.some((p: any) => p.nip === '198506152010011025');
          if (!isLegacyDummy) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const handleSelectStaff = (staff: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        name: staff.name ?? prev.name,
        nip: staff.nip ?? prev.nip,
        position: staff.position ?? prev.position,
        unitWork: staff.unitWork ?? prev.unitWork,
        rankGrade: staff.rankGrade ?? prev.rankGrade,
        employeeStatus: staff.employeeStatus ?? prev.employeeStatus,
        schoolHeadName: staff.schoolHeadName ?? prev.schoolHeadName,
        schoolHeadNip: staff.schoolHeadNip ?? prev.schoolHeadNip,
        cityLocation: staff.cityLocation ?? prev.cityLocation,
      };
      localStorage.setItem('sijunawan_profile', JSON.stringify(updated));
      return updated;
    });
  };

  // All Journals List for Monthly Recap & History
  const [allJournals, setAllJournals] = useState<JournalDay[]>(() => {
    const saved = localStorage.getItem('sijunawan_local_journals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((j: any) => ({
            ...j,
            activities: normalizeActivities(j.activities || []),
          }));
        }
      } catch (e) {}
    }
    return [];
  });

  // Sync & Export status with Quota Awareness
  const [isQuotaExhausted, setIsQuotaExhausted] = useState<boolean>(() => {
    return localStorage.getItem('sijunawan_quota_exhausted') === 'true';
  });
  const [showQuotaBanner, setShowQuotaBanner] = useState<boolean>(() => {
    return localStorage.getItem('sijunawan_quota_exhausted') === 'true';
  });
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'quota-exhausted'>(() => {
    return localStorage.getItem('sijunawan_quota_exhausted') === 'true' ? 'quota-exhausted' : 'synced';
  });
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Mark quota as exhausted and activate local fallback mode
  const markQuotaExhausted = useCallback(() => {
    setIsQuotaExhausted(true);
    setSyncStatus('quota-exhausted');
    setShowQuotaBanner(true);
    localStorage.setItem('sijunawan_quota_exhausted', 'true');
  }, []);

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

  // Refs for debouncing auto-sync & dirty checking
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const isCurrentPdfSavedRef = useRef<boolean>(false);
  const currentPdfSavedAtRef = useRef<number | null>(null);
  const lastCloudSavedPayloadRef = useRef<string>('');

  // Retry Cloud connection test (to see if daily quota reset)
  const handleRetryCloud = async () => {
    try {
      setSyncStatus('syncing');
      await getDoc(doc(db, 'settings', 'school_master_data'));
      setIsQuotaExhausted(false);
      setShowQuotaBanner(false);
      localStorage.removeItem('sijunawan_quota_exhausted');
      setSyncStatus('synced');
      showNotification('Koneksi Cloud Pulih', 'Kuota Firebase aktif kembali. Sinkronisasi cloud berjalan normal.', 'success');
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
        markQuotaExhausted();
        showNotification(
          'Batas Kuota Cloud Masih Berjalan',
          'Batas kuota harian Firebase gratis masih berlaku. Aplikasi tetap bekerja lancar dalam Mode Lokal mandiri.',
          'info'
        );
      } else {
        setSyncStatus('offline');
        showNotification('Koneksi Offline', 'Tidak dapat menghubungi server Firebase. Mode lokal tetap aktif.', 'info');
      }
    }
  };

  // 1. Initialize Firebase Auth (with anonymous fallback for transparent cloud sync)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthReady(true);
        if (!isQuotaExhausted) setSyncStatus('synced');
      } else {
        signInAnonymously(auth)
          .then((cred) => {
            setCurrentUser(cred.user);
            setIsAuthReady(true);
            if (!isQuotaExhausted) setSyncStatus('synced');
          })
          .catch((err) => {
            console.warn('Anonymous auth notice:', err);
            setCurrentUser(null);
            setIsAuthReady(true);
            if (!isQuotaExhausted) setSyncStatus('synced');
          });
      }
    });

    return () => unsubscribe();
  }, [isQuotaExhausted]);

  // 2. Real-time Listener for Shared Staff List ("Data Pegawai") from Firestore
  useEffect(() => {
    const masterDataRef = doc(db, 'settings', 'school_master_data');
    const unsubMasterData = onSnapshot(
      masterDataRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.staffList)) {
            const isLegacyDummy = data.staffList.length === 7 && data.staffList.some((p: any) => p.nip === '198506152010011025');
            if (!isLegacyDummy) {
              setStaffList(data.staffList);
              localStorage.setItem('sijunawan_staff_list', JSON.stringify(data.staffList));
            } else {
              setStaffList([]);
              localStorage.setItem('sijunawan_staff_list', JSON.stringify([]));
            }
          }
        }
      },
      (err: any) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
          markQuotaExhausted();
        }
        console.warn('Firestore Data Pegawai sync notice (using local storage):', err?.message || err);
      }
    );

    return () => unsubMasterData();
  }, [markQuotaExhausted]);

  // 3. Real-time Listener for User Profile & Settings from Firestore
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
      (err: any) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
          markQuotaExhausted();
        }
        console.warn('Firestore profile sync notice:', err?.message || err);
      }
    );

    return () => unsubUser();
  }, [currentUser, markQuotaExhausted]);

  // 4. Real-time Listener for ALL Teachers' Journals (for full Monthly Recap Matrix to read all teachers)
  useEffect(() => {
    const journalsRef = collection(db, 'journals');
    const unsubJournals = onSnapshot(
      journalsRef,
      (snapshot) => {
        const loaded: JournalDay[] = [];
        snapshot.forEach((docItem) => {
          loaded.push({ id: docItem.id, ...(docItem.data() as any) });
        });
        setAllJournals(loaded);
        localStorage.setItem('sijunawan_local_journals', JSON.stringify(loaded));
      },
      (err: any) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
          markQuotaExhausted();
        }
        console.warn('Firestore all journals sync notice (using local cache):', err?.message || err);
      }
    );

    return () => unsubJournals();
  }, [markQuotaExhausted]);

  // 5. Load or Listen to the Selected Date Journal for the Currently Active Teacher
  useEffect(() => {
    if (!selectedDate) return;

    const teacherSlug = getTeacherSlug(profile.nip, profile.name);
    const docId = `journal_${selectedDate}_${teacherSlug}`;

    const tNip = (profile.nip || '').trim().replace(/[^0-9]/g, '');
    const tName = (profile.name || '').trim().toLowerCase();

    // Check if we have this date in loaded journals for THIS teacher
    const existing = allJournals.find((j) => {
      if (j.dateStr !== selectedDate) return false;
      const jNip = (j.teacherNip || j.profileSnapshot?.nip || '').trim().replace(/[^0-9]/g, '');
      if (tNip && jNip && tNip === jNip) return true;
      const jName = (j.teacherName || j.profileSnapshot?.name || '').trim().toLowerCase();
      if (tName && jName && (tName === jName || jName.includes(tName) || tName.includes(jName))) return true;
      if (!jNip && !jName && selectedDate === '2026-08-28') return true;
      return false;
    });

    if (existing) {
      setActivities(normalizeActivities(existing.activities || []));
      if (existing.shift) setCurrentShift(existing.shift);
      isCurrentPdfSavedRef.current = Boolean(existing.isPdfSaved);
      currentPdfSavedAtRef.current = existing.pdfSavedAt ?? null;
      lastCloudSavedPayloadRef.current = JSON.stringify({
        selectedDate,
        teacherSlug,
        currentShift: existing.shift || currentShift,
        activities: normalizeActivities(existing.activities || []),
        wasPdfSaved: Boolean(existing.isPdfSaved),
      });
      return;
    }

    // Direct fetch from Firestore for this specific date and teacher
    const journalDocRef = doc(db, 'journals', docId);

    getDoc(journalDocRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as JournalDay;
          setActivities(normalizeActivities(data.activities || []));
          if (data.shift) setCurrentShift(data.shift);
          isCurrentPdfSavedRef.current = Boolean(data.isPdfSaved);
          currentPdfSavedAtRef.current = data.pdfSavedAt ?? null;
          lastCloudSavedPayloadRef.current = JSON.stringify({
            selectedDate,
            teacherSlug,
            currentShift: data.shift || currentShift,
            activities: normalizeActivities(data.activities || []),
            wasPdfSaved: Boolean(data.isPdfSaved),
          });
        } else {
          isCurrentPdfSavedRef.current = false;
          currentPdfSavedAtRef.current = null;
          // If reference date and default profile, keep initial demo activities; otherwise fresh row
          if (selectedDate === '2026-08-28' && (!profile.name || profile.name.includes('SAMSUDIN'))) {
            setActivities(normalizeActivities(INITIAL_ACTIVITIES));
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
      })
      .catch((err) => {
        console.warn('Could not load specific date journal:', err);
      });
  }, [selectedDate, profile.name, profile.nip]);

  // 6. Debounced Real-time Save of Current Day's Journal to Firestore & Local Storage
  const saveCurrentJournalToCloud = useCallback(async (isManualTrigger: boolean = false) => {
    if (!selectedDate) return;

    const teacherSlug = getTeacherSlug(profile.nip, profile.name);
    const docId = `journal_${selectedDate}_${teacherSlug}`;

    const wasPdfSaved = isCurrentPdfSavedRef.current;
    const existingPdfSavedAt = currentPdfSavedAtRef.current;

    const payload: JournalDay = {
      userId: currentUser ? currentUser.uid : 'shared_user',
      dateStr: selectedDate,
      formattedDate: parseDateStrToIndonesian(selectedDate),
      shift: currentShift,
      activities: activities,
      teacherName: profile.name || '',
      teacherNip: profile.nip || '',
      isPdfSaved: wasPdfSaved,
      pdfSavedAt: existingPdfSavedAt,
      profileSnapshot: {
        name: profile.name || '',
        nip: profile.nip || '',
        position: profile.position || '',
        unitWork: profile.unitWork || '',
        rankGrade: profile.rankGrade || '',
        employeeStatus: profile.employeeStatus || '',
      },
      updatedAt: Date.now(),
    };

    // Update local state and localStorage immediately (Zero latency, crash-proof)
    setAllJournals((prev) => {
      const entry: JournalDay = { id: docId, ...payload };
      const rawNip = (profile.nip || '').replace(/[^0-9]/g, '').trim();
      const rawName = (profile.name || '').trim().toLowerCase();
      const idx = prev.findIndex((j) => {
        if (j.dateStr !== selectedDate) return false;
        const jNip = (j.teacherNip || j.profileSnapshot?.nip || '').replace(/[^0-9]/g, '').trim();
        if (rawNip && jNip && rawNip === jNip) return true;
        const jName = (j.teacherName || j.profileSnapshot?.name || '').trim().toLowerCase();
        if (rawName && jName && (rawName.includes(jName) || jName.includes(rawName))) return true;
        return j.id === docId;
      });
      let updated: JournalDay[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = entry;
      } else {
        updated = [entry, ...prev];
      }
      localStorage.setItem('sijunawan_local_journals', JSON.stringify(updated));
      return updated;
    });

    // Check if cloud write is needed (dirty check)
    const payloadSignature = JSON.stringify({
      selectedDate,
      teacherSlug,
      currentShift,
      activities,
      wasPdfSaved,
    });

    if (payloadSignature === lastCloudSavedPayloadRef.current && !isManualTrigger) {
      return;
    }

    // If quota was already exhausted, stay in local mode and avoid spamming Firestore
    if (isQuotaExhausted) {
      setSyncStatus('quota-exhausted');
      if (isManualTrigger) {
        showNotification(
          'Jurnal Tersimpan di Perangkat',
          'Data tersimpan aman di browser Anda. (Mode Penyimpanan Lokal Aktif)',
          'success'
        );
      }
      return;
    }

    setSyncStatus('syncing');
    try {
      const journalDocRef = doc(db, 'journals', docId);
      const cleanPayload = cleanForFirestore(payload);
      await setDoc(journalDocRef, cleanPayload, { merge: true });
      lastCloudSavedPayloadRef.current = payloadSignature;
      setSyncStatus('synced');
      if (isManualTrigger) {
        showNotification('Jurnal Disimpan', 'Jurnal hari ini berhasil disimpan dan tersinkronisasi.', 'success');
      }
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
        markQuotaExhausted();
        if (isManualTrigger) {
          showNotification(
            'Jurnal Tersimpan (Lokal)',
            'Jurnal tersimpan aman di browser Anda. (Kuota cloud harian tercapai)',
            'info'
          );
        }
      } else {
        console.warn('Sync status notice (offline/fallback):', err?.message || err);
        setSyncStatus('offline');
      }
    }
  }, [currentUser, selectedDate, currentShift, activities, profile.name, profile.nip, isQuotaExhausted, markQuotaExhausted]);

  const saveCurrentJournalRef = useRef(saveCurrentJournalToCloud);
  saveCurrentJournalRef.current = saveCurrentJournalToCloud;

  // Trigger auto-save debounce on activity or shift change (2.5 seconds debounce)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentJournalRef.current(false);
    }, 2500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [activities, currentShift, selectedDate]);

  // Save Settings (Profile & Kop Surat & Master Data Staff) to Cloud
  const handleSaveSettingsToCloud = async () => {
    setIsSavingSettings(true);
    localStorage.setItem('sijunawan_profile', JSON.stringify(profile));
    localStorage.setItem('sijunawan_school', JSON.stringify(schoolSettings));
    localStorage.setItem('sijunawan_staff_list', JSON.stringify(staffList));

    if (isQuotaExhausted) {
      setIsSavingSettings(false);
      showNotification(
        'SIMPAN BERHASIL (LOKAL)',
        'Data Profil, Kop Sekolah & Data Pegawai tersimpan aman di browser Anda.',
        'success'
      );
      return;
    }

    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, cleanForFirestore({
          profile,
          schoolSettings,
          staffList: staffList || [],
          updatedAt: serverTimestamp(),
        }), { merge: true });

        // Also sync shared Data Pegawai to global settings doc
        await setDoc(doc(db, 'settings', 'school_master_data'), cleanForFirestore({
          staffList: staffList || [],
          updatedAt: serverTimestamp(),
        }), { merge: true }).catch(() => {});
      }

      setIsSavingSettings(false);
      showNotification(
        'SIMPAN BERHASIL',
        'Data Profil, Kop Sekolah & Data Pegawai berhasil disimpan!',
        'success'
      );
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
        markQuotaExhausted();
      }
      setIsSavingSettings(false);
      showNotification(
        'SIMPAN BERHASIL (LOKAL)',
        'Data Pengaturan berhasil disimpan di perangkat Anda! (Penyimpanan Lokal Aktif)',
        'success'
      );
    }
  };

  // Delete a journal entry
  const handleDeleteJournal = async (journalId: string, dateStr: string) => {
    try {
      if (journalId && !isQuotaExhausted) {
        await deleteDoc(doc(db, 'journals', journalId)).catch(() => {});
      }
      setAllJournals((prev) => {
        const updated = prev.filter((j) => (j.id ? j.id !== journalId : j.dateStr !== dateStr));
        localStorage.setItem('sijunawan_local_journals', JSON.stringify(updated));
        return updated;
      });
      if (selectedDate === dateStr) {
        setActivities([]);
        isCurrentPdfSavedRef.current = false;
      }
      showNotification('Jurnal Dihapus', `Jurnal tanggal ${dateStr} berhasil dihapus.`, 'info');
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
        markQuotaExhausted();
      }
      console.warn('Error deleting journal:', err);
    }
  };

  // Helper: Persist and mark current journal as isPdfSaved = true
  const handleConfirmPdfSaved = async () => {
    const validActivities = activities.filter(
      (a) => a.activity && a.activity.trim() !== '' && a.activity.trim() !== '-'
    );
    if (validActivities.length === 0) return;

    isCurrentPdfSavedRef.current = true;
    const teacherSlug = getTeacherSlug(profile.nip, profile.name);
    const docId = `journal_${selectedDate}_${teacherSlug}`;

    const updatedJournalPayload: JournalDay = {
      userId: currentUser ? currentUser.uid : 'shared_user',
      dateStr: selectedDate,
      formattedDate: parseDateStrToIndonesian(selectedDate),
      shift: currentShift,
      activities: activities,
      teacherName: profile.name || '',
      teacherNip: profile.nip || '',
      isPdfSaved: true,
      pdfSavedAt: Date.now(),
      profileSnapshot: {
        name: profile.name || '',
        nip: profile.nip || '',
        position: profile.position || '',
        unitWork: profile.unitWork || '',
        rankGrade: profile.rankGrade || '',
        employeeStatus: profile.employeeStatus || '',
        schoolHeadName: profile.schoolHeadName || '',
        schoolHeadNip: profile.schoolHeadNip || '',
        cityLocation: profile.cityLocation || '',
      },
      updatedAt: Date.now(),
    };

    setAllJournals((prev) => {
      const entry: JournalDay = { id: docId, ...updatedJournalPayload };
      const rawNip = (profile.nip || '').replace(/[^0-9]/g, '').trim();
      const rawName = (profile.name || '').trim().toLowerCase();
      const idx = prev.findIndex((j) => {
        if (j.dateStr !== selectedDate) return false;
        const jNip = (j.teacherNip || j.profileSnapshot?.nip || '').replace(/[^0-9]/g, '').trim();
        if (rawNip && jNip && rawNip === jNip) return true;
        const jName = (j.teacherName || j.profileSnapshot?.name || '').trim().toLowerCase();
        if (rawName && jName && (rawName.includes(jName) || jName.includes(rawName))) return true;
        return j.id === docId;
      });
      let updated: JournalDay[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = entry;
      } else {
        updated = [entry, ...prev];
      }
      localStorage.setItem('sijunawan_local_journals', JSON.stringify(updated));
      return updated;
    });

    if (!isQuotaExhausted) {
      try {
        const journalDocRef = doc(db, 'journals', docId);
        const cleanPayload = cleanForFirestore(updatedJournalPayload);
        await setDoc(journalDocRef, cleanPayload, { merge: true });

        // Auto-register teacher into shared school master data staff list on Firestore
        if (profile.name && profile.name.trim() !== '') {
          const masterDocRef = doc(db, 'settings', 'school_master_data');
          getDoc(masterDocRef)
            .then((snap) => {
              let currentList: Partial<UserProfile>[] = [];
              if (snap.exists()) {
                const data = snap.data();
                if (Array.isArray(data.staffList)) {
                  currentList = data.staffList;
                }
              }
              const tNipClean = (profile.nip || '').replace(/[^0-9]/g, '');
              const tNameClean = (profile.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const exists = currentList.some((st) => {
                const sNipClean = (st.nip || '').replace(/[^0-9]/g, '');
                if (tNipClean.length >= 6 && sNipClean.length >= 6 && tNipClean === sNipClean) return true;
                const sNameClean = (st.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                return tNameClean === sNameClean;
              });
              if (!exists) {
                const newStaffMember: Partial<UserProfile> = {
                  name: profile.name,
                  nip: profile.nip || '-',
                  position: profile.position || 'Guru / Tenaga Kependidikan',
                  unitWork: profile.unitWork || schoolSettings.subUnitName || 'SDN Babelan Kota 01',
                  rankGrade: profile.rankGrade || '-',
                  employeeStatus: profile.employeeStatus || (profile.nip && profile.nip !== '-' ? 'PNS' : 'Non-PNS / Tendik'),
                  schoolHeadName: profile.schoolHeadName || schoolSettings.headmasterName || '',
                  schoolHeadNip: profile.schoolHeadNip || schoolSettings.headmasterNip || '',
                  cityLocation: profile.cityLocation || schoolSettings.cityLocation || 'Bekasi',
                };
                const updatedStaffList = [...currentList, newStaffMember];
                setDoc(masterDocRef, cleanForFirestore({ staffList: updatedStaffList, updatedAt: serverTimestamp() }), { merge: true }).catch(() => {});
              }
            })
            .catch(() => {});
        }
      } catch (err: any) {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
          markQuotaExhausted();
        }
        console.warn('Firestore sync note:', err?.message || err);
      }
    }
  };

  // Export F4 PDF action - Verifies activities and updates isPdfSaved status
  const handleExportPdf = async () => {
    if (activeTab !== 'jurnal') {
      setActiveTab('jurnal');
    }

    const validActivities = activities.filter(
      (a) => a.activity && a.activity.trim() !== '' && a.activity.trim() !== '-'
    );

    if (validActivities.length === 0) {
      // Guru belum mengisi jurnal: kotak tidak berubah warna (tetap merah muda)
      showNotification(
        'Jurnal Belum Diisi',
        'Kegiatan jurnal harian masih kosong. Kotak pada Matriks Rekapitulasi tetap berwarna merah muda (tidak berubah hijau).',
        'error'
      );
      setIsSavePdfModalOpen(true);
      return;
    }

    // Guru telah mengisi jurnal dan mengklik tombol Simpan PDF:
    // Kotak pada Matrik akan berubah berwarna HIJAU!
    await handleConfirmPdfSaved();

    showNotification(
      'SIMPAN PDF BERHASIL',
      `Jurnal tanggal ${parseDateStrToIndonesian(selectedDate)} tersimpan. Kotak pada Matriks Rekapitulasi kini BERUBAH MENJADI HIJAU.`,
      'success'
    );

    setIsSavePdfModalOpen(true);
  };

  // Handle Quick Template Insertion (Support modifying row or adding manual row)
  const handleApplyTemplate = (
    activityText: string, 
    notesText?: string, 
    asNewRow?: boolean
  ) => {
    setActivities((prev) => {
      if (asNewRow || targetTemplateIndex < 0 || targetTemplateIndex >= prev.length) {
        const lastAct = prev[prev.length - 1];
        const startH = lastAct ? lastAct.endHour : '07';
        const startM = lastAct ? lastAct.endMinute : '00';
        const endH = String(Math.min(23, Number(startH) + 1)).padStart(2, '0');
        const endM = startM;
        const newAct: ActivityItem = {
          id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          startHour: startH,
          startMinute: startM,
          endHour: endH,
          endMinute: endM,
          activity: activityText,
          notes: notesText || '',
          photoUrl: '',
        };
        return [...prev, newAct];
      }

      const updated = [...prev];
      if (updated[targetTemplateIndex]) {
        updated[targetTemplateIndex] = {
          ...updated[targetTemplateIndex],
          activity: activityText,
          notes: notesText !== undefined ? notesText : updated[targetTemplateIndex].notes,
        };
      }
      return updated;
    });

    showNotification(
      'Template Diterapkan',
      'Kegiatan berhasil dimasukkan ke dalam jurnal harian.',
      'success'
    );
  };

  // Handle Full Day 6-activity Package (Guru & Tendik)
  const handleApplyFullDayPackage = (pkgActivities: ActivityItem[], shiftTitle?: string) => {
    const timestamp = Date.now();
    const cloned = pkgActivities.map((act, i) => ({
      ...act,
      id: `act_${timestamp}_${i}`,
    }));
    setActivities(cloned);
    if (shiftTitle) {
      setCurrentShift(shiftTitle);
    }
    showNotification(
      'Paket 6 Kegiatan Diterapkan',
      `Berhasil menerapkan 6 sesi kegiatan lengkap dengan jam teratur dan indikator kinerja ke jurnal hari ini.`,
      'success'
    );
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
                profile={profile}
                staffList={staffList}
                onSelectStaff={handleSelectStaff}
                onApplyFullDayPackage={handleApplyFullDayPackage}
                onExportPdf={handleExportPdf}
                isExporting={isExportingPdf}
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
                onUploadStamp={(b64) => {
                  setSchoolSettings((prev) => {
                    const updated = { ...prev, schoolStampUrl: b64 };
                    localStorage.setItem('sijunawan_school', JSON.stringify(updated));
                    return updated;
                  });
                  setProfile((prev) => {
                    const updated = { ...prev, schoolStampUrl: b64 };
                    localStorage.setItem('sijunawan_profile', JSON.stringify(updated));
                    return updated;
                  });
                  setToastMessage({
                    show: true,
                    title: 'Stempel Sekolah Berhasil Dipasang',
                    message: 'Stempel otomatis menempel di sebelah kiri Kepala Sekolah.',
                    type: 'success',
                  });
                }}
                onNavigateToSettings={() => setActiveTab('pengaturan')}
              />
            </div>
          </div>
        )}

        {/* TAB 2: REKAP BULANAN */}
        {activeTab === 'rekap' && (
          <MonthlyRecap
            journals={allJournals}
            staffList={staffList}
            onSelectDateToEdit={(dateStr, teacher) => {
              if (teacher) {
                handleSelectStaff(teacher);
              }
              setSelectedDate(dateStr);
              setActiveTab('jurnal');
              setActiveViewMobile('form');
            }}
            onOpenMasterData={() => setActiveTab('pengaturan')}
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
            staffList={staffList}
            setStaffList={setStaffList}
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
        onApplyFullDayActivities={handleApplyFullDayPackage}
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
        onPdfSavedSuccess={handleConfirmPdfSaved}
      />
    </div>
  );
}
