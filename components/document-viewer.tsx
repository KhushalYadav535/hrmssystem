'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

export default function DocumentViewer({ open, onOpenChange, document: doc }: DocumentViewerProps) {
  if (!doc) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{doc.name}</DialogTitle>
            <DialogDescription className="sr-only">Viewing document {doc.name}</DialogDescription>
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
          {doc.type === 'pdf' ? (
            <iframe
              src={doc.url}
              className="w-full h-full min-h-[600px]"
              title={doc.name}
            />
          ) : doc.type === 'image' ? (
            <img src={doc.url} alt={doc.name} className="w-full h-auto" />
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Preview not available for this file type</p>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download {doc.name}
              </Button>
            </div>
          )}
        </div>
        {doc.size && (
          <p className="text-xs text-muted-foreground text-center mt-2">File size: {doc.size}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
