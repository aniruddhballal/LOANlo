export function DeletedUsersStyles() {
  return (
    <style>{`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .dashboard-container {
        animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .header-title {
        animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .header-actions {
        animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .shimmer-button {
        position: relative;
        overflow: hidden;
      }

      .shimmer-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        transform: translateX(-100%);
      }

      .shimmer-button:hover::before {
        animation: shimmer 0.7s ease-in-out;
      }

      .card-hover {
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .card-hover:hover {
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .gradient-border {
        position: relative;
      }

      .gradient-border::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2px;
        background: linear-gradient(135deg, #f9f9f9, #ffffff, #f9f9f9);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .gradient-border:hover::before {
        opacity: 1;
      }

      .content-section {
        animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
      }
    `}</style>
  )
}