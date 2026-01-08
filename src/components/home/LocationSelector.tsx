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
  const nodes = refCodes.filter(r => r.type === 'COMMUNITY_NODE');

  const handleNodeChange = (nodeId: string) => {
    setActiveNode(nodeId);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50 hover:border-primary hover:bg-white transition-all shadow-sm">
        <span className="font-semibold text-lg">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {nodes.length > 0 ? (
          nodes.map((node) => (
            <DropdownMenuItem
              key={node.codeId}
              onClick={() => handleNodeChange(node.codeId)}
              className={activeNodeId === node.codeId ? 'bg-primary/10 font-semibold' : ''}
            >
              {node.zhName || node.enName}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            No communities available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
