import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

interface AgentTypeCardProps {
  value: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (value: string) => void;
}

export function AgentTypeCard({
  value,
  title,
  description,
  selected,
  onSelect,
}: AgentTypeCardProps) {
  return (
    <Card
      onClick={() => onSelect(value)}
      className={cn(
        "cursor-pointer", 
        selected ? "border-2 border-primary" : "hover:border-primary"
      )}
    >
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default AgentTypeCard;
