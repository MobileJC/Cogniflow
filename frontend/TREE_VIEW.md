# Tree View Feature

The Tree View feature provides a visual overlay that displays the relationship structure of your conversation branches. It's designed as a pure visualization tool to help you understand and navigate your chat hierarchy.

## How to Toggle Tree View

Click the **Tree View** button in the sidebar to:
- **Open Tree View**: Overlay appears on top of your current chat view
- **Close Tree View**: Click the X button in top-left corner, or click any chat node to view and exit
- **Original chat remains underneath**: Your chat interface stays intact while viewing the tree

## Features

### 1. **Tree-Based Layout**
- Primary chat appears as the root node on the left
- Child branches are automatically positioned to the right of their parents
- Compact layout with 400px horizontal spacing and 200px vertical spacing
- Each node shows only the chat title and a visual icon
- Nodes are color-coded: primary chat (gray), branches (colored)

### 2. **Visual Connections**
- **Colored arrows** connect parent nodes to child branches
- Each branch has a unique color (8 colors available: yellow, red, green, blue, purple, pink, indigo, orange)
- Arrows are color-matched to their branch nodes
- Arrows update dynamically when nodes are moved
- Clean white background with semi-transparent overlay effect

### 3. **Relationship Visualization**
- Pure visualization mode - no chat functionality in tree view
- Nodes show only chat titles (no messages)
- Color-coded nodes indicate branch relationships
- Primary chat has gray styling, branches have unique colors
- Active chat is highlighted with a blue ring

### 4. **Interactive Navigation**
- **Drag**: Click and drag the header to reposition nodes
- **Resize**: Drag the resize handle (bottom-right corner) to adjust node size
- **Minimum size**: 200px width, 100px height (compact design)
- **Click to navigate**: Click any node to view that chat and exit tree view
- **Close overlay**: Click the X button in top-left to close without navigating

### 5. **Creating Branches (from normal chat view)**
1. In normal chat view, highlight text in an assistant message
2. Right-click and select "Branch from this"
3. A new branch chat is created
4. Switch to tree view to see the new relationship visualized
5. The branching structure is automatically laid out

### 6. **Zoom Controls**
- Located in top-right corner
- **Zoom in**: Click + button or use Ctrl/Cmd + scroll up
- **Zoom out**: Click - button or use Ctrl/Cmd + scroll down
- Range: 30% to 250%

### 7. **Color Coding**
Each branch automatically gets assigned a color:
1. Yellow
2. Red
3. Green
4. Blue
5. Purple
6. Pink
7. Indigo
8. Orange

If you create more than 8 branches, colors will cycle.

## Usage Tips

### Viewing Relationships
1. Click **Tree View** in sidebar to open the overlay
2. See your entire conversation structure at a glance
3. Colored arrows show which chats are related
4. Drag nodes to organize the layout as you prefer

### Creating Branches
**Must be done in normal chat view (not in tree view):**
1. Highlight text in an assistant message
2. Right-click and select "Branch from this"
3. A new branch chat is created
4. Open tree view to see the updated structure

### Navigating
- **Click any node** to jump to that chat (exits tree view)
- **Use sidebar** to switch between chats in normal view
- **Drag nodes** to reorganize the visual layout
- **Zoom** to see more or focus on specific areas
- **Close button** (X) to exit tree view without navigating

### Organizing Your View
1. **Drag nodes** to arrange them spatially as you prefer
2. **Resize nodes** to make some more prominent
3. **Zoom out** to see the entire conversation tree
4. **Zoom in** to focus on specific branches
5. Layout persists as you drag (positions are temporary during session)

## Technical Details

### Components
- **TreeCanvas**: Main overlay canvas with zoom, pan, and title display
- **TreeLayer**: Simplified node showing only chat title and icon
- **ConnectionArrows**: SVG arrows with color-matched parent-child connections
- **Color utilities**: Manage branch colors for arrows and nodes
- **Tree layout**: Calculate automatic positioning (400px horizontal, 200px vertical spacing)

### Overlay Design
- Tree view renders as an absolute positioned overlay (z-index: 50)
- Original chat interface remains underneath and functional
- Semi-transparent white background with backdrop blur effect
- Close button in top-left corner for easy exit
- Clicking any node navigates to that chat and closes overlay

### Data Flow
1. Chats from parent component converted to compact Layer format
2. Layers rendered at calculated positions (280x120px nodes)
3. Click handlers trigger navigation and overlay closure
4. Branching done in normal view, structure visible in tree view
5. Tree view is read-only visualization (no message input)

## Keyboard Shortcuts

- **Ctrl/Cmd + Scroll**: Zoom in/out in tree view
- **Click + Drag**: Move nodes around canvas
- **Click node**: Navigate to chat and close tree view
- **ESC** or **Click X**: Close tree view (future enhancement)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Touch gestures supported

## Performance

- Lightweight overlay design (no message rendering in tree view)
- Efficient DOM manipulation for smooth drag/resize
- Optimized arrow path calculations
- Compact nodes (280x120px) allow more visibility
- Scales well to 50+ conversation branches
