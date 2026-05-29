import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

interface DetailViewButtonProps {
  path: string
}

export const DetailViewButton = ({
  path,
}: DetailViewButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={(() => navigate(path))}
      size="xs"
      variant="link"
    >
      <Search />
      <span>상세정보</span>
    </Button>
  );
}