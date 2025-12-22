import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Contact, Campaign, Tag } from "@shared/schema";
import { 
  ArrowUpDown, 
  Users, 
  Mail, 
  MessageSquare, 
  Tag as TagIcon,
  Check,
  X,
  Plus,
  Download,
  Sparkles
} from "lucide-react";

const contactColumns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-name"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center backdrop-blur-sm border border-white/20">
          <span className="text-sm font-medium text-primary">
            {row.getValue<string>("name")?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>
        <span className="font-medium" data-testid={`text-contact-name-${row.original.id}`}>
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-email"
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground" data-testid={`text-email-${row.original.id}`}>
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-phone"
      >
        Phone
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm" data-testid={`text-phone-${row.original.id}`}>
        {row.getValue("phone")}
      </span>
    ),
  },
  {
    accessorKey: "consent_whatsapp",
    header: "WhatsApp",
    cell: ({ row }) => (
      <div className="flex items-center" data-testid={`status-whatsapp-${row.original.id}`}>
        {row.getValue("consent_whatsapp") ? (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span className="text-xs">Opted in</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="text-xs">Opted out</span>
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "consent_email",
    header: "Email Consent",
    cell: ({ row }) => (
      <div className="flex items-center" data-testid={`status-email-consent-${row.original.id}`}>
        {row.getValue("consent_email") ? (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span className="text-xs">Opted in</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="text-xs">Opted out</span>
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      return (
        <div className="flex flex-wrap gap-1" data-testid={`tags-${row.original.id}`}>
          {tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/20">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-created"
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <span className="text-sm text-muted-foreground" data-testid={`text-created-${row.original.id}`}>
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
];

const campaignColumns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-campaign-name"
      >
        Campaign Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium" data-testid={`text-campaign-name-${row.original.id}`}>
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => {
      const channel = row.getValue("channel") as string;
      const Icon = channel === "email" ? Mail : MessageSquare;
      return (
        <div className="flex items-center gap-2" data-testid={`badge-channel-${row.original.id}`}>
          <div className="p-1.5 rounded-md bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/20">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="capitalize">{channel}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-campaign-status"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusStyles: Record<string, string> = {
        draft: "bg-gray-100/80 text-gray-800 dark:bg-gray-800/80 dark:text-gray-400 backdrop-blur-sm",
        scheduled: "bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 backdrop-blur-sm",
        sending: "bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400 backdrop-blur-sm",
        active: "bg-purple-100/80 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400 backdrop-blur-sm",
        sent: "bg-green-100/80 text-green-800 dark:bg-green-900/50 dark:text-green-400 backdrop-blur-sm",
        failed: "bg-red-100/80 text-red-800 dark:bg-red-900/50 dark:text-red-400 backdrop-blur-sm",
      };
      return (
        <Badge 
          className={`${statusStyles[status] || statusStyles.draft} border border-white/20 font-normal capitalize`}
          data-testid={`badge-campaign-status-${row.original.id}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "audience_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-audience"
      >
        Audience
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm" data-testid={`text-audience-${row.original.id}`}>
        {(row.getValue("audience_count") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "sent_count",
    header: "Sent",
    cell: ({ row }) => (
      <span className="font-mono text-sm" data-testid={`text-sent-${row.original.id}`}>
        {(row.getValue("sent_count") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "delivered_count",
    header: "Delivered",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-green-600 dark:text-green-400" data-testid={`text-delivered-${row.original.id}`}>
        {(row.getValue("delivered_count") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "read_count",
    header: "Read",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-blue-600 dark:text-blue-400" data-testid={`text-read-${row.original.id}`}>
        {(row.getValue("read_count") as number).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "failed_count",
    header: "Failed",
    cell: ({ row }) => {
      const failed = row.getValue("failed_count") as number;
      return (
        <span 
          className={`font-mono text-sm ${failed > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}
          data-testid={`text-failed-${row.original.id}`}
        >
          {failed.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-campaign-created"
      >
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <span className="text-sm text-muted-foreground" data-testid={`text-campaign-created-${row.original.id}`}>
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
];

const tagColumns: ColumnDef<Tag>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-tag-name"
      >
        Tag Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/10 to-primary/20 backdrop-blur-sm border border-white/20">
          <TagIcon className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium" data-testid={`text-tag-name-${row.original.id}`}>
          {row.getValue("name")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent px-0 font-semibold"
        data-testid="button-sort-tag-status"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isActive = status === "active";
      return (
        <Badge 
          className={`${isActive 
            ? 'bg-green-100/80 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
            : 'bg-gray-100/80 text-gray-800 dark:bg-gray-800/80 dark:text-gray-400'
          } border border-white/20 backdrop-blur-sm font-normal capitalize`}
          data-testid={`badge-tag-status-${row.original.id}`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_default",
    header: "Default",
    cell: ({ row }) => (
      <div className="flex items-center" data-testid={`status-default-${row.original.id}`}>
        {row.getValue("is_default") ? (
          <Badge variant="outline" className="text-xs bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/30">Default</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </div>
    ),
  },
];

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="rounded-md border border-white/20 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ApiResponse<T> {
  contacts?: T[];
  data?: T[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
  status: string;
}

export default function Home() {
  const { data: contactsResponse, isLoading: contactsLoading } = useQuery<ApiResponse<Contact>>({
    queryKey: ["/api/contacts"],
  });

  const { data: campaignsResponse, isLoading: campaignsLoading } = useQuery<ApiResponse<Campaign>>({
    queryKey: ["/api/campaigns"],
  });

  const { data: tagsResponse, isLoading: tagsLoading } = useQuery<ApiResponse<Tag>>({
    queryKey: ["/api/tags"],
  });

  const contacts = contactsResponse?.contacts || [];
  const campaigns = campaignsResponse?.data || [];
  const tags = tagsResponse?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 backdrop-blur-sm border border-white/30 shadow-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
                  Data Management
                </h1>
                <p className="text-muted-foreground">
                  Manage your contacts, campaigns, and tags in one place.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" className="bg-white/50 dark:bg-white/10 backdrop-blur-sm border-white/30" data-testid="button-export">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button className="shadow-lg" data-testid="button-add-new">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex bg-white/50 dark:bg-white/10 backdrop-blur-xl border border-white/30 shadow-lg">
            <TabsTrigger value="contacts" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/20" data-testid="tab-contacts">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Contacts</span>
              <Badge variant="secondary" className="ml-1 text-xs bg-white/70 dark:bg-white/20">{contacts.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/20" data-testid="tab-campaigns">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
              <Badge variant="secondary" className="ml-1 text-xs bg-white/70 dark:bg-white/20">{campaigns.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/20" data-testid="tab-tags">
              <TagIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tags</span>
              <Badge variant="secondary" className="ml-1 text-xs bg-white/70 dark:bg-white/20">{tags.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <div className="rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/30 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold">All Contacts</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your contact list and their communication preferences.
                </p>
              </div>
              <div className="p-6">
                {contactsLoading ? (
                  <TableSkeleton />
                ) : contacts.length > 0 ? (
                  <DataTable
                    columns={contactColumns}
                    data={contacts}
                    searchPlaceholder="Search contacts..."
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/20 p-4 mb-4 backdrop-blur-sm border border-white/30">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                      Get started by adding your first contact.
                    </p>
                    <Button data-testid="button-add-first-contact">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contact
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/30 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold">All Campaigns</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Track and manage your marketing campaigns.
                </p>
              </div>
              <div className="p-6">
                {campaignsLoading ? (
                  <TableSkeleton />
                ) : campaigns.length > 0 ? (
                  <DataTable
                    columns={campaignColumns}
                    data={campaigns}
                    searchPlaceholder="Search campaigns..."
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/20 p-4 mb-4 backdrop-blur-sm border border-white/30">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                      Create your first campaign to start reaching your audience.
                    </p>
                    <Button data-testid="button-add-first-campaign">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tags">
            <div className="rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/30 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-lg font-semibold">All Tags</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize contacts with custom tags for better segmentation.
                </p>
              </div>
              <div className="p-6">
                {tagsLoading ? (
                  <TableSkeleton />
                ) : tags.length > 0 ? (
                  <DataTable
                    columns={tagColumns}
                    data={tags}
                    searchPlaceholder="Search tags..."
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/20 p-4 mb-4 backdrop-blur-sm border border-white/30">
                      <TagIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
                    <p className="text-muted-foreground max-w-sm mb-4">
                      Create tags to organize and segment your contacts.
                    </p>
                    <Button data-testid="button-add-first-tag">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Tag
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
