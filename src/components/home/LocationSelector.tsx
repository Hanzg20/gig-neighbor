import { ChevronDown } from "lucide-react";
import { useCommunity } from "@/context/CommunityContext";
import { useConfigStore } from "@/stores/configStore";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Location Selector Component
 * Displays current community node and allows switching
 */
export function LocationSelector() {
  const { activeNodeId, setActiveNode } = useCommunity();
  const { refCodes } = useConfigStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get current node info
  const currentNode = refCodes.find(r => r.codeId === activeNodeId);
  const displayName = currentNode?.zhName || currentNode?.enName || 'Community';

  // Get all nodes
  const nodes = refCodes.filter(r => r.type === 'NODE');

  const handleNodeChange = (nodeId: string) => {
    setActiveNode(nodeId);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Left: Location Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
          <span>{displayName}</span>
          <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {nodes.map((node) => (
            <DropdownMenuItem
              key={node.codeId}
              onClick={() => handleNodeChange(node.codeId)}
              className={activeNodeId === node.codeId ? 'bg-primary/10' : ''}
            >
              {node.zhName || node.enName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right: Community Switch */}
      <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
        切换社区: {displayName}
      </button>
    </div>
  );
}
