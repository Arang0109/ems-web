import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface DetailViewButtonProps {
  onClick: () => void;
}

export const DetailViewButton = ({ onClick }: DetailViewButtonProps) => (
  <Button onClick={onClick} size="xs" variant="link">
    <Search />
    <span>상세정보</span>
  </Button>
);
