






const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 btn-magic';

  // Theme hook classes (used by the cinematic wizarding theme)
  const themeHookClass =
  variant === 'primary' ? 'button-primary' :
  variant === 'secondary' || variant === 'outline' ? 'button-secondary' :
  variant === 'ai-accent' ? 'button-ai' :
  '';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
    secondary: 'bg-secondary text-white hover:opacity-90 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
    success: 'bg-secondary text-white hover:opacity-90 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30',
    'ai-accent': 'bg-ai-accent text-white hover:opacity-90 shadow-lg shadow-ai-accent/20 hover:shadow-xl hover:shadow-ai-accent/30'
  };

  return (
    <button
      className={`${baseStyles} ${themeHookClass} ${variantStyles[variant]} ${className}`}
      {...props}>
      
      {children}
    </button>);

};

export default Button;