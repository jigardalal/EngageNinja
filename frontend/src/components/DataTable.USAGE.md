# DataTable Component Usage Guide

The `DataTable` component is a fully reusable, configurable data grid component built with TanStack React Table v8. It eliminates code duplication across multiple pages by encapsulating all table functionality (sorting, pagination, filtering, column toggling) into a single component.

## Quick Start

### Basic Usage

```jsx
import { DataTable } from '../components/ui'
import { Users } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'

export const MyPage = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch your data
    fetch('/api/data')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span>{row.getValue('name')}</span>
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span>{row.getValue('email')}</span>
    }
  ], [])

  return (
    <DataTable
      columns={columns}
      data={data}
      title="My Data"
      loading={loading}
    />
  )
}
```

## Props Reference

### Required Props

- **`columns`** (Array): Array of column definitions following TanStack React Table format
- **`data`** (Array): Array of data rows to display

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Table header title |
| `description` | string | - | Table header description |
| `searchPlaceholder` | string | `'Search...'` | Placeholder for search input |
| `loading` | boolean | `false` | Show loading state |
| `enableSearch` | boolean | `true` | Show search input |
| `enableColumnToggle` | boolean | `true` | Show columns visibility button |
| `emptyIcon` | React Component | - | Icon to show in empty state |
| `emptyTitle` | string | - | Title for empty state |
| `emptyDescription` | string | - | Description for empty state |
| `emptyAction` | React Element | - | Action button for empty state |
| `onRowSelect` | Function | - | Callback when rows are selected |

## Column Definition Format

Columns use the TanStack React Table format. Common properties:

```typescript
{
  accessorKey: 'fieldName',           // Maps to data property
  header: 'Column Title',              // OR ({ column }) => (...)
  cell: ({ row }) => (                 // Render cell content
    <span>{row.getValue('fieldName')}</span>
  ),
  enableHiding: true,                  // Allow column toggle
  enableSorting: true                  // Allow sorting (default true)
}
```

## Real-World Examples

### Contacts Page (Existing Implementation)

See `/Users/jigs/Code/engageNinja/frontend/src/pages/ContactsPage.jsx` for a full example with:
- Avatar circles with initials
- Consent status with icons (✓ / ✗)
- Tag badges
- Date formatting
- Custom cell rendering

Key features demonstrated:
- Avatar rendering in cell
- Icon rendering (Check, X from lucide-react)
- Badge styling with backdrop blur
- Date formatting (toLocaleDateString)
- Sortable columns with arrow icons

### Creating a Campaigns Page

```jsx
import { DataTable } from '../components/ui'
import { MessageSquare } from 'lucide-react'

export const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
      .then(r => r.json())
      .then(d => setCampaigns(d.campaigns))
      .finally(() => setLoading(false))
  }, [])

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Campaign Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status')
        return (
          <Badge variant={status === 'active' ? 'success' : 'secondary'}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'sent_count',
      header: 'Messages Sent',
      cell: ({ row }) => <span className="font-mono">{row.getValue('sent_count')}</span>
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'))
        return <span className="text-sm text-muted-foreground">{date.toLocaleDateString()}</span>
      }
    }
  ], [])

  return (
    <DataTable
      columns={columns}
      data={campaigns}
      title="All Campaigns"
      description="View and manage your messaging campaigns."
      searchPlaceholder="Search campaigns..."
      loading={loading}
      emptyIcon={MessageSquare}
      emptyTitle="No campaigns yet"
      emptyDescription="Create your first campaign to get started."
    />
  )
}
```

## Features Included

### Sorting
- Click column headers (if enabled) to sort
- Sort indicators show current direction (asc/desc)
- Use `column.toggleSorting()` in header for custom styling

### Pagination
- Built-in pagination with 10, 25, 50 rows per page
- Page navigation buttons (first, previous, next, last)
- Displays "Showing X to Y of Z results"

### Global Search/Filter
- Search input filters across all columns
- Case-insensitive string matching
- Real-time filtering as user types

### Column Visibility Toggle
- "Columns" button opens dropdown with checkboxes
- Hide/show individual columns
- Persists during session (not stored)

### Empty States
- Customizable empty state with icon, title, and action button
- Loading state with spinner
- "No results found" message when search yields no results

### Responsive Design
- Mobile-friendly layout
- Responsive header with column toggle on right
- Search input adjusts for smaller screens
- Pagination controls stack on mobile

### Styling
- Glass morphism design with backdrop blur
- Dark mode support with CSS variables
- Hover states for rows and controls
- Selection highlighting with primary color
- Consistent spacing and typography

## Styling Customization

The DataTable uses Tailwind CSS utilities. You can override specific styles by:

1. **Adding className props** to the DataTable wrapper:
```jsx
<DataTable
  columns={columns}
  data={data}
  className="rounded-lg"  // Custom wrapper styling
/>
```

2. **Styling cell content** in column definitions:
```jsx
{
  accessorKey: 'name',
  cell: ({ row }) => (
    <span className="text-lg font-bold text-blue-600">
      {row.getValue('name')}
    </span>
  )
}
```

## Common Patterns

### Status Badge with Color
```jsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const status = row.getValue('status')
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    }
    return (
      <div className={`px-2 py-1 rounded text-sm font-medium ${colors[status]}`}>
        {status}
      </div>
    )
  }
}
```

### Avatar with Initials
```jsx
{
  accessorKey: 'name',
  cell: ({ row }) => {
    const name = row.getValue('name') || 'Unknown'
    const initial = name.charAt(0).toUpperCase()
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-medium text-blue-700">{initial}</span>
        </div>
        <span>{name}</span>
      </div>
    )
  }
}
```

### Formatted Date
```jsx
{
  accessorKey: 'created_at',
  header: 'Created',
  cell: ({ row }) => {
    const date = new Date(row.getValue('created_at'))
    return <span>{date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}</span>
  }
}
```

### Truncated Text with Tooltip
```jsx
{
  accessorKey: 'description',
  header: 'Description',
  cell: ({ row }) => {
    const text = row.getValue('description') || ''
    return (
      <span title={text} className="truncate block max-w-xs">
        {text}
      </span>
    )
  }
}
```

## Implementation Checklist for New Pages

- [ ] Import DataTable from '../components/ui'
- [ ] Import lucide-react icons for empty state and sortable headers
- [ ] Create columns array with useMemo
- [ ] Set up data fetching with useState/useEffect
- [ ] Add loading state management
- [ ] Configure column definitions with accessorKey
- [ ] Add empty state icon, title, and action
- [ ] Test sorting (click headers)
- [ ] Test pagination (change rows per page, navigate)
- [ ] Test search (type in search box)
- [ ] Test column visibility (toggle columns)
- [ ] Verify responsive behavior on mobile
- [ ] Check dark mode styling

## Performance Notes

- The DataTable uses TanStack React Table v8 which is optimized for large datasets
- Pagination is client-side; for large datasets (1000+ rows), consider server-side pagination
- The global search filter runs on all data in memory; for large datasets, use server-side filtering
- Column definitions wrapped in useMemo prevent unnecessary re-renders

## Troubleshooting

### Columns not showing data
- Ensure `accessorKey` matches the property name in your data objects
- Check browser console for errors

### Search not working
- Verify `enableSearch={true}` (default)
- Check that data array is populated correctly

### Sorting not working
- Add `onClick={() => column.toggleSorting()}` to header button
- Ensure column data types are sortable (strings, numbers, dates)

### Empty state not showing
- Verify `data` array is empty `[]`
- Check that `emptyIcon`, `emptyTitle`, and `emptyDescription` props are passed
- Ensure `loading={false}` (loading state takes precedence)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support
- CSS Grid and Flexbox required for layout
- Backdrop-filter CSS property for glass morphism effect (fallback works in older browsers)
