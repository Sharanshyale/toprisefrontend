'use client';

import { Button } from "@/components/ui/button";
import { FileUp, X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { uploadDealerBulk } from "@/service/dealerServices";


interface UploadBulkCardProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function FileUploadModal ({ isOpen, onClose }: UploadBulkCardProps) {
  const {showToast} = useGlobalToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const auth = useAppSelector((state) => state.auth.user);
  const [uploadMessage, setUploadMessage] = useState('');
  const route = useRouter();

  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const allowedRoles = [ "Super-admin", "Inventory-Admin", "Fulfillment-Admin"];
// Handle file change for CSV files
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files && files[0];
    if (file) {
      setCsvFile(file);
    }
  };
    const resetState = () => {
    setCsvFile(null);
    setIsUploading(false);
  };
   const handleClose = () => {
    resetState();
    onClose();
  };
    const handleUpload = async () => {
      // Ensure CSV file is selected before uploading
      if (!csvFile) {
        setUploadMessage('Please select the CSV file for dealer upload.');
        return;
      }

      setIsUploading(true);
      setUploadMessage('');

      const formData = new FormData();
      if (csvFile) {
        formData.append('file', csvFile);
      }

      try {
        const response = await uploadDealerBulk(formData);
        showToast("Uploaded successfully", "success");

        if (response) {
          setUploadMessage(response.message || 'Dealer files uploaded successfully!');
          setCsvFile(null);
          handleClose();
          route.push(`/user/dashboard/user`);
        } else {
          setUploadMessage('Dealer upload failed. Please try again.');
        }
      } catch (error: any) {
        showToast( 'An error occurred during upload. Please check the console.', "error");
        const message = error.response?.data?.message || error.message || 'An error occurred during upload. Please check the console.';
        setUploadMessage(message);
      } finally {
        setIsUploading(false);
      }
    };
   const handleRemoveFile = () => {
    setCsvFile(null);
    if(csvInputRef.current) csvInputRef.current.value = '';
  };
  if (!auth || !allowedRoles.includes(auth.role)) {
    return (
       <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access.
        </div></DialogContent>
      </Dialog>
    );
  }
return (
  <>
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-800">Upload File</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <p className="text-gray-500">Upload dealer CSV file</p>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Upload CSV file section */}
          <div 
            className={`flex-1 flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                csvFile ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              } cursor-pointer`}
            onClick={() => csvInputRef.current?.click()}
          >
             {csvFile ? (
              <div className="text-center">
                <p className="text-sm font-medium">{csvFile.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                  className="mt-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <FileUp className="w-12 h-12 mb-2" />
                <span className="text-lg font-medium">Upload Dealer CSV file</span>
              </>
            )}
            <input
              type="file"
              ref={csvInputRef}
              onChange={(e) => handleFileChange(e)}
              className="hidden"
              accept=".csv"
            />
          </div>
        </div>
        {uploadMessage && <p className="text-center text-sm text-gray-600 pt-2">{uploadMessage}</p>}
      </div>
      <DialogFooter className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleClose}>Cancel</Button>
        <Button
          className="bg-red-600 text-white hover:bg-red-700"
          disabled={!csvFile || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? 'Uploading...' : 'Upload Dealer CSV'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  </>
)

}

