import { useCallback, useEffect, useRef, useState } from 'react';

interface UseGlobalCSVImportOverlayParams {
  isImportModalOpen: boolean;
  triggerImportWithFile: (file: File) => void;
  showAlert: (message: string) => void;
}

function isCSVFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return (
    lowerName.endsWith('.csv') ||
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/csv'
  );
}

export function useGlobalCSVImportOverlay({
  isImportModalOpen,
  triggerImportWithFile,
  showAlert,
}: UseGlobalCSVImportOverlayParams) {
  const [isGlobalDragActive, setIsGlobalDragActive] = useState(false);
  const dragCounterRef = useRef(0);

  const hasFileTransfer = useCallback((event: DragEvent) => {
    return Boolean(event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files'));
  }, []);

  const handleGlobalDragEnter = useCallback(
    (event: DragEvent) => {
      if (!hasFileTransfer(event) || isImportModalOpen) {
        return;
      }
      dragCounterRef.current += 1;
      setIsGlobalDragActive(true);
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    },
    [hasFileTransfer, isImportModalOpen],
  );

  const handleGlobalDragOver = useCallback(
    (event: DragEvent) => {
      if (!event.dataTransfer) {
        return;
      }

      if (isImportModalOpen) {
        dragCounterRef.current = 0;
        setIsGlobalDragActive(false);
        return;
      }

      if (hasFileTransfer(event)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setIsGlobalDragActive(true);
      }
    },
    [hasFileTransfer, isImportModalOpen],
  );

  const handleGlobalDragLeave = useCallback(
    (event: DragEvent) => {
      if (!hasFileTransfer(event)) {
        return;
      }

      dragCounterRef.current = Math.max(dragCounterRef.current - 1, 0);
      if (dragCounterRef.current === 0) {
        setIsGlobalDragActive(false);
      }
    },
    [hasFileTransfer],
  );

  const handleGlobalDrop = useCallback(
    (event: DragEvent) => {
      if (!event.dataTransfer || !hasFileTransfer(event)) {
        return;
      }

      setIsGlobalDragActive(false);
      dragCounterRef.current = 0;

      if (isImportModalOpen) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const files = Array.from(event.dataTransfer.files);
      const csvFile = files.find(isCSVFile);

      if (csvFile) {
        triggerImportWithFile(csvFile);
      } else {
        showAlert('CSVファイルをドロップしてください');
      }
    },
    [hasFileTransfer, isImportModalOpen, triggerImportWithFile, showAlert],
  );

  const handleGlobalPaste = useCallback(
    (event: ClipboardEvent) => {
      if (isImportModalOpen) {
        return;
      }

      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return;
      }

      const fileItems = Array.from(clipboardData.items).filter(
        (item) =>
          item.kind === 'file' &&
          (item.type === 'text/csv' ||
            item.type === 'application/vnd.ms-excel' ||
            item.type === 'application/csv'),
      );

      if (fileItems.length > 0) {
        const file = fileItems[0].getAsFile();
        if (file) {
          event.preventDefault();
          triggerImportWithFile(file);
        }
        return;
      }

      const textData = clipboardData.getData('text/plain');
      if (textData && /\n/.test(textData) && /[,\t]/.test(textData)) {
        event.preventDefault();
        const file = new File([textData], 'pasted-data.csv', { type: 'text/csv' });
        triggerImportWithFile(file);
      }
    },
    [isImportModalOpen, triggerImportWithFile],
  );

  useEffect(() => {
    window.addEventListener('dragenter', handleGlobalDragEnter);
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragleave', handleGlobalDragLeave);
    window.addEventListener('drop', handleGlobalDrop);
    window.addEventListener('paste', handleGlobalPaste);

    return () => {
      window.removeEventListener('dragenter', handleGlobalDragEnter);
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragleave', handleGlobalDragLeave);
      window.removeEventListener('drop', handleGlobalDrop);
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [
    handleGlobalDragEnter,
    handleGlobalDragOver,
    handleGlobalDragLeave,
    handleGlobalDrop,
    handleGlobalPaste,
  ]);

  useEffect(() => {
    if (isImportModalOpen) {
      setIsGlobalDragActive(false);
      dragCounterRef.current = 0;
    }
  }, [isImportModalOpen]);

  return { isGlobalDragActive };
}
