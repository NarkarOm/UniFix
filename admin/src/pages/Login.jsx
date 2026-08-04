import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  KeyRound,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

const STEP_LOGIN = "login";
const STEP_FORGOT_EMAIL = "forgot_email";
const STEP_FORGOT_OTP = "forgot_otp";
const STEP_FORGOT_PASSWORD = "forgot_password";
const STEP_FORGOT_SUCCESS = "forgot_success";

export default function Login() {
  const [step, setStep] = useState(STEP_LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim())
      return setError("Email and password are required.");
    setLoading(true);
    try {
      const res = await adminAPI.login(email, password);
      localStorage.setItem("unifix_admin_token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmail = async (e) => {
    e.preventDefault();
    setError("");
    if (!forgotEmail.trim()) return setError("Email is required.");
    setLoading(true);
    try {
      await adminAPI.forgotPassword(forgotEmail);
      setStep(STEP_FORGOT_OTP);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) return setError("OTP is required.");
    setLoading(true);
    try {
      await adminAPI.validateResetOtp(forgotEmail, otp);
      setStep(STEP_FORGOT_PASSWORD);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword.trim()) return setError("New password is required.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await adminAPI.verifyResetOtp(forgotEmail, otp, newPassword);
      setStep(STEP_FORGOT_SUCCESS);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setStep(STEP_LOGIN);
    setError("");
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const renderRight = () => {
    if (step === STEP_LOGIN) {
      return (
        <div className="login-card w-full max-w-[392px] bg-white rounded-[20px] p-[40px_36px] sm:p-[32px_24px] shadow-[0_4px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] border border-[#f1f5f9]">
          <div className="text-[25px] font-[800] text-[#0f172a] tracking-[-0.5px] mb-[5px]">Sign in</div>
          <div className="text-[14px] text-[#94a3b8] font-[400] mb-[30px]">Enter your admin credentials to continue</div>
          <form className="flex flex-col gap-[18px]" onSubmit={handleLogin}>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-[700] text-[#374151] tracking-[0.2px]">Email Address</label>
              <div className="relative flex items-center">
                <span className="absolute left-[13px] flex items-center text-[#94a3b8] pointer-events-none z-10">
                  <Mail size={15} />
                </span>
                <input
                  className="w-full p-[12px_16px_12px_40px] rounded-[10px] border-[1.5px] border-[#e2e8f0] text-[14px] text-[#0f172a] bg-[#f8fafc] outline-none transition-[border-color,background] duration-150 focus:border-[#16a34a] focus:bg-white placeholder:text-[#cbd5e1]"
                  type="email"
                  placeholder="admin@vcet.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-[700] text-[#374151] tracking-[0.2px]">Password</label>
              <div className="relative flex items-center">
                <span className="absolute left-[13px] flex items-center text-[#94a3b8] pointer-events-none z-10">
                  <Lock size={15} />
                </span>
                <input
                  className="w-full p-[12px_44px_12px_40px] rounded-[10px] border-[1.5px] border-[#e2e8f0] text-[14px] text-[#0f172a] bg-[#f8fafc] outline-none transition-[border-color,background] duration-150 focus:border-[#16a34a] focus:bg-white placeholder:text-[#cbd5e1]"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-[12px] bg-none border-none cursor-pointer p-[4px] flex items-center text-[#94a3b8] transition-colors duration-150 hover:text-[#475569]"
                  onClick={() => setShowPass((p) => !p)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                className="self-end text-[12px] text-[#16a34a] font-[600] hover:underline mt-[2px]"
                onClick={() => { setError(""); setStep(STEP_FORGOT_EMAIL); }}
              >
                Forgot password?
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-[9px] bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-[10px] p-[10px_14px] text-[13px] font-[500]">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#16a34a] text-white border-none rounded-[11px] p-[14px] text-[15px] font-[700] cursor-pointer flex items-center justify-center gap-[8px] transition-[background,transform] duration-150 hover:bg-[#15803d] disabled:opacity-70 disabled:cursor-not-allowed mt-[2px]"
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
          <div className="flex items-center justify-center gap-[8px] mt-[26px] text-[12px] text-[#cbd5e1] font-[500]">
            <ShieldCheck size={13} />
            Secure admin access only
          </div>
        </div>
      );
    }

    if (step === STEP_FORGOT_EMAIL) {
      return (
        <div className="w-full max-w-[392px] bg-white rounded-[20px] p-[40px_36px] sm:p-[32px_24px] shadow-[0_4px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] border border-[#f1f5f9]">
          <button onClick={resetToLogin} className="flex items-center gap-[6px] text-[13px] text-[#64748b] font-[600] mb-[24px] hover:text-[#0f172a]">
            <ChevronLeft size={15} /> Back to login
          </button>
          <div className="w-[44px] h-[44px] rounded-[12px] bg-[#f0fdf4] flex items-center justify-center mb-[18px]">
            <KeyRound size={20} color="#16a34a" />
          </div>
          <div className="text-[22px] font-[800] text-[#0f172a] tracking-[-0.5px] mb-[5px]">Forgot Password</div>
          <div className="text-[14px] text-[#94a3b8] mb-[28px]">Enter your admin email and we'll send an OTP to reset your password.</div>
          <form className="flex flex-col gap-[18px]" onSubmit={handleForgotEmail}>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-[700] text-[#374151]">Email Address</label>
              <div className="relative flex items-center">
                <span className="absolute left-[13px] flex items-center text-[#94a3b8] pointer-events-none z-10">
                  <Mail size={15} />
                </span>
                <input
                  className="w-full p-[12px_16px_12px_40px] rounded-[10px] border-[1.5px] border-[#e2e8f0] text-[14px] text-[#0f172a] bg-[#f8fafc] outline-none transition-[border-color] duration-150 focus:border-[#16a34a] focus:bg-white placeholder:text-[#cbd5e1]"
                  type="email"
                  placeholder="unifixofficial365@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-[9px] bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-[10px] p-[10px_14px] text-[13px] font-[500]">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#16a34a] text-white border-none rounded-[11px] p-[14px] text-[15px] font-[700] cursor-pointer flex items-center justify-center gap-[8px] hover:bg-[#15803d] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : <>Send OTP <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      );
    }

    if (step === STEP_FORGOT_OTP) {
      return (
        <div className="w-full max-w-[392px] bg-white rounded-[20px] p-[40px_36px] sm:p-[32px_24px] shadow-[0_4px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] border border-[#f1f5f9]">
          <button onClick={() => { setError(""); setStep(STEP_FORGOT_EMAIL); }} className="flex items-center gap-[6px] text-[13px] text-[#64748b] font-[600] mb-[24px] hover:text-[#0f172a]">
            <ChevronLeft size={15} /> Back
          </button>
          <div className="w-[44px] h-[44px] rounded-[12px] bg-[#f0fdf4] flex items-center justify-center mb-[18px]">
            <KeyRound size={20} color="#16a34a" />
          </div>
          <div className="text-[22px] font-[800] text-[#0f172a] tracking-[-0.5px] mb-[5px]">Enter OTP</div>
          <div className="text-[14px] text-[#94a3b8] mb-[28px]">We sent a 6-digit OTP to <span className="text-[#0f172a] font-[600]">{forgotEmail}</span>.</div>
          <form className="flex flex-col gap-[18px]" onSubmit={handleForgotOtp}>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-[700] text-[#374151]">OTP Code</label>
              <input
                className="w-full p-[12px_16px] rounded-[10px] border-[1.5px] border-[#e2e8f0] text-[18px] font-[700] text-[#0f172a] bg-[#f8fafc] outline-none tracking-[8px] transition-[border-color] duration-150 focus:border-[#16a34a] focus:bg-white placeholder:text-[#cbd5e1] placeholder:tracking-normal placeholder:text-[14px] placeholder:font-[400]"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
            </div>
            {error && (
              <div className="flex items-center gap-[9px] bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-[10px] p-[10px_14px] text-[13px] font-[500]">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#16a34a] text-white border-none rounded-[11px] p-[14px] text-[15px] font-[700] cursor-pointer flex items-center justify-center gap-[8px] hover:bg-[#15803d] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : <>Verify OTP <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      );
    }

    if (step === STEP_FORGOT_PASSWORD) {
      return (
        <div className="w-full max-w-[392px] bg-white rounded-[20px] p-[40px_36px] sm:p-[32px_24px] shadow-[0_4px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] border border-[#f1f5f9]">
          <div className="w-[44px] h-[44px] rounded-[12px] bg-[#f0fdf4] flex items-center justify-center mb-[18px]">
            <Lock size={20} color="#16a34a" />
          </div>
          <div className="text-[22px] font-[800] text-[#0f172a] tracking-[-0.5px] mb-[5px]">New Password</div>
          <div className="text-[14px] text-[#94a3b8] mb-[28px]">Set a new password for your admin account.</div>
          <form className="flex flex-col gap-[18px]" onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-[700] text-[#374151]">New Password</label>
              <div className="relative flex items-center">
                <span className="absolute left-[13px] flex items-center text-[#94a3b8] pointer-events-none z-10">
                  <Lock size={15} />
                </span>
                <input
                  className="w-full p-[12px_44px_12px_40px] rounded-[10px] border-[1.5px] border-[#e2e8f0] text-[14px] text-[#0f172a] bg-[#f8fafc] outline-none transition-[border-color] duration-150 focus:border-[#16a34a] focus:bg-white placeholder:text-[#cbd5e1]"
                  type={showNewPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-[12px] cursor-pointer p-[4px] flex items-center text-[#94a3b8] hover:text-[#475569]"
                  onClick={() => setShowNewPass((p) => !p)}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="text-[12px] font-[700] text-[#374151]">Confirm Password</label>
              <div className="relative flex items-center">
                <span className="absolute left-[13px] flex items-center text-[#94a3b8] pointer-events-none z-10">
                  <Lock size={15} />
                </span>
                <input
                  className="w-full p-[12px_16px_12px_40px] rounded-[10px] border-[1.5px] border-[#e2e8f0] text-[14px] text-[#0f172a] bg-[#f8fafc] outline-none transition-[border-color] duration-150 focus:border-[#16a34a] focus:bg-white placeholder:text-[#cbd5e1]"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-[9px] bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-[10px] p-[10px_14px] text-[13px] font-[500]">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#16a34a] text-white border-none rounded-[11px] p-[14px] text-[15px] font-[700] cursor-pointer flex items-center justify-center gap-[8px] hover:bg-[#15803d] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting…</> : <>Reset Password <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      );
    }

    if (step === STEP_FORGOT_SUCCESS) {
      return (
        <div className="w-full max-w-[392px] bg-white rounded-[20px] p-[40px_36px] sm:p-[32px_24px] shadow-[0_4px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] border border-[#f1f5f9] text-center">
          <div className="w-[56px] h-[56px] rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto mb-[20px]">
            <CheckCircle2 size={28} color="#16a34a" />
          </div>
          <div className="text-[22px] font-[800] text-[#0f172a] tracking-[-0.5px] mb-[8px]">Password Reset!</div>
          <div className="text-[14px] text-[#94a3b8] mb-[32px]">Your password has been reset successfully. You can now sign in with your new password.</div>
          <button
            onClick={resetToLogin}
            className="w-full bg-[#16a34a] text-white border-none rounded-[11px] p-[14px] text-[15px] font-[700] cursor-pointer flex items-center justify-center gap-[8px] hover:bg-[#15803d]"
          >
            Back to Sign In <ArrowRight size={16} />
          </button>
        </div>
      );
    }
  };

  return (
    <div className="login-root flex min-h-screen font-['DM_Sans'] bg-white">
      <div className="login-left hidden md:flex flex-[0_0_52%] bg-[#0f172a] relative overflow-hidden items-stretch">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_20%_50%,rgba(22,163,74,0.12)_0%,transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(22,163,74,0.06)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 w-full p-[44px_52px] flex flex-col justify-between">
          <div className="flex items-center gap-[13px]">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-transparent overflow-hidden">
              <img src="/logo192.png" alt="logo" className="w-full h-full object-cover rounded-[11px]" />
            </div>
            <div>
              <div className="text-[19px] font-[800] text-white tracking-[-0.3px]">UniFiX</div>
              <div className="text-[10px] font-[700] text-[#4ade80] tracking-[1.5px] uppercase mt-[2px]">Admin Portal</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center pt-[36px]">
            <div className="text-[10px] font-[700] text-[#4ade80] tracking-[2.5px] uppercase mb-[22px] flex items-center gap-[8px]">
              Campus Management
            </div>
            <h1 className="text-[50px] font-[800] text-white leading-[1.08] tracking-[-1.5px] mb-[22px]">
              CAMPUS CARE AT YOUR<br />
              <span className="text-[#4ade80]">FINGERTIPS.</span>
            </h1>
            <p className="text-[15px] text-white/45 leading-[1.75] max-w-[340px]">
              Manage staff verifications, track complaints in real-time, and oversee campus operations from one unified dashboard.
            </p>
          </div>
        </div>
      </div>
      <div className="login-right flex-1 flex items-center justify-center p-[40px_32px] sm:p-[24px_20px] bg-[#f8fafc]">
        {renderRight()}
      </div>
    </div>
  );
}