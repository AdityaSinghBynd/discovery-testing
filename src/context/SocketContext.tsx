import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useSocketConnection } from '@/hooks/useSocketConnection';

interface SocketContextType {
  simulateFileUpload: (file: { id: string; name: string; status: string }) => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { simulateFileUpload } = useSocketConnection();
  const recentUploadedDocuments = useSelector(
    (state: RootState) => state.recentUploaded.recentUploadedDocuments
  );

  // Set up a watcher for any loading documents to ensure they're tracked
  useEffect(() => {
    // Find any documents that are in a loading state
    const loadingDocs = recentUploadedDocuments.filter(
      doc => doc.status === "loading" || doc.status === "processing"
    );
    
    // Initialize socket connections for each loading document
    if (loadingDocs.length > 0) {
      loadingDocs.forEach(simulateFileUpload);
    }
  }, [recentUploadedDocuments, simulateFileUpload]);

  const value = useMemo(() => ({
    simulateFileUpload,
  }), [simulateFileUpload]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 