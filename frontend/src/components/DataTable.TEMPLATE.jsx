/**
 * TEMPLATE: Using DataTable Component on a New Page
 *
 * Copy this template as a starting point for any new page that needs a data table.
 * Replace placeholder values marked with [PLACEHOLDER] with your actual implementation.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '../components/ui'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import { PrimaryAction, SecondaryAction } from '../components/ui/ActionButtons'
import {
  [ICON_NAME],  // e.g., Users, MessageSquare, Settings, etc.
  ArrowUpDown,
  [OTHER_ICONS]  // e.g., Plus, Download, etc.
} from 'lucide-react'

/**
 * [PAGE_NAME] Page
 * Description of what this page does
 */
export const [PageName] = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/[endpoint]', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const result = await response.json()
      setData(result.data || [])  // Adjust based on API response structure
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Define table columns using TanStack React Table format
  // Wrap in useMemo to prevent unnecessary re-renders
  const columns = useMemo(() => [
    {
      accessorKey: '[fieldName1]',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent px-0 font-semibold"
        >
          Column Title 1
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span>{row.getValue('[fieldName1]')}</span>
      ),
      enableHiding: true
    },
    {
      accessorKey: '[fieldName2]',
      header: 'Column Title 2',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('[fieldName2]') || '-'}
        </span>
      ),
      enableHiding: true
    },
    // Add more columns as needed
  ], [])

  return (
    <AppShell
      title="[Page Title]"
      subtitle="[Page Subtitle]"
      hideFooter
    >
      <div className="space-y-6">
        {/* Optional: Page Header with Title, Description, and Actions */}
        <PageHeader
          icon={[ICON_NAME]}
          title="[Page Title]"
          description="[Page Description]"
          helper={`${data.length} items`}
          actions={
            <div className="flex flex-wrap gap-3">
              <PrimaryAction onClick={() => { /* Handle action */ }}>
                <[IconName] className="h-4 w-4" />
                <span>Action Button</span>
              </PrimaryAction>
              <SecondaryAction onClick={() => { /* Handle action */ }}>
                <[IconName] className="h-4 w-4" />
                <span>Secondary Action</span>
              </SecondaryAction>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Error Alert */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* DataTable Component - All table functionality is built-in! */}
          <DataTable
            columns={columns}
            data={data}
            title="All Items"
            description="Manage your items with sorting, search, and filtering."
            searchPlaceholder="Search items..."
            loading={loading}
            emptyIcon={[ICON_NAME]}
            emptyTitle="No items yet"
            emptyDescription="Create your first item to get started."
            emptyAction={
              <PrimaryAction onClick={() => { /* Handle create */ }}>
                Create Item
              </PrimaryAction>
            }
          />
        </div>
      </div>
    </AppShell>
  )
}

export default [PageName]

/**
 * REFERENCE NOTES:
 *
 * Column Definition Properties:
 * - accessorKey: string - Maps to the data property name (required if not using custom accessor)
 * - header: string | ((context) => ReactNode) - Column header text or custom render function
 * - cell: (context) => ReactNode - Custom cell renderer
 * - enableHiding: boolean - Allow column to be hidden via toggle (default: true)
 * - enableSorting: boolean - Allow sorting (default: true)
 *
 * DataTable Features (Automatic):
 * - Sorting: Click column headers to sort (if enabled)
 * - Pagination: Built-in pagination with 10/25/50 rows per page options
 * - Global Search: Search input filters across all columns
 * - Column Visibility: Toggle button shows/hides columns
 * - Empty States: Customizable with icon, title, description, action
 * - Loading States: Spinner shown while loading={true}
 * - Row Selection: Optional with onRowSelect callback
 * - Responsive: Mobile-friendly layout with proper breakpoints
 *
 * Common Column Examples:
 *
 * 1. Simple Text:
 *    {
 *      accessorKey: 'name',
 *      header: 'Name',
 *      cell: ({ row }) => <span>{row.getValue('name')}</span>
 *    }
 *
 * 2. Sortable Column:
 *    {
 *      accessorKey: 'date',
 *      header: ({ column }) => (
 *        <Button variant="ghost" onClick={() => column.toggleSorting()}>
 *          Date
 *          <ArrowUpDown className="ml-2 h-4 w-4" />
 *        </Button>
 *      ),
 *      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString()
 *    }
 *
 * 3. Status Badge:
 *    {
 *      accessorKey: 'status',
 *      header: 'Status',
 *      cell: ({ row }) => {
 *        const status = row.getValue('status')
 *        return <Badge variant={status === 'active' ? 'success' : 'secondary'}>{status}</Badge>
 *      }
 *    }
 *
 * 4. Avatar with Initial:
 *    {
 *      accessorKey: 'name',
 *      header: 'Name',
 *      cell: ({ row }) => {
 *        const name = row.getValue('name') || 'Unknown'
 *        const initial = name.charAt(0).toUpperCase()
 *        return (
 *          <div className="flex items-center gap-3">
 *            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
 *              <span className="text-sm font-medium">{initial}</span>
 *            </div>
 *            <span>{name}</span>
 *          </div>
 *        )
 *      }
 *    }
 *
 * See DataTable.USAGE.md for more detailed examples and patterns.
 */
