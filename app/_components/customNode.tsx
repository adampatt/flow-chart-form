import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from "@/components/ui/card"
import { Trash, PersonSimpleRun } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const handleStyle = { left: 10 };

function TextUpdaterNode({ data }) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-full max-w-md p-5 border border-gray-200 rounded-lg relative">
        <div className="flex items-center space-x-5">
          <div className="flex-shrink-0 w-auto flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <PersonSimpleRun size={48} weight="bold" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Person running icon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-lg">Card Title</h3>
              <Trash size={24} weight="bold" />
            </div>
            <p className="text-gray-500 text-sm">This is a description of the card. It provides additional information about the card's content.</p>
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  );
}

export default TextUpdaterNode;