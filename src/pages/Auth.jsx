import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./auth.css"; 

const Auth = () => {
  const { aseanCountries, setCurrentUser, login: contextLogin } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("my");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (!isLogin && (!name || !country)) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUser({ uid: user.uid, ...userDoc.data() });
        } else {
          // If user exists in Auth but not in Firestore, create Firestore record
          await setDoc(doc(db, "users", user.uid), {
            name: user.displayName || email.split('@')[0],
            email: user.email,
            country: "my",
            points: 10,
            avatar: (user.displayName || email.split('@')[0]).substring(0, 2).toUpperCase(),
            createdAt: new Date()
          });
          setCurrentUser({ 
            uid: user.uid, 
            name: user.displayName || email.split('@')[0],
            email: user.email,
            country: "my",
            points: 10 
          });
        }
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName: name });

        // Create user document in Firestore
        const userData = {
          name,
          email,
          country,
          points: 10,
          avatar: name.substring(0, 2).toUpperCase(),
          createdAt: new Date(),
          uid: user.uid
        };

        await setDoc(doc(db, "users", user.uid), userData);
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError("Email is already registered. Please login instead.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address.");
          break;
        case 'auth/weak-password':
          setError("Password should be at least 6 characters.");
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError("Invalid email or password.");
          break;
        default:
          setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🌱</div>
          <h2 className="auth-title">EcoWatch</h2>
          <p className="auth-subtitle">
            {isLogin ? "Welcome back!" : "Join the community"}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email field - always visible */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              disabled={loading}
            />
          </div>

          {/* Password field - always visible */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              disabled={loading}
              minLength={isLogin ? undefined : 6}
            />
          </div>

          {/* Signup only fields */}
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="select-field"
                  required
                  disabled={loading}
                >
                  <option value="">Select your country</option>
                  {aseanCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
          </button>

          {isLogin && (
            <p className="auth-switch-text">
              Don't have an account?{" "}
              <button 
                type="button"
                className="auth-switch-btn"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
              >
                Sign up
              </button>
            </p>
          )}
        </form>
      </div>

      {/* Background Decorations */}
      <div className="auth-bg-decor shape-1"></div>
      <div className="auth-bg-decor shape-2"></div>
    </div>
  );
};

export default Auth;