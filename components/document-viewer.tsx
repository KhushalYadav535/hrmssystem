'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    name: string;
    type: string;
    url: string;
    size?: string;
  } | null;
}

export default function DocumentViewer({ open, onOpenChange, document }: DocumentViewerProps) {
  if (!document) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{document.name}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-lg bg-secondary/50">
          {document.type === 'pdf' ? (
            <iframe
              src={document.url}
              className="w-full h-full min-h-[600px]"
              title={document.name}
            />
          ) : document.type === 'image' ? (
            <img src={document.url} alt={document.name} className="w-full h-auto" />
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Preview not available for this file type</p>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download {document.name}
              </Button>
            </div>
          )}
        </div>
        {document.size && (
          <p className="text-xs text-muted-foreground text-center mt-2">File size: {document.size}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
