# Data Grid Design Guidelines

## Design Approach
**Selected Approach:** Design System - Modern Data Application Pattern  
**Rationale:** Utility-focused data manipulation tool requiring clarity, efficiency, and standard UI patterns  
**Inspiration:** Linear (for clean hierarchy), Stripe Dashboard (for data density), shadcn/ui aesthetic (minimal, functional)

## Core Design Principles
1. **Scanability First:** Users need to quickly parse large datasets
2. **Progressive Disclosure:** Advanced features available but not overwhelming
3. **Spatial Efficiency:** Maximize data visibility without clutter
4. **Clear Hierarchy:** Distinguish controls from content clearly

## Typography System

**Font Stack:** 
- Primary: Inter or similar geometric sans-serif via Google Fonts
- Monospace: JetBrains Mono for data cells (numbers, IDs)

**Scale:**
- Table Headers: text-sm font-semibold uppercase tracking-wide
- Data Cells: text-sm font-normal
- Row Count/Pagination: text-xs
- Filter/Search Labels: text-xs font-medium
- Page Title/Header: text-2xl font-bold

## Layout & Spacing

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Cell padding: px-4 py-3
- Section gaps: gap-6
- Container padding: p-6 to p-8
- Filter row spacing: space-x-4

**Grid Container:**
- Max width: max-w-7xl mx-auto
- Responsive padding: px-4 md:px-6 lg:px-8
- Full-height layout option for immersive table views

## Component Specifications

### Page Header
- Title with optional description
- Right-aligned action buttons (Add New, Export, etc.)
- Bottom border or subtle shadow for separation
- Height: py-6

### Filter & Search Bar
- Horizontal layout with search input (flex-1) + filter dropdowns
- Search: Large input with icon prefix, placeholder text
- Filters: Dropdown buttons showing selected count badges
- Clear filters link when active
- Spacing: mb-6 from table

### Data Table
**Structure:**
- Sticky header row with sort indicators (arrows)
- Alternating row treatment for scannability
- Border style: Horizontal borders only (border-b)
- Hover state on rows for interactivity
- Selected row state distinct from hover

**Column Widths:**
- Checkbox/selection: w-12
- Actions: w-24 to w-32
- Auto-fit content columns with min/max constraints
- Responsive: Hide less critical columns on mobile (hidden md:table-cell)

**Cell Treatment:**
- Left-aligned text, right-aligned numbers
- Truncate long text with ellipsis
- Status badges: Compact pills with icons
- Actions: Icon buttons or dropdown menu

### Pagination Controls
**Layout:** Flex row with space-between
- Left: "Showing X-Y of Z results" text
- Center: Page number buttons with prev/next arrows
- Right: Rows per page dropdown

**Page Numbers:**
- Current page: Solid fill, high contrast
- Other pages: Ghost style
- Ellipsis (...) for condensed ranges
- Mobile: Show fewer page numbers, prioritize prev/next

### Loading & Empty States
- Skeleton rows: Shimmer animation matching table structure
- Empty state: Centered icon, headline, description, optional CTA
- Error state: Alert banner above table

### Toolbar Actions
- Bulk actions: Appear when rows selected (sticky to top or floating)
- Individual row actions: Dropdown menu (three-dot icon) in last column
- Primary action: Standalone button, secondary in dropdown

## Interaction Patterns

**Sorting:**
- Click column header to sort
- Visual indicators: Arrow icons (up/down/unsorted state)
- Multi-column sort: Shift+click with number badges

**Filtering:**
- Dropdown overlays for filters
- Multi-select with checkboxes
- Apply/Clear buttons in filter panels
- Active filter chips below search bar (dismissible)

**Selection:**
- Checkbox in first column
- Select all in header
- Shift-click for range selection
- Selected count indicator appears

**Responsive Behavior:**
- Desktop (lg+): Full table layout
- Tablet (md): Hide tertiary columns, compress spacing
- Mobile: Card layout per row with key fields visible, expandable details

## Advanced Features

**Search:**
- Debounced live search (300ms)
- Search icon prefix, clear button suffix when active
- Highlight matched terms in results (optional enhancement)

**Column Customization:**
- Columns dropdown to show/hide fields
- Drag handles for reordering (visual grip icon)
- Reset to default option

**Export:**
- Simple button in header actions
- Format options in dropdown (CSV, Excel, PDF)

## Performance Considerations
- Virtual scrolling for 100+ rows
- Pagination default: 20 rows per page
- Progressive loading indicators
- Optimistic UI updates for quick feedback

## Accessibility
- Semantic table markup
- ARIA labels for sort states and controls
- Keyboard navigation: Tab through controls, arrow keys optional for cells
- Focus indicators consistent throughout
- Screen reader announcements for filter changes and result counts

---

**Key Insight:** This data grid prioritizes functional clarity over decorative elements. Every pixel serves the user's goal of efficiently finding, sorting, and acting on data. The design should feel fast, precise, and uncluttered.