'use client';

import { Button } from "@/components/ui/button";
import { FileUp, ImageUp, X } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import { editBulkProducts } from "@/service/product-Service";
import { bulkUploadByDealer } from "@/service/dealer-product";
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

interface UploadBulkCardProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'upload' | 'edit';
}


export default function ProductBulkupload ({ isOpen, onClose, mode = 'upload' }: UploadBulkCardProps) {
  const {showToast} = useGlobalToast();
  const [imageZipFile, setImageZipFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const auth = useAppSelector((state) => state.auth.user);
  const [uploadMessage, setUploadMessage] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const route = useRouter();


  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
    const allowedRoles = [ "Super-admin", "Inventory-admin", "Dealer"];
// Handle file change for both image and CSV files
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>, fileType: string) => {
    const files = event.target.files;
    const file = files && files[0];
    if (file) {
      if (fileType === 'image') {
        setImageZipFile(file);
      } else {
        setCsvFile(file);
      }
    }
  };
    const resetState = () => {
    setImageZipFile(null);
    setCsvFile(null);
    setIsUploading(false);
  
  };
   const handleClose = () => {
    resetState();
    onClose();
  };
    const handleUpload = async () => {
      // Ensure both files are selected before uploading
      if (mode === 'edit' && !csvFile) {
        setUploadMessage('Please select the CSV file for editing.');
        return;
      }
      if (mode === 'upload' && (!imageZipFile || !csvFile)) {
        setUploadMessage('Please select the Image.zip file and CSV file for upload.');
        return;
      }

      setIsUploading(true);
      setUploadMessage('');

      // Show upload started toast
      if (mode === 'edit') {
        showToast("Starting bulk edit process... ⏳", "warning");
      } else {
        showToast("Starting bulk upload process... ⏳", "warning");
      }

      const formData = new FormData();
      if (mode === 'upload') {
        if (imageZipFile) {
          formData.append('imageZip', imageZipFile);
        }
        if (csvFile) {
          formData.append('dataFile', csvFile);
        }
      }
      if (mode === 'edit') {
        if (csvFile) {
          formData.append('editsFile', csvFile);
        }
      }
   

      try {
        let response;
        if (mode === 'edit') {
          response = await editBulkProducts(formData);
          showToast("Updated successfully", "success");
          console.log('Editing bulk upload with formData:');
        }
        else {
          response = await bulkUploadByDealer(formData);
          showToast("Uploaded successfully", "success");
          console.log('Uploading bulk upload with formData:');
        }

        if (response) {
          setUploadMessage(response.message || (mode === 'edit' ? 'Files edited successfully!' : 'Files uploaded successfully!'));
          setImageZipFile(null);
          setCsvFile(null);
          
          // Show success toast
          if (mode === 'edit') {
            showToast("Bulk edit completed successfully! 🎉", "success");
          } else {
            showToast("Bulk upload completed successfully! 🚀", "success");
          }
          
          handleClose();

          setIsLogOpen(true);
         
        } else {
          setUploadMessage((mode === 'edit' ? 'Edit failed. Please try again.' : 'Upload failed. Please try again.'));
        }
      } catch (error: any) {
        console.error('Error uploading files:', error);
        showToast( 'An error occurred during upload. Please check the console.', "error");
        const message = error.response?.data?.message || error.message || 'An error occurred during upload. Please check the console.';
        setUploadMessage(message);
      } finally {
        setIsUploading(false);
      }
    };
   const handleRemoveFile = (fileType: string) => {
    if (fileType === 'image') {
      setImageZipFile(null);
      if(imageInputRef.current) imageInputRef.current.value = '';
    } else {
      setCsvFile(null);
      if(csvInputRef.current) csvInputRef.current.value = '';
    }
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
        <p className="text-gray-500">Drag and drop the files as per the requirement</p>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image upload section */}
          {mode === 'upload' && (
            <div 
              className={`flex-1 flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors duration-200 ${
                  imageZipFile ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                } cursor-pointer`}
              onClick={() => imageInputRef.current?.click()}
            >
              {imageZipFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium">{imageZipFile.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile('image'); }}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <ImageUp className="w-12 h-12 mb-2" />
                  <span className="text-lg font-medium">Upload Image.zip file</span>
                </>
              )}
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => handleFileChange(e, 'image')}
                className="hidden"
                accept=".zip"
              />
            </div>
          )}

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
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile('csv'); }}
                  className="mt-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <FileUp className="w-12 h-12 mb-2" />
                <span className="text-lg font-medium">Upload CSV file</span>
              </>
            )}
            <input
              type="file"
              ref={csvInputRef}
              onChange={(e) => handleFileChange(e, 'csv')}
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
          disabled={
            (mode === 'edit'
              ? !csvFile
              : !imageZipFile || !csvFile
            ) || isUploading
          }
          onClick={handleUpload}
        >
          {isUploading
            ? (mode === 'edit'
                ? 'Editing...'
                : 'Uploading...')
            : (mode === 'edit'
                ? 'Edit Bulk'
                : 'Upload')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  </>
)

}

