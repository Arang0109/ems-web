
export const PageTitle = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div>
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}