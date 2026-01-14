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
  const { refCodes, language } = useConfigStore();
  const [isOpen, setIsOpen] = useState(false);

  // Get current node info
  const currentNode = refCodes.find(r => r.codeId === activeNodeId);
  // Respect language setting
  const displayName = language === 'zh'
    ? (currentNode?.zhName || currentNode?.enName || '当前社区')
    : (currentNode?.enName || currentNode?.zhName || 'Community');

  // Get all nodes (Handle potential type drift: COMMUNITY vs COMMUNITY_NODE vs NODE)
  const nodes = refCodes.filter(r => {
    const type = r.type as string;
    return type === 'NODE' || type === 'COMMUNITY_NODE' || type.startsWith('COMMUNITY');
  });

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
              {language === 'zh' ? (node.zhName || node.enName) : (node.enName || node.zhName)}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            {language === 'zh' ? '暂无社区' : 'No communities available'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
