# Components Directory

This directory contains modular, reusable components for the Trinity Tinder application.

## Structure

```
components/
├── Layer.tsx                    # Individual chatbox/layer component
├── ConnectionArrows.tsx         # SVG arrows connecting parent-child layers
├── types.ts                     # Shared TypeScript interfaces
├── utils/
│   ├── colorUtils.ts           # Color palette and color management
│   └── treeLayout.ts           # Tree-based positioning logic
└── README.md                    # This file
```

## Components

### `Layer.tsx`
Individual chatbox component that displays:
- Messages within the layer
- Input field for sending messages
- Branch button for creating child conversations
- Resize handle for adjusting dimensions
- Color-coded highlights for branched messages

**Props:**
- `layer`: Layer data (position, size, color, etc.)
- `messages`: Messages to display in this layer
- `isActive`: Whether this layer is currently active
- Event handlers for drag, resize, input, and branching

### `ConnectionArrows.tsx`
Renders colored arrows connecting parent messages to child branch chatboxes.

**Features:**
- Automatically calculates arrow paths from branched messages to child layers
- Color-matches arrows to branch colors
- Updates dynamically when layers are moved

**Props:**
- `layers`: All layers in the canvas
- `messages`: All messages
- `messageRefs`: Ref map for message DOM elements
- `containerRef`: Canvas container reference
- `zoom`: Current zoom level

## Utilities

### `utils/colorUtils.ts`
Manages the color system for branches.

**Exports:**
- `BRANCH_COLORS`: Array of 8 color schemes
- `getNextBranchColor()`: Get next available color for a new branch
- `getLayerColor()`: Get color info for a layer
- `getBranchedMessageColor()`: Get color for a branched message
- `isMessageBranched()`: Check if a message has been branched from

### `utils/treeLayout.ts`
Handles automatic tree-based positioning of branches.

**Exports:**
- `TREE_CONFIG`: Spacing configuration
- `findParentLayer()`: Find parent layer for a given layer
- `calculateTreePosition()`: Calculate position for new branch in tree structure

## Types

### `types.ts`
Shared TypeScript interfaces:

- `Message`: Chat message interface
- `Layer`: Chatbox/layer interface
- `BranchColor`: Color scheme interface

## Usage Example

```tsx
import { Layer } from "@/components/Layer";
import { ConnectionArrows } from "@/components/ConnectionArrows";
import { getNextBranchColor } from "@/components/utils/colorUtils";
import { calculateTreePosition } from "@/components/utils/treeLayout";
import type { Layer as LayerType, Message } from "@/components/types";

// In your component
<ConnectionArrows
  layers={layers}
  messages={messages}
  messageRefs={messageRefs}
  containerRef={containerRef}
  zoom={zoom}
/>

{layers.map((layer) => (
  <Layer
    key={layer.id}
    layer={layer}
    messages={messagesForLayer(layer)}
    isActive={layer.id === activeLayerId}
    // ... other props
  />
))}
```

## Adding New Features

### Adding a New Color Scheme
Edit `utils/colorUtils.ts` and add to `BRANCH_COLORS` array:

```ts
{
  bg: "bg-cyan-100",
  border: "border-cyan-400",
  dark: "dark:bg-cyan-900 dark:border-cyan-600",
  stroke: "rgb(6, 182, 212)",
}
```

### Modifying Tree Layout
Edit `utils/treeLayout.ts` to adjust:
- `TREE_CONFIG.horizontalSpacing`: Space between sibling branches
- `TREE_CONFIG.verticalSpacing`: Space between parent-child levels

### Extending Layer Features
Modify `Layer.tsx` to add new layer-specific features like:
- Additional UI controls
- Custom message rendering
- Layer-specific settings

## Best Practices

1. **Keep components focused**: Each component should have a single responsibility
2. **Use utilities**: Extract logic into utility functions for reusability
3. **Type everything**: Use TypeScript interfaces from `types.ts`
4. **Document changes**: Update this README when adding new components
5. **Test thoroughly**: Ensure new features work with existing functionality
