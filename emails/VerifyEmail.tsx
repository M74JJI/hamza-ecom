import { Html } from '@react-email/components';

export default function VerifyEmail({ verifyUrl }: { verifyUrl: string }){
  return (
<Html>
  <div style={{
    fontFamily: 'Inter, Arial, sans-serif',
    padding: '0',
    background: 'linear-gradient(135deg, #fefefe 0%, #fefefe 50%, #fefefe 100%)',
    color: '#1c1917',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}>
    
    {/* Premium Background Elements */}
    <div style={{
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: `
        radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.04) 0%, transparent 50%)
      `
    }} />
    
    {/* Geometric Background Patterns */}
    <div style={{
      position: 'absolute',
      top: '10%',
      right: '10%',
      width: '120px',
      height: '120px',
      border: '2px solid rgba(245, 158, 11, 0.08)',
      borderRadius: '24px',
      transform: 'rotate(45deg)',
      opacity: '0.6'
    }} />
    
    <div style={{
      position: 'absolute',
      bottom: '15%',
      left: '10%',
      width: '80px',
      height: '80px',
      border: '1.5px solid rgba(245, 158, 11, 0.05)',
      borderRadius: '16px',
      transform: 'rotate(15deg)',
      opacity: '0.4'
    }} />

    {/* Main Card */}
    <div style={{
      maxWidth: '520px',
      width: '90%',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(245, 158, 11, 0.15)',
      borderRadius: '32px',
      padding: '60px 40px',
      textAlign: 'center',
      position: 'relative',
      zIndex: '10',
      boxShadow: `
        0 25px 50px rgba(0, 0, 0, 0.08),
        0 15px 35px rgba(245, 158, 11, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8)
      `
    }}>
      
      {/* Brand Logo Section - EXACT MATCH TO TAILWIND */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {/* Logo Container - Exact match to Tailwind */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Main Logo Box */}
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <span style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: '800',
              fontFamily: 'Inter, sans-serif'
            }}>H</span>
          </div>
          
          {/* Crown Badge - Exact match */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L15 7L21 8L17 12L18 18L12 15L6 18L7 12L3 8L9 7L12 2Z"/>
            </svg>
          </div>
        </div>
        
        {/* Brand Name - Exact typography match */}
        <div style={{
          textAlign: 'left'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #1c1917 0%, #57534e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1',
            letterSpacing: '-0.025em',
            fontFamily: 'Inter, sans-serif'
          }}>
            HAMZA
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#d97706',
            letterSpacing: '0.1em',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Inter, sans-serif'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
            </svg>
            PREMIUM STORE
          </div>
        </div>
      </div>

      {/* Verification Icon */}
      <div style={{
        width: '100px',
        height: '100px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 32px',
        boxShadow: '0 15px 35px rgba(245, 158, 11, 0.25)',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        
        {/* Shine Effect */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          transform: 'skewX(-25deg)'
        }} />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '36px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #1c1917 0%, #57534e 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '0 0 16px 0',
        letterSpacing: '-0.025em',
        lineHeight: '1.2',
        fontFamily: 'Inter, sans-serif'
      }}>
        Verify Your Email
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '18px',
        color: '#57534e',
        lineHeight: '1.6',
        margin: '0 0 40px 0',
        fontWeight: '400',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontFamily: 'Inter, sans-serif'
      }}>
        Welcome to HAMZA Premium Store. Verify your email address to unlock exclusive access to our luxury collections and premium features.
      </p>

      {/* Verification Button */}
      <a href={verifyUrl} style={{
        display: 'inline-block',
        background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '16px',
        textDecoration: 'none',
        fontWeight: '700',
        fontSize: '16px',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 25px rgba(28, 25, 23, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '32px',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Button Shine Effect */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.2), transparent)',
          transition: 'left 0.6s ease'
        }} />
        
        Verify Email Address
      </a>

      {/* Security Note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px 24px',
        background: 'rgba(245, 158, 11, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(245, 158, 11, 0.1)',
        fontFamily: 'Inter, sans-serif'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706" stroke="none">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          <path d="M12 12l4-4m-4 4l4 4m-4-4h8" stroke="white" strokeWidth="2"/>
        </svg>
        <span style={{ fontSize: '14px', color: '#57534e', fontWeight: '500' }}>
          Secure verification • 24-hour expiry • Encrypted process
        </span>
      </div>

      {/* Additional Info */}
      <p style={{
        fontSize: '14px',
        color: '#78716c',
        lineHeight: '1.5',
        margin: '0',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto',
        fontFamily: 'Inter, sans-serif'
      }}>
        If you didn't create an account with HAMZA Premium Store, you can safely ignore this email. 
        The verification link will expire in 24 hours for your security.
      </p>

      {/* Brand Signature */}
      <div style={{
        marginTop: '40px',
        paddingTop: '32px',
        borderTop: '1px solid rgba(245, 158, 11, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            width: '4px',
            height: '4px',
            background: '#d97706',
            borderRadius: '50%'
          }} />
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#57534e',
            letterSpacing: '0.1em'
          }}>
            CRAFTED WITH EXCELLENCE
          </span>
          <div style={{
            width: '4px',
            height: '4px',
            background: '#d97706',
            borderRadius: '50%'
          }} />
        </div>
      </div>
    </div>

    <style>
      {`
        a:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(28, 25, 23, 0.25);
        }
        
        a:hover > div {
          left: 100%;
        }
      `}
    </style>
  </div>
</Html>
  );
}
