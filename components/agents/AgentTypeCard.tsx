import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

interface AgentTypeCardProps {
  value: string;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: (value: string) => void;
}

export function AgentTypeCard({
  value,
  title,
  description,
  selected,
  disabled,
  onSelect,
}: AgentTypeCardProps) {
  return (
    <Card
      onClick={() => !disabled && onSelect(value)}
      className={cn(
        "relative cursor-pointer",
        disabled
          ? "cursor-not-allowed"
          : selected
          ? "border-2 border-primary"
          : "hover:border-primary"
      )}
    >
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            Em breve
          </span>
        </div>
      )}
      <CardHeader className={cn("px-3 py-2", disabled && "opacity-50 select-none")}
      >
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default AgentTypeCard;
