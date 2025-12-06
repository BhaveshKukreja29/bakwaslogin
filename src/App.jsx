import { useState, useEffect, useRef } from 'react';
import './App.css';

export default function HorribleSignup() {
  const [step, setStep] = useState('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keys, setKeys] = useState([]);
  
  const [friction, setFriction] = useState('');
  const [force, setForce] = useState('');
  const [boxPosition, setBoxPosition] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'.split('');

  useEffect(() => {
    if (step === 'username') {
      shuffleKeys();
    }
  }, [step]);

  // Add annoying cursor following text
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (step === 'login') {
        const follower = document.getElementById('cursor-follower');
        if (follower) {
          follower.style.left = e.pageX + 20 + 'px';
          follower.style.top = e.pageY + 20 + 'px';
        }
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [step]);

  const shuffleKeys = () => {
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    setKeys(shuffled);
  };

  const handleKeyClick = (key) => {
    setUsername(prev => prev + key);
    shuffleKeys();
  };

  const startPasswordEntry = () => {
    if (username.length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }
    setStep('password');
  };

  const runSimulation = () => {
    const f = parseFloat(friction);
    const F = parseFloat(force);
    
    if (isNaN(f) || isNaN(F) || f < 0 || f > 1 || F <= 0) {
      alert('Invalid input! Friction: 0-1, Force: > 0');
      return;
    }

    setIsSimulating(true);
    
    const mass = 2;
    const g = 9.8;
    const mu = f;
    const frictionForce = mu * mass * g;
    
    const netForce = F - frictionForce;
    const acceleration = netForce / mass;

    if (acceleration <= 0) {
      setBoxPosition(0);
      setTimeout(() => {
        alert('Box didn\'t move! Applied force is less than friction force.');
        setIsSimulating(false);
      }, 500);
      return;
    }

    const velocityAfterPush = Math.sqrt(2 * acceleration * 1);
    const deceleration = frictionForce / mass;
    const slideDistance = (velocityAfterPush * velocityAfterPush) / (2 * deceleration);
    const totalDistance = Math.min(1 + slideDistance, 100);

    let currentPos = 0;
    let currentVelocity = 0;
    const dt = 0.03;
    const animationTime = 2000;
    const steps = animationTime / (dt * 1000);

    const animate = (stepNum) => {
      // Check if we've reached the final distance OR velocity is zero
      if (currentPos >= totalDistance || (currentPos >= 1 && currentVelocity <= 0)) {
        setBoxPosition(totalDistance);
        setIsSimulating(false);
        determineCharacter(totalDistance);
        return;
      }

      if (currentPos < 1) {
        currentVelocity += acceleration * dt;
        currentPos += currentVelocity * dt;
      } else {
        currentVelocity = Math.max(0, currentVelocity - deceleration * dt);
        currentPos += currentVelocity * dt;
        
        if (currentVelocity <= 0) {
          setBoxPosition(currentPos);
          setIsSimulating(false);
          determineCharacter(currentPos);
          return;
        }
      }

      setBoxPosition(Math.min(currentPos, totalDistance));
      setTimeout(() => animate(stepNum + 1), dt * 1000);
    };

    animate(0);
  };

  const determineCharacter = (distance) => {
    const canvasWidth = canvasRef.current.width;
    const startOffset = 100;
    const usableWidth = canvasWidth - startOffset - 50;
    
    const boxX = (distance / 100) * (canvasWidth - 20) + 10;
    
    if (boxX < startOffset) {
      alert('Box didn\'t reach the character zone! Slide further.');
      setBoxPosition(0);
      setFriction('');
      setForce('');
      return;
    }
    
    const adjustedPosition = boxX - startOffset;
    const segmentWidth = usableWidth / alphabet.length;
    const index = Math.floor(adjustedPosition / segmentWidth);
    const char = alphabet[Math.min(Math.max(index, 0), alphabet.length - 1)];
    
    setPassword(prev => prev + char);
    setBoxPosition(0);
    setFriction('');
    setForce('');
  };

  const handleSignup = () => {
    if (password.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }
    setSignedUp(true);
    setStep('login');
  };

  const handleLogin = () => {
    // Play troll sound
    if (audioRef.current) {
      audioRef.current.play();
    }
    
    // Shake the screen
    document.body.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
      alert('❌ INCORRECT PASSWORD!\n\n🚨 ACCOUNT TERMINATED 🚨\n\nJust kidding... this is the worst signup ever! 😈\n\nBut seriously, your account has been deleted. Try again! 💀');
      document.body.style.animation = '';
      // Reset everything
      setUsername('');
      setPassword('');
      setLoginUsername('');
      setLoginPassword('');
      setSignedUp(false);
      setStep('username');
    }, 1500);
  };

  useEffect(() => {
    if (step === 'password' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const startOffset = 100;
      const usableWidth = canvas.width - startOffset - 50;
      const segmentWidth = usableWidth / alphabet.length;
      
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      for (let i = 0; i < alphabet.length; i++) {
        const x = startOffset + (i * segmentWidth) + (segmentWidth / 2);
        ctx.fillText(alphabet[i], x, 15);
      }
      
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 35, canvas.width, 30);
      
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      for (let i = 0; i <= alphabet.length; i++) {
        const x = startOffset + (i * segmentWidth);
        ctx.beginPath();
        ctx.moveTo(x, 35);
        ctx.lineTo(x, 65);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 100; i += 10) {
        const x = (i / 100) * (canvas.width - 20) + 10;
        ctx.fillText(`${i}m`, x, 80);
        ctx.fillRect(x - 0.5, 65, 1, 5);
      }
      
      const boxX = (boxPosition / 100) * (canvas.width - 20) + 10;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(boxX, 42, 12, 16);
      
      if (boxPosition > 0 && boxX >= startOffset) {
        const adjustedPosition = boxX - startOffset;
        const charIndex = Math.floor(adjustedPosition / segmentWidth);
        if (charIndex >= 0 && charIndex < alphabet.length) {
          const zoneX = startOffset + (charIndex * segmentWidth);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
          ctx.fillRect(zoneX, 35, segmentWidth, 30);
        }
      }
    }
  }, [boxPosition, step]);

  if (step === 'login') {
    return (
      <div className="container login-page">
        <audio ref={audioRef} src="https://www.myinstants.com/media/sounds/youve-been-trolled.mp3" />
        <div id="cursor-follower">TRY TO LOGIN 👉</div>
        
        <marquee className="annoying-marquee">
          ⚠️ SECURE LOGIN PORTAL ⚠️ YOUR PASSWORD IS SAFE WITH US ⚠️ TOTALLY NOT STORING IN PLAIN TEXT ⚠️
        </marquee>
        
        <div className="card login-card">
          <h1 className="title blink">🔐 Login to Your Account 🔐</h1>
          <p className="subtitle">Welcome back! Please enter your credentials below</p>
          
          <div className="form-group">
            <label className="label">Username:</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="input"
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label className="label">Password:</label>
            <input
              type="text"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
            />
            <small className="hint">Hint: Your signup username was "{username}" and password was "{password}"</small>
          </div>

          <button onClick={handleLogin} className="login-btn pulse">
            🚀 LOGIN NOW 🚀
          </button>

          <div className="visitor-counter">
            <img src="https://c.statcounter.com/12345678/0/abcdefgh/1/" alt="web counter" />
            You are visitor #1337 today!
          </div>
        </div>

        <div className="footer blink">
          💀 This site is best viewed in Netscape Navigator 4.0 💀
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Sign Up</h1>
        
        {step === 'username' && (
          <div>
            <div className="form-group">
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                readOnly
                className="input"
                placeholder="Click keys below to enter username"
              />
              {username && (
                <button
                  onClick={() => setUsername(username.slice(0, -1))}
                  className="backspace-btn"
                >
                  Backspace
                </button>
              )}
            </div>

            <div className="form-group">
              <div className="keyboard-label">
                <span className="label-text">On-screen keyboard</span>
                <span className="shuffle-icon">(shuffles after each key!)</span>
              </div>
              <div className="key-grid">
                {keys.map((key, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeyClick(key)}
                    className="key"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startPasswordEntry} className="next-btn">
              Next Step
            </button>
          </div>
        )}

        {step === 'password' && (
          <div>
            <div className="form-group">
              <label className="label">Password (visible for your convenience!)</label>
              <input
                type="text"
                value={password}
                readOnly
                className="input password-visible"
                placeholder="Use physics simulation below"
              />
              {password && (
                <button
                  onClick={() => setPassword(password.slice(0, -1))}
                  className="backspace-btn"
                >
                  Remove last character
                </button>
              )}
            </div>

            <div className="physics-box">
              <h3 className="physics-title">Physics Simulation</h3>
              <p className="physics-desc">
                Calculate where the box slides to enter a character. Box mass = 2kg, g = 9.8m/s²
                <br />
                Force is applied over 1m, then friction decelerates the box.
              </p>
              
              <canvas
                ref={canvasRef}
                width={1200}
                height={100}
                className="canvas"
              />

              <div className="input-grid">
                <div>
                  <label className="small-label">
                    Coefficient of Friction (μ: 0-1)
                  </label>
                  <input
                    type="number"
                    value={friction}
                    onChange={(e) => setFriction(e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                    disabled={isSimulating}
                    className="number-input"
                  />
                </div>
                <div>
                  <label className="small-label">
                    Applied Force (N)
                  </label>
                  <input
                    type="number"
                    value={force}
                    onChange={(e) => setForce(e.target.value)}
                    step="0.1"
                    min="0"
                    disabled={isSimulating}
                    className="number-input"
                  />
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`simulate-btn ${isSimulating ? 'disabled' : ''}`}
              >
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>

            <button onClick={handleSignup} className="signup-btn">
              Complete Sign Up
            </button>
          </div>
        )}

        <div className="footer">
          Note: Your keyboard is disabled for username entry
        </div>
      </div>
    </div>
  );
}