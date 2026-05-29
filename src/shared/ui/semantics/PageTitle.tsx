
export const PageTitle = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
    </div>
  );
}