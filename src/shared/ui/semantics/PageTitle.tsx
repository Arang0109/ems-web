
export const PageTitle = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div>
      <h1 className="text-h1 text-ink">{title}</h1>
      {description && <p className="text-body-2 text-ink-soft mt-0.5">{description}</p>}
    </div>
  );
}