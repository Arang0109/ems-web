interface Props {
  children: React.ReactNode;
}

export const CenteredCardLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-muted p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-md border border-border p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
