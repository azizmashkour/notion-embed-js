import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Radix Popover shell — Fluent-style border (#edebe9) and layered shadow.
 */
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { popoverContentBase } from './styles.js';
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverContent = React.forwardRef(({ className, style, align = 'start', sideOffset = 6, collisionPadding = 16, ...props }, ref) => (_jsx(PopoverPrimitive.Portal, { children: _jsx(PopoverPrimitive.Content, { ref: ref, align: align, sideOffset: sideOffset, collisionPadding: collisionPadding, className: className, style: { ...popoverContentBase, ...style }, ...props }) })));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
//# sourceMappingURL=popover.js.map