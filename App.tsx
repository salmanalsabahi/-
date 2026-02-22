
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile, Reminder } from './types';
import { getWeeklyAdvice } from './services/geminiService';
import { HomeIcon, GuideIcon, BellIcon, AlertIcon, UserIcon, PhoneIcon } from './components/icons';
import LoadingSpinner from './components/LoadingSpinner';

type Page = 'home' | 'guide' | 'reminders' | 'emergency' | 'profile';

// Helper function to calculate pregnancy week
const calculatePregnancyWeek = (lmp: string): number | null => {
    if (!lmp) return null;
    const lmpDate = new Date(lmp);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
};

// ====================================================================================
// Page Components (defined outside the main App component to prevent re-renders)
// ====================================================================================

const AuthComponent: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-pink-600">رفيقة الحمل</h1>
                    <p className="text-gray-500 mt-2">{isRegister ? 'أنشئي حسابًا جديدًا' : 'سجلي دخولك للمتابعة'}</p>
                </div>
                <form className="space-y-4">
                    <input type="email" placeholder="البريد الإلكتروني" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    <input type="password" placeholder="كلمة المرور" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    {isRegister && <input type="password" placeholder="تأكيد كلمة المرور" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />}
                    <button type="button" onClick={onLogin} className="w-full bg-pink-500 text-white font-bold py-3 rounded-lg hover:bg-pink-600 transition-colors">
                        {isRegister ? 'تسجيل' : 'تسجيل الدخول'}
                    </button>
                </form>
                <div className="text-center">
                    <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-pink-500 hover:underline">
                        {isRegister ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HomePage: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
    const pregnancyWeek = profile?.lmp ? calculatePregnancyWeek(profile.lmp) : null;

    return (
        <div className="p-6 space-y-8">
            <div className="text-center bg-white p-8 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold text-gray-700">مرحبًا بكِ، {profile?.name || 'غاليتنا'}!</h1>
                {pregnancyWeek !== null ? (
                    <>
                        <p className="text-5xl font-bold text-pink-500 my-4">{pregnancyWeek}</p>
                        <p className="text-lg text-gray-600">أنتِ في الأسبوع</p>
                        <div className="mt-6 text-sm text-gray-500">
                            <p>تاريخ الولادة المتوقع</p>
                            <p className="font-semibold">{profile?.edd || 'غير محدد'}</p>
                        </div>
                    </>
                ) : (
                    <p className="mt-4 text-gray-600">يرجى تحديث ملفك الشخصي بتاريخ آخر دورة شهرية لبدء المتابعة.</p>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-4 rounded-2xl shadow-md">
                    <p className="font-bold text-pink-600">نصائح اليوم</p>
                    <p className="text-sm text-gray-500">اشربي الكثير من الماء</p>
                </div>
                 <div className="bg-white p-4 rounded-2xl shadow-md">
                    <p className="font-bold text-pink-600">حجم الجنين</p>
                    <p className="text-sm text-gray-500">
                        {pregnancyWeek ? `بحجم حبة أفوكادو تقريبًا` : 'غير محدد'}
                    </p>
                </div>
            </div>
        </div>
    );
};

const WeeklyGuidePage: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const pregnancyWeek = profile?.lmp ? calculatePregnancyWeek(profile.lmp) : null;

    const fetchAdvice = useCallback(async () => {
        if (pregnancyWeek === null) return;
        setIsLoading(true);
        const fetchedAdvice = await getWeeklyAdvice(pregnancyWeek);
        setAdvice(fetchedAdvice);
        setIsLoading(false);
    }, [pregnancyWeek]);

    useEffect(() => {
        fetchAdvice();
    }, [fetchAdvice]);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">دليلك الأسبوعي</h1>
            {pregnancyWeek !== null ? (
                 <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-bold text-pink-600 mb-4">الأسبوع {pregnancyWeek}</h2>
                    {isLoading ? <LoadingSpinner /> : (
                        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }} />
                    )}
                 </div>
            ) : (
                <p className="text-center text-gray-600 bg-white p-6 rounded-2xl shadow-md">
                    يرجى تحديث ملفك الشخصي بتاريخ آخر دورة شهرية لعرض النصائح الأسبوعية.
                </p>
            )}
        </div>
    );
};

const RemindersPage: React.FC = () => {
    const [reminders, setReminders] = useState<Reminder[]>(() => {
        const saved = localStorage.getItem('reminders');
        return saved ? JSON.parse(saved) : [];
    });
    const [newReminder, setNewReminder] = useState({ title: '', time: '' });
    const notifiedRef = React.useRef<Set<string>>(new Set());

    useEffect(() => {
        localStorage.setItem('reminders', JSON.stringify(reminders));
    }, [reminders]);

    // Notification check logic
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const todayKey = now.toISOString().split('T')[0];

            reminders.forEach(r => {
                const notificationKey = `${r.id}-${todayKey}-${r.time}`;
                if (r.time === currentTime && !notifiedRef.current.has(notificationKey)) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('تذكير!', {
                            body: `حان موعد: ${r.title}`,
                            icon: '/favicon.ico'
                        });
                        notifiedRef.current.add(notificationKey);
                    }
                }
            });
        };

        // Check immediately and then every 30 seconds
        checkReminders();
        const interval = setInterval(checkReminders, 30000);
        return () => clearInterval(interval);
    }, [reminders]);

    const handleAddReminder = () => {
        if (!newReminder.title || !newReminder.time) return;
        const newRem: Reminder = { ...newReminder, id: Date.now() };
        setReminders([...reminders, newRem]);
        setNewReminder({ title: '', time: '' });
        
        // Ask for notification permission
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('تم تفعيل التذكيرات!', {
                        body: `سنقوم بتذكيرك بـ ${newRem.title} في الساعة ${newRem.time}`,
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    };

    const handleDeleteReminder = (id: number) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">التذكيرات</h1>
            <div className="bg-white p-4 rounded-2xl shadow-md space-y-3">
                <input 
                    type="text" 
                    placeholder="اسم الدواء أو الفيتامين" 
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <input 
                    type="time" 
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button onClick={handleAddReminder} className="w-full bg-pink-500 text-white font-bold py-2 rounded-lg hover:bg-pink-600 transition-colors">
                    إضافة تذكير
                </button>
            </div>
            <div className="space-y-3">
                {reminders.length > 0 ? reminders.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-700">{r.title}</p>
                            <p className="text-sm text-gray-500">{r.time}</p>
                        </div>
                        <button onClick={() => handleDeleteReminder(r.id)} className="text-red-500 hover:text-red-700">
                           حذف
                        </button>
                    </div>
                )) : <p className="text-center text-gray-500 pt-4">لا توجد تذكيرات حاليًا.</p>}
            </div>
        </div>
    );
};

const EmergencyPage: React.FC = () => {
    const emergencyNumber = '123'; // Replace with local emergency number e.g., 997, 999
    return (
        <div className="p-6 flex flex-col items-center justify-center h-[70vh]">
            <div className="text-center space-y-4">
                 <AlertIcon className="w-20 h-20 text-red-500 mx-auto"/>
                 <h1 className="text-3xl font-bold text-red-600">حالة طارئة</h1>
                 <p className="text-gray-600 max-w-sm">
                     في حالات الطوارئ، يرجى الضغط على الزر أدناه للاتصال الفوري بالطوارئ أو بجهة الاتصال المحددة مسبقًا.
                 </p>
                 <a href={`tel:${emergencyNumber}`} className="inline-block w-full max-w-xs mt-6">
                    <button className="w-full bg-red-500 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105 flex items-center justify-center gap-3">
                        <PhoneIcon className="w-6 h-6"/>
                        اتصال سريع بالطوارئ
                    </button>
                 </a>
            </div>
        </div>
    );
};

const ProfilePage: React.FC<{ profile: UserProfile | null; onSave: (profile: UserProfile) => void }> = ({ profile, onSave }) => {
    const [formData, setFormData] = useState<UserProfile>(profile || { name: '', age: null, lmp: '', edd: '' });

    useEffect(() => {
        if (profile) {
            setFormData(profile);
        }
    }, [profile]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'age' ? (value ? parseInt(value) : null) : value}));
    };

    const handleSave = () => {
        let edd = formData.edd;
        if (formData.lmp) {
            const lmpDate = new Date(formData.lmp);
            lmpDate.setDate(lmpDate.getDate() + 280);
            edd = lmpDate.toISOString().split('T')[0];
        }
        onSave({ ...formData, edd });
        alert('تم حفظ الملف الشخصي بنجاح!');
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">الملف الشخصي</h1>
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">الاسم</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">العمر</label>
                    <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">تاريخ آخر دورة شهرية</label>
                    <input type="date" name="lmp" value={formData.lmp} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-500">تاريخ الولادة المتوقع (يُحسب تلقائيًا)</label>
                    <input type="text" value={formData.edd} readOnly className="mt-1 w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg" />
                </div>
                <button onClick={handleSave} className="w-full bg-pink-500 text-white font-bold py-3 rounded-lg hover:bg-pink-600 transition-colors">
                    حفظ التغييرات
                </button>
            </div>
        </div>
    );
};


// ====================================================================================
// Main App Component
// ====================================================================================

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [profile, setProfile] = useState<UserProfile | null>(() => {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : null;
    });

    const handleSaveProfile = (updatedProfile: UserProfile) => {
        setProfile(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home': return <HomePage profile={profile} />;
            case 'guide': return <WeeklyGuidePage profile={profile}/>;
            case 'reminders': return <RemindersPage />;
            case 'emergency': return <EmergencyPage />;
            case 'profile': return <ProfilePage profile={profile} onSave={handleSaveProfile} />;
            default: return <HomePage profile={profile} />;
        }
    };

    if (!isAuthenticated) {
        return <AuthComponent onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-rose-50 pb-20">
            <header className="bg-white shadow-sm p-4 text-center sticky top-0 z-10">
                <h1 className="text-xl font-bold text-pink-600">رفيقة الحمل</h1>
            </header>
            
            <main>
                {renderPage()}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t border-t border-gray-200">
                <div className="flex justify-around max-w-md mx-auto">
                    <NavItem icon={<HomeIcon />} label="الرئيسية" page="home" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<GuideIcon />} label="الدليل" page="guide" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<BellIcon />} label="تذكيرات" page="reminders" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<AlertIcon />} label="طوارئ" page="emergency" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem icon={<UserIcon />} label="ملفي" page="profile" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </div>
            </nav>
        </div>
    );
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    page: Page;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, page, currentPage, setCurrentPage }) => {
    const isActive = currentPage === page;
    const colorClass = isActive ? 'text-pink-500' : 'text-gray-400';

    return (
        <button onClick={() => setCurrentPage(page)} className={`flex flex-col items-center justify-center p-2 pt-3 w-1/5 ${colorClass} hover:text-pink-500 transition-colors`}>
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );
};
