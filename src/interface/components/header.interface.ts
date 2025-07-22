export interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchPerformed?: () => void;
  handleSearchClick?: () => void;
  workspaceId?: string;
  documentId?: string;
  title?: string;
}
