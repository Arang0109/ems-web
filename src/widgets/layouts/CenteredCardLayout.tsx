interface Props {
  children: React.ReactNode;
}

export const CenteredCardLayout = ({ children }: Props) => {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-canvas via-canvas to-canvas p-4">
      <div className="w-full max-w-lg">
        <div className="bg-surface/95 backdrop-blur-sm rounded-panel shadow-md border border-rule p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
