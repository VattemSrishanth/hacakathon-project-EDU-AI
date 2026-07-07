import { GraduationCap } from 'lucide-react';
import Card from '../Card';






const ClassList = ({ onSelectClass, selectedGrade }) => {
  const grades = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {grades.map((grade) =>
      <Card
        key={grade}
        onClick={() => onSelectClass(grade)}
        className={`cursor-pointer transition-all duration-300 rounded-4xl border-2 group p-6 flex flex-col items-center justify-center gap-3 active:scale-95 ${
        selectedGrade === grade ?
        'bg-primary border-primary shadow-xl ring-4 ring-primary/20' :
        'bg-app-bg border-app-border hover:border-primary/50 hover:shadow-lg'}`
        }>
        
          <div className={`p-4 rounded-3xl transition-colors ${
        selectedGrade === grade ? 'bg-white/20' : 'bg-primary/10 group-hover:bg-primary/20'}`
        }>
            <GraduationCap
            size={32}
            className={selectedGrade === grade ? 'text-white' : 'text-primary'} />
          
          </div>
          <div className="text-center">
            <span className={`block text-[10px] font-black uppercase tracking-widest ${
          selectedGrade === grade ? 'text-white/70' : 'text-app-text-sub'}`
          }>
              Class
            </span>
            <span className={`text-3xl font-black ${
          selectedGrade === grade ? 'text-white' : 'text-app-text-main'}`
          }>
              {grade}
            </span>
          </div>
        </Card>
      )}
    </div>);

};

export default ClassList;