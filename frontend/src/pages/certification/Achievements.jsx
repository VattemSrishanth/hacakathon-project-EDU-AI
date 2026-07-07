import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Achievements = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/certificates');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-primary" />
      <span className="ml-4 text-xs font-black text-app-text-muted uppercase tracking-widest">
        Opening Achievement Center...
      </span>
    </div>);

};

export default Achievements;