
import React, { useState } from 'react';
import { Lock, User, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { useData } from './DataContext';

interface LoginProps {
  onLogin: () => void;
  isRTL: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isRTL }) => {
  const { validateUser, registerUser } = useData();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isRegistering) {
          // Register Logic
          if (!name || !username || !password || !confirmPassword) {
              setError(isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required');
              setIsLoading(false);
              return;
          }
          if (password !== confirmPassword) {
              setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
              setIsLoading(false);
              return;
          }

          // Added await here to wait for Firebase response
          const result = await registerUser({
              name,
              username,
              password,
              role: 'user' // Default role
          });

          if (result.success) {
              setSuccessMsg(isRTL ? 'تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.' : 'Account created successfully! You can login now.');
              // Clear form and switch to login
              setName('');
              setUsername('');
              setPassword('');
              setConfirmPassword('');
              setTimeout(() => setIsRegistering(false), 1500);
          } else {
              setError(isRTL ? 'اسم المستخدم موجود مسبقاً' : 'Username already exists');
          }

      } else {
          // Login Logic
          // Validate user is synchronous because it checks the loaded array
          if (validateUser(username, password)) {
              onLogin();
          } else {
              setError(isRTL ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
          }
      }
    } catch (err) {
      console.error(err);
      setError(isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
      setSuccessMsg('');
      setUsername('');
      setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 font-cairo" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-300">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Milano Store</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isRegistering 
                ? (isRTL ? 'إنشاء حساب جديد' : 'Create New Account')
                : (isRTL ? 'يرجى تسجيل الدخول للمتابعة' : 'Please sign in to continue')
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium animate-fade-in">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center font-medium animate-fade-in">
                {successMsg}
              </div>
            )}

            {isRegistering && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full p-3 ps-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder={isRTL ? "الاسم الكامل" : "Full Name"}
                        />
                    </div>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full p-3 ps-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={isRTL ? "اسم المستخدم" : "username"}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full p-3 ps-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            {isRegistering && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full p-3 ps-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="••••••"
                        />
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span>{isRTL ? 'جاري المعالجة...' : 'Processing...'}</span>
              ) : (
                isRegistering 
                  ? <><UserPlus size={20} /> <span>{isRTL ? 'إنشاء الحساب' : 'Create Account'}</span></>
                  : <><LogIn size={20} /> <span>{isRTL ? 'دخول' : 'Sign In'}</span></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {isRegistering ? (isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?') : (isRTL ? 'ليس لديك حساب؟' : "Don't have an account?")}
            </p>
            <button 
                onClick={toggleMode}
                className="text-primary hover:text-blue-700 font-bold text-sm flex items-center justify-center gap-1 mx-auto"
            >
                {isRegistering ? (isRTL ? 'تسجيل الدخول' : 'Sign In') : (isRTL ? 'إنشاء حساب جديد' : 'Create New Account')}
                <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Milano Store Manager
        </div>
      </div>
    </div>
  );
};

export default Login;
