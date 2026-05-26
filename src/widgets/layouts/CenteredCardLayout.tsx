interface Props {
  children: React.ReactNode;
}

export const CenteredCardLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-neutral-50 to-slate-100 p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
