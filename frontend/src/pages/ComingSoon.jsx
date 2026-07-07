import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const ComingSoon = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        
        <div className="mb-6 inline-flex p-4 bg-primary/10 rounded-full text-primary">
          <Sparkles size={48} className="animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-bold text-app-text-main mb-4">
          {title}
        </h1>
        
        <p className="text-xl text-app-text-sub mb-8">
          We're working hard to bring this feature to you. Stay tuned!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2">
            
            <ArrowLeft size={18} />
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}>
            
            Go to Dashboard
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-app-text-sub opacity-50 uppercase tracking-widest font-semibold">
          Coming Soon
        </div>
      </motion.div>
    </div>);

};

export default ComingSoon;